const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use('/auth', authRoutes);
app.use('/api/sales', salesRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});