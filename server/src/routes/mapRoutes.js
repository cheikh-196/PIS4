const express = require('express');
const router = express.Router();
const { getMapReports, getNearbyReports } = require('../controllers/mapController');

router.get('/reports', getMapReports);
router.get('/reports/nearby', getNearbyReports);

module.exports = router;
