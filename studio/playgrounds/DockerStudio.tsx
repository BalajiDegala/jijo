import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Box, ChevronRight, Database, Layers, Network, Search, SquareTerminal } from 'lucide-react';
import { SCENARIOS, type Verification } from '../../dockerlab/src/engine/ScenarioEngine';
import { DockerEngine } from '../../dockerlab/src/engine/DockerEngine';
import { dockerQuestionTopics, interviewCases, referenceCommands, runtimeTemplates } from '../lab/content';
import { GraphWorkbench } from './GraphWorkbench';
import { runtimeGraph, runtimePalette } from './runtimeGraph';
import { removeCopy, runtimeSession, setActive, startRuntime, updateRuntime, useRuntimeBook, type RuntimeProject } from './runtime';
import './playgrounds.css';
import './dockerStudio.css';

function Templates({busy}:{busy:boolean}) {
  const [index,setIndex] = useState(0);
  const template = runtimeTemplates[index];
  const preview = useMemo(() => {
    const ws = runtimeSession({id:'preview',kind:'template',source:template.id,name:'',commands:[],positions:{},verified:false});
    const output = ws.run(template.probe);
    return {state:ws.engine.state,output:output.output};
  },[template]);
  return <div className="template-layout"><div className="template-list" role="group" aria-label="Choose a template">
    {runtimeTemplates.map((t,i)=><button key={t.id} aria-pressed={i===index} onClick={()=>setIndex(i)}><Layers size={18}/><span>{t.example.name}<small>{t.example.description}</small></span></button>)}</div>
    <section className="runtime-card"><div className="runtime-card-head"><div><small>Finished stack · Browser simulation</small><h2>{template.example.name}</h2></div>
      <button className="primary" disabled={busy} onClick={async()=>{if(await startRuntime('template',template.id,template.example.name)) location.hash='docker';}}>Open a copy <ArrowRight size={14}/></button></div>
      <div className="template-services">{preview.state.containers.map(c=><div key={c.id}><Box size={18}/><strong>{c.service}</strong><code>{c.image}</code><small>{c.status} {c.ports.map(p=>' · '+p.host+' → '+p.container).join('')}</small>
        {c.networks.map(n=><span key={n.name}><Network size={12}/>{n.name}</span>)}{c.volumes.map(v=><span key={v.destination}><Database size={12}/>{v.source}</span>)}</div>)}</div>
      <h3>Test response</h3><pre className="runtime-output">{'$ '+template.probe+'\n'+preview.output}</pre>
      <details className="runtime-detail"><summary>Compose YAML</summary><pre>{template.example.yaml}</pre></details>
    </section></div>;
}

function Scenarios({completed,busy}:{completed:number;busy:boolean}) {
  const [query,setQuery]=useState('');
  return <section className="scenario-library"><p>Practice questions from the Docker Interview Preparation Guide in a separate simulated environment.</p>
    <a href="#lab" className="case-card"><small>Q11 · Port publishing</small><h2>The unreachable container</h2><p>Trace a request from the host to a Flask listener.</p>
      <strong>{completed===4?'Review lesson':completed?'Resume lesson':'Start lesson'} <ArrowRight size={14}/></strong></a>
    {interviewCases.map(s=><button className="case-card" key={s.id} disabled={busy} onClick={async()=>{
      if(await startRuntime('scenario',s.id,s.title)) location.hash='investigation';
    }}><small>Q{s.question} · {s.topic}</small><h2>{s.title}</h2><p>{SCENARIOS.find(item=>item.id===s.id)!.problem}</p><strong>Open scenario <ArrowRight size={14}/></strong></button>)}
    <details className="question-index runtime-detail"><summary>Interview guide index · {dockerQuestionTopics.length} questions</summary>
      <label>Find a topic or question number <input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <ol>{dockerQuestionTopics.map((topic,i)=>('Q'+(i+1)+' '+topic).toLowerCase().includes(query.trim().toLowerCase())&&<li key={topic}><small>Q{i+1}</small> {topic}</li>)}</ol>
      {!dockerQuestionTopics.some((topic,i)=>('Q'+(i+1)+' '+topic).toLowerCase().includes(query.trim().toLowerCase()))&&<p>No matching questions.</p>}
    </details></section>;
}

