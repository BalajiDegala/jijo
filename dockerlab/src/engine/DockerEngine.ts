import type { EngineState, DockerEvent, EventCategory, ImageResource, ContainerResource, NetworkResource, VolumeResource, RunOptions, Port, Mount, CommandResult } from './types';
import { imageCatalog, reference, timestamp } from './catalog';
import { tokenize, parseFlags, requireArgs, table, HELP } from './CommandParser';

const validName = (name: string) => { if(!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) throw new Error(`Invalid resource name: "${name}". Use letters, numbers, underscores, dots, or hyphens.`); };
export function emptyState(): EngineState {
  return { version: 1, sequence: 3, clock:0, images: [], containers: [], volumes: [], events: [], buildCache: [], registry: {username:null,repositories:[]}, networks: [
    {id:'net000000001', name:'bridge',driver:'bridge',subnet:'172.17.0.0/16',gateway:'172.17.0.1',containers:[],builtin:true},
    {id:'net000000002', name:'host',driver:'host',subnet:'',gateway:'',containers:[],builtin:true},
    {id:'net000000003', name:'none',driver:'null',subnet:'',gateway:'',containers:[],builtin:true},
  ] };
}
export class DockerEngine {
  state: EngineState;
  private listeners = new Set<()=>void>();
  extension?: (args: string[]) => string;
  constructor(saved?: EngineState) { this.state=saved?structuredClone(saved):emptyState(); }
  subscribe = (listener:()=>void) => { this.listeners.add(listener); return ()=>{this.listeners.delete(listener)}; };
  getSnapshot = () => this.state;
  notify() { this.state={...this.state}; this.listeners.forEach(l=>l()); }
  reset() { this.state=emptyState(); this.event('system','reset','Virtual environment reset.'); this.notify(); }
  id(prefix: string) { return prefix + (++this.state.sequence).toString(16).padStart(9,'0'); }
  event(category: EventCategory, action: string, message: string, resourceId?: string, level: 'info'|'error'='info') {
    const event: DockerEvent={id:this.id('evt'),time:timestamp(),category,action,message,resourceId,level};
    this.state.events.push(event); if(this.state.events.length>800) this.state.events.shift(); return event;
  }
  image(value: string): ImageResource { const result=this.state.images.find(x=>`${x.repository}:${x.tag}`===reference(value)||x.id===value); if(!result) throw new Error(`No such image: ${value}`); return result; }
  container(value: string): ContainerResource { const result=this.state.containers.find(x=>x.name===value||x.id===value||x.id.startsWith(value)&&value.length>=4); if(!result) throw new Error(`No such container: ${value}`); return result; }
  network(value: string): NetworkResource { const result=this.state.networks.find(x=>x.name===value||x.id===value); if(!result) throw new Error(`network ${value} not found`); return result; }
  volume(value: string): VolumeResource { const result=this.state.volumes.find(x=>x.name===value||x.id===value); if(!result) throw new Error(`No such volume: ${value}`); return result; }
  pull(value: string): ImageResource {
    const ref=reference(value); const found=this.state.images.find(x=>`${x.repository}:${x.tag}`===ref); if(found) return found;
    const [repository,tag]=ref.split(':'); const item=imageCatalog[repository];
    if(!item || !item.tags.includes(tag)) throw new Error(`pull access denied for ${ref}: repository or tag does not exist in the virtual registry. Available images: ${Object.keys(imageCatalog).join(', ')}.`);
    const image: ImageResource={id:this.id('sha'),repository,tag,size:item.size,layers:[{id:this.id('lay'),instruction:`FROM ${ref}`,size:item.size,cached:false,detail:'Base filesystem and default image configuration.'}],createdAt:timestamp(),source:'pulled',command:item.command,entrypoint:item.entrypoint??[],exposedPorts:item.ports,environment:item.environment??{},user:'root',files:repository==='dockerlab/flask'?{'/app/app.py':'# Virtual Flask application'}:{},workdir:'/'};
    this.state.images.push(image);this.event('image','pull',`Pulled ${ref} (${item.size} MB)`,image.id); return image;
  }
  createNetwork(name: string, driver='bridge', subnet?: string) {
    validName(name); if(this.state.networks.some(n=>n.name===name)) throw new Error(`network with name ${name} already exists`);
    if(driver!=='bridge') throw new Error('Only user-defined bridge networks can be created in this simulator.');
    if(subnet && !/^172\.(1[6-9]|2\d|3[01])\.0\.0\/16$/.test(subnet)) throw new Error('Supported subnets: 172.16.0.0/16 through 172.31.0.0/16.');
    let block=18; while(this.state.networks.some(n=>n.subnet===`172.${block}.0.0/16`)) block++;
    if(block>31&&!subnet) throw new Error('No available virtual network subnets. Remove an unused network.');
    const cidr=subnet??`172.${block}.0.0/16`; if(this.state.networks.some(n=>n.subnet===cidr)) throw new Error(`Pool overlaps with another network: ${cidr}`);
    const network: NetworkResource={id:this.id('net'),name,driver:'bridge',subnet:cidr,gateway:cidr.replace('0.0/16','0.1'),containers:[],builtin:false};
    this.state.networks.push(network);this.event('network','create',`Created network ${name} · ${cidr}`,network.id);return network;
  }
  createVolume(name: string) { validName(name); const found=this.state.volumes.find(v=>v.name===name); if(found) return found;
    const volume: VolumeResource={id:this.id('vol'),name,driver:'local',mountedBy:[],data:{},owner:'root'};this.state.volumes.push(volume);this.event('volume','create',`Created persistent volume ${name}`,volume.id);return volume;
  }
  connect(networkName: string, containerName: string, aliases: string[] = []) {
    const n=this.network(networkName),c=this.container(containerName);
    if(c.networks.some(x=>x.name===n.name)) throw new Error(`endpoint ${c.name} already exists in network ${n.name}`);
    if(c.networks.some(x=>['host','none'].includes(x.name)) || (['host','none'].includes(n.name)&&c.networks.length)) throw new Error('Host and none network modes cannot be combined with other networks.');
    const prefix=n.subnet.split('.').slice(0,2).join('.'); let suffix=2;
    const used=new Set(this.state.containers.flatMap(x=>x.networks.filter(a=>a.name===n.name).map(a=>a.ip)));
    while(used.has(`${prefix}.${Math.floor(suffix/256)}.${suffix%256}`)) suffix++;
    const ip=n.driver==='bridge'?`${prefix}.${Math.floor(suffix/256)}.${suffix%256}`:n.driver==='host'?'127.0.0.1':'';
    c.networks.push({name:n.name,ip,aliases});n.containers.push(c.id);this.event('network','connect',`Connected ${c.name} → ${n.name}${ip?` (${ip})`:''}`,c.id);
  }
  disconnect(networkName: string, containerName: string) { const n=this.network(networkName),c=this.container(containerName);
    if(!c.networks.some(a=>a.name===n.name)) throw new Error(`${c.name} is not connected to network ${n.name}`);
    c.networks=c.networks.filter(a=>a.name!==n.name);n.containers=n.containers.filter(id=>id!==c.id);this.event('network','disconnect',`Disconnected ${c.name} from ${n.name}`,c.id);
  }
  parsePorts(values: string[]): Port[] {
    return values.map(value=>{ const m=value.match(/^(\d+):(\d+)(?:\/(tcp|udp))?$/); if(!m||[+m[1],+m[2]].some(n=>n<1||n>65535)) throw new Error(`Invalid port mapping: ${value}. Expected HOST:CONTAINER (1–65535).`); return {host:+m[1],container:+m[2],protocol:(m[3]??'tcp') as 'tcp'|'udp'}; });
  }
  checkPorts(ports: Port[], except?: string) { const own=new Set<string>(); for(const p of ports) { const key=`${p.host}/${p.protocol}`; if(own.has(key)) throw new Error(`Duplicate host port ${key}`); own.add(key); const conflict=this.state.containers.find(c=>c.id!==except&&c.status==='running'&&c.ports.some(x=>x.host===p.host&&x.protocol===p.protocol)); if(conflict) throw new Error(`Bind for 0.0.0.0:${p.host} failed: port is already allocated by ${conflict.name}. Inspect docker ps or choose another host port.`); } }
  run(imageRef: string, options: RunOptions = {}) {
    const name=options.name??`container-${this.state.sequence+1}`;validName(name);if(this.state.containers.some(c=>c.name===name)) throw new Error(`Conflict. The container name "${name}" is already in use.`);
    const ports=this.parsePorts(options.ports??[]);this.checkPorts(ports);
    const networks=options.networks?.length?options.networks:['bridge'];networks.forEach(n=>this.network(n));
    if(new Set(networks).size!==networks.length) throw new Error('Duplicate network attachment.');
    if(networks.length>1&&networks.some(n=>['host','none'].includes(n))) throw new Error('Host and none modes cannot be combined with other networks.');
    if(networks.includes('host')&&ports.length) throw new Error('Published ports are unsupported in host network mode.');
    const mounts: Mount[]=(options.volumes??[]).map(v=>{const parts=v.split(':');if(parts.length<2||parts.length>3||!parts[0]||!parts[1].startsWith('/')||parts[2]&&!['ro','rw'].includes(parts[2])) throw new Error(`Invalid mount: ${v}. Expected VOLUME:/absolute/path[:ro|rw].`);const type=parts[0].startsWith('.')||parts[0].startsWith('/')?'bind':'volume';if(type==='volume')validName(parts[0]);return {source:parts[0],destination:parts[1].replace(/\/$/,'')||'/',readOnly:parts[2]==='ro',type};});
    if(new Set(mounts.map(m=>m.destination)).size!==mounts.length) throw new Error('Duplicate mount destination.');
    const env: Record<string,string>={}; for(const v of options.environment??[]) {const eq=v.indexOf('=');if(eq<1||!/^\w+$/.test(v.slice(0,eq))) throw new Error(`Invalid environment variable: ${v}. Use KEY=VALUE.`);env[v.slice(0,eq)]=v.slice(eq+1);}
    if(options.restart&&!['no','always','unless-stopped','on-failure'].includes(options.restart)) throw new Error(`Unsupported restart policy: ${options.restart}`);
    let img=this.state.images.find(x=>`${x.repository}:${x.tag}`===reference(imageRef));if(!img)img=this.pull(imageRef);
    const c: ContainerResource={id:this.id('ctr'),name,image:reference(imageRef),imageId:img.id,status:'created',ports,networks:[],volumes:mounts,environment:{...img.environment,...env},command:options.command?.length?options.command:options.entrypoint?[]:img.command,entrypoint:options.entrypoint?[options.entrypoint]:img.entrypoint,exitCode:null,health:options.healthcheck?'starting':'none',healthcheck:options.healthcheck,logs:[],createdAt:timestamp(),user:options.user??img.user,restart:options.restart??'no',project:options.project,service:options.service,writableLayer:{...img.files},ready:false};
    this.state.containers.push(c);mounts.forEach(m=>{if(m.type==='volume')this.createVolume(m.source).mountedBy.push(c.id);else{this.state.bindMounts??={};this.state.bindMounts[m.source]??={data:{},owner:'root'};}});networks.forEach(n=>this.connect(n,c.id,options.aliases));
    this.event('container','create',`Created container ${name} from ${c.image}`,c.id);this.start(c.id,options.deferReady);return c;
  }
  log(c: ContainerResource, message: string) { c.logs.push(`${timestamp().slice(11,19)} ${message}`);if(c.logs.length>200)c.logs.shift(); }
  healthStatus(c:ContainerResource):'none'|'starting'|'healthy'|'unhealthy' {if(!c.healthcheck)return 'none';if(!c.ready)return 'starting';const test=c.healthcheck;if(/\bfalse\b|exit 1/.test(test))return 'unhealthy';if(/pg_isready/.test(test))return c.image.startsWith('postgres:')?'healthy':'unhealthy';if(/redis-cli ping/.test(test))return c.image.startsWith('redis:')?'healthy':'unhealthy';if(/curl /.test(test)){const port=Number(test.match(/localhost:(\d+)/)?.[1]??80);return this.listeningPorts(c).includes(port)?'healthy':'unhealthy';}return /\btrue\b|exit 0/.test(test)?'healthy':'unhealthy';}
  listeningPorts(c:ContainerResource):number[]{const img=this.state.images.find(i=>i.id===c.imageId)??this.image(c.image);const cmd=[...c.entrypoint,...c.command].join(' ');if(/(?:^|\s)nginx(?:\s|$)/.test(cmd))return [80];if(/(?:^|\s)postgres(?:\s|$)/.test(cmd))return [5432];if(/redis-server/.test(cmd))return [6379];if(/python/.test(cmd)&&/app\.py|flask/.test(cmd)){const app=Object.entries(img.files).find(([path])=>path.endsWith('app.py'))?.[1]??'';return [Number(app.match(/port\s*=\s*(\d+)/)?.[1]??5000)];}return [];}
  fail(c: ContainerResource, code: number, message: string) { c.status='exited';c.exitCode=code;c.ready=false;if(c.healthcheck)c.health='unhealthy';this.log(c,message);this.event('container','die',`${c.name} exited (${code}): ${message}`,c.id,'error'); }
  start(value: string, deferReady=false) {
    const c=this.container(value);if(c.status==='running')throw new Error(`Container ${c.name} is already running.`);this.checkPorts(c.ports,c.id);
    c.status='running';c.exitCode=null;c.ready=!deferReady;c.readyAt=deferReady?this.state.clock+3:undefined;c.health=c.healthcheck?(deferReady?'starting':'healthy'):'none';
    const cmd=[...c.entrypoint,...c.command].join(' '),img=this.state.images.find(i=>i.id===c.imageId)??this.image(c.image),executable=[...c.entrypoint,...c.command][0]?.split('/').at(-1);
    if(!cmd || !['nginx','postgres','redis-server','python','python3','node','sleep','sh','bash','hello','flask','gunicorn'].includes(executable??'') || /missing|invalid|does-not-exist|nonexistent/.test(cmd)) this.fail(c,127,`exec: "${cmd||'(empty)'}": executable file not found in the virtual runtime. Inspect Cmd and Entrypoint.`);
    else if(executable==='postgres'&&!c.environment.POSTGRES_PASSWORD&&c.environment.POSTGRES_HOST_AUTH_METHOD!=='trust') this.fail(c,1,'Database is uninitialized and superuser password is not specified. Set POSTGRES_PASSWORD.');
    else if(c.environment.DB_REQUIRED==='true') { const target=this.resolve(c.environment.DB_HOST??'database',c.id);if(!target||target.status!=='running'||!target.ready)this.fail(c,1,'Database connection refused: dependency is not ready. Add a health check and wait for service_healthy, or retry after readiness.'); }
    if(c.status==='running'&&c.image.startsWith('hello-world'))this.fail(c,0,'Hello from Docker! The process completed successfully.');
    else if(c.status==='running'&&['sh','/bin/sh','python','node'].includes(cmd))this.fail(c,0,'Interactive process reached EOF (no virtual TTY attached). Run a long-lived command to keep this container running.');
    else if(c.status==='running'&&/python\s+\S+\.py/.test(cmd)&&img.source==='built') {const file=cmd.match(/python\s+(\S+\.py)/)?.[1]??'';const path=file.startsWith('/')?file:`${img.workdir.replace(/\/$/,'')}/${file}`;if(!(path in c.writableLayer))this.fail(c,2,`python: can't open file '${path}': No such file or directory`);}
    if(c.status==='running') {c.health=this.healthStatus(c);this.log(c,deferReady?'Service initializing…':c.image.startsWith('nginx:')?'nginx: configuration complete; ready for connections on port 80':c.image.startsWith('postgres:')?'database system is ready to accept connections':`Started ${cmd}`);if(c.environment.DB_HOST&&!this.resolve(c.environment.DB_HOST,c.id))this.log(c,`Could not resolve database host "${c.environment.DB_HOST}". Check network attachments and DNS.`);this.event('container','start',`Started ${c.name}${deferReady?' · waiting for readiness':''}`,c.id);}
    return c;
  }
  advance() {this.state.clock++;for(const c of this.state.containers)if(c.status==='running'&&c.readyAt!==undefined&&c.readyAt<=this.state.clock){c.ready=true;c.readyAt=undefined;c.health=this.healthStatus(c);this.log(c,'Service initialization complete. Ready to accept connections.');this.event('container','health',`${c.name} is ready${c.healthcheck?` (${c.health})`:''}`,c.id);}}
  stop(value: string) {const c=this.container(value);if(c.status!=='running')throw new Error(`Container ${c.name} is not running.`);c.status='exited';c.exitCode=0;c.ready=false;this.log(c,'Received SIGTERM. Graceful shutdown complete.');this.event('container','stop',`Stopped ${c.name}`,c.id);return c;}
  removeContainer(value: string, force=false) {const c=this.container(value);if(c.status==='running'&&!force)throw new Error(`Cannot remove running container ${c.name}. Stop it first or use docker rm -f.`);c.networks.forEach(a=>{const n=this.network(a.name);n.containers=n.containers.filter(id=>id!==c.id)});this.state.volumes.forEach(v=>v.mountedBy=v.mountedBy.filter(id=>id!==c.id));this.state.containers=this.state.containers.filter(x=>x.id!==c.id);this.event('container','destroy',`Removed ${c.name}; named volumes retained`,c.id);return c.name;}
  removeNetwork(value: string) {const n=this.network(value);if(n.builtin)throw new Error(`${n.name} is a pre-defined network and cannot be removed.`);if(n.containers.length)throw new Error(`network ${n.name} has active endpoints. Disconnect or remove its containers first.`);this.state.networks=this.state.networks.filter(x=>x.id!==n.id);this.event('network','destroy',`Removed network ${n.name}`,n.id);return n.name;}
  removeVolume(value: string) {const v=this.volume(value);if(v.mountedBy.length)throw new Error(`volume ${v.name} is in use by ${v.mountedBy.map(id=>this.container(id).name).join(', ')}`);this.state.volumes=this.state.volumes.filter(x=>x.id!==v.id);this.event('volume','destroy',`Removed volume ${v.name} and its stored data`,v.id);return v.name;}
  removeImage(value: string) {const img=this.image(value);if(this.state.containers.some(c=>c.image===`${img.repository}:${img.tag}`))throw new Error(`Image ${value} is used by a container. Remove that container first.`);this.state.images=this.state.images.filter(x=>x!==img);this.event('image','remove',`Removed image ${value}`,img.id);return `Untagged: ${img.repository}:${img.tag}`;}
  resolve(host: string, sourceId?: string): ContainerResource | undefined {
    if(!sourceId)return undefined;const source=this.container(sourceId);
    if(['localhost','127.0.0.1'].includes(host))return source;
    return this.state.containers.find(c=>c.networks.some(a=>source.networks.some(b=>b.name===a.name)&& (a.ip===host||(!['bridge','none','host'].includes(a.name)&&(c.name===host||a.aliases.includes(host))))));
  }
  diagnostic(kind: string,args: string[],sourceId?: string) {
    let host='',port=80;const source=sourceId?this.container(sourceId):undefined;if(source&&source.status!=='running')throw new Error(`Container ${source.name} is not running.`);
    if(kind==='ping'){const p=parseFlags(args,{'-c':'value'});requireArgs(p.positional,1,'ping [-c COUNT] HOST');if(p.one('-c')&&!/^[1-9]\d*$/.test(p.one('-c')!))throw new Error('ping count must be a positive integer.');host=p.positional[0];}
    else {requireArgs(args,1,`${kind} ${kind==='curl'?'http://HOST:PORT':'HOST'}`);host=args[0];}
    if(kind==='curl'){let url: URL;try{url=new URL(host.includes('://')?host:`http://${host}`)}catch{throw new Error(`curl: invalid URL ${host}`)}if(url.protocol!=='http:')throw new Error('Only simulated HTTP URLs are supported.');host=url.hostname;port=Number(url.port||80);}
    let target: ContainerResource|undefined;let servicePort=port;
    if(!source&&['localhost','127.0.0.1'].includes(host)&&kind==='curl') {target=this.state.containers.find(c=>c.status==='running'&&c.ports.some(p=>p.host===port&&p.protocol==='tcp'));servicePort=target?.ports.find(p=>p.host===port)?.container??port;target??=this.state.containers.find(c=>c.status==='running'&&c.networks.some(n=>n.name==='host')&&this.listeningPorts(c).includes(port));}
    else target=this.resolve(host,sourceId);
    const label=source?.name??'host';
    if(!target) {const failedEvent=this.event('network','failed',`${label} → ${host}${kind==='curl'?`:${port}`:''}: ${!source&&kind==='curl'&&['localhost','127.0.0.1'].includes(host)?'port not published':'no DNS / network path'}`,source?.id,'error');failedEvent.targetId=this.state.containers.find(c=>c.name===host||c.networks.some(n=>n.aliases.includes(host)))?.id;throw new Error(kind==='curl'&&!source&&['localhost','127.0.0.1'].includes(host)?`curl: (7) Failed to connect to ${host} port ${port}: no running service publishes this host port. EXPOSE alone does not publish a port.`:`${kind}: ${host}: name resolution failed. Container names resolve only on a shared user-defined network. ${source?'Inspect docker network inspect.':'Use docker exec -it CONTAINER sh to test from a container.'}`);}
    if(target.status!=='running')throw new Error(`${host}: Destination Host Unreachable (${target.name} is stopped).`);
    if(kind==='curl'&&(!target.ready||!this.listeningPorts(target).includes(servicePort)))throw new Error(`curl: (7) Connection refused at ${host}:${port}. ${target.name} ${target.ready?`has no service listening on ${servicePort}`:'is still initializing'}.`);
    const ip=target.networks.find(a=>source?.networks.some(b=>a.name===b.name))?.ip??target.networks[0]?.ip??'127.0.0.1';
    const traffic=this.event('network','traffic',`${label} → ${target.name}${kind==='curl'?`:${servicePort}`:''} · ${kind} succeeded`,source?.id??target.id);traffic.targetId=target.id;
    if(kind==='nslookup')return `Server: 127.0.0.11\nName: ${host}\nAddress: ${ip}`;
    if(kind==='ping')return `PING ${host} (${ip}): 56 data bytes\n64 bytes from ${ip}: icmp_seq=1 ttl=64 time=0.12 ms\n--- ${host} ping statistics ---\n1 packet transmitted, 1 received, 0% packet loss (simulated)`;
    if([5432,6379].includes(servicePort))throw new Error(`curl: (52) Service on ${servicePort} speaks ${servicePort===5432?'PostgreSQL':'Redis'}, not HTTP. The network path exists; use ping or nslookup for this lab.`);
    this.log(target,`GET / HTTP/1.1 200 · from ${label}`);return `HTTP/1.1 200 OK\nServer: ${target.image.startsWith('nginx')?'nginx':'DockerLab/Flask'}\nContent-Type: text/html\n\n${target.image.startsWith('nginx')?'Welcome to nginx!':`Hello from ${target.name}!`}\n[Virtual response · no external request was made]`;
  }
  fileCommand(kind:string,args:string[],sourceId?:string) {if(!sourceId)throw new Error('File helpers are available only in a virtual container shell.');const c=this.container(sourceId);if(c.status!=='running')throw new Error(`${c.name} is not running`);requireArgs(args,kind==='write'?2:1,`${kind} /PATH${kind==='write'?' TEXT':''}`,kind==='write'?Infinity:1);const path=args[0];if(!path.startsWith('/'))throw new Error('Use an absolute virtual path.');const mount=[...c.volumes].sort((a,b)=>b.destination.length-a.destination.length).find(m=>path.startsWith(m.destination+'/')||path===m.destination);const v=mount?.type==='volume'?this.volume(mount.source):undefined;const bind=mount?.type==='bind'?this.state.bindMounts?.[mount.source]:undefined;const data=v?.data??bind?.data??c.writableLayer;const key=v||bind?path.slice(mount!.destination.length):path;if(kind==='cat'){if(!(key in data))throw new Error(`cat: ${path}: No such file or directory`);return data[key];}if(mount?.readOnly||(v||bind)&&c.user!=='root'&&c.user!=='0'&&c.user!==(v??bind)!.owner)throw new Error(`write: ${path}: Permission denied. Inspect the mount's read-only flag and volume owner (${v?.owner??bind?.owner??'root'}).`);data[key]=args.slice(1).join(' ');this.event('volume','write',`Wrote ${path} in ${c.name}${v?` → persistent volume ${v.name}`:bind?` → virtual host bind ${mount!.source}`:' → ephemeral container filesystem'}`,v?.id??c.id);return `Wrote ${path} (simulated)`;}
  inspect(c:ContainerResource){return {Id:c.id,Name:c.name,Image:c.image,State:{Status:c.status,ExitCode:c.exitCode,Health:c.health,Ready:c.ready},Config:{Env:c.environment,Cmd:c.command,Entrypoint:c.entrypoint,User:c.user},NetworkSettings:{Networks:Object.fromEntries(c.networks.map(n=>[n.name,{IPAddress:n.ip,Aliases:n.aliases}])),Ports:c.ports},Mounts:c.volumes,RestartPolicy:c.restart};}
  private listContainers(args: string[]) {
    const expanded = args.flatMap(arg => /^-[aq]{2,}$/.test(arg) ? [...arg.slice(1)].map(flag => '-'+flag) : [arg]);
    const flags = parseFlags(expanded, {'-a':'boolean','--all':'boolean','-q':'boolean','--quiet':'boolean','-f':'value','--filter':'value','--format':'value'});
    requireArgs(flags.positional, 0, 'docker ps [-a] [-q] [--filter status=STATE] [--format TEMPLATE]');
    const statuses = flags.many('-f','--filter').map(filter => {
      const match = /^status=(created|restarting|running|removing|paused|exited|dead)$/.exec(filter);
      if (!match) throw new Error('The simulator supports --filter status=STATE.');
      return match[1];
    });
    const rows = this.state.containers.filter(c => (flags.one('-a','--all') || c.status==='running' || statuses.length>0) && (!statuses.length || statuses.includes(c.status)));
    const format = flags.one('--format');
    const fields = ['ID','Image','Status','Ports','Names','State'];
    if (format !== undefined && /[{}]/.test(format.replace(/{{\s*\.(\w+)\s*}}/g, (token,key) => fields.includes(key) ? '' : token))) throw new Error('Supported format fields: ID, Image, Status, State, Ports, Names.');
    const display = rows.map(c => ({ID:c.id, Image:c.image, Status:c.status==='running'?'Up'+(c.health==='none'?'':' ('+c.health+')'):c.status==='created'?'Created':'Exited ('+c.exitCode+')',
      Ports:c.ports.map(p=>p.host+'->'+p.container+'/'+p.protocol).join(', '), Names:c.name, State:c.status}));
    if (format !== undefined) return display.map(row => format.replace(/{{\s*\.(\w+)\s*}}/g, (_,key: keyof typeof row) => row[key])).join('\n');
    if (flags.one('-q','--quiet')) return display.map(row=>row.ID).join('\n');
    return table(['CONTAINER ID','IMAGE','STATUS','PORTS','NAMES'],display.map(row=>[row.ID,row.Image,row.Status,row.Ports,row.Names]));
  }
  execute(input:string,sourceId?:string):CommandResult {
    const before=this.state.sequence;const previous=JSON.stringify({images:this.state.images,containers:this.state.containers,networks:this.state.networks,volumes:this.state.volumes});let output='';let success=true;let clear=false;let shell:string|null|undefined;
    try {const args=tokenize(input.trim());if(!args.length)return {success:true,output:'',events:[],resourceIds:[],changes:[]};this.advance();
      if(args[0]==='clear'){requireArgs(args.slice(1),0,'clear');clear=true;}
      else if(args[0]==='help'){requireArgs(args.slice(1),0,'help');output=HELP;}
      else if(args[0]==='exit'){requireArgs(args.slice(1),0,'exit');shell=null;output='Returned to virtual host.';}
      else if(['ping','curl','nslookup'].includes(args[0]))output=this.diagnostic(args[0],args.slice(1),sourceId);
      else if(['cat','write'].includes(args[0]))output=this.fileCommand(args[0],args.slice(1),sourceId);
      else if(args[0]!=='docker')throw new Error(`${args[0]}: unsupported command. This terminal simulates a defined Docker CLI subset, not a Linux shell. Type help.`);
      else {
        const command=args[1],rest=args.slice(2);
        if(!command||command==='--help')output=HELP;
        else if(command==='pull'){requireArgs(rest,1,'docker pull IMAGE');const img=this.pull(rest[0]);output=`${img.tag}: Pulling from ${img.repository}\nStatus: Image is up to date for ${img.repository}:${img.tag}\n${img.id}`;}
        else if(command==='images'||command==='image'&&rest[0]==='ls'){requireArgs(command==='images'?rest:rest.slice(1),0,'docker images');output=table(['REPOSITORY','TAG','IMAGE ID','SIZE'],this.state.images.map(i=>[i.repository,i.tag,i.id,`${i.size.toFixed(1)} MB`]));}
        else if(command==='rmi'){requireArgs(rest,1,'docker rmi IMAGE');output=this.removeImage(rest[0]);}
        else if(command==='image'&&rest[0]==='inspect'){requireArgs(rest.slice(1),1,'docker image inspect IMAGE');const img=this.image(rest[1]);output=JSON.stringify(img,null,2);this.event('image','inspect',`Inspected ${img.repository}:${img.tag}`,img.id);}
        else if(command==='run') {const p=parseFlags(rest,{'-d':'boolean','--detach':'boolean','--name':'value','-p':'value','--publish':'value','--network':'value','-v':'value','--volume':'value','-e':'value','--env':'value','--entrypoint':'value','--user':'value','-u':'value','--restart':'value','--health-cmd':'value'},true);requireArgs(p.positional,1,'docker run [OPTIONS] IMAGE [COMMAND]',Infinity);const c=this.run(p.positional[0],{name:p.one('--name'),ports:p.many('-p','--publish'),networks:p.many('--network'),volumes:p.many('-v','--volume'),environment:p.many('-e','--env'),command:p.positional.slice(1),entrypoint:p.one('--entrypoint'),user:p.one('--user','-u'),restart:p.one('--restart'),healthcheck:p.one('--health-cmd')});output=p.one('-d','--detach')?c.id:c.logs.join('\n')+'\n[Virtual process: control returned to terminal]';if(c.exitCode&&c.exitCode!==0)output+=`\nContainer exited (${c.exitCode}). Run docker logs ${c.name}.`;}
        else if(command==='ps'||command==='container'&&rest[0]==='ls') output=this.listContainers(command==='ps'?rest:rest.slice(1));
        else if(['stop','start','restart','logs','inspect'].includes(command)){requireArgs(rest,1,`docker ${command} CONTAINER`);const c=this.container(rest[0]);if(command==='stop'){this.stop(c.id);output=c.name;}if(command==='start'){this.start(c.id);output=c.name;}if(command==='restart'){if(c.status==='running')this.stop(c.id);this.start(c.id);output=c.name;}if(command==='logs'){output=c.logs.join('\n')||'(no logs)';this.event('container','inspect',`Read logs for ${c.name}`,c.id);}if(command==='inspect'){output=JSON.stringify(this.inspect(c),null,2);this.event('container','inspect',`Inspected ${c.name}`,c.id);}}
        else if(command==='rm'){const p=parseFlags(rest,{'-f':'boolean','--force':'boolean'});requireArgs(p.positional,1,'docker rm [-f] CONTAINER');output=this.removeContainer(p.positional[0],!!p.one('-f','--force'));}
        else if(command==='exec'){const p=parseFlags(rest,{'-it':'boolean','-i':'boolean','-t':'boolean'},true);requireArgs(p.positional,2,'docker exec [-it] CONTAINER COMMAND',Infinity);const c=this.container(p.positional[0]);if(c.status!=='running')throw new Error(`Container ${c.name} is not running.`);const cmd=p.positional[1];if(['sh','bash','/bin/sh'].includes(cmd)){requireArgs(p.positional,2,'docker exec -it CONTAINER sh');shell=c.id;output=`Attached to ${c.name}. Virtual shell: ping, curl, nslookup, cat, write, exit.`;}else if(['ping','curl','nslookup'].includes(cmd))output=this.diagnostic(cmd,p.positional.slice(2),c.id);else if(['cat','write'].includes(cmd))output=this.fileCommand(cmd,p.positional.slice(2),c.id);else throw new Error(`exec: ${cmd}: unsupported in the virtual shell. Supported: sh, ping, curl, nslookup, cat, write.`);}
        else if(command==='stats'){requireArgs(rest,0,'docker stats');output=table(['NAME','CPU %','MEM USAGE','NET I/O'],this.state.containers.filter(c=>c.status==='running').map(c=>[c.name,'0.10%',`${c.image.startsWith('postgres')?48:8} MiB`,'1.2 kB / 0.8 kB']))+'\n[Illustrative virtual metrics, not host measurements]';}
        else if(command==='network'){const sub=rest[0],tail=rest.slice(1);if(sub==='ls'){requireArgs(tail,0,'docker network ls');output=table(['NETWORK ID','NAME','DRIVER','SCOPE'],this.state.networks.map(n=>[n.id,n.name,n.driver,'local']));}else if(sub==='create'){const p=parseFlags(tail,{'--driver':'value','-d':'value','--subnet':'value'});requireArgs(p.positional,1,'docker network create [--driver bridge] NAME');output=this.createNetwork(p.positional[0],p.one('--driver','-d'),p.one('--subnet')).id;}else if(sub==='connect'||sub==='disconnect'){requireArgs(tail,2,`docker network ${sub} NETWORK CONTAINER`);if(sub==='connect')this.connect(tail[0],tail[1]);else this.disconnect(tail[0],tail[1]);output=`${sub==='connect'?'Connected':'Disconnected'} ${tail[1]} ${sub==='connect'?'to':'from'} ${tail[0]}`;}else if(sub==='inspect'){requireArgs(tail,1,'docker network inspect NETWORK');const n=this.network(tail[0]);output=JSON.stringify({...n,containers:n.containers.map(id=>({name:this.container(id).name,id,ip:this.container(id).networks.find(a=>a.name===n.name)?.ip}))},null,2);this.event('network','inspect',`Inspected network ${n.name}`,n.id);}else if(sub==='rm'){requireArgs(tail,1,'docker network rm NETWORK');output=this.removeNetwork(tail[0]);}else throw new Error(`Unknown network command: ${sub??''}`);}
        else if(command==='volume'){const sub=rest[0],tail=rest.slice(1);if(sub==='ls'){requireArgs(tail,0,'docker volume ls');output=table(['DRIVER','VOLUME NAME','MOUNTS'],this.state.volumes.map(v=>[v.driver,v.name,v.mountedBy.length]));}else if(sub==='create'){requireArgs(tail,1,'docker volume create NAME');output=this.createVolume(tail[0]).name;}else if(sub==='inspect'){requireArgs(tail,1,'docker volume inspect NAME');const v=this.volume(tail[0]);output=JSON.stringify(v,null,2);this.event('volume','inspect',`Inspected volume ${v.name}`,v.id);}else if(sub==='rm'){requireArgs(tail,1,'docker volume rm NAME');output=this.removeVolume(tail[0]);}else throw new Error(`Unknown volume command: ${sub??''}`);}
        else if(command==='login'){const p=parseFlags(rest,{'-u':'value','--username':'value'});requireArgs(p.positional,0,'docker login [-u USERNAME]');const username=p.one('-u','--username')??'learner';validName(username);this.state.registry.username=username;output=`Login Succeeded (SIMULATED) as ${username}. No credentials requested or sent.`;this.event('system','login',output);}
        else if(command==='logout'){requireArgs(rest,0,'docker logout');this.state.registry.username=null;output='Logged out of the virtual registry.';this.event('system','logout',output);}
        else if(command==='tag'){requireArgs(rest,2,'docker tag SOURCE TARGET');const img=this.image(rest[0]),ref=reference(rest[1]);if(!/^[a-z0-9][a-z0-9/_.-]*:[a-zA-Z0-9_.-]+$/.test(ref))throw new Error(`Invalid image reference: ${ref}`);const [repository,tag]=ref.split(':');this.state.images=this.state.images.filter(i=>`${i.repository}:${i.tag}`!==ref);this.state.images.push({...structuredClone(img),repository,tag});output=`Tagged ${rest[0]} as ${ref}`;this.event('image','tag',output,img.id);}
        else if(command==='push'){requireArgs(rest,1,'docker push IMAGE');const img=this.image(rest[0]),username=this.state.registry.username,ref=reference(rest[0]);if(!username)throw new Error('denied: requested access to the resource is denied. Run docker login -u USERNAME first (simulated).');if(!img.repository.startsWith(username+'/'))throw new Error(`denied: tag your image under ${username}/REPOSITORY before pushing.`);this.state.registry.repositories=this.state.registry.repositories.filter(r=>r.reference!==ref);this.state.registry.repositories.push({reference:ref,imageId:img.id,pushedAt:timestamp()});output=img.layers.map(l=>`${l.id}: Pushed ${l.size.toFixed(1)} MB`).join('\n')+`\n${ref}: pushed to virtual registry. No data left this browser.`;this.event('image','push',`Published ${ref} to virtual registry`,img.id);}
        else if(['compose','build'].includes(command)&&this.extension)output=this.extension(args.slice(1));
        else throw new Error(`docker: '${command??''}' is not a supported command. Type help for the defined subset.`);
      }
    }catch(error){success=false;output=`Error: ${error instanceof Error?error.message:String(error)}`;this.event('system','error',output,sourceId,'error');}
    const events=this.state.events.filter(e=>parseInt(e.id.slice(3),16)>before);const after=JSON.stringify({images:this.state.images,containers:this.state.containers,networks:this.state.networks,volumes:this.state.volumes});this.notify();
    return {success,output,events,resourceIds:[...new Set(events.flatMap(e=>e.resourceId?[e.resourceId]:[]))],changes:previous!==after?events.filter(e=>e.level!=='error').map(e=>e.message):[],clear,shell};
  }
}
