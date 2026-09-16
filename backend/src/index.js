require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const addressRoutes = require('./routes/addresses');

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173']
    : '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/addresses', addressRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
