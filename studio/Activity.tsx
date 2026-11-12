import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CircleHelp, Lightbulb, Play, SquareTerminal, Waypoints } from 'lucide-react';
import { explanations, predictions } from './lab/content';
import { probeCommand } from './lab/journey';
import type { Event, Session } from './lab/journey';

interface Props { session: Session; act: (event: Event) => void; busy: boolean }

function Terminal({ session, act, busy }: Props) {
  const { lab, log } = session;
  const [input, setInput] = useState('');
  const history = useRef<HTMLDivElement>(null);
  useEffect(() => { if (history.current) history.current.scrollTop = history.current.scrollHeight; }, [log.length]);
  return <section className="term">
    <header><SquareTerminal size={16}/> Simulated terminal</header>
    <div className="quick">{['docker ps', 'docker inspect ' + lab.name, 'docker logs ' + lab.name, probeCommand(lab)].map(cmd =>
      <button key={cmd} disabled={busy} onClick={() => act({ type: 'command', text: cmd })}>{cmd.startsWith('curl') ? 'Test HTTP' : cmd.split(' ')[1] === 'ps' ? 'List containers' : cmd.includes('inspect') ? 'Inspect' : 'Read logs'}</button>)}</div>
    <div className="history" ref={history} tabIndex={0} aria-label="Command history">{log.length === 0 ? <p>Run a diagnostic to collect evidence.</p> : log.slice(-20).map((e, i) =>
      <div key={i}><code>$ {e.command}</code><pre className={e.success ? '' : 'failed'}>{e.output}</pre></div>)}</div>
    <form className="terminal-input" onSubmit={e => { e.preventDefault(); if (input.trim()) { act({ type: 'command', text: input.trim() }); setInput(''); } }}>
      <span aria-hidden="true">$</span><input aria-label="Docker command" value={input} maxLength={200} onChange={e => setInput(e.target.value)} placeholder="Enter a lab command" autoComplete="off" spellCheck={false}/><button disabled={busy || !input.trim()} aria-label="Run command"><ArrowRight size={17}/></button>
    </form>
    <details className="term-help"><summary>Terminal help</summary><p>Use docker ps, inspect, logs, stop, start, restart, rm or rm -f. To recreate the service, run docker run -d --name {lab.name} -p HOST:CONTAINER {lab.image}. Test HTTP with curl http://localhost:PORT.</p></details>
  </section>;
}

function Repair(props: Props) {
  const { session, act, busy } = props;
  const { lab, stage } = session;
  const port = session.engine.state.containers.find(c => c.name === lab.name)?.ports[0];
  const [host, setHost] = useState(String(port?.host ?? lab.host));
  const [target, setTarget] = useState(port ? String(port.container) : '');
  return <>
    <p className="activity-description">{stage === 'repair' ? 'Inspect the container and its logs. Recreate it with a port mapping, then verify the request.' :
      'Restore access to the weather service at localhost:' + lab.host + '. Use the evidence in this environment to choose both ports.'}</p>
    <Terminal {...props}/>
    <form className="mapping-form" onSubmit={e => { e.preventDefault(); act({ type: 'map', host: Number(host), target: Number(target) }); }}>
      <label>Host port<input type="number" min="1" max="65535" required value={host} onChange={e => setHost(e.target.value)}/></label><ArrowRight size={17}/>
      <label>Container port<input type="number" min="1" max="65535" required placeholder="1–65535" value={target} onChange={e => setTarget(e.target.value)}/></label>
      <button className="secondary" disabled={busy}>Apply mapping</button>
    </form>
    <div className="actions"><button className="primary" disabled={busy} onClick={() => act({ type: 'verify' })}><Play size={14}/>Verify connection</button>
      {stage === 'repair' && session.hints < 2 && <button className="quiet" disabled={busy} onClick={() => act({ type: 'hint' })}><Lightbulb size={15}/>Get a hint</button>}</div>
  </>;
}

export function Activity({ session, act, busy, showFiles }: Props & { showFiles: () => void }) {
  const { stage, lab } = session;
  const [choice, setChoice] = useState<number | null>(null);
  const isQuestion = stage === 'predict' || stage === 'explain';
  const question = stage === 'predict' ? 'What will the browser receive?' : 'Why did the repair work?';
  const options = stage === 'predict' ? predictions : explanations;
  return <section className="activity card" aria-labelledby="activity-title" id="activity">
    <div className="micro activity-kicker">{isQuestion ? <CircleHelp size={15}/> : <Waypoints size={15}/>}
      {stage === 'predict' ? 'Prediction' : stage === 'explain' ? 'Knowledge check' : stage === 'transfer' ? 'Independent challenge' : stage === 'complete' ? 'Journey complete' : 'Guided repair'}</div>
    <h2 id="activity-title">{isQuestion ? question : stage === 'complete' ? 'Both routes verified' : stage === 'transfer' ? 'Repair the weather API' : 'Connect the missing port'}</h2>
    {session.feedback && <div role="status" className={'feedback ' + (session.success ? 'positive' : '')}>{session.feedback}</div>}
    {isQuestion ? <form onSubmit={e => { e.preventDefault(); if (choice !== null) act({ type: stage === 'predict' ? 'predict' : 'explain', choice }); }}>
      <p className="activity-description">{stage === 'predict' ? <>Flask is listening inside its container. Predict the outcome of a request to <code>localhost:{lab.host}</code>.</> : 'Choose the explanation that accounts for the successful HTTP request.'}</p>
      <fieldset className={'choices ' + (stage === 'predict' ? 'short' : '')}><legend className="sr-only">{question}</legend>{options.map((option, i) =>
        <label key={option} className={choice === i ? 'chosen' : ''}><input type="radio" name="choice" checked={choice === i} onChange={() => setChoice(i)}/>{option}</label>)}</fieldset>
      <button className="primary" disabled={choice === null || busy}>{stage === 'predict' ? 'Record prediction & test' : 'Check explanation'}<ArrowRight size={16}/></button>
    </form> : stage === 'complete' ? <><p className="activity-description">Your verified weather service is ready to export with its Dockerfile, Compose configuration, source code and local testing checklist.</p><button className="primary" onClick={showFiles}><Check size={16}/>Open project files</button></> :
      <Repair session={session} busy={busy} act={act}/>}
  </section>;
}
