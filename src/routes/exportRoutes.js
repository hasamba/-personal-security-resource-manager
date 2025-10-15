const express = require('express');

function createExportRouter(service) {
  const router = express.Router();

  router.get('/:resource', async (req, res, next) => {
    try {
      const { resource } = req.params;
      const format = req.query.format || 'json';
      const exportResult = await service.exportData(resource, format);
      const filename = `${exportResult.resource}.${exportResult.format}`;

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      res.type(exportResult.contentType);
      res.send(exportResult.content);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createExportRouter
};
