import { useSyncExternalStore } from 'react';
import { workspace } from './workspace';
export function useEngine(){return useSyncExternalStore(workspace.engine.subscribe,workspace.engine.getSnapshot);}
export function useWorkspace(){return useSyncExternalStore(workspace.subscribe,workspace.getSnapshot);}
