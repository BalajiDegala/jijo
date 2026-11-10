import { useState } from 'react';
import { Activity, Code2, FileCode2, GitFork, Network } from 'lucide-react';
import { sources } from './lab/content';
import type { Session } from './lab/journey';

function Device({ kind }: { kind: 'host' | 'mapping' | 'container' }) {
  return <svg className="device" viewBox="0 0 132 100" aria-hidden="true" fill="none" strokeLinejoin="round" strokeLinecap="round">
    {kind === 'host' && <g stroke="#b3d6c8" strokeWidth="2">
      <path d="m24 22 65-14 14 9v47L39 80l-15-10z" fill="#244940" />
      <path d="m24 22 65-14v49L24 71z" fill="#43655b" />
      <path d="m30 26 53-11v37L30 64z" fill="#122f2b" />
      <path d="m38 35 8 4-8 8m15-3 12-3" stroke="#cdf39b" strokeWidth="3" />
      <path d="m52 74 1 8-15 5 13 6 35-9-13-6-1-9" fill="#33574e" />
      <path d="m39 80 64-16M89 8l14 9" />
    </g>}
    {kind === 'mapping' && <g stroke="#85b8a7" strokeWidth="1.8">
      <path d="m22 58 55-21 34 17-55 22z" fill="#315a4e" /><path d="m22 58 34 18v10L22 69z" fill="#294b42"/><path d="m56 76 55-22v10L56 86z" fill="#193b34"/>
      <path d="m22 43 55-21 34 17-55 22z" fill="#426557"/><path d="m22 43 34 18v10L22 54z" fill="#315347"/><path d="m56 61 55-22v10L56 71z" fill="#23483d"/>
      <path d="m22 28 55-21 34 17-55 22z" fill="#567b66"/><path d="m22 28 34 18v10L22 39z" fill="#3b5f4f"/><path d="m56 46 55-22v10L56 56z" fill="#284c40"/>
      <path d="m45 30 26-10m-8-1 10 1-3 5m17-2-25 10m7 1-10-1 3-5" stroke="#d5edab" />
      <path d="m85 40 5-2m6-2 5-2m-16 21 5-2m6-2 5-2" stroke="#c5e68c"/>
    </g>}
    {kind === 'container' && <g strokeWidth="1.8" stroke="#cae6a0">
      <path d="m14 39 64-26 40 18-65 27z" fill="#98b875"/><path d="m14 39 39 19v34L14 72z" fill="#6c925e"/><path d="m53 58 65-27v34L53 92z" fill="#446f53"/>
      <path d="m23 39 55-22m-46 26 55-22m-46 27 56-23m-47 27 56-22" stroke="#577c55"/>
      <path d="m60 60 0 23m9-27v23m9-27v23m9-26v23m9-27v23m9-27v23" stroke="#aacd8a" strokeWidth="3"/>
      <path d="m19 46 12 6v25l-12-7zm15 8 13 6v24l-13-6z" stroke="#a7c887"/><path d="m25 51 0 19m15-12v19" stroke="#e1efb7"/>
    </g>}
  </svg>;
}

export function Topology({ session }: { session: Session }) {
  const [tab, setTab] = useState<'map' | 'source'>('map');
  const [selected, setSelected] = useState<number | null>(null);
  const { lab, engine } = session;
  const service = engine.state.containers.find(c => c.name === lab.name);
  const port = service?.ports[0];
  const mapping = port ? port.host + ' → ' + port.container : 'Unpublished';
  const listener = service && service.status === 'running' ? engine.listeningPorts(service)[0] : undefined;
  const intact = service?.status === 'running' && port?.host === lab.host && port?.container === listener && port?.protocol === 'tcp';
  const nodes = [
    { kind: 'host' as const, label: 'Your browser', detail: 'localhost:' + lab.host, note: 'The browser sends its HTTP request to port ' + lab.host + ' on the host.' },
    { kind: 'mapping' as const, label: 'Host port', detail: mapping, note: port ? 'Docker forwards host port ' + port.host + ' to container port ' + port.container + ' over ' + port.protocol.toUpperCase() + '.' : 'The current container has no published host port.' },
    { kind: 'container' as const, label: 'Flask container', detail: lab.name, note: service ? service.name + ' is ' + service.status + '. Its startup command is ' + service.command.join(' ') + '.' : 'The service container has been removed.' },
  ];
  return <section className="topology" aria-label="Simulated environment">
    <div className="topo-head"><div className="panel-title"><Network size={18}/> Environment</div><span className="mode"><i/> Simulation</span></div>
    <div className="topo-tabs">
      <button aria-pressed={tab === 'map'} onClick={() => setTab('map')}><GitFork size={14}/>Request path</button>
      <button aria-pressed={tab === 'source'} onClick={() => setTab('source')}><FileCode2 size={14}/>Dockerfile</button>
    </div>
    {tab === 'map' ? <div className="circuit">
      <div className={'devices ' + (intact ? 'connected' : '')}>
        {nodes.map((n, i) => <button className="node" aria-pressed={selected === i} key={n.kind} onClick={() => setSelected(selected === i ? null : i)}>
          <Device kind={n.kind}/><strong>{n.label}</strong><code>{n.detail}</code>
        </button>)}
      </div>
      <div className="telemetry" aria-live="polite"><Activity size={14}/>{selected !== null ? nodes[selected].note :
        'Process ' + (service?.status ?? 'absent') + (listener ? ' · Listening on 0.0.0.0:' + listener : '')}</div>
    </div> : <div className="topo-code"><pre>{sources(lab).Dockerfile.trimEnd().split('\n').map((line, i) => <span key={line}><i>{i + 1}</i>{line}{'\n'}</span>)}</pre></div>}
    <div className="topo-foot"><Code2 size={14}/><code>{service ? [ 'docker run -d --name', lab.name, ...(port ? ['-p', port.host + ':' + port.container + (port.protocol === 'udp' ? '/udp' : '')] : []), lab.image ].join(' ') : 'No container created'}</code></div>
  </section>;
}