function Console({project,ws,run,busy}:{project:RuntimeProject;ws:ReturnType<typeof runtimeSession>;run:(text:string)=>void;busy:boolean}) {
  const [text,setText] = useState(''), [history,setHistory]=useState(-1), [query,setQuery]=useState('');
  const field=useRef<HTMLInputElement>(null), scroll=useRef<HTMLDivElement>(null), dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(scroll.current) scroll.current.scrollTop=scroll.current.scrollHeight;},[project.commands.length]);
  const submit=()=>{if (!busy && text.trim()) {run(text.trim());setText('');setHistory(-1);}};
  const pick=(cmd:string)=>{dialog.current?.close();setText(cmd);setHistory(-1);field.current?.focus();};
  return <section className="runtime-terminal" aria-label="Docker terminal"><header><span><SquareTerminal size={17}/>Terminal</span>
    <button title="Command reference" onClick={()=>{setQuery('');dialog.current?.showModal();}}><BookOpen size={14}/>Commands</button></header>
    <div ref={scroll} className="runtime-history" tabIndex={0} aria-label="Terminal output" role="region">
      {!ws.state.terminal.length && <div className="terminal-start"><strong>{project.kind==='scenario'?'Investigate the environment':'Start with an image'}</strong>
        <p>{project.kind==='scenario'?'Inspect the running and exited containers.':'Pull Nginx, then run a container to see it appear on the canvas.'}</p>
        {(project.kind==='scenario'?['docker ps -a']:['docker pull nginx','docker run -d --name web nginx']).map(cmd=><button key={cmd} onClick={()=>pick(cmd)}><code>{cmd}</code><ChevronRight size={12}/></button>)}</div>}
      {ws.state.terminal.map((e,i)=><div className="runtime-entry" key={i}><code>$ {e.command}</code><pre className={e.success?'':'error-output'}>{e.output}</pre></div>)}</div>
    <form onSubmit={e=>{e.preventDefault();submit();}}><span aria-hidden="true">❯</span><input ref={field} aria-label="Docker command" value={text} maxLength={600} autoComplete="off" spellCheck={false}
      placeholder="Type a command…" onChange={e=>{setText(e.target.value);setHistory(-1);}} onKeyDown={e=>{
        if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();const next=Math.max(-1,Math.min(project.commands.length-1,history+(e.key==='ArrowUp'?1:-1)));setHistory(next);setText(next<0?'':project.commands[project.commands.length-1-next]);}
        if(e.key==='Tab'&&!e.shiftKey&&text){const prefix=text.trimStart();const completion=referenceCommands.find(([,cmd])=>cmd!==prefix&&cmd.startsWith(prefix));if(completion){e.preventDefault();setText(completion[1]);}}
      }}/><button disabled={busy||!text.trim()} aria-label="Run command"><ArrowRight size={16}/></button></form>
    <small>{ws.state.shell ? ws.engine.state.containers.find(c=>c.id===ws.state.shell)?.name+' · container shell' : 'Local host'} · Browser simulation</small>
    <dialog ref={dialog} className="command-reference"><header><h2>Supported commands</h2><button onClick={()=>dialog.current?.close()}>Close</button></header>
      <label><Search size={15}/><input aria-label="Find a command" placeholder="Search command or purpose" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <div>{referenceCommands.filter(row=>row.join(' ').toLowerCase().includes(query.toLowerCase())).map(([group,cmd,description])=><button key={cmd} onClick={()=>pick(cmd)}><small>{group}</small><code>{cmd}</code><span>{description}</span></button>)}
      {!referenceCommands.some(row=>row.join(' ').toLowerCase().includes(query.toLowerCase())) && <p>No matching commands.</p>}</div></dialog>
  </section>;
}

