const Match = require('../models/Match');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const matchingService = require('../services/matchingService');

exports.runMatching = catchAsync(async (req, res, next) => {
  const { reportId, reportType } = req.body;

  if (!reportId || !reportType) {
    return next(new AppError('reportId et reportType sont requis.', 400));
  }

  const matches = await matchingService.findMatches(reportId, reportType);

  res.status(200).json({
    success: true,
    count: matches.length,
    matches,
  });
});

exports.getMyMatches = catchAsync(async (req, res, next) => {
  const matches = await Match.find({ notifiedUsers: req.user.id })
    .populate({
      path: 'lostReport',
      populate: { path: 'user', select: 'name avatar' },
    })
    .populate({
      path: 'foundReport',
      populate: { path: 'user', select: 'name avatar' },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: matches.length, matches });
});

exports.getMatch = catchAsync(async (req, res, next) => {
  const match = await Match.findById(req.params.id)
    .populate({
      path: 'lostReport',
      populate: { path: 'user', select: 'name avatar phone' },
    })
    .populate({
      path: 'foundReport',
      populate: { path: 'user', select: 'name avatar phone' },
    });

  if (!match) {
    return next(new AppError('Correspondance non trouvée.', 404));
  }

  res.status(200).json({ success: true, match });
});

exports.acceptMatch = catchAsync(async (req, res, next) => {
  const match = await Match.findById(req.params.id);

  if (!match) {
    return next(new AppError('Correspondance non trouvée.', 404));
  }

  if (!match.notifiedUsers.some((id) => id.equals(req.user.id))) {
    return next(new AppError('Non autorisé.', 403));
  }

  match.status = 'accepted';
  await match.save();

  res.status(200).json({ success: true, match });
});

exports.rejectMatch = catchAsync(async (req, res, next) => {
  const match = await Match.findById(req.params.id);

  if (!match) {
    return next(new AppError('Correspondance non trouvée.', 404));
  }

  if (!match.notifiedUsers.some((id) => id.equals(req.user.id))) {
    return next(new AppError('Non autorisé.', 403));
  }

  match.status = 'rejected';
  await match.save();

  res.status(200).json({ success: true, match });
});
