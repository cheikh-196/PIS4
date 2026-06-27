const LostReport = require('../models/LostReport');
const FoundReport = require('../models/FoundReport');
const catchAsync = require('../utils/catchAsync');

exports.getMapReports = catchAsync(async (req, res, next) => {
  const { lat, lng, radius = 10, type, limit = 100 } = req.query;

  let lostResults = [];
  let foundResults = [];

  const geoQuery = lat && lng
    ? {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      }
    : {};

  if (!type || type === 'lost') {
    lostResults = await LostReport.find(
      lat && lng ? { location: geoQuery, status: 'active' } : { status: 'active' }
    )
      .select('title category location city lostDate images status')
      .populate('user', 'name avatar')
      .limit(parseInt(limit));
  }

  if (!type || type === 'found') {
    foundResults = await FoundReport.find(
      lat && lng ? { location: geoQuery, status: 'active' } : { status: 'active' }
    )
      .select('title category location city foundDate images status')
      .populate('user', 'name avatar')
      .limit(parseInt(limit));
  }

  res.status(200).json({
    success: true,
    reports: {
      lost: lostResults.map((r) => ({
        id: r._id,
        type: 'lost',
        title: r.title,
        category: r.category,
        coordinates: r.location.coordinates,
        city: r.city,
        date: r.lostDate,
        image: r.images[0]?.url || null,
        status: r.status,
        user: r.user,
      })),
      found: foundResults.map((r) => ({
        id: r._id,
        type: 'found',
        title: r.title,
        category: r.category,
        coordinates: r.location.coordinates,
        city: r.city,
        date: r.foundDate,
        image: r.images[0]?.url || null,
        status: r.status,
        user: r.user,
      })),
    },
  });
});

exports.getNearbyReports = catchAsync(async (req, res, next) => {
  const { lat = 48.8566, lng = 2.3522, radius = 5 } = req.query;

  const geoQuery = {
    $near: {
      $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      $maxDistance: parseFloat(radius) * 1000,
    },
  };

  const [lostNearby, foundNearby] = await Promise.all([
    LostReport.find({ location: geoQuery, status: 'active' })
      .select('title category location city lostDate images')
      .populate('user', 'name avatar')
      .limit(20),
    FoundReport.find({ location: geoQuery, status: 'active' })
      .select('title category location city foundDate images')
      .populate('user', 'name avatar')
      .limit(20),
  ]);

  res.status(200).json({
    success: true,
    nearby: {
      lost: lostNearby,
      found: foundNearby,
    },
  });
});
