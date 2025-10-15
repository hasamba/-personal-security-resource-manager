import { contextBridge, ipcRenderer } from 'electron';
import type { IPCEventName } from '@monorepo/shared';

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: IPCEventName, ...args: unknown[]) => {
    return ipcRenderer.invoke(channel, ...args);
  },
});
