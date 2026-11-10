import { strToU8, zipSync } from 'fflate';
import { ComposeEngine } from '../../dockerlab/src/engine/ComposeEngine';
import { DockerEngine } from '../../dockerlab/src/engine/DockerEngine';
import { sources } from './content';
import { probeCommand } from './journey';
import type { Session } from './journey';

export function buildBundle(session: Session): Record<string, string> {
  if (session.stage !== 'complete') throw new Error('Complete the independent repair before exporting.');
  const lab = session.lab;
  const mapping = session.engine.container(lab.name).ports.find(p => p.host === lab.host && p.container === lab.listener && p.protocol === 'tcp');
  if (!mapping) throw new Error('The verified port mapping is missing.');
  const files = sources(lab);
  const compose = [
    'name: jijo-weather-lab', 'services:', '  web:', '    build: .',
    '    container_name: ' + lab.name, '    ports:', '      - "' + mapping.host + ':' + mapping.container + '"', '',
  ].join('\n');
  const check = new DockerEngine();
  const stack = new ComposeEngine(check, compose, files.Dockerfile, files);
  stack.up(true);
  if (!check.execute(probeCommand(lab)).success) throw new Error('The exported Compose project failed the simulated HTTP check.');
  const checklist = [
    '# Verify the Flask lab locally', '',
    'This sample uses Docker Engine, Docker Compose and the Flask development server for local learning.',
    'JIJO parsed the Compose file, modeled the Dockerfile build, and tested the route in DockerLab. A real build downloads the Python base image and installs Flask.',
    '', '1. Extract these files together. Run the commands in this directory.',
    '2. Check the service configuration with: docker compose config',
    '3. On a trusted local machine run: docker compose up --build -d',
    '   The published port is accessible on host interfaces that permit inbound traffic.',
    '4. Read the service status with docker compose ps and the logs with docker compose logs web.',
    '5. Run ' + probeCommand(lab) + ' and expect the body "Hello from ' + lab.name + '!".',
    '6. Stop and remove the sample with: docker compose down', '',
    'If the host port is occupied, choose a free host port in compose.yaml and use that port in the request. Keep the container port aligned with app.py.', '',
  ].join('\n');
  return { ...files, 'compose.yaml': compose, 'VERIFY.md': checklist };
}

export function archive(files: Record<string, string>) {
  const zipped = zipSync(Object.fromEntries(Object.entries(files).map(([name, contents]) => [name, strToU8(contents)])));
  return new Blob([new Uint8Array(zipped)], { type: 'application/zip' });
}
