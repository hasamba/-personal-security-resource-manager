const { InMemoryRepository } = require('./data/inMemoryRepository');
const { ResourceService } = require('./services/resourceService');
const { createApp } = require('./app');
const { registerIpcHandlers } = require('./electron/ipcBridge');

const repository = new InMemoryRepository();
const service = new ResourceService(repository);
const app = createApp(service);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend service listening on port ${port}`);
});

let unregisterIpcHandlers = () => {};

try {
  unregisterIpcHandlers = registerIpcHandlers(service) || (() => {});
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    // eslint-disable-next-line no-console
    console.warn('Electron module not found. IPC handlers were not registered.');
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Failed to register Electron IPC handlers: ${error.message}`);
  }
}

process.on('exit', () => {
  unregisterIpcHandlers?.();
  server.close();
});

module.exports = {
  app,
  service
};
