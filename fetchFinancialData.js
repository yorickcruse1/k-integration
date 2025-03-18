const axios = require('axios');
const { insertSalesData, getPersistedAccessTokenJSON } = require('./db');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const BASE_URL = process.env.BASE_URL;
const BL_ID = process.env.BL_ID;
const DATE = '2025-03-18'; // The date for which you want to retrieve sales data

async function fetchAndStoreFinancialData() {
  try {
    // Retrieve the persisted access token
    const tokenData = await getPersistedAccessTokenJSON();
    const accessToken = tokenData.access_token;

    // Make the GET request to the financial API
    const response = await axios.get(`${BASE_URL}/f/v2/business-location/${BL_ID}/sales-daily`, {
      params: {
        date: DATE
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const salesData = response.data.sales;

    // Insert the sales data into the database
    await insertSalesData(salesData);

    console.log('Financial data successfully fetched and stored.');
  } catch (error) {
    console.error('Error fetching or storing financial data:', error);
  }
}

fetchAndStoreFinancialData();
