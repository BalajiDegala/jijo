import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { buildBundle } from '../studio/lab/artifacts';
import { emptyProject, replay } from '../studio/lab/journey';
import { frameworks } from '../studio/lab/content';
import { compileGraph, initialPlayground, makeNode, stackFiles } from '../studio/playgrounds/graph';

const session = replay({ ...emptyProject(), events: [
  { type: 'predict', choice: 1 }, { type: 'map', host: 8080, target: 5000 }, { type: 'verify' },
  { type: 'explain', choice: 1 }, { type: 'map', host: 9090, target: 7000 }, { type: 'verify' },
] });
const directory = mkdtempSync(join(tmpdir(), 'jijo-export-'));
const files = buildBundle(session);
try {
  for (const [name, source] of Object.entries(files)) writeFileSync(join(directory, name), source);
  const config = JSON.parse(execFileSync('docker', ['compose', 'config', '--format', 'json'], { cwd: directory, encoding: 'utf8' }));
  const [port] = config.services.web.ports;
  assert.equal(port.published, '9090');
  assert.equal(port.target, 7000);
  const python = process.env.PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
  execFileSync(python, ['-m', 'py_compile', 'app.py'], { cwd: directory });
  console.log('Compose normalized the verified ports. Python compiled app.py.');
  const graph = initialPlayground().graph;
  for (const name of frameworks.filter(f => f !== 'Flask')) graph.nodes.push(makeNode(graph, 'app', name));
  const exported = stackFiles(compileGraph(graph));
  const stackDir = join(directory, 'stack');
  for (const [path, content] of Object.entries(exported)) {
    const file = join(stackDir, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
    if (path.endsWith('.py')) execFileSync(python, ['-m', 'py_compile', file]);
    if (path.endsWith('.js')) execFileSync(process.execPath, ['--check', file]);
  }
  const stack = JSON.parse(execFileSync('docker', ['compose', 'config', '--format', 'json'], {
    cwd: stackDir, encoding: 'utf8', env: { ...process.env, POSTGRES_PASSWORD: 'validation-fixture-only' },
  }));
  assert.equal(Object.keys(stack.services).length, 5);
  assert.equal(stack.services.api.depends_on.database.condition, 'service_started');
  assert.equal(stack.services.database.volumes[0].target, '/var/lib/postgresql/data');
  for (const resource of graph.nodes.filter(n => n.recipe)) assert.equal(stack.services[resource.name].build.context, join(stackDir, 'apps', resource.name));
  console.log('Compose verified the resource graph and all four framework build contexts. Python and Node parsed the exported entry points.');
} finally {
  rmSync(directory, { recursive: true, force: true });
}
