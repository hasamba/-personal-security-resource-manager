const express = require('express');

function createNoteRouter(service) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const notes = await service.listNotes({
        bookmarkId: req.query.bookmarkId
      });
      res.json(notes);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const created = await service.createNote(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await service.updateNote(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await service.deleteNote(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createNoteRouter
};
