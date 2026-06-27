const User = require('../models/User');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !Expo.isExpoPushToken(pushToken)) return;

  try {
    await expo.sendPushNotificationsAsync([
      { to: pushToken, title, body, data, sound: 'default' },
    ]);
  } catch (error) {
    console.error('Push notification error:', error.message);
  }
};

exports.sendMatchNotification = async (match, lostReport, foundReport) => {
  const lostUser = await User.findById(lostReport.user);
  const foundUser = await User.findById(foundReport.user);

  if (lostUser && foundUser) {
    const title = 'Correspondance trouvée !';
    const bodyLost = `Un objet similaire à "${lostReport.title}" a été trouvé par ${foundUser.name}.`;

    await Notification.create({
      user: lostUser._id,
      title,
      body: bodyLost,
      type: 'match_found',
      data: { matchId: match._id, reportId: foundReport._id, reportType: 'found' },
    });

    await sendPushNotification(lostUser.expoPushToken, title, bodyLost, { matchId: match._id.toString(), reportId: foundReport._id.toString(), reportType: 'found' });
  }

  if (foundUser && lostUser) {
    const title = 'Correspondance trouvée !';
    const bodyFound = `Un objet similaire à "${foundReport.title}" a été perdu par ${lostUser.name}.`;

    await Notification.create({
      user: foundUser._id,
      title,
      body: bodyFound,
      type: 'match_found',
      data: { matchId: match._id, reportId: lostReport._id, reportType: 'lost' },
    });

    await sendPushNotification(foundUser.expoPushToken, title, bodyFound, { matchId: match._id.toString(), reportId: lostReport._id.toString(), reportType: 'lost' });
  }
};

exports.sendNewMessageNotification = async (message, sender) => {
  const messageData = await Message.findById(message._id).populate('sender', 'name');
  if (!messageData) return;

  const receiver = await User.findById(message.receiver);

  if (receiver) {
    const title = `Nouveau message de ${messageData.sender.name}`;
    const body = message.content.substring(0, 100);

    await Notification.create({
      user: receiver._id,
      title,
      body,
      type: 'new_message',
      data: { messageId: message._id, reportId: message.reportId, senderId: sender._id },
    });

    await sendPushNotification(receiver.expoPushToken, title, body, {
      messageId: message._id.toString(),
      reportId: message.reportId.toString(),
    });
  }
};

exports.sendAdminAlert = async (title, body, data = {}) => {
  const admins = await User.find({ role: 'admin' });

  for (const admin of admins) {
    await Notification.create({
      user: admin._id,
      title,
      body,
      type: 'admin_alert',
      data,
    });

    await sendPushNotification(admin.expoPushToken, title, body, data);
  }
};
