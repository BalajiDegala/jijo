import { stringify } from 'yaml';
import { parseCompose, type ComposeService } from '../../dockerlab/src/engine/ComposeEngine';
import { frameworks, frameworkLessons, type Framework } from '../lab/content';
import { checkRecipe, maxRecipe, recipeFiles } from './recipes';

export const kinds = ['app', 'nginx', 'postgres', 'redis', 'network', 'volume'] as const;
export type Kind = typeof kinds[number];
export const labels: Record<Kind, string> = {
  app: 'Application', nginx: 'Nginx', postgres: 'PostgreSQL', redis: 'Redis', network: 'Network', volume: 'Volume',
};
export interface Resource {
  id: string; kind: Kind; name: string; x: number; y: number; host: string;
  recipe?: { framework: Framework; source: string };
}
export interface Link { from: string; to: string; mount?: string }
export interface Graph { nodes: Resource[]; links: Link[] }
export interface Playground {
  version: 1; graph: Graph; active: Framework; drafts: Partial<Record<Framework, string>>;
}
export const maxNodes = 32;
export const maxLinks = 128;
export const isService = (kind: Kind) => kind !== 'network' && kind !== 'volume';
export function listener(node: Resource) {
  if (node.recipe) return frameworkLessons[node.recipe.framework].port;
  return ({ nginx: 80, redis: 6379, postgres: 5432 } as Partial<Record<Kind, number>>)[node.kind];
}
export const relation = (kind: Kind) => kind === 'volume' ? 'mounts' : kind === 'network' ? 'joins' : 'depends on';
export const imageFor = { nginx: 'nginx:alpine', redis: 'redis:7-alpine', postgres: 'postgres:16-alpine' } as const;

export function makeNode(graph: Graph, kind: Kind, framework: Framework = 'Flask', source?: string): Resource {
  const base = kind === 'app' ? framework.toLowerCase() : kind;
  let name: string = base;
  for (let n = 2; graph.nodes.some(r => r.name === name); n++) name = base + '-' + n;
  let slot = 0;
  while (graph.nodes.some(r => Math.abs(r.x - (slot % 3) * 240) < 165 && Math.abs(r.y - Math.floor(slot / 3) * 140) < 90)) slot++;
  let host = '';
  if (kind === 'app' || kind === 'nginx') {
    let port = 8080;
    while (graph.nodes.some(r => r.host === String(port))) port++;
    host = String(port);
  }
  return { id: crypto.randomUUID(), kind, name, x: (slot % 3) * 240, y: Math.floor(slot / 3) * 140, host,
    ...(kind === 'app' && { recipe: { framework, source: source ?? recipeFiles(framework).Dockerfile } }) };
}

export function initialPlayground(): Playground {
  const empty: Graph = { nodes: [], links: [] };
  const app = { ...makeNode(empty, 'app'), name: 'api', x: 0, y: 0 };
  const db = { ...makeNode(empty, 'postgres'), name: 'database', x: 310, y: 0 };
  const net = { ...makeNode(empty, 'network'), name: 'backend', x: 0, y: 165 };
  const vol = { ...makeNode(empty, 'volume'), name: 'db-data', x: 310, y: 165 };
  return { version: 1, active: 'Flask', drafts: {}, graph: { nodes: [app, db, net, vol], links: [
    { from: app.id, to: db.id }, { from: app.id, to: net.id }, { from: db.id, to: net.id }, { from: db.id, to: vol.id, mount: '/var/lib/postgresql/data' },
  ] } };
}

export function connect(graph: Graph, from: string, to: string): Graph {
  const a = graph.nodes.find(r => r.id === from);
  const b = graph.nodes.find(r => r.id === to);
  if (!a || !b || !isService(a.kind)) throw new Error('Start a connection at a service.');
  if (from === to) throw new Error('A service cannot depend on itself.');
  if (graph.links.some(e => e.from === from && e.to === to)) throw new Error('These resources are already connected.');
  if (graph.links.length >= maxLinks) throw new Error('This workspace supports 128 connections.');
  const mount = a.kind === 'postgres' ? '/var/lib/postgresql/data' : '/data';
  return { ...graph, links: [...graph.links, { from, to, ...(b.kind === 'volume' && { mount }) }] };
}
export function removeNode(graph: Graph, id: string): Graph {
  return { nodes: graph.nodes.filter(n => n.id !== id), links: graph.links.filter(e => e.from !== id && e.to !== id) };
}

