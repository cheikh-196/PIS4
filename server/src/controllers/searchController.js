const LostReport = require('../models/LostReport');
const FoundReport = require('../models/FoundReport');
const catchAsync = require('../utils/catchAsync');

exports.search = catchAsync(async (req, res, next) => {
  const {
    q, category, city, lat, lng, radius,
    startDate, endDate, status = 'active',
    page = 1, limit = 20, sort = '-createdAt',
  } = req.query;

  const buildQuery = (type) => {
    const query = { status };
    const dateField = type === 'lost' ? 'lostDate' : 'foundDate';

    if (q) {
      query.$text = { $search: q };
    }
    if (category) {
      query.category = category;
    }
    if (city) {
      const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.city = new RegExp(escapedCity, 'i');
    }
    if (lat && lng && radius) {
      if (q) {
        query.location = {
          $geoWithin: {
            $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius) / 6378.1],
          },
        };
      } else {
        query.location = {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseFloat(radius) * 1000,
          },
        };
      }
    }
    if (startDate || endDate) {
      query[dateField] = {};
      if (startDate) query[dateField].$gte = new Date(startDate);
      if (endDate) query[dateField].$lte = new Date(endDate);
    }

    return query;
  };

  const sortOrder = sort.startsWith('-')
    ? { [sort.slice(1)]: -1 }
    : { [sort]: 1 };

  const [lostResults, foundResults] = await Promise.all([
    LostReport.find(buildQuery('lost'))
      .populate('user', 'name avatar')
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    FoundReport.find(buildQuery('found'))
      .populate('user', 'name avatar')
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
  ]);

  res.status(200).json({
    success: true,
    results: {
      lost: lostResults,
      found: foundResults,
      total: lostResults.length + foundResults.length,
    },
  });
});

exports.searchLost = catchAsync(async (req, res, next) => {
  const { q, category, city, lat, lng, radius, startDate, endDate, status = 'active', page = 1, limit = 20 } = req.query;
  const query = { status };

  if (q) query.$text = { $search: q };
  if (category) query.category = category;
  if (city) {
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.city = new RegExp(escapedCity, 'i');
  }
  if (lat && lng && radius) {
    if (q) {
      query.location = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius) / 6378.1],
        },
      };
    } else {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      };
    }
  }
  if (startDate || endDate) {
    query.lostDate = {};
    if (startDate) query.lostDate.$gte = new Date(startDate);
    if (endDate) query.lostDate.$lte = new Date(endDate);
  }

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
    reports,
  });
});

exports.searchFound = catchAsync(async (req, res, next) => {
  const { q, category, city, lat, lng, radius, startDate, endDate, status = 'active', page = 1, limit = 20 } = req.query;
  const query = { status };

  if (q) query.$text = { $search: q };
  if (category) query.category = category;
  if (city) {
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.city = new RegExp(escapedCity, 'i');
  }
  if (lat && lng && radius) {
    if (q) {
      query.location = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius) / 6378.1],
        },
      };
    } else {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      };
    }
  }
  if (startDate || endDate) {
    query.foundDate = {};
    if (startDate) query.foundDate.$gte = new Date(startDate);
    if (endDate) query.foundDate.$lte = new Date(endDate);
  }

  const reports = await FoundReport.find(query)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await FoundReport.countDocuments(query);

  res.status(200).json({
    success: true,
    count: reports.length,
    total,
    totalPages: Math.ceil(total / limit),
    reports,
  });
});
