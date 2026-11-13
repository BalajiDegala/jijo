import { Device } from './Topology';
import { ArrowRight, ArrowUpRight, BookOpen, Boxes, Container, GitBranch, Network } from 'lucide-react';

export function Brand() {
  return <a className="brand" href="#modules" aria-label="JIJO learning modules"><img alt="" src="/jijo.svg"/>JIJO<span className="brand-period">.</span></a>;
}

const modules = [
  { name: 'Git', summary: 'Practice commits, branching and merging.', icon: GitBranch, href: 'https://raga-git.vercel.app', color: 'git' },
  { name: 'Networking', summary: 'Explore how devices connect and packets travel.', icon: Network, href: 'https://roopa-net.vercel.app', color: 'network' },
  { name: 'Terraform', summary: 'Work with infrastructure resources and their dependencies.', icon: Boxes, href: 'https://venkata-farm.vercel.app', color: 'terraform' },
];

export function ModuleLibrary() {
  return <div className="module-directory">
    <a className="module-feature" href="#docker">
      <div className="feature-copy"><div className="feature-title"><Container size={28}/><h2>Docker</h2></div>
        <p>Build containers, connect services and export a Compose stack.</p>
        <small>Terminal playground · Templates · Interview scenarios</small>
        <span className="module-action">Open module <ArrowRight size={17}/></span>
      </div>
      <div className="request-preview" aria-hidden="true">
        <span><Device kind="host"/><small>Browser</small></span>
        <span><Device kind="mapping"/><small>Host port</small></span>
        <span><Device kind="container"/><small>Container</small></span>
      </div>
    </a>
    <section aria-labelledby="studio-heading"><h2 className="library-label" id="studio-heading">Standalone studios</h2>
      <div className="studio-grid">{modules.map(m => <a key={m.name} href={m.href} className={'studio-card ' + m.color}>
        <span className="studio-icon"><m.icon size={22}/></span><ArrowUpRight className="outbound" size={16} aria-hidden="true"/>
        <h3>{m.name}</h3><p>{m.summary}</p>
      </a>)}</div></section>
    <a className="library-reference" href="https://brocodeparadise.vercel.app"><BookOpen size={17}/>BroCode reference library<ArrowUpRight size={14}/></a>
  </div>;
}
