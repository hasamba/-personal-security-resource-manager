let ValidationError;

const createServiceMock = () => ({
  listBookmarks: jest.fn(),
  getBookmark: jest.fn(),
  createBookmark: jest.fn(),
  updateBookmark: jest.fn(),
  deleteBookmark: jest.fn(),
  listTags: jest.fn(),
  createTag: jest.fn(),
  listCategories: jest.fn(),
  listNotes: jest.fn(),
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  listSnippets: jest.fn(),
  createSnippet: jest.fn(),
  updateSnippet: jest.fn(),
  deleteSnippet: jest.fn(),
  search: jest.fn(),
  exportData: jest.fn()
});

describe('Electron IPC bridge', () => {
  describe('with ipcMain available', () => {
    let ipcMain;
    let handlers;
    let registerIpcHandlers;
    let service;

    beforeEach(() => {
      jest.resetModules();
      handlers = {};
      ipcMain = {
        handle: jest.fn((channel, handler) => {
          handlers[channel] = handler;
        }),
        removeHandler: jest.fn((channel) => {
          delete handlers[channel];
        })
      };
      jest.doMock(
        'electron',
        () => ({
          ipcMain
        }),
        { virtual: true }
      );
      ({ registerIpcHandlers } = require('../../src/electron/ipcBridge'));
      ({ ValidationError } = require('../../src/errors'));
      service = createServiceMock();
    });

    test('registers IPC handlers and proxies calls to the service layer', async () => {
      service.listBookmarks.mockReturnValue([{ id: 'abc' }]);

      const unregister = registerIpcHandlers(service);

      expect(ipcMain.handle).toHaveBeenCalledWith(
        'bookmarks:list',
        expect.any(Function)
      );

      const result = await handlers['bookmarks:list']();
      expect(service.listBookmarks).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ id: 'abc' }]);

      unregister();
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('bookmarks:list');
    });

    test('wraps application errors into serializable payloads', async () => {
      service.listBookmarks.mockImplementation(() => {
        throw new ValidationError('Invalid request');
      });

      registerIpcHandlers(service);

      const response = await handlers['bookmarks:list']();
      expect(response).toEqual({
        error: {
          message: 'Invalid request',
          statusCode: 400,
          details: null
        }
      });
    });
  });

  test('returns a no-op unregister function when Electron is unavailable', () => {
    jest.resetModules();
    const { registerIpcHandlers } = require('../../src/electron/ipcBridge');

    const unregister = registerIpcHandlers(createServiceMock());
    expect(typeof unregister).toBe('function');
    expect(unregister()).toBeUndefined();
  });
});
