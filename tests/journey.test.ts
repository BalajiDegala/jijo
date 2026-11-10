import assert from 'node:assert/strict';
import test from 'node:test';
import { unzipSync, strFromU8 } from 'fflate';
import { parse } from 'yaml';
import { archive, buildBundle } from '../studio/lab/artifacts';
import { guided, transfer } from '../studio/lab/content';
import { append, emptyProject, maxEvents, replay, restore } from '../studio/lab/journey';
import type { Event } from '../studio/lab/journey';

const prediction: Event = { type: 'predict', choice: 1 };
const repair: Event = { type: 'map', host: guided.host, target: guided.listener };
const verify: Event = { type: 'verify' };
const explain: Event = { type: 'explain', choice: 1 };
const changed: Event = { type: 'map', host: transfer.host, target: transfer.listener };
const project = (...events: Event[]) => ({ ...emptyProject(), events });
const run = (...events: Event[]) => replay(project(...events));
const first = [prediction, repair, verify, explain];

test('prediction comes before any HTTP response and records incorrect predictions', () => {
  assert.equal(run().log.length, 0);
  assert.throws(() => run(verify));
  const s = run({ type: 'predict', choice: 2 });
  assert.equal(s.prediction, 2);
  assert.equal(s.stage, 'repair');
  assert.match(s.log[0].output, /no running service publishes/);
});

test('the host port, listener, protocol and running process all affect verification', () => {
  for (const variation of [
    [prediction, verify],
    [prediction, { type: 'map', host: 8000, target: 5000 }, verify],
    [prediction, { type: 'map', host: 8080, target: 4000 }, verify],
    [prediction, repair, { type: 'command', text: 'docker stop flask-web' }, verify],
    [prediction, { type: 'command', text: 'docker rm -f flask-web' }, { type: 'command', text: 'docker run -d --name flask-web -p 8080:5000/udp jijo/flask-web:v1' }, verify],
  ] as Event[][]) {
    assert.equal(run(...variation).stage, 'repair');
  }
  assert.equal(run(prediction, repair, verify).stage, 'explain');
});

test('a learner can remove and run the service from the terminal instead of using the form', () => {
  const steps = ['docker logs flask-web', 'docker inspect flask-web', 'docker stop flask-web', 'docker rm flask-web',
    'docker run --name flask-web --publish 8080:5000 --detach jijo/flask-web:v1'].map(text => ({ type: 'command', text } as Event));
  const s = run(prediction, ...steps, verify);
  assert.equal(s.stage, 'explain');
  assert.ok(s.log.at(-1)?.output.startsWith('HTTP/1.1 200 OK'));
});

test('commands outside the lab and shell operators cannot change its resources', () => {
  const s = run(prediction, { type: 'command', text: 'docker run -d --name other nginx' },
    { type: 'command', text: 'docker rm -f flask-web; echo fail' });
  assert.equal(s.engine.state.containers.length, 1);
  assert.equal(s.engine.container('flask-web').status, 'running');
  assert.equal(s.log.at(-1)?.success, false);
});

test('the explanation and independent repair require fresh evidence', () => {
  assert.equal(run(prediction, repair, verify, { type: 'explain', choice: 0 }).stage, 'explain');
  const s = run(...first, verify);
  assert.equal(s.stage, 'transfer');
  assert.match(s.feedback, /no service listening on 5000/);
  assert.throws(() => run(...first, { type: 'hint' }));
  assert.equal(run(...first, changed, verify).stage, 'complete');
});

test('project files include the repaired mapping, Python listener and checklist in a readable ZIP', async () => {
  const s = run(...first, changed, verify);
  const bundle = buildBundle(s);
  const bytes = new Uint8Array(await archive(bundle).arrayBuffer());
  const unzipped = unzipSync(bytes);
  assert.deepEqual(Object.keys(unzipped).sort(), ['Dockerfile', 'VERIFY.md', 'app.py', 'compose.yaml', 'requirements.txt']);
  assert.deepEqual(parse(strFromU8(unzipped['compose.yaml'])).services.web.ports, ['9090:7000']);
  assert.match(strFromU8(unzipped['Dockerfile']), /EXPOSE 7000/);
  assert.match(strFromU8(unzipped['app.py']), /host="0.0.0.0", port=7000/);
  assert.throws(() => buildBundle(run(...first)));
  s.engine.container(transfer.name).ports = [];
  assert.throws(() => buildBundle(s), /mapping/);
});

test('restoration derives progress from actions and rejects invalid input or sequence', () => {
  const p = project(...first, changed, verify);
  assert.deepEqual(restore(JSON.parse(JSON.stringify(p))), p);
  assert.equal(replay(restore({ ...p, stage: 'predict' })).stage, 'complete');
  for (const invalid of [null, { ...p, version: 2 }, { ...p, journey: 'unknown' },
    { ...p, events: [verify] }, { ...p, events: [prediction, { type: 'map', target: 65536, host: 8080 }] },
    { ...p, events: [{ type: 'predict', choice: 99 }] }, { ...p, events: Array(maxEvents + 1).fill(verify) }]) {
    assert.throws(() => restore(invalid));
  }
  assert.throws(() => append(project(...Array(maxEvents).fill(verify)), verify));
});
