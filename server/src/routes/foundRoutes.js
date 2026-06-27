const express = require('express');
const router = express.Router();
const {
  getFoundReports, getFoundReport, createFoundReport, updateFoundReport,
  deleteFoundReport, updateFoundStatus, addFoundImages, deleteFoundImage, getMyFoundReports,
} = require('../controllers/foundController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const handleUpload = require('../middleware/upload');
const { createReportValidator, updateReportValidator } = require('../validators/reportValidator');

router.get('/', getFoundReports);
router.get('/my', protect, getMyFoundReports);
router.get('/:id', getFoundReport);
router.post('/', protect, handleUpload, createReportValidator, validate, createFoundReport);
router.put('/:id', protect, updateReportValidator, validate, updateFoundReport);
router.delete('/:id', protect, deleteFoundReport);
router.put('/:id/status', protect, updateFoundStatus);
router.post('/:id/images', protect, handleUpload, addFoundImages);
router.delete('/:id/images/:imageId', protect, deleteFoundImage);

module.exports = router;
