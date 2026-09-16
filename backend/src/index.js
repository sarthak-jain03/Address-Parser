require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const addressRoutes = require('./routes/addresses');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/addresses', addressRoutes);

app.get('/api/health', function (req, res) {
  res.json({ status: 'ok' });
});

async function start() {
  await connectDB();
  app.listen(PORT, function () {
    console.log('Server running on http://localhost:' + PORT);
  });
}

start();
