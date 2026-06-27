const { body } = require('express-validator');
const { CATEGORIES } = require('../utils/constants');

const parseCoords = (v) => {
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return []; }
  }
  return v;
};

const createReportValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 10, max: 2000 }).withMessage('La description doit contenir entre 10 et 2000 caractères'),
  body('category')
    .notEmpty().withMessage('La catégorie est requise')
    .isIn(CATEGORIES).withMessage(`Catégorie invalide. Valeurs: ${CATEGORIES.join(', ')}`),
  body('city')
    .trim()
    .notEmpty().withMessage('La ville est requise'),
  body('coordinates')
    .customSanitizer(parseCoords)
    .isArray({ min: 2, max: 2 }).withMessage('Les coordonnées doivent être un tableau [lng, lat]')
    .custom((arr) => arr.every((n) => typeof n === 'number'))
    .withMessage('Les coordonnées doivent être des nombres'),
  body('date')
    .notEmpty().withMessage('La date est requise')
    .isISO8601().withMessage('Format de date invalide (ISO8601 requis)'),
];

const updateReportValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('La description doit contenir entre 10 et 2000 caractères'),
  body('category')
    .optional()
    .isIn(CATEGORIES).withMessage(`Catégorie invalide. Valeurs: ${CATEGORIES.join(', ')}`),
  body('city')
    .optional()
    .trim(),
  body('coordinates')
    .optional()
    .customSanitizer(parseCoords)
    .isArray({ min: 2, max: 2 }).withMessage('Les coordonnées doivent être un tableau [lng, lat]')
    .custom((arr) => arr.every((n) => typeof n === 'number'))
    .withMessage('Les coordonnées doivent être des nombres'),
  body('date')
    .optional()
    .isISO8601().withMessage('Format de date invalide (ISO8601 requis)'),
];

module.exports = { createReportValidator, updateReportValidator };
