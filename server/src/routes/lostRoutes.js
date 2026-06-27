const express = require('express');
const router = express.Router();
const {
  getLostReports, getLostReport, createLostReport, updateLostReport,
  deleteLostReport, updateLostStatus, addLostImages, deleteLostImage, getMyLostReports,
} = require('../controllers/lostController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const handleUpload = require('../middleware/upload');
const { createReportValidator, updateReportValidator } = require('../validators/reportValidator');

router.get('/', getLostReports);
router.get('/my', protect, getMyLostReports);
router.get('/:id', getLostReport);
router.post('/', protect, handleUpload, createReportValidator, validate, createLostReport);
router.put('/:id', protect, updateReportValidator, validate, updateLostReport);
router.delete('/:id', protect, deleteLostReport);
router.put('/:id/status', protect, updateLostStatus);
router.post('/:id/images', protect, handleUpload, addLostImages);
router.delete('/:id/images/:imageId', protect, deleteLostImage);

module.exports = router;
