import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Code2, FileCode2, FolderDown, Hammer, Layers3, RotateCcw, TriangleAlert, Wrench } from 'lucide-react';
import { dockerfileInstructions, frameworkLessons, frameworks, type Framework } from '../lab/content';
import { GraphWorkbench } from './GraphWorkbench';
import { canSequence, readInstructions, writeInstructions, type Instruction } from './instructionGraph';
import { archive } from '../lab/artifacts';
import { download } from '../download';
import { brokenRecipe, checkRecipe, maxRecipe, recipeFiles, type RecipeCheck } from './recipes';

interface Props {
  name: Framework; source: string; serviceName?: string;
  select: (name: Framework) => void; edit: (source: string) => void; useRecipe: () => void;
}
export function DockerfileLab({ name, source, serviceName, select, edit, useRecipe }: Props) {
  const [showCode, setShowCode] = useState(!!serviceName);
  const [stepIndex, setStepIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState('Dockerfile');
  const [prediction, setPrediction] = useState<'' | 'pass' | 'fail'>('');
  const [lastAttempt, setAttempt] = useState<{ checked: RecipeCheck; prediction: string; source: string } | null>(null);
  const attempt = lastAttempt?.source === source ? lastAttempt : null;
  const [challenge, setChallenge] = useState(false);
  const context = useMemo(() => recipeFiles(name), [name]);
  const lesson = frameworkLessons[name];
  function change(text: string) { edit(text); setAttempt(null); setPrediction(''); }
  function switchTemplate(to: Framework) { if (to !== name || serviceName) select(to); }
  const doc = useMemo(() => readInstructions(source), [source]);
  const { steps } = doc;
  const index = Math.min(stepIndex,steps.length - 1);
  const step = steps[index];
  const tooLarge = steps.length > 80;
  const items = useMemo(() => tooLarge ? [] : steps.map((s,i) => {
    const row = Math.floor(i / 3);
    return { id: String(i), name: s.verb, kind: 'Step ' + (i + 1), color: 'instruction', icon: FileCode2, reverse: row % 2 === 1,
      detail: s.text.trimStart().slice(s.verb.length).trim(), x: (row % 2 ? 2 - i % 3 : i % 3) * 238, y: row * 138, source: s.verb !== 'CMD' };
  }), [steps, tooLarge]);
  const links = useMemo(() => items.slice(1).map((n,i) => ({ from: String(i), to: n.id, kind: 'sequence' as const, label: 'next' })), [items]);
  function write(next: Instruction[], focus: number) {
    const updated = writeInstructions(doc,next);
    if (updated.length > maxRecipe) { setMessage('This recipe exceeds the 6000-character limit.'); return; }
    setMessage(''); change(updated); setStepIndex(Math.max(0,focus));
  }
  function add(verb: string) {
    const template = context.Dockerfile.split('\n').find(line => line.startsWith(verb + ' ')) ?? ({ ARG: 'ARG APP_ENV=development', ENV: 'ENV APP_ENV=development', ADD: 'ADD . /app', ENTRYPOINT: 'ENTRYPOINT ["/bin/sh"]' } as Record<string,string>)[verb];
    const next = [...steps];
    const at = verb === 'FROM' ? 0 : verb === 'CMD' ? next.length : Math.max(0,Math.min(index + 1, steps.at(-1)?.verb === 'CMD' ? steps.length - 1 : steps.length));
    next.splice(at,0,{ prefix: [], text: template, verb });
    write(next,at);
  }
  function order(from: string,to: string) {
    const a = Number(from), b = Number(to);
    if (!canSequence(steps,a,b)) return;
    const next = [...steps];
    next.splice(a + 1,0,next.splice(b,1)[0]);
    write(next,a);
  }
  return <>
    <div className="pg-frameworks" aria-label="Frameworks">{frameworks.map(f =>
      <button key={f} aria-pressed={name === f} onClick={() => switchTemplate(f)}><span className="pg-framework-icon"><Code2 size={18}/></span>
      <span><strong>{f}</strong><small>{frameworkLessons[f].runtime} · port {frameworkLessons[f].port}</small></span></button>)}</div>
    <GraphWorkbench title="Dockerfile instruction graph" items={items} links={links} selected={String(index)} select={id => setStepIndex(Number(id))}
      valid={(a,b) => canSequence(steps,Number(a),Number(b))} connect={order} add={add}
      palette={dockerfileInstructions.map(([verb,description]) => ({ id: verb, name: verb, description, icon: FileCode2,
        disabled: tooLarge || steps.length >= 80 || (verb === 'FROM' && steps.some(s => s.verb === verb)) }))}
      showCode={showCode || tooLarge} setShowCode={setShowCode} alternateName="Source" message={tooLarge ? 'Use Source to edit recipes over 80 instructions.' : message}
      alternate={<div className="recipe-source">
      <div className="pg-file-tabs">{['Dockerfile', ...Object.keys(context).filter(f => f !== 'Dockerfile')].map(f =>
        <button key={f} aria-pressed={file === f} onClick={() => setFile(f)}>{f}</button>)}</div>
      {file === 'Dockerfile' ? <textarea className="pg-editor" aria-label="Dockerfile editor" value={source} maxLength={maxRecipe}
        onChange={e => change(e.target.value)} autoCapitalize="off" spellCheck={false} wrap="off"/> :
        <pre className="pg-editor pg-context" aria-label={file + ' source'}>{context[file]}</pre>}
      <div className="pg-canvas-help">{file === 'Dockerfile' ? 'Edit the instructions, then predict what the build checks will find.' : 'This source file is included in the downloadable build context.'}</div>
    </div>} properties={<>
      {step && !showCode && !tooLarge && <div className="instruction-properties"><strong>Step {index + 1} · {step.verb}</strong>
        <label>Arguments<textarea aria-label="Instruction arguments" value={step.text.trimStart().replace(/^\S+\s?/, '')} maxLength={maxRecipe} onChange={e => {
          const text = step.verb + ' ' + e.target.value;
          write(steps.map((s,i) => i === index ? { ...s,text } : s),index);
        }}/></label>
        <button className="quiet" onClick={() => {
          const next = steps.filter((_,i) => i !== index);
          if (next[index]) next[index] = { ...next[index], prefix: [...step.prefix,...next[index].prefix] };
          else if (step.prefix.length) { change(writeInstructions({ ...doc,tail: [...step.prefix,...doc.tail] },next)); setStepIndex(Math.max(0,index-1)); return; }
          write(next,index-1);
        }}>Remove instruction</button></div>}
      <div className="micro"><Hammer size={14}/>Build exercise</div><h2>{name} image</h2><p>{lesson.goal}</p>
      <div className="pg-fact"><span>Listener</span><code>0.0.0.0:{lesson.port}</code></div>
      <button className="secondary" onClick={() => { change(brokenRecipe(name)); setFile('Dockerfile'); setShowCode(true); setChallenge(true); }}><Wrench size={14}/>Load broken recipe</button>
      {challenge && <p className="pg-hint">{lesson.challenge}</p>}
      <button className="quiet" onClick={() => { change(context.Dockerfile); setChallenge(false); setFile('Dockerfile'); }}><RotateCcw size={14}/>Restore starter</button>
      <fieldset className="pg-predict"><legend>Predict this build</legend>{(['pass','fail'] as const).map(p =>
        <label key={p}><input type="radio" name="build-prediction" checked={prediction === p} onChange={() => setPrediction(p)}/>{p === 'pass' ? 'Passes the checks' : 'Fails a check'}</label>)}</fieldset>
      <button className="primary" disabled={!prediction} onClick={() => setAttempt({ prediction, source, checked: checkRecipe(name, source) })}><Hammer size={15}/>Simulate build</button>

    <section className="pg-build-result" aria-live="polite"><div className="micro"><Layers3 size={15}/>Simulated build output</div>
      {!attempt ? <p>Run the simulation to inspect each instruction and check the sample’s startup command.</p> : <>
        <h2>{attempt.checked.error ? <TriangleAlert size={20}/> : <CheckCircle2 size={20}/>} {attempt.checked.error ? 'Build check failed' : 'Build checks passed'}</h2>
        <p>{(attempt.prediction === 'fail') === !!attempt.checked.error ? 'Your prediction matched the result.' : 'The result differed from your prediction.'} {attempt.checked.error ?? 'The model found the dependency inputs, application source, documented port and startup command.'}</p>
        <ol className="pg-steps">{attempt.checked.steps.map((s, i) => <li key={i}><code>{s.instruction}</code><span>{s.detail}</span></li>)}</ol>
        {!attempt.checked.error && <div className="actions"><button className="primary" onClick={useRecipe}>{serviceName ? 'Apply to ' + serviceName : 'Add service to graph'}<ArrowRight size={15}/></button>
          <button className="secondary" onClick={() => download(archive({ ...context, Dockerfile: source }), name.toLowerCase() + '-context.zip')}><FolderDown size={15}/>Build context ZIP</button></div>}
      </>}
      <small>DockerLab models the supported instructions in your browser. Package installation, image builds and application execution require Docker.</small>
    </section></>}/>
  </>;
}
