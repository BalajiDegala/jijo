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
