const { body, param } = require('express-validator');

const sendMessageValidator = [
  param('reportId')
    .notEmpty().withMessage('L\'ID du signalement est requis')
    .isMongoId().withMessage('ID de signalement invalide'),
  body('content')
    .trim()
    .notEmpty().withMessage('Le message ne peut pas être vide')
    .isLength({ max: 2000 }).withMessage('Le message ne peut pas dépasser 2000 caractères'),
  body('receiver')
    .notEmpty().withMessage('Le destinataire est requis')
    .isMongoId().withMessage('ID du destinataire invalide'),
];

module.exports = { sendMessageValidator };
