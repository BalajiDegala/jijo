import { DockerEngine } from '../../dockerlab/src/engine/DockerEngine';
import { DockerfileEngine } from '../../dockerlab/src/engine/DockerfileEngine';
import { parseFlags, tokenize } from '../../dockerlab/src/engine/CommandParser';
import { guided, sources, transfer } from './content';
import type { Lab } from './content';

export type Stage = 'predict' | 'repair' | 'explain' | 'transfer' | 'complete';
export type Event =
  | { type: 'predict' | 'explain'; choice: number }
  | { type: 'command'; text: string }
  | { type: 'map'; host: number; target: number }
  | { type: 'verify' | 'hint' };

export interface Project {
  version: 1;
  journey: 'container-path-v1';
  events: Event[];
}
export interface Entry { command: string; output: string; success: boolean }
export interface Session {
  engine: DockerEngine;
  lab: Lab;
  stage: Stage;
  prediction?: number;
  lastAnswer?: number;
  log: Entry[];
  hints: number;
  feedback: string;
  success: boolean;
}
export const maxEvents = 512;
export const emptyProject = (): Project => ({ version: 1, journey: 'container-path-v1', events: [] });
export const probeCommand = (lab: Lab) => 'curl http://localhost:' + lab.host;
export const validPort = (p: unknown): p is number => typeof p === 'number' && Number.isInteger(p) && p >= 1 && p <= 65535;

export function createEngine(lab: Lab) {
  const files = sources(lab);
  const engine = new DockerEngine();
  new DockerfileEngine(engine).build(files.Dockerfile, files, lab.image);
  engine.run(lab.image, { name: lab.name, ports: lab.initialTarget ? [lab.host + ':' + lab.initialTarget] : [] });
  return engine;
}

export function start(): Session {
  return { engine: createEngine(guided), lab: guided, stage: 'predict', log: [], hints: 0, feedback: '', success: false };
}

function execute(s: Session, command: string) {
  const { success, output } = s.engine.execute(command);
  // Replayed activities preserve the log messages without displaying a new wall-clock time.
  const displayed = /^docker\s+logs\s/.test(command) ? output.replace(/^\d{2}:\d{2}:\d{2} /gm, '') : output;
  s.log.push({ command, success, output: displayed });
  return success;
}

// Keep learner commands inside the single-service exercise. The shared engine owns the Docker rules.
function checkCommand(text: string, lab: Lab) {
  const args = tokenize(text);
  if (args[0] === 'curl' && args.length === 2 && /^http:\/\/(?:localhost|127\.0\.0\.1):\d{1,5}\/?$/.test(args[1])) return;
  if (args[0] === 'docker') {
    const [verb, ...tail] = args.slice(1);
    if (verb === 'ps' && (tail.length === 0 || (tail.length === 1 && ['-a', '--all'].includes(tail[0])))) return;
    if (['inspect', 'logs', 'stop', 'start', 'restart'].includes(verb) && tail.join(' ') === lab.name) return;
    if (verb === 'rm' && [lab.name, '-f ' + lab.name, '--force ' + lab.name].includes(tail.join(' '))) return;
    if (verb === 'run') {
      const flags = parseFlags(tail, { '--name': 'value', '-d': 'boolean', '--detach': 'boolean', '-p': 'value', '--publish': 'value' }, true);
      if (flags.one('--name') === lab.name && flags.positional.length === 1 && flags.positional[0] === lab.image && flags.many('-p', '--publish').length <= 1) return;
    }
  }
  throw new Error('Use the lab service and the commands listed under Terminal help.');
}

