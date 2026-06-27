const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
};

const extractPublicId = (url) => {
  const parts = url.split('/');
  const file = parts[parts.length - 1];
  return 'findit/' + file.split('.')[0];
};

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

module.exports = { generateToken, extractPublicId, sanitizeUser };
