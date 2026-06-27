const express = require('express');
const router = express.Router();
const { search, searchLost, searchFound } = require('../controllers/searchController');

router.get('/', search);
router.get('/lost', searchLost);
router.get('/found', searchFound);

module.exports = router;
