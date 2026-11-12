import { Device } from './Topology';
import { ArrowRight, ArrowUpRight, Blocks, BookOpen, Boxes, Container, FileCode2, FlaskConical, GitBranch, Network, Workflow } from 'lucide-react';

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
        <small>1 guided lesson · 2 playgrounds</small>
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

export function DockerOverview({ completed }: { completed: number }) {
  return <div className="docker-overview">
    <section aria-labelledby="lesson-heading"><h2 className="library-label" id="lesson-heading">Guided lesson</h2>
      <a href="#lab" className="lesson-card">
        <span className="module-symbol"><FlaskConical size={24}/></span><div><h3>The unreachable container</h3><p>Trace a failed HTTP request and repair the port mapping.</p>
        <small>{completed} of 4 steps complete</small></div>
        <span className="module-action">{completed === 4 ? 'Review lesson' : completed ? 'Resume lesson' : 'Start lesson'} <ArrowRight size={16}/></span>
      </a></section>
    <section aria-labelledby="tools-heading"><h2 className="library-label" id="tools-heading">Playgrounds</h2>
      <div className="tool-list">
        <a href="#graph"><span className="tool-symbol"><Workflow/></span><div><h3>Resource playground</h3><p>Connect resources on a canvas, validate the graph and download Compose YAML.</p></div><ArrowRight size={17}/></a>
        <a href="#dockerfile"><span className="tool-symbol recipe"><FileCode2/></span><div><h3>Dockerfile playground</h3><p>Edit and test recipes for Flask, FastAPI, Express and Fastify.</p></div><ArrowRight size={17}/></a>
      </div></section>
    <div className="module-references"><a href="#notes"><BookOpen size={15}/>Field notes</a><a href="#files"><Blocks size={15}/>Project files</a></div>
  </div>;
}
