const express = require('express');
const router = express.Router();
const {
  getUsers, getUser, updateUserRole, deleteUser,
  getReports, deleteReport, getStats, getDailyStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/reports', getReports);
router.delete('/reports/:type/:id', deleteReport);

router.get('/stats', getStats);
router.get('/stats/daily', getDailyStats);

module.exports = router;
