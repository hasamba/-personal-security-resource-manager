const { createBookmarkRouter } = require('./bookmarkRoutes');
const { createNoteRouter } = require('./noteRoutes');
const { createSnippetRouter } = require('./snippetRoutes');
const { createTagRouter } = require('./tagRoutes');
const { createCategoryRouter } = require('./categoryRoutes');
const { createSearchRouter } = require('./searchRoutes');
const { createExportRouter } = require('./exportRoutes');

function registerRoutes(app, service) {
  app.use('/bookmarks', createBookmarkRouter(service));
  app.use('/notes', createNoteRouter(service));
  app.use('/snippets', createSnippetRouter(service));
  app.use('/tags', createTagRouter(service));
  app.use('/categories', createCategoryRouter(service));
  app.use('/search', createSearchRouter(service));
  app.use('/export', createExportRouter(service));
}

module.exports = {
  registerRoutes
};
