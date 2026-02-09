# K-Series Integration

A Node.js/Express application for testing K-series integration with financial data management and sales tracking capabilities.

## Overview

This project provides a backend API server and frontend interface for managing sales data, integrating with financial systems, and handling user authentication through OAuth. The application uses SQLite for data persistence and Webpack for frontend bundling.

## Features

- **Express Server**: RESTful API running on port 3000
- **Sales Management**: Fetch and manage sales data with account references and transaction details
- **Authentication**: OAuth2 integration for secure user access
- **Financial Data Integration**: Integration with financial data sources
- **SQLite Database**: Persistent data storage
- **Webpack Bundling**: Bundled frontend assets for production deployment
- **Static File Serving**: Serve static HTML, CSS, and JavaScript files

## Project Structure

```
k-integration/
├── src/                    # Frontend application code
│   └── app.js             # Main frontend application with sales data display
├── routes/                # Backend API routes
│   └── sales.js           # Sales endpoints
├── public/                # Static files served to clients
│   ├── index.html         # Main HTML page
│   ├── style.css          # Stylesheets
│   └── bundle.js          # Bundled frontend code
├── server.js              # Express server entry point
├── auth.js                # Authentication configuration
├── db.js                  # Database configuration
├── fetchFinancialData.js  # Financial data fetching logic
├── webpack.config.js      # Webpack build configuration
└── package.json           # Project dependencies
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd k-integration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
DATABASE_URL=./database.db
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
```

## Usage

1. Start the development server:
   ```bash
   node server.js
   ```
   The server will be available at `http://localhost:3000`

2. Build frontend assets with Webpack:
   ```bash
   npm run build
   ```

## API Endpoints

- `GET /api/sales` - Retrieve sales data
  - Returns an array of sales records with fields:
    - `id`: Sale identifier
    - `accountReference`: Account reference number
    - `timeOfSale`: Timestamp of the transaction
    - `totalNetAmountWithTax`: Sale amount including tax

## Technologies

- **Backend**: Express.js, Node.js
- **Database**: SQLite3
- **Authentication**: OAuth2 (simple-oauth2)
- **HTTP Client**: Axios
- **Frontend Bundler**: Webpack
- **Environment Management**: dotenv

## Dependencies

- `express` - Web framework
- `sqlite3` - Database driver
- `axios` - HTTP client
- `simple-oauth2` - OAuth2 implementation
- `body-parser` - Request parsing middleware
- `dotenv` - Environment variable management

## License

ISC
