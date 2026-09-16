require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB ulandi');
    app.listen(PORT, () => {
      console.log(`Server ishlayapti: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB xatosi:', err.message);
    process.exit(1);
  });
