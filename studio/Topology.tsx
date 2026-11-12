import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Code2, FileCode2, GitFork, Monitor, Network, Pause, Play, RotateCcw, X } from 'lucide-react';
import { sources } from './lab/content';
import { PortExperiment } from './PortExperiment';
import { portRoute, type Event, type PortRoute, type RequestRecord, type Session } from './lab/journey';

export function Device({ kind }: { kind: 'host' | 'mapping' | 'container' }) {
  return <svg className="device" viewBox="0 0 132 100" aria-hidden="true" fill="none" strokeLinejoin="round" strokeLinecap="round">
    {kind === 'host' && <g stroke="#93c4ff" strokeWidth="2">
      <path d="m24 22 65-14 14 9v47L39 80l-15-10z" fill="#182e58" />
      <path d="m24 22 65-14v49L24 71z" fill="#344c80" />
      <path d="m30 26 53-11v37L30 64z" fill="#0a1428" />
      <path d="m38 35 8 4-8 8m15-3 12-3" stroke="#66f3ed" strokeWidth="3" />
      <path d="m52 74 1 8-15 5 13 6 35-9-13-6-1-9" fill="#25385a" />
      <path d="m39 80 64-16M89 8l14 9" />
    </g>}
    {kind === 'mapping' && <g stroke="#c6abff" strokeWidth="1.8">
      <path d="m22 58 55-21 34 17-55 22z" fill="#4d3d73" /><path d="m22 58 34 18v10L22 69z" fill="#32294f"/><path d="m56 76 55-22v10L56 86z" fill="#201e39"/>
      <path d="m22 43 55-21 34 17-55 22z" fill="#70579d"/><path d="m22 43 34 18v10L22 54z" fill="#423960"/><path d="m56 61 55-22v10L56 71z" fill="#30274d"/>
      <path d="m22 28 55-21 34 17-55 22z" fill="#8e73bb"/><path d="m22 28 34 18v10L22 39z" fill="#59457f"/><path d="m56 46 55-22v10L56 56z" fill="#433563"/>
      <path d="m45 30 26-10m-8-1 10 1-3 5m17-2-25 10m7 1-10-1 3-5" stroke="#eee4ff" />
      <path d="m85 40 5-2m6-2 5-2m-16 21 5-2m6-2 5-2" stroke="#d1adff"/>
    </g>}
    {kind === 'container' && <g strokeWidth="1.8" stroke="#9df8ef">
      <path d="m14 39 64-26 40 18-65 27z" fill="#59c2c1"/><path d="m14 39 39 19v34L14 72z" fill="#318b9d"/><path d="m53 58 65-27v34L53 92z" fill="#19566d"/>
      <path d="m23 39 55-22m-46 26 55-22m-46 27 56-23m-47 27 56-22" stroke="#2e8297"/>
      <path d="m60 60 0 23m9-27v23m9-27v23m9-26v23m9-27v23m9-27v23" stroke="#72d5dc" strokeWidth="3"/>
      <path d="m19 46 12 6v25l-12-7zm15 8 13 6v24l-13-6z" stroke="#84dbe1"/><path d="m25 51 0 19m15-12v19" stroke="#c5fffa"/>
    </g>}
  </svg>;
}

const stations = [
  { kind: 'host', label: 'Your browser' },
  { kind: 'mapping', label: 'Host port' },
  { kind: 'container', label: 'Flask container' },
] as const;

function RequestPath({ session, current, record }: { session: Session; current: PortRoute; record?: RequestRecord }) {
  const { lab } = session;
  const route = record?.route ?? current;
  const last = route.target === undefined ? 1 : 2;
  const [hop, setHop] = useState(last);
  const [playing, setPlaying] = useState(false);
  const [inspected, setInspected] = useState<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setHop(hop + 1);
      if (hop + 1 === last) setPlaying(false);
    }, 950);
    return () => window.clearTimeout(timer);
  }, [playing, hop, last]);
  function step(next: number) { setPlaying(false); setInspected(null); setHop(next); }
  const address = 'localhost:' + lab.host;
  const descriptions = [
    'The browser sends an HTTP request to ' + address + '.',
    route.target !== undefined ? 'Docker forwards TCP port ' + lab.host + ' on the host to port ' + route.target + ' inside the container.' :
      'The request stops on the host. No running container publishes TCP port ' + lab.host + '.',
    record?.success ? lab.name + ' answers on port ' + route.target + ' with HTTP 200.' :
      lab.name + ' received traffic on port ' + route.target + ' but did not return an HTTP response.',
  ];
  const stateNotes = ['The browser uses the host address ' + address + '.', 'Published mapping · ' + route.binding,
    'Process ' + route.process + (route.listener ? ' · Listening on port ' + route.listener : '')];
  const details = [address, route.binding, lab.name];
  const blocked = record && !record.success && hop === last;
  return <div className="circuit mission-circuit">
    <div className="devices mission-devices">
      {stations.map((station,i) => <button key={station.kind} type="button" className={'node' + (record && i <= hop ? ' reached' : '') +
        (record && i === hop ? blocked ? ' stopped' : ' current-hop' : '')} aria-pressed={inspected === i}
        onClick={() => { setPlaying(false); setInspected(inspected === i ? null : i); }}>
        <Device kind={station.kind}/><strong>{station.label}</strong><code>{details[i]}</code>
      </button>)}
    </div>
    <div className="trace-console">
      <div className="trace-readout" aria-live="polite" aria-atomic="true">
        {inspected !== null ? <><strong>{stations[inspected].label}</strong><span>{stateNotes[inspected]}</span></> :
          record ? <><strong className={blocked ? 'stop-text' : ''}>{blocked ? 'Stopped at ' : 'Hop ' + (hop + 1) + ' · '}{stations[hop].label}</strong><span>{descriptions[hop]}</span></> :
          <><strong>Request path</strong><span>{session.stage === 'predict' ? 'Inspect each device, then predict what the browser will receive.' : 'Inspect the environment or send a request to trace its path.'}</span></>}
      </div>
      {record && <div className="trace-controls" role="group" aria-label="Trace playback">
        <button type="button" title="Previous hop" aria-label="Previous hop" disabled={hop === 0} onClick={() => step(hop - 1)}><ChevronLeft size={16}/></button>
        <button type="button" onClick={() => {
          setInspected(null);
          if (playing) setPlaying(false);
          else { if (hop === last) setHop(0); setPlaying(true); }
        }}>{playing ? <Pause size={14}/> : hop === last ? <RotateCcw size={14}/> : <Play size={14}/>}
          {playing ? 'Pause' : hop === last ? 'Replay' : 'Play'}</button>
        <button type="button" title="Next hop" aria-label="Next hop" disabled={hop === last} onClick={() => step(hop + 1)}><ChevronRight size={16}/></button>
      </div>}
    </div>
  </div>;
}

