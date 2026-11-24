const router = require('express').Router();
const {
  getGallery,
  createGalleryItem,
  createBatchGalleryItems,
  deleteGalleryItem,
} = require('../controllers/gallery.controller');

router.get('/', getGallery);
router.post('/', createGalleryItem);
router.post('/batch', createBatchGalleryItems);
router.delete('/:id', deleteGalleryItem);

module.exports = router;