export interface Result { issues: string[]; yaml: string; files: Record<string, string> }
export function compileGraph(graph: Graph): Result {
  const issues: string[] = [];
  const nodes = new Map(graph.nodes.map(n => [n.id, n]));
  const services: Record<string, ComposeService> = Object.create(null);
  const networks: Record<string, { driver: string }> = Object.create(null);
  const volumes: Record<string, null> = Object.create(null);
  const files: Record<string, string> = {};
  const contexts = new Set<string>();
  const names = new Set<string>();
  const hosts = new Set<number>();
  const attached = (id: string, kind: Kind) => graph.links.filter(e => e.from === id && nodes.get(e.to)?.kind === kind);
  const networkNames = (id: string) => {
    const names = attached(id, 'network').map(e => nodes.get(e.to)!.name);
    return names.length ? names : ['default'];
  };
  for (const n of graph.nodes) {
    if (!/^[a-z][a-z0-9-]{0,47}$/.test(n.name) || n.name in Object.prototype)
      issues.push('Use a lowercase resource name starting with a letter, up to 48 letters, digits or hyphens.');
    if (names.has(n.name)) issues.push('Duplicate resource name “' + n.name + '”. Rename one resource.');
    names.add(n.name);
    if (!isService(n.kind)) {
      if (n.kind === 'volume') volumes[n.name] = null;
      else networks[n.name] = { driver: 'bridge' };
      continue;
    }
    const service: ComposeService = {};
    services[n.name] = service;
    if (n.kind === 'app' && n.recipe) {
      const { framework, source } = n.recipe;
      const checked = checkRecipe(framework, source);
      if (checked.error) issues.push(n.name + ' Dockerfile: ' + checked.error);
      const path = 'apps/' + n.name;
      service.build = './' + path;
      contexts.add(service.build);
      for (const [filename, contents] of Object.entries({ ...recipeFiles(framework), Dockerfile: source }))
        files[path + '/' + filename] = contents;
    } else if (n.kind === 'nginx' || n.kind === 'postgres' || n.kind === 'redis') {
      service.image = imageFor[n.kind];
    }
    if (n.host) {
      const port = Number(n.host);
      if (!/^[1-9]\d{0,4}$/.test(n.host) || port > 65535) issues.push(n.name + ' needs a host port from 1 to 65535, or a blank field for internal access.');
      if (hosts.has(port)) issues.push('Host port ' + n.host + ' is published by more than one service.');
      hosts.add(port);
      service.ports = [n.host + ':' + listener(n)];
    }
    if (n.kind === 'postgres') service.environment = { POSTGRES_PASSWORD: '${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD before starting the stack}' };
    const nets = attached(n.id, 'network').map(e => nodes.get(e.to)!.name);
    if (nets.length) service.networks = nets;
    const mountPaths = new Set<string>();
    for (const e of attached(n.id, 'volume')) {
      const path = e.mount ?? '';
      if (!/^\/(?:[a-zA-Z0-9._-]+\/)*[a-zA-Z0-9._-]+$/.test(path) || path.split('/').some(p => p === '..' || p === '.'))
        issues.push(n.name + ' needs an absolute container mount path such as /data.');
      if (mountPaths.has(path)) issues.push(n.name + ' mounts two volumes at ' + path + '. Choose distinct mount paths.');
      mountPaths.add(path);
      (service.volumes ??= []).push(nodes.get(e.to)!.name + ':' + path);
    }
    const deps = graph.links.filter(e => e.from === n.id && isService(nodes.get(e.to)!.kind));
    for (const e of deps) {
      const target = nodes.get(e.to)!;
      service.depends_on ??= [];
      (service.depends_on as string[]).push(target.name);
      if (!networkNames(e.from).some(net => networkNames(e.to).includes(net)))
        issues.push(n.name + ' and ' + target.name + ' need a shared network for service-name communication.');
    }
  }
  if (Object.keys(services).length === 0) issues.push('Add an application, web server, database or cache to export a stack.');
  const config = { name: 'jijo-stack', services,
    ...(Object.keys(networks).length && { networks }), ...(Object.keys(volumes).length && { volumes }) };
  const yaml = stringify(config);
  if (!issues.length) {
    try { parseCompose(yaml, {}, contexts); }
    catch (error) { issues.push((error as Error).message); }
  }
  return { issues: [...new Set(issues)], yaml, files };
}

export function stackFiles(result: Result) {
  if (result.issues.length) throw new Error('Resolve the graph errors before exporting.');
  return { ...result.files, 'compose.yaml': result.yaml,
    'README.md': [
      '# JIJO Compose project', '', 'Extract all files together before running Docker Compose.',
      ...(result.yaml.includes('POSTGRES_PASSWORD') ? ['Supply POSTGRES_PASSWORD in your shell environment or a local .env file.'] : []),
      'Inspect the expanded configuration with docker compose config.',
      'For a local run, use docker compose up --build and stop it with docker compose down.',
      'Published ports bind to host interfaces. Use a trusted development machine.',
      'depends_on sets startup order. Network attachment enables service-name discovery. Applications need their own client code to query a database or cache.', '',
    ].join('\n') };
}

const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const smallText = (v: unknown, size: number): v is string => typeof v === 'string' && v.length <= size;
const framework = (v: unknown): v is Framework => frameworks.some(f => f === v);
export function readPlayground(v: unknown): Playground {
  const fail = () => { throw new Error('Unsupported or damaged playground data.'); };
  if (!record(v) || v.version !== 1 || !framework(v.active) || !record(v.drafts) || !record(v.graph)) throw new Error('Unsupported playground version.');
  for (const [name, draft] of Object.entries(v.drafts)) if (!framework(name) || !smallText(draft, maxRecipe)) fail();
  const { nodes, links } = v.graph;
  if (!Array.isArray(nodes) || nodes.length > maxNodes || !Array.isArray(links) || links.length > maxLinks) throw new Error('Invalid graph size.');
  const ids = new Set<string>();
  for (const n of nodes) {
    if (!record(n) || !smallText(n.id, 64) || !n.id || ids.has(n.id) || !kinds.some(k => k === n.kind) ||
        !smallText(n.name, 48) || !smallText(n.host, 5) || !Number.isFinite(n.x) || !Number.isFinite(n.y)) throw new Error('Invalid resource record.');
    ids.add(n.id);
    if (n.kind === 'app' ? !record(n.recipe) || !framework(n.recipe.framework) || !smallText(n.recipe.source, maxRecipe) : n.recipe !== undefined) fail();
  }
  const pairs = new Set<string>();
  for (const e of links) {
    if (!record(e) || typeof e.from !== 'string' || typeof e.to !== 'string' || !ids.has(e.from) || !ids.has(e.to) || e.from === e.to ||
      !isService(nodes.find(n => n.id === e.from).kind) || (e.mount !== undefined && !smallText(e.mount, 100))) fail();
    const pair = JSON.stringify([e.from, e.to]);
    if (pairs.has(pair)) fail();
    pairs.add(pair);
  }
  return v as unknown as Playground;
}
