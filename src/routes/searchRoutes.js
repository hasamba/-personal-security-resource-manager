const express = require('express');

function createSearchRouter(service) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const { q } = req.query;
      const results = await service.search(q);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createSearchRouter
};
