const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./auth'); // Import the auth routes

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000; // Listen on port 3000

// Use the auth routes
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
