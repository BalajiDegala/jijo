import { useEffect, useRef, useState } from 'react';
import { BookOpen, Download, FileCode2, FolderDown, RotateCcw, Upload } from 'lucide-react';
import { download } from './download';
import { explanations, predictions, sources } from './lab/content';
import { emptyProject, restore } from './lab/journey';
import type { Event, Project } from './lab/journey';
import type { useProject } from './useProject';

type Workspace = ReturnType<typeof useProject>;

function describe(event: Event) {
  switch (event.type) {
    case 'predict': return 'Predicted · ' + predictions[event.choice];
    case 'explain': return 'Answered · ' + explanations[event.choice];
    case 'command': return event.text;
    case 'map': return 'Applied port mapping ' + event.host + ' → ' + event.target;
    case 'verify': return 'Tested the required HTTP route';
    case 'hint': return 'Requested a repair hint';
  }
}

export function FieldNotes({ project }: { project: Project }) {
  return <div className="resources"><section className="card reference">
    <div className="micro"><BookOpen size={15}/>Container networking</div><h2>Follow an HTTP request</h2>
    <dl><dt>Process and listener</dt><dd>Flask accepts traffic on a socket inside the container. Its startup command launches the process. The port in app.py tells you where the process listens.</dd>
      <dt>Host and container ports</dt><dd>A browser connects to a port on the host. A published TCP mapping forwards that traffic to a port in the container. The two port numbers can differ.</dd>
      <dt>Image metadata</dt><dd>EXPOSE documents an intended container port. Read the running container’s port bindings to see which ports Docker actually publishes.</dd>
      <dt>Reading the evidence</dt><dd>Use docker ps to find running containers, docker inspect to read bindings, docker logs to inspect startup and curl to test the HTTP path.</dd>
    </dl>
    <p className="source-note">On a Linux host, ss -ltn lists listening TCP sockets. Use curl to test what the HTTP endpoint actually returns. BroCode Paradise covers both tools in its Linux guide. <a href="https://github.com/BalajiDegala/jijo/blob/d0f89ef/paradise/docs/mdfiles/Linux_Shell_Scripting_Interview_Preparation_Guide.md#q21-linux-networking---ip-ifconfig-ping-traceroute-netstat-ss">Read Q21 on network diagnostics</a> or <a href="https://github.com/BalajiDegala/jijo/blob/d0f89ef/paradise/docs/mdfiles/Linux_Shell_Scripting_Interview_Preparation_Guide.md#q38-curl-deep-dive---headers-auth-debugging-api-calls">Q38 on cURL</a>.</p>
  </section><section className="card reference"><h2>Activity journal</h2>{project.events.length ?
    <ol className="journal">{project.events.map((event, i) => <li key={i}>{describe(event)}</li>)}</ol> : <p>Your predictions, commands and repairs will appear here as you work.</p>}</section></div>;
}

export function ProjectFiles({ workspace, goLab }: { workspace: Workspace; goLab: () => void }) {
  const { session, project, update, busy, setNotice } = workspace;
  const fileInput = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState('Dockerfile');
  const [bundle, setBundle] = useState<Record<string, string> | null>(null);
  const [replace, setReplace] = useState<{ project: Project; label: string } | null>(null);
  const complete = session.stage === 'complete';
  useEffect(() => {
    let current = true;
    setBundle(null);
    if (complete) void import('./lab/artifacts').then(({ buildBundle }) => {
      const result = buildBundle(session);
      if (current) setBundle(result);
    }).catch(error => { if (current) setNotice(error.message); });
    return () => { current = false; };
  }, [session, complete, setNotice]);
  const files: Record<string, string> = bundle ?? sources(session.lab);
  const active = selected in files ? selected : 'Dockerfile';
  async function read(file?: File) {
    if (!file) return;
    try {
      if (file.size > 160000) throw new Error('Choose a JIJO backup smaller than 160 KB.');
      const imported = restore(JSON.parse(await file.text()));
      setReplace({ project: imported, label: 'Open this backup and replace the current project?' });
    } catch (error) { setNotice('Import failed. ' + (error as Error).message); }
  }
  return <div className="resources">
    <section className="card reference"><div className="micro"><FileCode2 size={15}/>{session.lab.name}</div><h2>Project source</h2>
      <div className="file-tabs">{Object.keys(files).map(name => <button key={name} aria-pressed={active === name} onClick={() => setSelected(name)}>{name}</button>)}</div>
      <pre className="source-preview">{files[active]}</pre>
      {complete ? <button className="primary" disabled={!bundle} onClick={async () => {
        try { const { archive } = await import('./lab/artifacts'); download(archive(bundle!), 'jijo-weather-api.zip'); }
        catch (error) { setNotice((error as Error).message); }
      }}><FolderDown size={16}/>Download Flask project (.zip)</button> :
        <p className="source-note">Finish the independent repair to export the validated Compose project. <button className="inline" onClick={goLab}>Return to lab</button></p>}
    </section>
    <section className="card reference"><h2>Guest project backup</h2><p>Save your activity journal and lab state together. Import the JSON file on another device to continue at the same step.</p>
      <div className="actions"><button className="secondary" disabled={busy} onClick={() => download(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), 'jijo-project.json')}><Download size={16}/>Save backup</button>
        <button className="secondary" disabled={busy} onClick={() => fileInput.current?.click()}><Upload size={16}/>Import backup</button>
        <button className="quiet" disabled={busy} onClick={() => setReplace({ project: emptyProject(), label: 'Start again and clear this project’s activity journal?' })}><RotateCcw size={15}/>Start again</button></div>
      <input aria-label="Choose project backup" ref={fileInput} type="file" accept=".json,application/json" hidden onChange={e => { void read(e.target.files?.[0]); e.target.value = ''; }}/>
      {replace && <div className="confirm"><strong>{replace.label}</strong><p>Download a backup first to keep this attempt.</p><div className="actions"><button className="secondary" disabled={busy} onClick={async () => { await update(replace.project, true); setReplace(null); goLab(); }}>Confirm replacement</button><button className="quiet" onClick={() => setReplace(null)}>Cancel</button></div></div>}
    </section>
  </div>;
}
