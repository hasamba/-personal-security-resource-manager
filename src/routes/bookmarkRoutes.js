const express = require('express');

function createBookmarkRouter(service) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const bookmarks = await service.listBookmarks();
      res.json(bookmarks);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const created = await service.createBookmark(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const bookmark = await service.getBookmark(req.params.id);
      res.json(bookmark);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await service.updateBookmark(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await service.deleteBookmark(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createBookmarkRouter
};
