require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
app.use('/api/kitchen', require('./routes/kitchen'));
app.use('/api/recipes', require('./routes/recipes'));

app.listen(PORT, () => {
  console.log(`🚀 Server draait op poort ${PORT}`);
});