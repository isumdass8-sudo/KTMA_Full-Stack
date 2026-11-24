const router = require('express').Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  deleteEvent,
} = require('../controllers/events.controller');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
