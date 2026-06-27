const { body } = require('express-validator');

const mauritanianPhone = /^(\+222|00222)[\s]?\d{2}[\s]?\d{2}[\s]?\d{2}[\s]?\d{2}$/;

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(mauritanianPhone).withMessage('Numéro mauritanien requis (+222 XX XX XX XX)'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis'),
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
];

const resetPasswordValidator = [
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('phone')
    .optional()
    .trim()
    .matches(mauritanianPhone).withMessage('Numéro mauritanien requis (+222 XX XX XX XX)'),
];

const updatePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .notEmpty().withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères'),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  updatePasswordValidator,
};
