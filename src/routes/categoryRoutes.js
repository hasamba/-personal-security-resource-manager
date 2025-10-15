const express = require('express');

function createCategoryRouter(service) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const categories = await service.listCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createCategoryRouter
};
