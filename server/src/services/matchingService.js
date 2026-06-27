const LostReport = require('../models/LostReport');
const FoundReport = require('../models/FoundReport');
const Match = require('../models/Match');
const notificationService = require('./notificationService');

const SCORE_CATEGORY = 35;
const SCORE_CITY = 20;
const SCORE_PROXIMITY = 25;
const SCORE_KEYWORDS = 12;
const SCORE_DATE = 8;

const extractKeywords = (text) => {
  const stopWords = ['le', 'la', 'les', 'des', 'un', 'une', 'de', 'du', 'et', 'est', 'a', 'dans', 'sur', 'pour', 'avec', 'pas', 'que', 'qui', 'mon', 'ton', 'son', 'trouve', 'trouvee', 'perdu', 'perdue', 'bonjour', 'svp', 'merci'];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.includes(w));
};

const calculateScore = (lost, found) => {
  let score = 0;

  if (lost.category === found.category) {
    score += SCORE_CATEGORY;
  }

  if (lost.city.toLowerCase() === found.city.toLowerCase()) {
    score += SCORE_CITY;
  }

  const MAX_DISTANCE_KM = 5;
  if (lost.location?.coordinates && found.location?.coordinates) {
    const [lng1, lat1] = lost.location.coordinates;
    const [lng2, lat2] = found.location.coordinates;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance <= MAX_DISTANCE_KM) {
      score += SCORE_PROXIMITY;
    }
  }

  const lostKeywords = extractKeywords(`${lost.title} ${lost.description}`);
  const foundKeywords = extractKeywords(`${found.title} ${found.description}`);
  const common = lostKeywords.filter((k) => foundKeywords.includes(k));

  if (common.length >= 2) {
    score += SCORE_KEYWORDS;
  }

  const daysDiff = Math.abs(new Date(lost.lostDate) - new Date(found.foundDate)) / (1000 * 60 * 60 * 24);
  if (daysDiff <= 7) {
    score += SCORE_DATE;
  }



  return Math.max(0, Math.min(100, score));
};

exports.findMatches = async (reportId, reportType) => {
  const THRESHOLD = 60;
  const matches = [];

  if (reportType === 'lost') {
    const lostReport = await LostReport.findById(reportId);
    if (!lostReport) return [];

    const foundReports = await FoundReport.find({
      status: 'active',
      category: lostReport.category,
    });

    for (const found of foundReports) {
      const score = calculateScore(lostReport, found);
      if (score >= THRESHOLD) {
        const existing = await Match.findOne({
          lostReport: lostReport._id,
          foundReport: found._id,
        });

        if (!existing) {
          const match = await Match.create({
            lostReport: lostReport._id,
            foundReport: found._id,
            score,
            notifiedUsers: [lostReport.user, found.user],
          });

          await notificationService.sendMatchNotification(match, lostReport, found);
          matches.push(match);
        } else {
          matches.push(existing);
        }
      }
    }
  } else {
    const foundReport = await FoundReport.findById(reportId);
    if (!foundReport) return [];

    const lostReports = await LostReport.find({
      status: 'active',
      category: foundReport.category,
    });

    for (const lost of lostReports) {
      const score = calculateScore(lost, foundReport);
      if (score >= THRESHOLD) {
        const existing = await Match.findOne({
          lostReport: lost._id,
          foundReport: foundReport._id,
        });

        if (!existing) {
          const match = await Match.create({
            lostReport: lost._id,
            foundReport: foundReport._id,
            score,
            notifiedUsers: [lost.user, foundReport.user],
          });

          await notificationService.sendMatchNotification(match, lost, foundReport);
          matches.push(match);
        } else {
          matches.push(existing);
        }
      }
    }
  }

  return matches;
};
