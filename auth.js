const express = require('express');
const { AuthorizationCode } = require('simple-oauth2');
const { persistAccessTokenJSON, getPersistedAccessTokenJSON } = require('./db');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const router = express.Router();

const config = {
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET
  },
  auth: {
    tokenHost: process.env.TOKEN_HOST
  }
};

// Check if required environment variables are set
if (!config.client.id || !config.client.secret || !config.auth.tokenHost) {
  console.error('Missing required environment variables.');
  process.exit(1); // Exit the process with an error code
}

const client = new AuthorizationCode(config);

router.get('/', (req, res) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.SCOPE,
    state: '<state>'
  });
  console.log('Redirecting to:', authorizationUri);
  res.redirect(authorizationUri);
});

router.get('/callback', async (req, res) => {
  console.log('Query parameters:', req.query);

  if (!req.query.code) {
    console.error('No authorization code present in the query parameters');
    return res.status(400).send('Bad Request: No authorization code present');
  }

  const tokenParams = {
    code: req.query.code,
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.SCOPE,
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    console.log('Access Token retrieved:', accessToken);

    await persistAccessTokenJSON(JSON.stringify(accessToken));
    console.log('Access Token persisted');

    res.send('Authentication successful!');
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;
