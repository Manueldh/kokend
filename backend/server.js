require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://kokend.vercel.app',
      'https://kokend-git-live-manueldhs-projects.vercel.app',
      'https://kokend-git-live-manueldh.vercel.app'
    ];
    
    // Allow all Vercel preview URLs
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Valideer OpenAI configuratie bij opstarten
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.warn('⚠️  WAARSCHUWING: OpenAI API key niet correct geconfigureerd in .env file');
  console.warn('   AI recepten zullen fallback functionaliteit gebruiken');
} else {
  console.log('✅ OpenAI API key geconfigureerd');
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Verbonden met MongoDB'))
.catch(err => console.error('❌ MongoDB connectie fout:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Kokend API is actief! 👨‍🍳' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/kitchen', require('./routes/kitchen'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/achievements', require('./routes/achievements'));

app.listen(PORT, () => {
  console.log(`🚀 Server draait op poort ${PORT}`);
});