function apply(s: Session, event: Event) {
  if (event.type === 'predict' && s.stage === 'predict') {
    s.prediction = event.choice;
    s.stage = 'repair';
    execute(s, probeCommand(s.lab));
    s.feedback = (event.choice === 1 ? 'Your prediction matched. ' : 'The request failed. ') +
      'The process is running. Inspect the path between the host and Flask.';
    s.success = false;
    return;
  }
  if (event.type === 'explain' && s.stage === 'explain') {
    s.lastAnswer = event.choice;
    if (event.choice === 1) {
      s.stage = 'transfer';
      s.lab = transfer;
      s.engine = createEngine(transfer);
      s.log = [];
      s.feedback = 'A different Flask service already publishes a port. Diagnose its current mapping.';
      s.hints = 0;
    } else {
      s.feedback = event.choice === 0 ? 'EXPOSE records a port in the image. What connected the host to the running service?' :
        'Flask kept its original listening port. What changed between the host and the container?';
    }
    s.success = event.choice === 1;
    return;
  }
  if (s.stage !== 'repair' && s.stage !== 'transfer') throw new Error('This action is unavailable at the current step.');
  s.success = false;
  if (event.type === 'hint' && s.hints < 2 && s.stage === 'repair') {
    s.hints++;
    s.feedback = s.hints === 1 ? 'Read the image’s EXPOSE line and compare it with PORTS in docker ps.' :
      'Recreate the service with a published port. Put the requested host port first and the Flask listener second.';
    return;
  }
  if (event.type === 'command') {
    try {
      checkCommand(event.text, s.lab);
      execute(s, event.text);
    } catch (error) {
      s.log.push({ command: event.text, output: (error as Error).message, success: false });
    }
    s.feedback = '';
    return;
  }
  if (event.type === 'map') {
    if (!validPort(event.host) || !validPort(event.target)) throw new Error('Use whole ports between 1 and 65535.');
    const current = s.engine.state.containers.find(c => c.name === s.lab.name);
    if (current) execute(s, 'docker rm -f ' + current.name);
    const mapped = execute(s, 'docker run -d --name ' + s.lab.name + ' -p ' + event.host + ':' + event.target + ' ' + s.lab.image);
    s.feedback = mapped ? 'Container recreated. Test the requested address to verify the route.' : 'Read the terminal output for the Docker error.';
    return;
  }
  if (event.type === 'verify') {
    const ok = execute(s, probeCommand(s.lab));
    const container = s.engine.state.containers.find(c => c.name === s.lab.name);
    s.success = ok && !!container?.ports.some(p => p.host === s.lab.host && p.container === s.lab.listener && p.protocol === 'tcp');
    if (s.success) {
      s.stage = s.stage === 'repair' ? 'explain' : 'complete';
      s.feedback = 'HTTP 200. Host port ' + s.lab.host + ' now forwards to Flask on port ' + s.lab.listener + '.';
    } else {
      s.feedback = s.log.at(-1)!.output.replace(/^Error: /, '');
    }
    return;
  }
  throw new Error('Invalid activity order in this project.');
}

export function replay(project: Project): Session {
  const session = start();
  for (const event of project.events) apply(session, event);
  return session;
}

export function append(project: Project, event: Event): Project {
  if (project.events.length >= maxEvents) throw new Error('This project reached its action limit. Save a backup and start a fresh attempt.');
  return { ...project, events: [...project.events, event] };
}

function readEvent(value: unknown): Event {
  if (!value || typeof value !== 'object' || !('type' in value)) throw new Error('Invalid activity record.');
  switch (value.type) {
    case 'predict': case 'explain':
      if ('choice' in value && typeof value.choice === 'number' && [0, 1, 2].includes(value.choice)) return { type: value.type, choice: value.choice };
      break;
    case 'command':
      if ('text' in value && typeof value.text === 'string' && value.text.trim() && value.text.length <= 200) return { type: 'command', text: value.text };
      break;
    case 'map':
      if ('host' in value && 'target' in value && validPort(value.host) && validPort(value.target)) return { type: 'map', host: value.host, target: value.target };
      break;
    case 'hint': case 'verify': return { type: value.type };
  }
  throw new Error('Unrecognized activity in this backup.');
}

export function restore(input: unknown): Project {
  if (!input || typeof input !== 'object' || !('version' in input) || input.version !== 1 ||
      !('journey' in input) || input.journey !== 'container-path-v1' || !('events' in input) ||
      !Array.isArray(input.events) || input.events.length > maxEvents) throw new Error('Unsupported JIJO project backup.');
  const project = { ...emptyProject(), events: input.events.map(readEvent) };
  replay(project);
  return project;
}
