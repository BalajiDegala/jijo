import assert from 'node:assert/strict';
import test from 'node:test';
import { parse } from 'yaml';
import { frameworks } from '../studio/lab/content';
import { compileGraph, connect, initialPlayground, makeNode, readPlayground, removeNode, stackFiles } from '../studio/playgrounds/graph';
import { brokenRecipe, checkRecipe, recipeFiles } from '../studio/playgrounds/recipes';

for (const name of frameworks) {
  test(name + ' starter builds through DockerLab and its broken exercise gives targeted feedback', () => {
    const good = checkRecipe(name, recipeFiles(name).Dockerfile);
    assert.equal(good.error, undefined);
    assert.ok(good.steps.length >= 7);
    const issue = checkRecipe(name, brokenRecipe(name)).error;
    const expected = { Flask: /packages.txt/, FastAPI: /EXPOSE 8000/, Express: /package-lock.json/, Fastify: /CMD/ };
    assert.match(issue!, expected[name]);
  });
}
test('renaming resources updates generated dependencies, network names, mounts and paths', () => {
  const { graph } = initialPlayground();
  graph.nodes[0].name = 'catalog';
  graph.nodes[1].name = 'books';
  graph.nodes[2].name = 'library';
  const result = compileGraph(graph);
  const files = stackFiles(result);
  const cfg = parse(files['compose.yaml']);
  assert.deepEqual(cfg.services.catalog.depends_on, ['books']);
  assert.deepEqual(cfg.services.catalog.networks, ['library']);
  assert.deepEqual(cfg.services.books.volumes, ['db-data:/var/lib/postgresql/data']);
  assert.equal(cfg.services.catalog.build, './apps/catalog');
  assert.ok(files['apps/catalog/Dockerfile'].includes('EXPOSE 5000'));
});
test('dependency location and runtime user must match the supported image layout', () => {
  const source = recipeFiles('Express').Dockerfile;
  assert.match(checkRecipe('Express', source.replace('RUN npm', 'USER node\nRUN npm')).error!, /before switching/);
  assert.match(checkRecipe('Express', source.replace('COPY server.js', 'WORKDIR /other\nCOPY server.js')).error!, /node_modules/);
  assert.match(checkRecipe('Express', source.replace('USER node', 'USER unknown')).error!, /user ID/);
});
test('duplicate ports and names, bad mount paths, isolated dependencies and cycles block export', () => {
  for (const rule of ['port', 'name', 'mount', 'network', 'cycle']) {
    let { graph } = initialPlayground();
    const [app, db, net] = graph.nodes;
    if (rule === 'port') db.host = app.host;
    if (rule === 'name') db.name = app.name;
    if (rule === 'mount') graph.links.find(e => e.mount)!.mount = '../escape';
    if (rule === 'network') graph.links = graph.links.filter(e => !(e.from === db.id && e.to === net.id));
    if (rule === 'cycle') graph.links.push({ from: db.id, to: app.id });
    const result = compileGraph(graph);
    assert.ok(result.issues.length, rule);
    assert.throws(() => stackFiles(result));
  }
});
test('invalid connections fail; removing a resource releases its edges', () => {
  const { graph } = initialPlayground();
  const [app, db, net] = graph.nodes;
  assert.throws(() => connect(graph, net.id, db.id), /Start/);
  assert.throws(() => connect(graph, app.id, app.id), /itself/);
  assert.throws(() => connect(graph, app.id, db.id), /already/);
  assert.throws(() => connect(graph, db.id, app.id), /cycle/);
  const trimmed = removeNode(graph, db.id);
  assert.ok(trimmed.links.every(e => e.from !== db.id && e.to !== db.id));
  assert.equal(compileGraph(trimmed).issues.length, 0);
});
test('import validates record shape while preserving actionable design errors', () => {
  const p = initialPlayground();
  const app = makeNode(p.graph, 'app', 'Express', brokenRecipe('Express'));
  p.graph.nodes.push(app);
  assert.deepEqual(readPlayground(JSON.parse(JSON.stringify(p))), p);
  assert.match(compileGraph(p.graph).issues.join(' '), /package-lock/);
  assert.throws(() => readPlayground({ ...p, version: 2 }));
  p.graph.links.push({ from: 'unknown', to: app.id });
  assert.throws(() => readPlayground(p));
});
