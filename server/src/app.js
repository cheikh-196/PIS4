const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const env = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const lostRoutes = require('./routes/lostRoutes');
const foundRoutes = require('./routes/foundRoutes');
const searchRoutes = require('./routes/searchRoutes');
const matchRoutes = require('./routes/matchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mapRoutes = require('./routes/mapRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FindIt API Documentation',
}));

app.use('/api/auth', authRoutes);
app.use('/api/lost', lostRoutes);
app.use('/api/found', foundRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/map', mapRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'FindIt API',
    version: '1.0.0',
    description: 'Smart Lost & Found Platform',
    docs: '/api-docs',
  });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} introuvable`, 404));
});

app.use(errorHandler);

module.exports = app;
