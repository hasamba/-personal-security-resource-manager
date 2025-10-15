import type { IpcMain } from 'electron';
import type { IPCEventName } from '@monorepo/shared';

export function setupIpcHandlers(ipcMain: IpcMain) {
  ipcMain.handle('bookmark:list' as IPCEventName, async () => {
    return [];
  });

  ipcMain.handle('tag:list' as IPCEventName, async () => {
    return [];
  });

  ipcMain.handle('category:list' as IPCEventName, async () => {
    return [];
  });

  console.log('IPC handlers registered');
}
