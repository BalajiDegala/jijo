import { Component } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow/latin-700.css';
import App from './App';
import './studio.css';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="recovery"><h1>The workspace could not open</h1><p>Reload to reopen your last saved project.</p><button className="primary" onClick={() => location.reload()}>Reload studio</button></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(<Boundary><App/></Boundary>);
