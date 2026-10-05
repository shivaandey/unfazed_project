const configuredOrigins = process.env.CLIENT_ORIGINS?.trim();
const allowedOrigins = (configuredOrigins || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOrigin = (origin, callback) => {
  const localDevelopmentOrigin = !configuredOrigins
    && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
  if (!origin || allowedOrigins.includes(origin) || localDevelopmentOrigin) {
    return callback(null, true);
  }
  return callback(new Error('Origin is not allowed by CORS'));
};

module.exports = { allowedOrigins, corsOrigin };