function Live({project,projects,busy}:{project:RuntimeProject;projects:RuntimeProject[];busy:boolean}) {
  const ws = useMemo(()=>runtimeSession(project),[project.kind,project.source,project.commands]);
  const state=ws.engine.state;
  const {items,links}=useMemo(()=>runtimeGraph(state,project.positions),[state,project.positions]);
  const [manual,setManual]=useState<{id:string;count:number}|null>(null),[code,setCode]=useState(false),[confirm,setConfirm]=useState(false);
  const [checks,setChecks]=useState<Verification[]>([]),[hints,setHints]=useState(0);
  const selected=(manual?.count===project.commands.length ? manual.id : ws.state.selection?.id) ?? 'engine';
  const item=items.find(n=>n.id===selected);
  const sessionCase=interviewCases.find(s=>project.kind==='scenario'&&s.id===project.source);
  const scenario=sessionCase && SCENARIOS.find(s=>s.id===sessionCase.id)!;
  function run(command:string) {
    void updateRuntime(project.id,p=>{
      if(p.commands.length>=1000) throw new Error('This session has reached 1,000 commands. Open a fresh template copy for a new experiment.');
      return {...p,commands:[...p.commands,command],verified:false};
    });
    setChecks([]);
  }
  const valid=(from:string,to:string)=>{
    const c=state.containers.find(v=>v.id===from), n=state.networks.find(v=>v.id===to);
    return !!(c && n && !n.builtin && !c.networks.some(a=>a.name===n.name));
  };
  function add(kind:string) {
    const used=new Set([...state.containers,...state.networks,...state.volumes].map(r=>r.name));
    const base=kind==='network'?'backend':kind==='volume'?'data':'web';
    let name=base, i=2;while(used.has(name)) name=base+'-'+i++;
    run(kind==='container'?'docker run -d --name '+name+' nginx':kind==='image'?'docker pull nginx':'docker '+kind+' create '+name);
  }
  const c=state.containers.find(n=>n.id===selected), n=state.networks.find(r=>r.id===selected), v=state.volumes.find(r=>r.id===selected), img=state.images.find(r=>r.id===selected);
  const facts=c ? {Status:c.status,Image:c.image,Ports:c.ports.map(p=>p.host+' → '+p.container).join(', ')||'Unpublished',Networks:c.networks.map(a=>a.name).join(', '),Mounts:c.volumes.map(m=>m.destination).join(', ')||'None'} :
    n ? {Driver:n.driver,Subnet:n.subnet,Endpoints:n.containers.length} : v ? {Driver:v.driver,Mounts:v.mountedBy.length,Files:Object.keys(v.data).length} :
    img ? {Tags:state.images.filter(r=>r.id===img.id).map(r=>r.repository+':'+r.tag).join(', '),Layers:img.layers.length,Command:img.command.join(' ')} :
    {Images:state.images.length,Containers:state.containers.length,Running:state.containers.filter(r=>r.status==='running').length,Volumes:state.volumes.length};
  return <div className="pg runtime-live">
    <div className="runtime-session">{scenario && sessionCase ? <><a href="#scenarios">← Scenarios</a><strong>Q{sessionCase.question} · {project.name}</strong></> :
      <><label>Workspace <select disabled={busy} value={project.id} onChange={e=>void setActive(e.target.value)}>{projects.filter(p=>p.kind!=='scenario').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        {project.kind==='template' && <button className="quiet" disabled={busy} onClick={()=>setConfirm(!confirm)}>Remove copy</button>}
        {confirm && <button className="secondary" disabled={busy} onClick={()=>void removeCopy(project.id)}>Confirm removal</button>}</>}
      <span className="mode"><i/> Browser simulation</span></div>
    {scenario && <section className="runtime-brief"><p>{scenario.problem}</p><div><button className="primary" disabled={busy} onClick={()=>{
      const result=scenario.checks(new DockerEngine(state));setChecks(result);void updateRuntime(project.id,p=>({...p,verified:result.every(c=>c.passed)}));
    }}>Verify repair</button><button className="quiet" disabled={hints>=scenario.hints.length} onClick={()=>setHints(hints+1)}>Show hint</button></div>
      {hints>0&&<p>{scenario.hints[hints-1]}</p>}{checks.length>0?<ul aria-live="polite">{checks.map(c=><li key={c.label}>{c.passed?'Passed':'Needs work'} · {c.label}</li>)}</ul>: project.verified&&<p>Repair verified.</p>}</section>}
    <div className="runtime-bench"><Console project={project} ws={ws} run={run} busy={busy}/>
      <GraphWorkbench title="Docker environment" items={items} links={links} selected={selected} palette={runtimePalette}
        select={id=>setManual({id,count:project.commands.length})} add={add} valid={valid}
        connect={(from,to)=>{const service=state.containers.find(c=>c.id===from), network=state.networks.find(n=>n.id===to);if(service&&network)run('docker network connect '+network.name+' '+service.name);}}
        move={(id,x,y)=>void updateRuntime(project.id,p=>({...p,positions:{...p.positions,[id]:{x,y}}}))}
        alternateName="Events" alternate={<pre className="pg-yaml">{state.events.map(e=>e.action+'  '+e.message).join('\n')||'Run a command to see engine events.'}</pre>}
        showCode={code} setShowCode={setCode} properties={<div className="runtime-facts"><small>{item?.kind??'Host'}</small><h3>{item?.name??'Docker Engine'}</h3>
          <dl>{Object.entries(facts).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></div>}/></div>
  </div>;
}

export default function DockerStudio({page,completed}:{page:'docker'|'templates'|'scenarios'|'investigation';completed:number}) {
  const {book,ready,busy,message}=useRuntimeBook();
  if(!ready) return <p role="status">Opening Docker workspace…</p>;
  const project=book.projects.find(p=>p.id===(page==='investigation'?book.caseId:book.active));
  return <div className="docker-studio">{message&&<p role="alert" className="notice">{message}</p>}
    {page==='templates'?<Templates busy={busy}/> : page==='scenarios'||!project?<Scenarios completed={completed} busy={busy}/> :
      <Live key={project.id} project={project} projects={book.projects} busy={busy}/>}
    </div>;
}
