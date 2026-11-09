import { DockerEngine } from '../engine/DockerEngine';
import type { EngineState, Selection, ScenarioProgress } from '../engine/types';
import { DEFAULT_DOCKERFILE, DEFAULT_FILES, COMPOSE_EXAMPLES } from '../data/examples';
import { DockerfileEngine } from '../engine/DockerfileEngine';
import { ComposeEngine } from '../engine/ComposeEngine';
import { parseFlags,requireArgs } from '../engine/CommandParser';

export interface TerminalEntry { id: number; command: string; output: string; success: boolean; context: string }
export interface WorkspaceState { selection: Selection|null; shell: string|null; terminal: TerminalEntry[]; commandHistory: string[]; dockerfile: string; files: Record<string,string>; compose: string; imageTag: string; scenario: ScenarioProgress|null; persistenceError: boolean; backup?:{engine:EngineState;dockerfile:string;compose:string;files:Record<string,string>;imageTag:string}; }
const STORAGE_KEY='dockerlab.workspace.v1';
function readSaved(): {engine?:EngineState;workspace?:Partial<WorkspaceState>} {try{if(typeof localStorage==='undefined')return {};const text=localStorage.getItem(STORAGE_KEY);if(!text)return {};const data=JSON.parse(text);if(data.engine?.version!==1||!Array.isArray(data.engine.containers)||!Array.isArray(data.engine.images)||!Array.isArray(data.engine.networks)||!Array.isArray(data.engine.volumes))return {};return data;}catch{return {};}}
export class Workspace {
  engine: DockerEngine;
  state: WorkspaceState;
  private listeners=new Set<()=>void>();
  constructor(restore=true){const saved=restore?readSaved():{};this.engine=new DockerEngine(saved.engine);this.state={selection:null,shell:null,terminal:[],commandHistory:[],dockerfile:DEFAULT_DOCKERFILE,files:{...DEFAULT_FILES},compose:COMPOSE_EXAMPLES[0].yaml,imageTag:'my-flask-app',scenario:null,persistenceError:false,...saved.workspace};this.engine.subscribe(()=>this.persist());this.engine.extension=(args)=>{if(args[0]==='build'){const p=parseFlags(args.slice(1),{'-t':'value','--tag':'value'});requireArgs(p.positional,1,'docker build [-t IMAGE] .');if(p.positional[0]!=='.')throw new Error('Only the virtual project context "." is supported.');return new DockerfileEngine(this.engine).build(this.state.dockerfile,this.state.files,p.one('-t','--tag')??this.state.imageTag).output;}if(args[0]==='compose')return new ComposeEngine(this.engine,this.state.compose,this.state.dockerfile,this.state.files).execute(args.slice(1));throw new Error('Unsupported Docker command.');};}
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return ()=>{this.listeners.delete(listener)}};
  getSnapshot=()=>this.state;
  update(patch:Partial<WorkspaceState>){this.state={...this.state,...patch};this.persist();this.listeners.forEach(l=>l());}
  persist(){try{if(typeof localStorage!=='undefined')localStorage.setItem(STORAGE_KEY,JSON.stringify({engine:this.engine.state,workspace:{...this.state,terminal:this.state.terminal.slice(-100),commandHistory:this.state.commandHistory.slice(-100)}}));}catch{this.state={...this.state,persistenceError:true};}}
  run=(command:string)=>{const context=this.state.shell?this.engine.state.containers.find(c=>c.id===this.state.shell)?.name??'host':'host';const result=this.engine.execute(command,this.state.shell??undefined);const entry={id:Date.now()+Math.random(),command,output:result.output,success:result.success,context};let selection=this.state.selection;
    const resourceId=result.resourceIds.at(-1);if(resourceId){const state=this.engine.state;if(state.containers.some(c=>c.id===resourceId))selection={kind:'container',id:resourceId};else if(state.networks.some(n=>n.id===resourceId))selection={kind:'network',id:resourceId};else if(state.volumes.some(v=>v.id===resourceId))selection={kind:'volume',id:resourceId};else if(state.images.some(i=>i.id===resourceId))selection={kind:'image',id:resourceId};}
    const scenario=this.state.scenario?{...this.state.scenario,commands:[...this.state.scenario.commands,command],inspected:[...new Set([...this.state.scenario.inspected,...result.events.filter(e=>e.action==='inspect').flatMap(e=>e.resourceId?[e.resourceId]:[])])],errors:this.state.scenario.errors+(result.success?0:1),changes:[...new Set([...(this.state.scenario.changes??[]),...result.events.filter(e=>['connect','disconnect','create','destroy','start','stop','complete'].includes(e.action)).map(e=>e.message)])],observations:[...new Set([...(this.state.scenario.observations??[]),...result.events.filter(e=>e.action==='inspect'||e.action==='traffic'||e.action==='failed').map(e=>e.message)])]}:null;
    this.update({terminal:result.clear?[]:[...this.state.terminal,entry].slice(-150),commandHistory:[...this.state.commandHistory,command].slice(-100),shell:result.shell!==undefined?result.shell:this.state.shell,selection,scenario});return result;};
  select(selection:Selection|null){const scenario=this.state.scenario&&selection?{...this.state.scenario,inspected:[...new Set([...this.state.scenario.inspected,selection.id])]}:this.state.scenario;this.update({selection,scenario});}
  reset(){this.engine.reset();this.update({selection:null,shell:null,terminal:[],scenario:null,backup:undefined});}
  loadExample(){for(const command of ['docker network create app-network','docker volume create postgres-data','docker run -d --name web -p 8080:80 --network app-network nginx','docker run -d --name database -e POSTGRES_PASSWORD=demo -v postgres-data:/var/lib/postgresql/data --network app-network postgres:16','docker run -d --name cache --network app-network redis:7-alpine'])this.run(command);}
}
export const workspace=new Workspace();
