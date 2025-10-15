const express = require('express');

function createSnippetRouter(service) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const snippets = await service.listSnippets({
        bookmarkId: req.query.bookmarkId
      });
      res.json(snippets);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const created = await service.createSnippet(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await service.updateSnippet(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await service.deleteSnippet(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createSnippetRouter
};
