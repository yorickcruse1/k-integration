const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'k-integration-db.db');
const db = new sqlite3.Database(dbPath);

console.log('Database path:', dbPath);

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY,
    access_token TEXT,
    token_type TEXT,
    refresh_token TEXT,
    expires_in INTEGER,
    scope TEXT,
    expires_at TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating tokens table:', err);
    } else {
      console.log('Tokens table created successfully.');
    }
  });

  // Create sales table
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY,
    accountReference TEXT,
    accountFiscId TEXT,
    receiptId TEXT,
    initialAccountId TEXT,
    timeOfOpening TEXT,
    timeClosed TEXT,
    tableName TEXT,
    accountProfileCode TEXT,
    ownerName TEXT,
    ownerId INTEGER,
    type TEXT,
    nbCovers REAL,
    dineIn BOOLEAN,
    deviceId INTEGER,
    deviceName TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating sales table:', err);
    } else {
      console.log('Sales table created successfully.');
    }
  });

  // Create sales_lines table
  db.run(`CREATE TABLE IF NOT EXISTS salesLines (
    id INTEGER PRIMARY KEY,
    saleId INTEGER,
    lineId TEXT,
    totalNetAmountWithTax REAL,
    totalNetAmountWithoutTax REAL,
    menuListPrice REAL,
    unitCostPrice REAL,      
    serviceCharge REAL,
    discountAmount REAL,
    taxRatePercentage REAL,
    accountDiscountAmount REAL,
    totalDiscountAmount REAL,
    quantity REAL,
    accountingGroupId INTEGER,
    accountingGroupName TEXT,
    accountingGroupCode TEXT,
    currency TEXT,
    revenueCenter TEXT,
    revenueCenterId INTEGER,
    timeOfSale TEXT,
    staffId INTEGER,
    staffName TEXT,
    deviceId INTEGER,
    deviceName TEXT,
    accountProfileCode TEXT,
    FOREIGN KEY (saleId) REFERENCES sales (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating sales lines table:', err);
    } else {
      console.log('Sales lines table created successfully.');
    }
  });

  // Create payments table
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY,
    saleId INTEGER,
    code TEXT,
    description TEXT,
    paymentMethodId INTEGER,
    netAmountWithTax REAL,
    currency TEXT,
    tip REAL,
    type TEXT,
    deviceId TEXT,
    deviceName TEXT,
    staffId INTEGER,
    staffName TEXT,
    revenueCenter TEXT,
    revenueCenterId INTEGER,
    fiscId TEXT,
    uuid TEXT,
    fiscDate TEXT,
    surcharge REAL,
    FOREIGN KEY (saleId) REFERENCES sales (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating payments table:', err);
    } else {
      console.log('Payments table created successfully.');
    }
  });

  // Create logs table
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY,
    timestamp TEXT,
    level TEXT,
    message TEXT,
    details TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating logs table:', err);
    } else {
      console.log('Logs table created successfully.');
    }
  });
});

function persistAccessTokenJSON(accessTokenJSON) {
  const tokenData = JSON.parse(accessTokenJSON);
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO tokens (access_token, token_type, refresh_token, expires_in, scope, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      tokenData.access_token,
      tokenData.token_type,
      tokenData.refresh_token,
      tokenData.expires_in,
      tokenData.scope,
      tokenData.expires_at,
      function(err) {
        if (err) {
          console.error('Error persisting access token:', err);
          reject(err);
        } else {
          console.log('Access Token successfully persisted to database');
          resolve();
        }
      }
    );
    stmt.finalize();
  });
}

function getPersistedAccessTokenJSON() {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM tokens ORDER BY id DESC LIMIT 1", (err, row) => {
      if (err) {
        console.error('Error retrieving access token:', err);
        reject(err);
      } else if (row) {
        console.log('Access Token successfully retrieved from database:', row);
        resolve(row);
      } else {
        console.log('No token found in the database.');
        reject(new Error('No token found'));
      }
    });
  });
}

function logToDb(level, message, details = null) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO logs (timestamp, level, message, details)
      VALUES (datetime('now'), ?, ?, ?)
    `);
    
    stmt.run(level, message, JSON.stringify(details), function(err) {
      if (err) {
        console.error('Error logging to database:', err);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
    
    stmt.finalize();
  });
}

