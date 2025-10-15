const express = require('express');

function createTagRouter(service) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const tags = await service.listTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const created = await service.createTag(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createTagRouter
};
