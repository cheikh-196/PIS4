const express = require('express');
const router = express.Router();
const {
  getConversations, getMessages, sendMessage, markAsRead, markConversationAsRead, deleteMessage, updateMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendMessageValidator } = require('../validators/messageValidator');

router.get('/conversations', protect, getConversations);
router.put('/conversations/:reportId/read', protect, markConversationAsRead);
router.get('/:reportId', protect, getMessages);
router.post('/:reportId', protect, sendMessageValidator, validate, sendMessage);
router.put('/:id/read', protect, markAsRead);
router.put('/:id', protect, validate, updateMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