function insertSalesData(salesData) {
  return new Promise((resolve, reject) => {
    // Validate input data
    if (!salesData || !Array.isArray(salesData)) {
      reject(new Error('Invalid sales data format'));
      return;
    }

    db.serialize(() => {
      const salesStmt = db.prepare(`
        INSERT INTO sales (
          accountReference,
          accountFiscId,
          receiptId,
          initialAccountId,
          timeOfOpening,
          timeClosed,
          tableName,
          accountProfileCode,
          ownerName,
          ownerId,
          type,
          nbCovers,
          dineIn,
          deviceId,
          deviceName
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      const linesStmt = db.prepare(`
        INSERT INTO salesLines (
          saleId,
          lineId,
          totalNetAmountWithTax,
          totalNetAmountWithoutTax,
          menuListPrice,
          unitCostPrice,
          serviceCharge,
          discountAmount,
          taxRatePeracentage,
          accountDiscountAmount,
          totalDiscountAmount,
          sku,
          name,
          quantity,
          accountingGroupId,
          accountingGroupName,
          accountingGroupCode,
          currency,
          revenueCenter,
          revenueCenterId,
          timeOfSale,
          staffId,
          staffName,
          deviceId,
          deviceName,
          accountProfileCode
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `);

      const paymentsStmt = db.prepare(`
        INSERT INTO payments (
          saleId,
          code,
          description,
          paymentMethodId,
          netAmountWithTax,
          currency,
          tip,
          type,
          deviceId,
          deviceName,
          staffId,
          staffName,
          revenueCenter,
          revenueCenterId,
          fiscId,
          uuid,
          fiscDate,
          surcharge
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      try {
        // Handle both array and object formats
        const salesToProcess = Array.isArray(salesData) ? salesData : salesData.sales;

        if (!Array.isArray(salesToProcess)) {
          throw new Error('Sales data must be an array or contain a sales array');
        }

        salesToProcess.forEach((sale) => {
          logToDb('INFO', `Processing sale: ${sale.accountReference}`);
          
          salesStmt.run(
            sale.accountReference,
            sale.accountFiscId,
            sale.receiptId,
            sale.source?.initialAccountId || '',
            sale.timeOfOpening,
            sale.timeClosed,
            sale.tableName || '',
            sale.accountProfileCode || '',
            sale.ownerName,
            sale.ownerId,
            sale.type,
            sale.nbCovers,
            sale.dineIn ? 1 : 0,
            sale.deviceId,
            sale.deviceName,
            function(err) {
              if (err) {
                throw new Error(`Failed to insert sale: ${err.message}`);
              }
              const saleId = this.lastID;

              // Insert sales lines if they exist
              if (sale.salesLines && Array.isArray(sale.salesLines)) {
                sale.salesLines.forEach((line) => {
                  linesStmt.run(
                    saleId,
                    line.id,
                    parseFloat(line.totalNetAmountWithTax) || 0,
                    parseFloat(line.menuListPrice) || 0,
                    parseFloat(line.unitCostPrice) || 0,
                    parseFloat(line.serviceCharge) || 0,
                    parseFloat(line.discountAmount) || 0,
                    parseFloat(line.taxRatePercentage) || 0,
                    parseFloat(line.accountDiscountAmount) || 0,
                    parseFloat(line.totalDiscountAmount) || 0,
                    line.sku || '',
                    line.name || '',
                    parseFloat(line.quantity) || 0,
                    line.accountingGroup?.accountingGroupId,
                    line.accountingGroup?.name || '',
                    line.accountingGroup?.code || '',
                    line.currency || '',
                    line.revenueCenter || '',
                    line.revenueCenterId || 0,
                    line.timeOfSale || '',
                    line.staffId || 0,
                    line.staffName || '',
                    line.deviceId || 0,
                    line.deviceName || '',
                    line.accountProfileCode || '',
                    (err) => {
                      if (err) {
                        throw new Error(`Failed to insert sales line: ${err.message}`);
                      }
                    }
                  );
                });
              }

              // Insert payments if they exist
              if (sale.payments && Array.isArray(sale.payments)) {
                sale.payments.forEach((payment) => {
                  paymentsStmt.run(
                    saleId,
                    payment.code || '',
                    payment.description || '',
                    payment.paymentMethodId || 0,
                    parseFloat(payment.netAmountWithTax) || 0,
                    payment.currency || '',
                    parseFloat(payment.tip) || 0,
                    payment.type || '',
                    payment.deviceId || '',
                    payment.deviceName || '',
                    payment.staffId || 0,
                    payment.staffName || '',
                    payment.revenueCenter || '',
                    payment.revenueCenterId || 0,
                    payment.fiscId || '',
                    payment.uuid || '',
                    payment.fiscDate || '',
                    parseFloat(payment.surcharge) || 0,
                    (err) => {
                      if (err) {
                        throw new Error(`Failed to insert payment: ${err.message}`);
                      }
                    }
                  );
                });
              }
            }
          );
        });

        // Finalize statements
        salesStmt.finalize();
        linesStmt.finalize();
        paymentsStmt.finalize();
        
        logToDb('INFO', 'All sales data successfully inserted');
        resolve();
      } catch (error) {
        logToDb('ERROR', 'Error inserting sales data', { error: error.message });
        reject(error);
      }
    });
  });
}

module.exports = {
  persistAccessTokenJSON,
  getPersistedAccessTokenJSON,
  insertSalesData,
  logToDb
};
