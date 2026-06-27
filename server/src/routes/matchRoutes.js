const express = require('express');
const router = express.Router();
const {
  runMatching, getMyMatches, getMatch, acceptMatch, rejectMatch,
} = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.post('/run', protect, runMatching);
router.get('/', protect, getMyMatches);
router.get('/:id', protect, getMatch);
router.post('/:id/accept', protect, acceptMatch);
router.post('/:id/reject', protect, rejectMatch);

module.exports = router;
