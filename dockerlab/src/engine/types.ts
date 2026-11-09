export type ResourceKind = 'container' | 'image' | 'network' | 'volume';
export interface Selection { kind: ResourceKind; id: string; reference?:string }
export interface Layer { id: string; instruction: string; size: number; cached: boolean; detail: string }
export interface ImageResource { id: string; repository: string; tag: string; size: number; layers: Layer[]; createdAt: string; source: 'pulled' | 'built'; baseImage?: string; command: string[]; entrypoint: string[]; exposedPorts: number[]; environment: Record<string,string>; user: string; files: Record<string,string>; workdir: string }
export interface Port { host: number; container: number; protocol: 'tcp' | 'udp' }
export interface Mount { source: string; destination: string; readOnly: boolean; type: 'volume' | 'bind' }
export interface Attachment { name: string; ip: string; aliases: string[] }
export interface ContainerResource { id: string; name: string; image: string; imageId: string; status: 'running' | 'exited' | 'created'; ports: Port[]; networks: Attachment[]; volumes: Mount[]; environment: Record<string,string>; command: string[]; entrypoint: string[]; exitCode: number | null; health: 'none' | 'starting' | 'healthy' | 'unhealthy'; healthcheck?: string; logs: string[]; createdAt: string; user: string; restart: string; project?: string; service?: string; writableLayer: Record<string,string>; ready: boolean; readyAt?: number }
export interface NetworkResource { id: string; name: string; driver: 'bridge' | 'host' | 'null'; subnet: string; gateway: string; containers: string[]; builtin: boolean; project?: string }
export interface VolumeResource { id: string; name: string; driver: 'local'; mountedBy: string[]; data: Record<string,string>; owner: string; project?: string }
export type EventCategory = 'container' | 'network' | 'build' | 'system' | 'volume' | 'image';
export interface DockerEvent { id: string; time: string; category: EventCategory; action: string; message: string; resourceId?: string; targetId?:string; level: 'info' | 'error' }
export interface EngineState { version: 1; sequence: number; images: ImageResource[]; containers: ContainerResource[]; networks: NetworkResource[]; volumes: VolumeResource[]; events: DockerEvent[]; registry: { username: string | null; repositories: { reference: string; imageId: string; pushedAt: string }[] }; buildCache: string[]; clock: number; bindMounts?:Record<string,{data:Record<string,string>;owner:string}> }
export interface CommandResult { success: boolean; output: string; events: DockerEvent[]; resourceIds: string[]; changes: string[]; clear?: boolean; shell?: string | null }
export interface RunOptions { name?: string; ports?: string[]; networks?: string[]; volumes?: string[]; environment?: string[]; command?: string[]; entrypoint?: string; user?: string; restart?: string; healthcheck?: string; project?: string; service?: string; aliases?: string[]; deferReady?: boolean }
export interface ScenarioProgress { id: string; commands: string[]; inspected: string[]; errors: number; hints: number; revealed: boolean; verified: boolean; startedAt: string; changes?:string[];observations?:string[] }
