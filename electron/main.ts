import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { BookmarkService } from './services/BookmarkService';

let mainWindow: BrowserWindow | null = null;
const bookmarkService = new BookmarkService();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../react/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('bookmarks:getAll', async () => {
  return bookmarkService.getAllBookmarks();
});

ipcMain.handle('bookmarks:getById', async (_event, id: string) => {
  return bookmarkService.getBookmarkById(id);
});

ipcMain.handle('bookmarks:create', async (_event, bookmark) => {
  return bookmarkService.createBookmark(bookmark);
});

ipcMain.handle('bookmarks:update', async (_event, id: string, bookmark) => {
  return bookmarkService.updateBookmark(id, bookmark);
});

ipcMain.handle('bookmarks:delete', async (_event, id: string) => {
  return bookmarkService.deleteBookmark(id);
});

ipcMain.handle('bookmarks:search', async (_event, query: string) => {
  return bookmarkService.searchBookmarks(query);
});

ipcMain.handle('bookmarks:export', async (_event, format: string) => {
  return bookmarkService.exportBookmarks(format);
});

ipcMain.handle('tags:getAll', async () => {
  return bookmarkService.getAllTags();
});

ipcMain.handle('categories:getAll', async () => {
  return bookmarkService.getAllCategories();
});
