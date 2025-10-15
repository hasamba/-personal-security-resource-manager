import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  bookmarks: {
    getAll: () => ipcRenderer.invoke('bookmarks:getAll'),
    getById: (id: string) => ipcRenderer.invoke('bookmarks:getById', id),
    create: (bookmark: any) => ipcRenderer.invoke('bookmarks:create', bookmark),
    update: (id: string, bookmark: any) => ipcRenderer.invoke('bookmarks:update', id, bookmark),
    delete: (id: string) => ipcRenderer.invoke('bookmarks:delete', id),
    search: (query: string) => ipcRenderer.invoke('bookmarks:search', query),
    export: (format: string) => ipcRenderer.invoke('bookmarks:export', format),
  },
  tags: {
    getAll: () => ipcRenderer.invoke('tags:getAll'),
  },
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
  },
});
