import { COMPOSE_EXAMPLES } from '../../dockerlab/src/data/examples';

export const runtimeTemplates = [
  { id: 'web', example: COMPOSE_EXAMPLES[1], probe: 'curl http://localhost:8080' },
  { id: 'database', example: COMPOSE_EXAMPLES[0], probe: 'curl http://localhost:5000' },
  { id: 'cache', example: COMPOSE_EXAMPLES[2], probe: 'curl http://localhost:5000' },
] as const;

export const interviewCases = [
  { question: 68, id: 'persistence', title: 'Where did the database data go?', topic: 'Named volumes' },
  { question: 69, id: 'networks', title: 'Two containers cannot communicate on the same host', topic: 'Container networking' },
  { question: 74, id: 'permissions', title: 'A mounted volume denies writes', topic: 'Volume permissions' },
] as const;

// Source order follows the Docker Interview Preparation Guide, index pages 1–4.
export const dockerQuestionTopics = [
  'Docker and virtual machines', 'Client, daemon and registry', 'Image versus container', 'Dockerfile instructions',
  'CMD and ENTRYPOINT', 'COPY and ADD', 'Image layers and cache', 'Multi-stage builds', 'Volume, bind and tmpfs mounts',
  'Network drivers', 'Exposing and publishing ports', 'Using .dockerignore', 'Environment and build variables', 'Compose fundamentals',
  'Exec and attach', 'Container lifecycle', 'Logs and startup failures', 'Image registries', 'Image tagging', 'Build context',
  'Save, export and commit', 'Docker Desktop and Engine', 'Ordering Dockerfile instructions', 'Choosing a base image',
  'Non-root containers', 'Health checks', 'Compose in production', 'Memory and CPU limits', 'Container DNS',
  'Persistent storage patterns', 'Image scanning', 'Reducing image size', 'CI build caching', 'Multi-platform builds',
  'Build secrets', 'Container logging', 'PID 1 and child processes', 'Graceful shutdown', 'Language-specific Dockerfiles',
  'Docker-in-Docker and socket mounting', 'Private registries', 'ARG scope and ONBUILD', 'Migrating Compose versions',
  'Container design mistakes', 'Daemon settings and log rotation', 'Swarm fundamentals', 'Container design patterns',
  'Docker contexts', 'Namespaces and cgroups', 'OCI standards', 'Container runtimes', 'Rootless containers',
  'Storage drivers', 'Network internals', 'Layer deduplication', 'BuildKit architecture', 'Enterprise image governance',
  'Signing and supply-chain integrity', 'Capabilities and security profiles', 'Docker Bench checks', 'Docker socket access',
  'Migrating Compose to Kubernetes', 'Diagnose a restart loop', 'Speed up a slow build', 'Shrink an oversized image',
  'Diagnose a production-only crash', 'Respond to a secret in an image layer', 'Investigate lost database data',
  'Restore communication between containers', 'Handle registry rate limits in CI', 'Respond to a compromised container',
  'Plan a monolith migration', 'Investigate an OOM kill', 'Repair a volume permission mismatch',
  'Investigate zombie processes', 'Diagnose Docker disk usage', 'Investigate intermittent DNS', 'Diagnose slow shutdown',
  'Respond to a compromised base image', 'Investigate repeated CI cache misses',
] as const;

export const referenceCommands = [
  ['Images', 'docker pull nginx', 'Download an image into the simulated engine.'],
  ['Images', 'docker images', 'List local images and tags.'],
  ['Images', 'docker image ls', 'List images using the object command.'],
  ['Images', 'docker image inspect nginx', 'Inspect metadata, entrypoint, and files.'],
  ['Images', 'docker rmi nginx', 'Remove an unused image.'],
  ['Containers', 'docker run -d --name web -p 8080:80 nginx', 'Create a container and forward host port 8080.'],
  ['Containers', 'docker ps', 'List running containers.'],
  ['Containers', 'docker ps -a', 'Include exited containers.'],
  ['Containers', 'docker ps -a --filter status=exited', 'Show containers whose main process exited.'],
  ['Containers', 'docker ps -aq --filter status=exited', 'Return just the IDs of exited containers.'],
  ['Containers', 'docker container ls -a --format "{{.Names}} {{.State}}"', 'Display selected fields from the container list.'],
  ['Containers', 'docker inspect web', 'Inspect the current configuration and state.'],
  ['Containers', 'docker logs web', 'Read the process log.'],
  ['Containers', 'docker stats', 'Show illustrative resource usage.'],
  ['Containers', 'docker stop web', 'Stop the process and retain the container.'],
  ['Containers', 'docker start web', 'Start the same container again.'],
  ['Containers', 'docker restart web', 'Restart the container process.'],
  ['Containers', 'docker rm web', 'Remove a stopped container.'],
  ['Containers', 'docker exec -it web sh', 'Enter the simulated container shell. Use exit to return.'],
  ['Networks', 'docker network create backend', 'Create a user-defined bridge.'],
  ['Networks', 'docker network ls', 'List available networks.'],
  ['Networks', 'docker network connect backend web', 'Attach a running service to a network.'],
  ['Networks', 'docker network inspect backend', 'Inspect network membership and addresses.'],
  ['Networks', 'docker network disconnect backend web', 'Detach the service.'],
  ['Networks', 'docker network rm backend', 'Remove an unused network.'],
  ['Volumes', 'docker volume create data', 'Create persistent storage.'],
  ['Volumes', 'docker volume ls', 'List volumes.'],
  ['Volumes', 'docker volume inspect data', 'Inspect storage and its mounts.'],
  ['Volumes', 'docker volume rm data', 'Remove an unused volume.'],
  ['Build and registry', 'docker build -t status:v1 .', 'Build the included Flask project.'],
  ['Build and registry', 'docker login -u learner', 'Select a virtual registry account.'],
  ['Build and registry', 'docker tag nginx learner/web:v1', 'Add a registry tag.'],
  ['Build and registry', 'docker push learner/web:v1', 'Publish to the simulated registry.'],
  ['Build and registry', 'docker logout', 'Leave the virtual registry session.'],
  ['Compose', 'docker compose config', 'Inspect the normalized project configuration.'],
  ['Compose', 'docker compose build', 'Build project images.'],
  ['Compose', 'docker compose up -d', 'Create or start the stack.'],
  ['Compose', 'docker compose ps', 'Inspect project services.'],
  ['Compose', 'docker compose logs', 'Read service logs.'],
  ['Compose', 'docker compose stop', 'Stop project services.'],
  ['Compose', 'docker compose start', 'Resume project services.'],
  ['Compose', 'docker compose down', 'Remove project containers and networks.'],
  ['Diagnostics', 'curl http://localhost:8080', 'Test a published HTTP listener.'],
  ['Diagnostics', 'docker exec web ping database', 'Check container-to-container reachability.'],
  ['Diagnostics', 'docker exec web nslookup database', 'Resolve a service name.'],
] as const;

