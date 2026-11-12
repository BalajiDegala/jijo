import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { portExperiments } from './lab/content';
import { testPortExperiment, type Entry, type Session } from './lab/journey';

export function PortExperiment({ session }: { session: Session }) {
  const { lab } = session;
  const variants = portExperiments(lab);
  const [scenario, setScenario] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [result, setResult] = useState<Entry[]>();
  const [error, setError] = useState('');
  const trial = variants[scenario];
  const addresses = ['localhost:' + lab.host, 'localhost:' + (lab.host + 1), 'Neither address'];
  const winner = result?.findIndex(res => res.success);
  return <details className="port-experiment"><summary><FlaskConical size={15}/>Try changing one port</summary>
    <div className="trial-body"><p>Experiment on a copy of your working container.</p>
      <label>Experiment<select value={scenario} onChange={e => {
        setScenario(Number(e.target.value)); setResult(undefined); setGuess(null); setError('');
      }}>{variants.map((v,i) => <option key={v.name} value={i}>{v.name}</option>)}</select></label>
      <dl className="trial-ports"><div><dt>Host port</dt><dd>{trial.host === lab.host ? lab.host : <><del>{lab.host}</del> → {trial.host}</>}</dd></div>
      <div><dt>Container port</dt><dd>{trial.target === lab.listener ? lab.listener : <><del>{lab.listener}</del> → {trial.target}</>}</dd></div></dl>
      <form onSubmit={e => {
        e.preventDefault();
        if (guess === null) return;
        try { setResult(testPortExperiment(session, trial)); setError(''); }
        catch (err) { setError((err as Error).message); }
      }}>
        <fieldset className="choices trial-choices"><legend>Which browser address will respond?</legend>{addresses.map((label,i) =>
          <label key={label}><input type="radio" name="trial-prediction" checked={guess === i} onChange={() => { setGuess(i); setResult(undefined); }}/>{label}</label>)}</fieldset>
        <button className="secondary" disabled={guess === null}>Test both addresses</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {result && <div className="trial-result" aria-live="polite"><strong>{guess === (winner === -1 ? 2 : winner) ? 'Your prediction matched.' : 'Compare your prediction with the responses.'}</strong>
        {result.map((res,i) => <div key={res.command}><code>{addresses[i]}</code><span className={res.success ? 'pass-text' : 'stop-text'}>{res.success ? 'HTTP 200' : 'Connection failed'}</span></div>)}
        <p>{trial.host !== lab.host ? 'The browser address changed. Flask still listens on port ' + lab.listener + '.' :
          'Docker forwarded to port ' + trial.target + '. Flask was listening on port ' + lab.listener + '.'}</p></div>}
    </div>
  </details>;
}
