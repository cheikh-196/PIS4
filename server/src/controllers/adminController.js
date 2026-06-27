const User = require('../models/User');
const LostReport = require('../models/LostReport');
const FoundReport = require('../models/FoundReport');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: new RegExp(escapedSearch, 'i') },
      { email: new RegExp(escapedSearch, 'i') },
    ];
  }
  if (role) query.role = role;

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / limit),
    users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Utilisateur non trouvé.', 404));
  }

  const lostCount = await LostReport.countDocuments({ user: user._id });
  const foundCount = await FoundReport.countDocuments({ user: user._id });

  res.status(200).json({
    success: true,
    user,
    stats: { lostCount, foundCount },
  });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return next(new AppError('Rôle invalide. Utilisez "user" ou "admin".', 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

  if (!user) {
    return next(new AppError('Utilisateur non trouvé.', 404));
  }

  res.status(200).json({ success: true, user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Utilisateur non trouvé.', 404));
  }

  const lostReports = await LostReport.find({ user: user._id }, '_id');
  const foundReports = await FoundReport.find({ user: user._id }, '_id');
  const lostReportIds = lostReports.map(r => r._id);
  const foundReportIds = foundReports.map(r => r._id);

  await Match.deleteMany({
    $or: [
      { lostReport: { $in: lostReportIds } },
      { foundReport: { $in: foundReportIds } }
    ]
  });

  await Message.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] });
  await Notification.deleteMany({ user: user._id });

  await LostReport.deleteMany({ user: user._id });
  await FoundReport.deleteMany({ user: user._id });
  await user.deleteOne();

  res.status(200).json({ success: true, message: 'Utilisateur supprimé.' });
});

exports.getReports = catchAsync(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const { type, status } = req.query;

  const buildQuery = (extra = {}) => {
    const q = { ...extra };
    if (status) q.status = status;
    return q;
  };

  let lostReports = [];
  let foundReports = [];
  let total = 0;

  if (!type || type === 'lost') {
    const lostQ = buildQuery();
    lostReports = await LostReport.find(lostQ)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    total = await LostReport.countDocuments(lostQ);
  }

  if (!type || type === 'found') {
    const foundQ = buildQuery();
    foundReports = await FoundReport.find(foundQ)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    if (!type) {
      total += await FoundReport.countDocuments(foundQ);
    } else {
      total = await FoundReport.countDocuments(foundQ);
    }
  }

  res.status(200).json({
    success: true,
    count: lostReports.length + foundReports.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    lost: lostReports,
    found: foundReports,
  });
});

exports.deleteReport = catchAsync(async (req, res, next) => {
  const { id, type } = req.params;
  let report;

  if (type === 'lost') {
    report = await LostReport.findById(id);
  } else if (type === 'found') {
    report = await FoundReport.findById(id);
  } else {
    return next(new AppError('Type invalide. Utilisez "lost" ou "found".', 400));
  }

  if (!report) {
    return next(new AppError('Signalement non trouvé.', 404));
  }

  if (report.images) {
    const { cloudinary } = require('../config/cloudinary');
    for (const image of report.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }

  await report.deleteOne();
  res.status(200).json({ success: true, message: 'Signalement supprimé.' });
});

exports.getStats = catchAsync(async (req, res, next) => {
  const [totalUsers, totalLost, totalFound, totalMatches] = await Promise.all([
    User.countDocuments(),
    LostReport.countDocuments(),
    FoundReport.countDocuments(),
    Match.countDocuments(),
  ]);

  const [activeLost, activeFound, resolvedLost, returnedFound] = await Promise.all([
    LostReport.countDocuments({ status: 'active' }),
    FoundReport.countDocuments({ status: 'active' }),
    LostReport.countDocuments({ status: 'resolved' }),
    FoundReport.countDocuments({ status: 'returned' }),
  ]);

  const lostByCategory = await LostReport.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const foundByCategory = await FoundReport.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const lostByCity = await LostReport.aggregate([
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const foundByCity = await FoundReport.aggregate([
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayLost, todayFound, todayUsers] = await Promise.all([
    LostReport.countDocuments({ createdAt: { $gte: today } }),
    FoundReport.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: today } }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      total: { users: totalUsers, lost: totalLost, found: totalFound, matches: totalMatches },
      active: { lost: activeLost, found: activeFound },
      resolved: { lost: resolvedLost, found: returnedFound },
      today: { lost: todayLost, found: todayFound, users: todayUsers },
      byCategory: { lost: lostByCategory, found: foundByCategory },
      byCity: { lost: lostByCity, found: foundByCity },
    },
  });
});

exports.getDailyStats = catchAsync(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [lostDaily, foundDaily, userDaily] = await Promise.all([
    LostReport.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    FoundReport.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: { daily: { lost: lostDaily, found: foundDaily, users: userDaily } },
  });
});
