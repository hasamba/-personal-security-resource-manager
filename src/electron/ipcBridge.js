const { ApplicationError } = require('../errors');

function resolveElectron() {
  try {
    // eslint-disable-next-line global-require
    return require('electron');
  } catch (error) {
    if (error && error.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw error;
  }
}

function registerIpcHandlers(service) {
  const electron = resolveElectron();
  if (!electron || !electron.ipcMain || typeof electron.ipcMain.handle !== 'function') {
    return () => {};
  }

  const { ipcMain } = electron;

  const handlerMap = {
    'bookmarks:list': () => service.listBookmarks(),
    'bookmarks:get': (id) => service.getBookmark(id),
    'bookmarks:create': (payload) => service.createBookmark(payload),
    'bookmarks:update': ({ id, payload } = {}) =>
      service.updateBookmark(id, payload),
    'bookmarks:delete': (id) => service.deleteBookmark(id),
    'tags:list': () => service.listTags(),
    'tags:create': (payload) => service.createTag(payload),
    'categories:list': () => service.listCategories(),
    'notes:list': (filter = {}) => service.listNotes(filter || {}),
    'notes:create': (payload) => service.createNote(payload),
    'notes:update': ({ id, payload } = {}) => service.updateNote(id, payload),
    'notes:delete': (id) => service.deleteNote(id),
    'snippets:list': (filter = {}) => service.listSnippets(filter || {}),
    'snippets:create': (payload) => service.createSnippet(payload),
    'snippets:update': ({ id, payload } = {}) =>
      service.updateSnippet(id, payload),
    'snippets:delete': (id) => service.deleteSnippet(id),
    'search:run': (query) => service.search(query),
    'export:resource': ({ resource, format } = {}) =>
      service.exportData(resource, format)
  };

  const wrappedHandlers = {};

  Object.entries(handlerMap).forEach(([channel, handler]) => {
    const wrapped = async (event, args) => {
      try {
        return await handler(args);
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {
            error: {
              message: error.message,
              statusCode: error.statusCode,
              details: error.details
            }
          };
        }
        return {
          error: {
            message: 'Internal error',
            statusCode: 500
          }
        };
      }
    };
    wrappedHandlers[channel] = wrapped;

    if (typeof ipcMain.removeHandler === 'function') {
      ipcMain.removeHandler(channel);
    }

    ipcMain.handle(channel, wrapped);
  });

  return () => {
    Object.keys(wrappedHandlers).forEach((channel) => {
      ipcMain.removeHandler?.(channel);
    });
  };
}

module.exports = {
  registerIpcHandlers
};
