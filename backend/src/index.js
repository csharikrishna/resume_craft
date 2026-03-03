require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('./services/firebase');

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const aiRoutes = require('./routes/ai');
const templateRoutes = require('./routes/templates');
const exportRoutes = require('./routes/export');
const paymentRoutes = require('./routes/payments');

const app = express();

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');

const configuredOrigins = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL]
  .filter(Boolean)
  .flatMap((value) => String(value).split(','))
  .map(normalizeOrigin)
  .filter(Boolean);

if (!configuredOrigins.length) {
  configuredOrigins.push('http://localhost:5173');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const requestOrigin = normalizeOrigin(origin);
    const isAllowed = configuredOrigins.includes('*') || configuredOrigins.includes(requestOrigin);
    return callback(null, isAllowed);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security and compression middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Disable CSP for API
}));
app.use(compression());

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (_, res) => {
  res.json({ 
    message: 'ResumeCraft API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health or /api/health',
      auth: '/api/auth',
      resumes: '/api/resumes',
      ai: '/api/ai',
      templates: '/api/templates',
      export: '/api/export',
      payments: '/api/payments'
    }
  });
});

// Health check routes (both with and without /api prefix)
app.get('/health', (_, res) => {
  res.json({ status: 'OK', app: 'ResumeCraft', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', app: 'ResumeCraft', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) console.error(err.stack);
  else console.error(`[ERROR] ${err.message}`);
  
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ResumeCraft running on port ${PORT}`));
module.exports = app;
