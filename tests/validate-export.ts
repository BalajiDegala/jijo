import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildBundle } from '../studio/lab/artifacts';
import { emptyProject, replay } from '../studio/lab/journey';

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
} finally {
  rmSync(directory, { recursive: true, force: true });
}
