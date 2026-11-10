import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Code2, FileCode2, FolderDown, Hammer, Layers3, RotateCcw, TriangleAlert, Wrench } from 'lucide-react';
import { frameworkLessons, frameworks, type Framework } from '../lab/content';
import { archive } from '../lab/artifacts';
import { download } from '../download';
import { brokenRecipe, checkRecipe, maxRecipe, recipeFiles, type RecipeCheck } from './recipes';

interface Props {
  name: Framework; source: string; serviceName?: string;
  select: (name: Framework) => void; edit: (source: string) => void; useRecipe: () => void;
}
export function DockerfileLab({ name, source, serviceName, select, edit, useRecipe }: Props) {
  const [file, setFile] = useState('Dockerfile');
  const [prediction, setPrediction] = useState<'' | 'pass' | 'fail'>('');
  const [lastAttempt, setAttempt] = useState<{ checked: RecipeCheck; prediction: string; source: string } | null>(null);
  const attempt = lastAttempt?.source === source ? lastAttempt : null;
  const [challenge, setChallenge] = useState(false);
  const context = useMemo(() => recipeFiles(name), [name]);
  const lesson = frameworkLessons[name];
  function change(text: string) { edit(text); setAttempt(null); setPrediction(''); }
  function switchTemplate(to: Framework) { if (to !== name || serviceName) select(to); }
  return <>
    <div className="pg-frameworks" aria-label="Frameworks">{frameworks.map(f =>
      <button key={f} aria-pressed={name === f} onClick={() => switchTemplate(f)}><span className="pg-framework-icon"><Code2 size={18}/></span>
      <span><strong>{f}</strong><small>{frameworkLessons[f].runtime} · port {frameworkLessons[f].port}</small></span></button>)}</div>
    <div className="pg-layout pg-recipe-layout"><section className="pg-board">
      <header className="pg-board-head"><strong><FileCode2 size={16}/>{serviceName ? serviceName + ' / Dockerfile' : name + ' project'}</strong><small>Build context</small></header>
      <div className="pg-file-tabs">{['Dockerfile', ...Object.keys(context).filter(f => f !== 'Dockerfile')].map(f =>
        <button key={f} aria-pressed={file === f} onClick={() => setFile(f)}>{f}</button>)}</div>
      {file === 'Dockerfile' ? <textarea className="pg-editor" aria-label="Dockerfile editor" value={source} maxLength={maxRecipe}
        onChange={e => change(e.target.value)} autoCapitalize="off" spellCheck={false} wrap="off"/> :
        <pre className="pg-editor pg-context" aria-label={file + ' source'}>{context[file]}</pre>}
      <div className="pg-canvas-help">{file === 'Dockerfile' ? 'Edit the instructions, then predict what the build checks will find.' : 'This source file is included in the downloadable build context.'}</div>
    </section>
    <section className="card pg-inspector"><div className="micro"><Hammer size={14}/>Build exercise</div><h2>{name} image</h2><p>{lesson.goal}</p>
      <div className="pg-fact"><span>Listener</span><code>0.0.0.0:{lesson.port}</code></div>
      <button className="secondary" onClick={() => { change(brokenRecipe(name)); setFile('Dockerfile'); setChallenge(true); }}><Wrench size={14}/>Load broken recipe</button>
      {challenge && <p className="pg-hint">{lesson.challenge}</p>}
      <button className="quiet" onClick={() => { change(context.Dockerfile); setChallenge(false); setFile('Dockerfile'); }}><RotateCcw size={14}/>Restore starter</button>
      <fieldset className="pg-predict"><legend>Predict this build</legend>{(['pass','fail'] as const).map(p =>
        <label key={p}><input type="radio" name="build-prediction" checked={prediction === p} onChange={() => setPrediction(p)}/>{p === 'pass' ? 'Passes the checks' : 'Fails a check'}</label>)}</fieldset>
      <button className="primary" disabled={!prediction} onClick={() => setAttempt({ prediction, source, checked: checkRecipe(name, source) })}><Hammer size={15}/>Simulate build</button>
    </section></div>
    <section className="card pg-build-result" aria-live="polite"><div className="micro"><Layers3 size={15}/>Simulated build output</div>
      {!attempt ? <p>Run the simulation to inspect each instruction and check the sample’s startup command.</p> : <>
        <h2>{attempt.checked.error ? <TriangleAlert size={20}/> : <CheckCircle2 size={20}/>} {attempt.checked.error ? 'Build check failed' : 'Build checks passed'}</h2>
        <p>{(attempt.prediction === 'fail') === !!attempt.checked.error ? 'Your prediction matched the result.' : 'The result differed from your prediction.'} {attempt.checked.error ?? 'The model found the dependency inputs, application source, documented port and startup command.'}</p>
        <ol className="pg-steps">{attempt.checked.steps.map((s, i) => <li key={i}><code>{s.instruction}</code><span>{s.detail}</span></li>)}</ol>
        {!attempt.checked.error && <div className="actions"><button className="primary" onClick={useRecipe}>{serviceName ? 'Apply to ' + serviceName : 'Add service to graph'}<ArrowRight size={15}/></button>
          <button className="secondary" onClick={() => download(archive({ ...context, Dockerfile: source }), name.toLowerCase() + '-context.zip')}><FolderDown size={15}/>Build context ZIP</button></div>}
      </>}
      <small>DockerLab models the supported instructions in your browser. Package installation, image builds and application execution require Docker.</small>
    </section>
  </>;
}