function Comparison({ requests }: { requests: RequestRecord[] }) {
  if (requests.length < 2) return null;
  const first = requests[0], latest = requests[requests.length - 1];
  return <section className="request-comparison" aria-label="Request comparison">
    {[first, latest].map((item,i) => <div key={i}><small>{i === 0 ? 'First request' : 'Latest request'}</small>
      <code>{item.route.binding}</code><span className={item.success ? 'pass-text' : 'stop-text'}>{item.success ? <Check size={13}/> : <X size={13}/>}
        {item.success ? 'HTTP 200' : item.route.target === undefined ? 'Stopped at host' : 'Stopped at container'}</span></div>)}
  </section>;
}

export function Topology({ session, act, busy }: { session: Session; act: (event: Event) => void; busy: boolean }) {
  const [tab, setTab] = useState<'map' | 'source'>('map');
  const { lab, requests, stage } = session;
  const current = portRoute(session);
  const record = requests.at(-1);
  const dirty = record && (record.route.binding !== current.binding || record.route.process !== current.process || record.route.listener !== current.listener);
  const body = record?.success ? record.output.split('\n\n')[1]?.split('\n')[0] : undefined;
  const canSend = stage === 'repair' || stage === 'transfer';
  return <section className="topology" aria-label="Simulated environment">
    <div className="topo-head"><div className="panel-title"><Network size={18}/> Request explorer</div><span className="mode"><i/> Browser simulation</span></div>
    <div className="topo-tabs">
      <button aria-pressed={tab === 'map'} onClick={() => setTab('map')}><GitFork size={14}/>Request path</button>
      <button aria-pressed={tab === 'source'} onClick={() => setTab('source')}><FileCode2 size={14}/>Dockerfile</button>
    </div>
    {tab === 'map' ? <>
      <div className="mission-browser">
        <div className="browser-toolbar"><Monitor size={16} aria-hidden="true"/><code>http://localhost:{lab.host}/</code>
          {stage === 'predict' ? <button type="button" onClick={() => document.querySelector<HTMLInputElement>('#activity input[type=radio]')?.focus()}>Make a prediction <ArrowRight size={14}/></button> :
            canSend && <button type="button" disabled={busy} onClick={() => act({ type: 'verify' })}>Send request <ArrowRight size={14}/></button>}</div>
        <div className="browser-receipt" role="group" aria-label="Simulated browser response">
          {record ? <><strong className={record.success ? 'pass-text' : 'stop-text'}>{record.success ? <Check size={15}/> : <X size={15}/>}
            {record.success ? 'HTTP 200 OK' : 'Connection failed'}</strong>
            <span>{record.success ? body : 'The browser received no HTTP response.'}</span></> : <span>{stage === 'predict' ? 'Your first request will run when you record your prediction.' : 'Ready to test this address.'}</span>}
        </div>
        {dirty && <div className="request-stale">Configuration changed. Send a request to update this trace.</div>}
      </div>
      <RequestPath key={requests.length} session={session} current={current} record={record}/>
      <Comparison requests={requests}/>
      {(stage === 'explain' || stage === 'complete') && <PortExperiment session={session}/>}
    </> : <div className="topo-code"><pre>{sources(lab).Dockerfile.trimEnd().split('\n').map((line, i) => <span key={line}><i>{i + 1}</i>{line}{'\n'}</span>)}</pre></div>}
    <div className="topo-foot"><Code2 size={14}/><code>{current.process !== 'absent' ? ['docker run -d --name', lab.name,
      ...(current.binding === 'Unpublished' ? [] : ['-p', current.binding]), lab.image].join(' ') : 'No container created'}</code></div>
  </section>;
}
