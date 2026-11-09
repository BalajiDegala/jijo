export const imageCatalog: Record<string, { tags: string[]; size: number; ports: number[]; command: string[]; entrypoint?: string[]; environment?: Record<string,string> }> = {
  nginx: { tags: ['latest','stable','alpine','1.27','1.28'], size: 142, ports: [80], command: ['nginx','-g','daemon off;'] },
  postgres: { tags: ['latest','16','17','16-alpine'], size: 432, ports: [5432], command: ['postgres'] },
  redis: { tags: ['latest','7','7-alpine','alpine'], size: 117, ports: [6379], command: ['redis-server'] },
  python: { tags: ['latest','3.12','3.12-slim','3.11','3.11-slim','3.13-slim'], size: 126, ports: [], command: ['python'] },
  alpine: { tags: ['latest','3.20','3.21'], size: 8, ports: [], command: ['/bin/sh'] },
  busybox: { tags: ['latest','1.36'], size: 5, ports: [], command: ['sh'] },
  node: { tags: ['latest','20','20-alpine','22','22-alpine'], size: 182, ports: [], command: ['node'] },
  'hello-world': { tags: ['latest'], size: 0.01, ports: [], command: ['/hello'] },
  'dockerlab/flask': { tags: ['latest','v1'], size: 152, ports: [5000], command: ['python','app.py'] },
};
export function reference(value: string) { return value.includes(':') ? value : `${value}:latest`; }
export const timestamp = () => new Date().toISOString();
