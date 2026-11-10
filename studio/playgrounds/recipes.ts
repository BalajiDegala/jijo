import { DockerEngine } from '../../dockerlab/src/engine/DockerEngine';
import { DockerfileEngine } from '../../dockerlab/src/engine/DockerfileEngine';
import { frameworkLessons, frameworkSource, guided, sources, type Framework } from '../lab/content';
import expressPackage from './samples/express/package.json';
import expressLock from './samples/express/package-lock.json';
import fastifyPackage from './samples/fastify/package.json';
import fastifyLock from './samples/fastify/package-lock.json';

export const maxRecipe = 6000;
export function recipeFiles(name: Framework): Record<string, string> {
  if (name === 'Flask') return sources(guided);
  const lesson = frameworkLessons[name];
  if (name === 'FastAPI') return {
    'app.py': frameworkSource(name),
    'requirements.txt': 'fastapi==0.115.12\nuvicorn==0.34.3\n',
    Dockerfile: sources(guided).Dockerfile.replace('EXPOSE 5000', 'EXPOSE 8000'),
  };
  const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
  return {
    'server.js': frameworkSource(name),
    'package.json': json(name === 'Express' ? expressPackage : fastifyPackage),
    'package-lock.json': json(name === 'Express' ? expressLock : fastifyLock),
    Dockerfile: ['FROM node:22-alpine', 'WORKDIR /app', 'COPY package*.json ./', 'RUN npm ci --omit=dev --ignore-scripts',
      'COPY server.js .', 'USER node', 'EXPOSE ' + lesson.port, 'CMD ["node", "server.js"]', ''].join('\n'),
  };
}

export function brokenRecipe(name: Framework) {
  const text = recipeFiles(name).Dockerfile;
  switch (name) {
    case 'Flask': return text.replace('COPY requirements.txt', 'COPY packages.txt');
    case 'FastAPI': return text.replace('EXPOSE 8000', 'EXPOSE 80');
    case 'Express': return text.replace('COPY package*.json', 'COPY package.json');
    case 'Fastify': return text.replace('"server.js"', '"main.js"');
  }
}

export interface CheckedStep { instruction: string; detail: string }
export interface RecipeCheck { steps: CheckedStep[]; error?: string }
export function checkRecipe(name: Framework, source: string): RecipeCheck {
  const steps: CheckedStep[] = [];
  try {
    if (source.length > maxRecipe) throw new Error('Keep this exercise under 6000 characters.');
    const context = recipeFiles(name);
    const node = frameworkLessons[name].runtime === 'Node.js';
    const filename = node ? 'server.js' : 'app.py';
    const install = node ? 'npm ci --omit=dev --ignore-scripts' : 'pip install --no-cache-dir -r requirements.txt';
    const engine = new DockerEngine();
    let installed = false;
    let installDir = '';
    let user = 'root';
    let image;
    for (const step of new DockerfileEngine(engine).steps(source, context, 'jijo/lesson:v1')) {
      if (step.layer) {
        steps.push({ instruction: step.instruction, detail: step.layer.detail });
        const [verb, ...args] = step.instruction.split(/\s+/);
        if (verb.toUpperCase() === 'USER') {
          user = args.join(' ');
          if (!/^\d+$/.test(user) && user !== 'root' && !(node && user === 'node'))
            throw new Error('Choose a numeric user ID or a user defined in this sample’s base image.');
        }
        if (/^RUN\s/i.test(step.instruction)) {
          if (step.instruction.slice(4).trim() !== install) throw new Error('This exercise models RUN ' + install + '.');
          if (!['root', '0'].includes(user)) throw new Error('Install dependencies before switching to the sample’s unprivileged runtime user.');
          installDir = step.workdir ?? '/';
          installed = true;
        }
        if (!/^(FROM|WORKDIR|COPY|RUN|EXPOSE|CMD|USER)\s/i.test(step.instruction))
          throw new Error('Use FROM, WORKDIR, COPY, RUN, USER, EXPOSE and CMD in this exercise.');
      }
      if (step.image) image = step.image;
    }
    if (!image) throw new Error('Add the base image and build instructions.');
    if (image.baseImage !== (node ? 'node:22-alpine' : 'python:3.12-slim')) throw new Error('Use the sample’s ' + (node ? 'node:22-alpine' : 'python:3.12-slim') + ' runtime.');
    if (!installed) throw new Error('Install the application dependencies before starting the service.');
    if (node && image.workdir !== installDir && !image.workdir.startsWith(installDir.replace(/\/$/, '') + '/'))
      throw new Error('Start the Node application in the directory containing node_modules or one of its subdirectories.');
    if (image.files[image.workdir.replace(/\/$/, '') + '/' + filename] !== context[filename])
      throw new Error('Copy ' + filename + ' into the final working directory.');
    if (!image.exposedPorts.includes(frameworkLessons[name].port))
      throw new Error('Document the sample’s listening port with EXPOSE ' + frameworkLessons[name].port + '.');
    if (JSON.stringify(image.command) !== JSON.stringify([node ? 'node' : 'python', filename]))
      throw new Error('CMD must start the supplied ' + filename + ' with ' + (node ? 'node' : 'python') + '.');
    if (image.layers.some(l => /^CMD\s/i.test(l.instruction) && !l.instruction.slice(4).trim().startsWith('[')))
      throw new Error('Use a JSON array for the startup command in this exercise.');
    return { steps };
  } catch (error) {
    return { steps, error: error instanceof Error ? error.message : 'Could not check this recipe.' };
  }
}
