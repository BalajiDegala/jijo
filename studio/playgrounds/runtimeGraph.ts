import { Box, Container, HardDrive, Layers, Network, Server } from 'lucide-react';
import type { EngineState } from '../../dockerlab/src/engine/types';
import type { CanvasItem, CanvasLink } from './GraphCanvas';
import type { RuntimeProject } from './runtime';

export function runtimeGraph(state: EngineState, positions: RuntimeProject['positions']) {
  const items: CanvasItem[] = [];
  const links: CanvasLink[] = [];
  const add = (item: CanvasItem) => items.push({...item,...positions[item.id]});
  add({id:'engine', name:'Docker Engine',kind:'Host',detail:'Local simulator',icon:Server,color:'nginx',source:true,x:0,y:0});
  const ids = new Set<string>();
  for (const image of state.images) {
    if (ids.has(image.id)) continue;
    ids.add(image.id);
    add({id:image.id,name:image.repository + ':' + image.tag,kind:'Image',detail:image.layers.length + ' layers',icon:Layers,color:'instruction',source:true,x:245,y:(ids.size-1)*145});
    links.push({from:'engine',to:image.id,label:'stores',kind:'dependency'});
  }
  state.containers.forEach((c,i) => {
    add({id:c.id,name:c.name,kind:'Container',detail:c.status + (c.ports.length ? ' · ' + c.ports.map(p=>p.host+' → '+p.container).join(', ') : ''),icon:Container,color:c.status === 'running' ? 'instruction':'volume',source:true,x:245,y:(ids.size+i)*145+30,reverse:true});
    if (ids.has(c.imageId)) links.push({from:c.imageId,to:c.id,label:'runs as',kind:'sequence'});
  });
  const networks=state.networks.filter(n=>!n.builtin || n.containers.length);
  networks.forEach((n,i) => {
    add({id:n.id,name:n.name,kind:'Network',detail:n.subnet || n.driver,icon:Network,color:'network',source:false,x:0,y:(ids.size+i)*145+30,reverse:true});
    for(const c of state.containers.filter(c=>c.networks.some(a=>a.name===n.name))) links.push({from:c.id,to:n.id,label:'joins',kind:'network'});
  });
  state.volumes.forEach((v,i) => {
    add({id:v.id,name:v.name,kind:'Volume',detail:v.mountedBy.length+' mounts',icon:HardDrive,color:'volume',source:false,x:0,y:(ids.size+networks.length+i)*145+30,reverse:true});
    for(const c of state.containers.filter(c=>c.volumes.some(m=>m.type==='volume' && m.source===v.name))) links.push({from:c.id,to:v.id,label:'mounts',kind:'mount'});
  });
  return {items,links};
}
export const runtimePalette = [
  {id:'image',name:'Nginx image',description:'Pull nginx into the local image store',icon:Layers},
  {id:'container',name:'Nginx container',description:'Run a named web container',icon:Box},
  {id:'network',name:'Bridge network',description:'Create a user-defined network',icon:Network},
  {id:'volume',name:'Named volume',description:'Create persistent storage',icon:HardDrive},
];
