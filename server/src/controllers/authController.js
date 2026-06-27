const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { generateToken } = require('../utils/helpers');
const { cloudinary, hasCloudinary } = require('../config/cloudinary');
const env = require('../config/env');

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);
  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Un compte avec cet email existe déjà.', 400));
  }

  const user = await User.create({ name, email, password, phone });
  sendTokenResponse(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Email ou mot de passe incorrect.', 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Email ou mot de passe incorrect.', 401));
  }

  sendTokenResponse(user, 200, res);
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

exports.updateDetails = catchAsync(async (req, res, next) => {
  const fields = {};
  if (req.body.name) fields.name = req.body.name;
  if (req.body.phone !== undefined) fields.phone = req.body.phone;

  const user = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.comparePassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new AppError('Le mot de passe actuel est incorrect.', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.updateAvatar = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('Veuillez fournir une image.', 400));
  }

  const user = await User.findById(req.user.id);

  if (user.avatar && hasCloudinary) {
    const publicId = user.avatar.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`findit/avatars/${publicId}`);
  }

  user.avatar = req.files[0].path;
  await user.save();

  res.status(200).json({ success: true, user });
});

exports.updatePushToken = catchAsync(async (req, res, next) => {
  const { expoPushToken } = req.body;
  await User.findByIdAndUpdate(req.user.id, { expoPushToken });
  res.status(200).json({ success: true, message: 'Push token mis à jour' });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 3600000;
  await user.save({ validateBeforeSave: false });

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
      to: user.email,
      subject: 'Réinitialisation de mot de passe - FindIt',
      html: `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
             <p>Cliquez sur le lien ci-dessous :</p>
             <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#007AFF;color:#fff;text-decoration:none;border-radius:6px;">Réinitialiser mon mot de passe</a>
             <p>Ce lien expire dans 1 heure.</p>`,
    });

    res.status(200).json({ success: true, message: 'Email envoyé.' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Erreur lors de l\'envoi de l\'email.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token invalide ou expiré.', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
