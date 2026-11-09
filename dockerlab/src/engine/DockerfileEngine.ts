import { DockerEngine } from './DockerEngine';
import { tokenize } from './CommandParser';
import { reference,timestamp } from './catalog';
import type { ImageResource,Layer } from './types';
export interface BuildStep { index:number; total:number; instruction:string; layer?:Layer; message:string; complete:boolean; image?:ImageResource }
function hash(text:string){let n=2166136261;for(let i=0;i<text.length;i++)n=Math.imul(n^text.charCodeAt(i),16777619);return(n>>>0).toString(16)}
function normalize(path:string){const result:string[]=[];for(const part of path.split('/')){if(part==='..')result.pop();else if(part&&part!=='.')result.push(part)}return '/'+result.join('/')}
export class DockerfileEngine {
  constructor(public engine:DockerEngine){}
  *steps(source:string,files:Record<string,string>,tag:string):Generator<BuildStep,ImageResource,unknown>{
    if(!/^[a-z0-9][a-z0-9/_.-]*(?::[a-zA-Z0-9_.-]+)?$/.test(tag))throw new Error(`Invalid image tag: ${tag}`);
    const lines=source.replace(/\\\r?\n/g,' ').split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('#'));if(!lines.length)throw new Error('Dockerfile is empty. Add FROM to select a base image.');
    let draft:ImageResource|undefined;let previous='';const args:Record<string,string>={};const layers:Layer[]=[];
    for(let i=0;i<lines.length;i++){
      const line=lines[i],match=line.match(/^(\w+)\s+(.+)$/);if(!match)throw new Error(`Dockerfile line ${i+1}: instruction needs an argument: ${line}`);const instruction=match[1].toUpperCase();let value=match[2];
      if(!['FROM','WORKDIR','COPY','ADD','RUN','ENV','EXPOSE','CMD','ENTRYPOINT','USER','ARG'].includes(instruction))throw new Error(`Dockerfile line ${i+1}: unknown or unsupported instruction ${instruction}`);
      const vars={...args,...draft?.environment};if(!['CMD','ENTRYPOINT'].includes(instruction))value=value.replace(/\$\{(\w+)\}|\$(\w+)/g,(_,a,b)=>vars[a??b]??'');
      if(instruction!=='FROM'&&instruction!=='ARG'&&!draft)throw new Error(`${instruction} must follow FROM.`);
      let detail='',size=0,context='';
      if(instruction==='FROM'){if(draft)throw new Error('Multi-stage builds are not supported in this lab. Use a single FROM instruction.');if(value.split(/\s+/).length!==1)throw new Error('FROM accepts a single image reference in this simulator.');const base=this.engine.pull(value);draft={...structuredClone(base),id:this.engine.id('sha'),repository:'',tag:'',source:'built',baseImage:reference(value),createdAt:timestamp(),layers:[]};size=base.size;detail=`Base filesystem from ${value}`;}
      if(instruction==='ARG'){const [name,...rest]=value.split('=');if(!/^\w+$/.test(name))throw new Error(`Invalid ARG: ${value}`);args[name]=rest.join('=');detail=`Build-time variable ${name}; not included in the container environment.`;}
      if(instruction==='WORKDIR'){draft!.workdir=normalize(value.startsWith('/')?value:`${draft!.workdir}/${value}`);detail=`Working directory set to ${draft!.workdir}`;}
      if(instruction==='COPY'||instruction==='ADD'){
        const parts=value.startsWith('[')?JSON.parse(value):tokenize(value);if(!Array.isArray(parts)||parts.length<2||parts.some(p=>typeof p!=='string'||p.startsWith('--')))throw new Error(`${instruction}: expected SOURCE... DESTINATION. Flags are not supported.`);
        const destination=parts.at(-1) as string,sources=parts.slice(0,-1) as string[];const copied:Record<string,string>={};
        for(const src of sources){if(src.includes('://'))throw new Error('ADD only supports local virtual files; URL downloads are not supported.');if(src.split('/').includes('..')||src.startsWith('/'))throw new Error(`COPY source escapes the build context: ${src}`);const key=src.replace(/^\.\//,'').replace(/\/$/,'');let names:string[];
          if(key==='.'||key==='')names=Object.keys(files).filter(f=>f!=='.env'&&f!=='Dockerfile');else if(key.includes('*')){const pattern=new RegExp('^'+key.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*')+'$');names=Object.keys(files).filter(f=>pattern.test(f));}else names=Object.keys(files).filter(f=>f===key||f.startsWith(key+'/'));
          if(!names.length)throw new Error(`COPY failed: "${src}" not found in the build context. Add the file or correct its path.`);
          for(const name of names){const dest=normalize(destination.startsWith('/')?destination:`${draft!.workdir}/${destination}`);const directory=destination.endsWith('/')||destination==='.'||sources.length>1||names.length>1||key==='.';const path=directory?normalize(`${dest}/${name.split('/').at(-1)}`):dest;draft!.files[path]=files[name];copied[name]=files[name];}
        }
        context=JSON.stringify(copied);size=Math.max(.01,context.length/1024/1024);detail=`Copied ${Object.keys(copied).join(', ')} into ${destination}`;
      }
      if(instruction==='RUN'){
        for(const cmd of value.split('&&').map(x=>x.trim())){
          if(/^pip(?:3)? install\s/.test(cmd)){const tokens=tokenize(cmd),requirements=tokens.indexOf('-r');if(requirements>=0){const path=normalize(`${draft!.workdir}/${tokens[requirements+1]??''}`);if(!(path in draft!.files))throw new Error(`RUN failed: could not open requirements file ${path}. COPY it before installing.`);if(/nonexistent|missing-package|invalid-package/.test(draft!.files[path]))throw new Error('RUN failed: no matching distribution found in requirements.txt.');}else if(tokens.length<3||/nonexistent|missing-package|invalid-package/.test(cmd))throw new Error(`RUN failed: no matching distribution found: ${cmd}`);size+=18;detail+='Installed virtual Python dependencies. ';}
          else if(/^apt-get update$/.test(cmd)){size+=.5;detail+='Updated virtual package index. ';}
          else if(/^apt-get install (?:-y )?[a-z0-9 .+\-]+$/.test(cmd)&&!/(?:nonexistent|invalid|missing)/.test(cmd)){size+=8;detail+='Installed virtual system packages. ';}
          else if(/^apk add (?:--no-cache )?[a-z0-9 .+\-]+$/.test(cmd)&&!/(?:nonexistent|invalid|missing)/.test(cmd)){size+=4;detail+='Installed virtual Alpine packages. ';}
          else throw new Error(`RUN failed (exit 127): unsupported or invalid command "${cmd}". Supported: pip install, apt-get update/install, apk add. No host commands are executed.`);
        }
      }
      if(instruction==='ENV'){const parts=tokenize(value);if(parts[0]?.includes('=')){for(const p of parts){const eq=p.indexOf('=');if(eq<1)throw new Error(`ENV expects KEY=VALUE pairs: ${value}`);draft!.environment[p.slice(0,eq)]=p.slice(eq+1)}}else{if(parts.length!==2)throw new Error('ENV expects KEY VALUE or KEY=VALUE.');draft!.environment[parts[0]]=parts[1];}detail=`Environment configuration: ${value}`;}
      if(instruction==='EXPOSE'){const ports=tokenize(value);for(const p of ports){if(!/^\d+(?:\/tcp)?$/.test(p)||parseInt(p)<1||parseInt(p)>65535)throw new Error(`Invalid EXPOSE port: ${p}. This lab supports TCP service ports.`);draft!.exposedPorts.push(parseInt(p))}draft!.exposedPorts=[...new Set(draft!.exposedPorts)];detail=`Documented internal ports ${ports.join(', ')}. No host ports are published.`;}
      if(instruction==='CMD'||instruction==='ENTRYPOINT'){let command:string[];if(value.startsWith('[')){try{command=JSON.parse(value)}catch{throw new Error(`${instruction}: invalid JSON array`)}if(!Array.isArray(command)||command.some(v=>typeof v!=='string'))throw new Error(`${instruction} requires a JSON string array.`);}else command=tokenize(value);if(instruction==='CMD')draft!.command=command;else draft!.entrypoint=command;detail=`${instruction==='CMD'?'Default command':'Entrypoint'}: ${command.join(' ')}`;}
      if(instruction==='USER'){if(!/^[a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)?$/.test(value))throw new Error(`Invalid USER: ${value}`);draft!.user=value;detail=`Runtime user: ${value}`;}
      const cacheKey=hash(previous+'\n'+line+'\n'+context);const cached=this.engine.state.buildCache.includes(cacheKey);previous=cacheKey;if(!cached)this.engine.state.buildCache.push(cacheKey);const layer:Layer={id:`layer-${cacheKey}`,instruction:line,size,cached,detail};layers.push(layer);
      const message=`[${i+1}/${lines.length}] ${line}\n${cached?'CACHED':detail}`;this.engine.event('build',cached?'cache':'step',message);this.engine.notify();yield {index:i+1,total:lines.length,instruction:line,layer,message,complete:false};
    }
    if(!draft)throw new Error('Dockerfile must contain FROM.');const [repository,imageTag]=reference(tag).split(':');draft.repository=repository;draft.tag=imageTag;draft.layers=layers;draft.size=layers.reduce((n,l)=>n+l.size,0);
    this.engine.state.images=this.engine.state.images.filter(i=>`${i.repository}:${i.tag}`!==`${repository}:${imageTag}`);this.engine.state.images.push(draft);this.engine.event('build','complete',`Successfully built ${repository}:${imageTag} · ${draft.size.toFixed(1)} MB`,draft.id);this.engine.notify();yield {index:lines.length,total:lines.length,instruction:'Exporting image',message:`Successfully built ${repository}:${imageTag}\n${draft.id}`,complete:true,image:draft};return draft;
  }
  build(source:string,files:Record<string,string>,tag:string){const logs:string[]=[];let image:ImageResource|undefined;try{for(const step of this.steps(source,files,tag)){logs.push(step.message);if(step.image)image=step.image;}}catch(error){this.engine.event('build','error',error instanceof Error?error.message:String(error),undefined,'error');throw error;}return {image:image!,output:logs.join('\n')};}
}