export interface Lab {
  name: string;
  image: string;
  host: number;
  listener: number;
  initialTarget?: number;
}

export const guided: Lab = { name: 'flask-web', image: 'jijo/flask-web:v1', host: 8080, listener: 5000 };
export const transfer: Lab = { name: 'weather-api', image: 'jijo/weather-api:v1', host: 9090, listener: 7000, initialTarget: 5000 };

export function portExperiments(lab: Lab) {
  return [
    { name: 'Change the host port', host: lab.host + 1, target: lab.listener },
    { name: 'Change the container port', host: lab.host, target: lab.listener + 1 },
  ];
}

export const milestones = ['Predict the response', 'Repair the connection', 'Explain the fix', 'Solve a new case'];
export const frameworks = ['Flask', 'FastAPI', 'Express', 'Fastify'] as const;
export type Framework = typeof frameworks[number];
export const frameworkLessons = {
  Flask: { port: 5000, runtime: 'Python', goal: 'Copy the dependency list before installing Flask.', challenge: 'The build context contains requirements.txt. Find the instruction that asks for a different file.' },
  FastAPI: { port: 8000, runtime: 'Python', goal: 'Match the documented port to the Uvicorn listener.', challenge: 'The HTTP server listens on port 8000. Check the port recorded in the image.' },
  Express: { port: 3000, runtime: 'Node.js', goal: 'Use the lockfile to install a repeatable set of packages.', challenge: 'npm ci needs both package files. Inspect the layer immediately before installation.' },
  Fastify: { port: 3000, runtime: 'Node.js', goal: 'Start the server from a file present in the image.', challenge: 'Compare the startup command with the filename in the build context.' },
} as const;

export function frameworkSource(name: Framework): string {
  if (name === 'Flask') return sources(guided)['app.py'];
  if (name === 'FastAPI') return [
    'from fastapi import FastAPI', 'import uvicorn', '', 'app = FastAPI()', '',
    '@app.get("/")', 'def index():', '    return {"service": "FastAPI"}', '',
    'if __name__ == "__main__":', '    uvicorn.run(app, host="0.0.0.0", port=8000)', '',
  ].join('\n');
  if (name === 'Express') return [
    'import express from "express";', 'const app = express();',
    'app.get("/", (_request, response) => response.json({ service: "Express" }));',
    'app.listen(3000, "0.0.0.0");', '',
  ].join('\n');
  return [
    'import Fastify from "fastify";', 'const app = Fastify({ logger: true });',
    'app.get("/", async () => ({ service: "Fastify" }));',
    'await app.listen({ port: 3000, host: "0.0.0.0" });', '',
  ].join('\n');
}
export const predictions = ['The app responds', 'The connection fails', 'The container exits'];
export const explanations = [
  'EXPOSE makes the app available on every host port.',
  'Publishing forwards a host port to the port where the app listens.',
  'Changing the host port changes the port Flask listens on.',
];

export function sources(lab: Lab) {
  return {
    'app.py': [
      'from flask import Flask', '', 'app = Flask(__name__)', '', '',
      '@app.get("/")', 'def index():', '    return "Hello from ' + lab.name + '!\\n"', '', '',
      'if __name__ == "__main__":', '    app.run(host="0.0.0.0", port=' + lab.listener + ')', '',
    ].join('\n'),
    'requirements.txt': 'Flask==3.1.2\n',
    Dockerfile: [
      'FROM python:3.12-slim', 'WORKDIR /app', 'COPY requirements.txt .',
      'RUN pip install --no-cache-dir -r requirements.txt', 'COPY app.py .',
      'EXPOSE ' + lab.listener, 'USER 10001', 'CMD ["python", "app.py"]', '',
    ].join('\n'),
  };
}

export const dockerfileInstructions = [
  ['FROM', 'Select the base image'], ['WORKDIR', 'Set the working directory'], ['COPY', 'Copy files from the build context'],
  ['ADD', 'Add files to the image'], ['ARG', 'Define a build argument'], ['ENTRYPOINT', 'Set the image entry point'],
  ['RUN', 'Run a build command'], ['ENV', 'Set an environment variable'], ['USER', 'Set the runtime user'],
  ['EXPOSE', 'Document a container port'], ['CMD', 'Set the startup command'],
] as const;
