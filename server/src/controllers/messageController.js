const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notificationService');

exports.getConversations = catchAsync(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$reportId',
        reportType: { $first: '$reportType' },
        lastMessage: { $first: '$$ROOT' },
        count: { $sum: 1 },
        unread: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0],
          },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  const populated = await Message.populate(conversations, {
    path: 'lastMessage.sender lastMessage.receiver',
    select: 'name avatar',
  });

  const total = await Message.distinct('reportId', {
    $or: [{ sender: userId }, { receiver: userId }],
  });

  res.status(200).json({
    success: true,
    count: populated.length,
    total: total.length,
    totalPages: Math.ceil(total.length / limit),
    currentPage: page,
    conversations: populated,
  });
});

exports.getMessages = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;

  const isParticipant = await Message.exists({
    reportId,
    $or: [{ sender: req.user.id }, { receiver: req.user.id }],
  });

  if (!isParticipant) {
    return next(new AppError('Accès non autorisé à cette conversation.', 403));
  }

  const messages = await Message.find({ reportId })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: 1 });

  res.status(200).json({ success: true, count: messages.length, messages });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;
  const { content, receiver } = req.body;

  const message = await Message.create({
    sender: req.user.id,
    receiver,
    reportId,
    reportType: req.body.reportType || 'lost',
    content,
  });

  await notificationService.sendNewMessageNotification(message, req.user);

  const populated = await Message.populate(message, {
    path: 'sender receiver',
    select: 'name avatar',
  });

  res.status(201).json({ success: true, message: populated });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new AppError('Message non trouvé.', 404));
  }

  if (message.receiver.toString() !== req.user.id) {
    return next(new AppError('Non autorisé.', 403));
  }

  message.read = true;
  await message.save();

  res.status(200).json({ success: true, message });
});

exports.markConversationAsRead = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;

  await Message.updateMany(
    { reportId, receiver: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({ success: true, message: 'Conversation marquée comme lue.' });
});

exports.updateMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new AppError('Message non trouvé.', 404));
  }

  if (message.sender.toString() !== req.user.id) {
    return next(new AppError('Non autorisé.', 403));
  }

  message.content = req.body.content;
  await message.save();

  res.status(200).json({ success: true, message });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new AppError('Message non trouvé.', 404));
  }

  if (message.sender.toString() !== req.user.id) {
    return next(new AppError('Non autorisé.', 403));
  }

  await message.deleteOne();
  res.status(200).json({ success: true, message: 'Message supprimé.' });
});
