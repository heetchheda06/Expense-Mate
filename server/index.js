const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas or local instance
connectDB();

const app = express();

// Enable Helmet to secure headers
app.use(helmet());

// Dynamic CORS configuration supporting custom deployed frontends and localhost development
const allowedOrigins = [
  'http://localhost:8080',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or postman/rest requests without origin header
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Direct exact match
      if (allowedOrigin === origin) return true;
      // Allow matching subdomains or custom domains if configured
      return false;
    });

    if (isAllowed || origin.startsWith('http://localhost') || origin.endsWith('.vercel.app') || origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter to prevent API abuse (allowing 200 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Health check endpoint (critical for Railway/Render verification checks)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ExpenseMate API running securely.',
    environment: process.env.NODE_ENV,
    time: new Date()
  });
});

// Import Express routers
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/incomes');
const goalRoutes = require('./routes/goals');
const aiRoutes = require('./routes/ai');
const tripRoutes = require('./routes/trips');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);

// Mount nested sub-routers with parameter inheritance
app.use('/api/profiles/:id/expenses', expenseRoutes);
app.use('/api/profiles/:id/incomes', incomeRoutes);
app.use('/api/profiles/:id/goals', goalRoutes);
app.use('/api/profiles/:id/ai-recommendations', aiRoutes);
app.use('/api/trips', tripRoutes);

// Fallback Route for non-existent endpoints
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Requested resource not found' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`[Server Error]: ${err.message}`);
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
