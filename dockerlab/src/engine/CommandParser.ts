export function tokenize(input: string): string[] {
  const result: string[] = []; let word = ''; let quote = ''; let active = false;
  for (let i=0; i<input.length; i++) {
    const c = input[i];
    if (c === '\\' && quote !== "'") { if (i+1 >= input.length) throw new Error('Incomplete escape at end of command.'); word += input[++i]; active=true; }
    else if (quote) { if(c === quote) quote=''; else word+=c; }
    else if (c === '"' || c === "'") { quote=c; active=true; }
    else if (/\s/.test(c)) { if(active) { result.push(word); word=''; active=false; } }
    else if (/[|;&<>`]/.test(c)) throw new Error('Shell operators are unsupported. This is a virtual Docker CLI; enter one command at a time.');
    else { word+=c; active=true; }
  }
  if(quote) throw new Error('Unterminated quote. Close your quoted argument.');
  if(active) result.push(word);
  return result;
}
export interface FlagSpec { [name: string]: 'boolean' | 'value' }
export function parseFlags(args: string[], spec: FlagSpec, stopAtPositional = false) {
  const flags: Record<string,string[]> = {}; const positional: string[] = [];
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(arg==='--') { positional.push(...args.slice(i+1)); break; }
    if(arg.startsWith('-')) {
      const eq=arg.indexOf('='); const name=eq>-1?arg.slice(0,eq):arg;
      if(!spec[name]) throw new Error(`unknown flag: ${name}. Type help to see supported options.`);
      if(spec[name]==='boolean') { if(eq>-1) throw new Error(`${name} does not accept a value.`); (flags[name]??=[]).push('true'); }
      else { const value=eq>-1?arg.slice(eq+1):args[++i]; if(value===undefined || value.startsWith('--')) throw new Error(`flag needs an argument: ${name}`); (flags[name]??=[]).push(value); }
    } else { positional.push(arg); if(stopAtPositional) { positional.push(...args.slice(i+1)); break; } }
  }
  return { flags, positional, one: (...names: string[]) => names.flatMap(n=>flags[n]??[]).at(-1), many: (...names: string[])=>names.flatMap(n=>flags[n]??[]) };
}
export function requireArgs(args: string[], count: number, usage: string, max=count) { if(args.length<count || args.length>max) throw new Error(`Usage: ${usage}`); }
export function table(headers: string[], rows: (string | number)[][]): string {
  const widths=headers.map((h,i)=>Math.max(h.length,...rows.map(r=>String(r[i]??'').length)));
  return [headers,...rows].map(row=>row.map((v,i)=>String(v).padEnd(widths[i]+3)).join('').trimEnd()).join('\n');
}
export const HELP = `DockerLab · Virtual Docker CLI\nAll resources and registry operations are simulated locally. No host shell is executed.\n\nIMAGES    docker pull IMAGE | images | image ls | image inspect IMAGE | rmi IMAGE\nCONTAINERS\n  docker run [-d] [--name NAME] [-p HOST:CONTAINER] [--network NET]\n    [-v VOLUME:PATH[:ro]] [-e KEY=VALUE] [--entrypoint CMD] [--user USER] IMAGE [COMMAND]\n  docker ps [-a] | stop NAME | start NAME | restart NAME | rm [-f] NAME\n  docker logs NAME | inspect NAME | stats | exec [-it] NAME [sh|COMMAND]\nNETWORKS  docker network ls|create|inspect|rm NAME\n  docker network connect|disconnect NETWORK CONTAINER\nVOLUMES   docker volume ls|create|inspect|rm NAME\nBUILD     docker build [-t NAME:TAG] . (uses Dockerfile Lab files)\nREGISTRY  docker login [-u USER] | tag SOURCE TARGET | push IMAGE | logout\nCOMPOSE   docker compose config|build|up [-d]|ps|logs [SERVICE]|stop|start|down [-v]\nDIAGNOSE  ping [-c N] NAME | curl URL | nslookup NAME\n  Enter a container with docker exec -it NAME sh; exit returns to the host.\n  Inside a container: cat PATH | write PATH TEXT (simulated file helpers)\nOTHER     help | clear\n\nTab completes commands and resource names. ↑ / ↓ browses history.\nOnly the documented subset is accepted. EXPOSE does not publish ports.\nPublished ports are immutable: remove and recreate the container to change them.`;
