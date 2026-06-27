const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

const start = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`API Documentation: http://localhost:${env.PORT}/api-docs`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
