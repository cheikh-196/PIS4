const LostReport = require('../models/LostReport');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { cloudinary, hasCloudinary } = require('../config/cloudinary');

exports.getLostReports = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status || 'active';
  const query = { status };

  const reports = await LostReport.find(query)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await LostReport.countDocuments(query);

  res.status(200).json({
    success: true,
    count: reports.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    reports,
  });
});

exports.getLostReport = catchAsync(async (req, res, next) => {
  const report = await LostReport.findById(req.params.id)
    .populate('user', 'name avatar phone');

  if (!report) {
    return next(new AppError('Signalement non trouvé.', 404));
  }

  res.status(200).json({ success: true, report });
});

exports.createLostReport = catchAsync(async (req, res, next) => {
  const { title, description, category, city, coordinates, date, reward } = req.body;

  const images = (req.files || []).map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  const report = await LostReport.create({
    user: req.user.id,
    title,
    description,
    category,
    images,
    city,
    location: {
      type: 'Point',
      coordinates,
    },
    lostDate: date,
    reward: reward || 0,
  });

  res.status(201).json({ success: true, report });
});

exports.updateLostReport = catchAsync(async (req, res, next) => {
  let report = await LostReport.findById(req.params.id);

  if (!report) {
    return next(new AppError('Signalement non trouvé.', 404));
  }

  if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'êtes pas autorisé à modifier ce signalement.', 403));
  }

  const fields = {};
  if (req.body.title) fields.title = req.body.title;
  if (req.body.description) fields.description = req.body.description;
  if (req.body.category) fields.category = req.body.category;
  if (req.body.city) fields.city = req.body.city;
  if (req.body.date) fields.lostDate = req.body.date;
  if (req.body.reward !== undefined) fields.reward = req.body.reward;
  if (req.body.status) fields.status = req.body.status;
  if (req.body.coordinates) {
    fields.location = {
      type: 'Point',
      coordinates: req.body.coordinates,
    };
  }

  report = await LostReport.findByIdAndUpdate(req.params.id, fields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, report });
});

exports.deleteLostReport = catchAsync(async (req, res, next) => {
  const report = await LostReport.findById(req.params.id);

  if (!report) {
    return next(new AppError('Signalement non trouvé.', 404));
  }

  if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'êtes pas autorisé à supprimer ce signalement.', 403));
  }

  if (hasCloudinary) {
    for (const image of report.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }

  await report.deleteOne();

  res.status(200).json({ success: true, message: 'Signalement supprimé.' });
});

exports.updateLostStatus = catchAsync(async (req, res, next) => {
  const report = await LostReport.findById(req.params.id);

  if (!report) {
    return next(new AppError('Signalement non trouvé.', 404));
  }

  if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Non autorisé.', 403));
  }

  report.status = req.body.status;
  await report.save();

  res.status(200).json({ success: true, report });
});

exports.addLostImages = catchAsync(async (req, res, next) => {
  const report = await LostReport.findById(req.params.id);

  if (!report) {
    return next(new AppError('Signalement non trouvé.', 404));
  }

  if (report.user.toString() !== req.user.id) {
    return next(new AppError('Non autorisé.', 403));
  }

  const newImages = (req.files || []).map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  report.images = [...report.images, ...newImages];
  await report.save();

  res.status(200).json({ success: true, images: report.images });
});

exports.deleteLostImage = catchAsync(async (req, res, next) => {
  const report = await LostReport.findById(req.params.id);

  if (!report) {
    return next(new AppError('Signalement non trouvé.', 404));
  }

  if (report.user.toString() !== req.user.id) {
    return next(new AppError('Non autorisé.', 403));
  }

  const image = report.images.id(req.params.imageId);
  if (!image) {
    return next(new AppError('Image non trouvée.', 404));
  }

  if (hasCloudinary) {
    await cloudinary.uploader.destroy(image.publicId);
  }
  image.deleteOne();
  await report.save();

  res.status(200).json({ success: true, images: report.images });
});

exports.getMyLostReports = catchAsync(async (req, res, next) => {
  const reports = await LostReport.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reports.length, reports });
});
