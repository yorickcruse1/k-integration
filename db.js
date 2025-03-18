const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'k-integration-db.db');
const db = new sqlite3.Database(dbPath);

console.log('Database path:', dbPath);

db.serialize(() => {
  // Drop and create the tokens table
  db.run(`DROP TABLE IF EXISTS tokens`);

  db.run(`CREATE TABLE tokens (
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

  // Create the sales table
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY,
    account_reference TEXT,
    account_fisc_id TEXT,
    receipt_id TEXT,
    time_of_opening TEXT,
    time_closed TEXT,
    table_name TEXT,
    type TEXT,
    nb_covers REAL,
    dine_in BOOLEAN,
    device_id INTEGER,
    device_name TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating sales table:', err);
    } else {
      console.log('Sales table created successfully.');
    }
  });

  // Create the sales_lines table
  db.run(`CREATE TABLE IF NOT EXISTS sales_lines (
    id INTEGER PRIMARY KEY,
    sale_id INTEGER,
    item_name TEXT,
    total_net_amount REAL,
    menu_list_price REAL,
    unit_cost_price REAL,
    service_charge REAL,
    discount_amount REAL,
    tax_rate_percentage REAL,
    account_discount_amount REAL,
    total_discount_amount REAL,
    sku TEXT,
    quantity REAL,
    accounting_group_id INTEGER,
    accounting_group_name TEXT,
    accounting_group_code TEXT,
    currency TEXT,
    time_of_sale TEXT,
    FOREIGN KEY (sale_id) REFERENCES sales (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating sales_lines table:', err);
    } else {
      console.log('Sales lines table created successfully.');
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

function insertSalesData(salesData) {
  return new Promise((resolve, reject) => {
    const salesStmt = db.prepare(`
      INSERT INTO sales (
        account_reference, account_fisc_id, receipt_id, time_of_opening,
        time_closed, table_name, type, nb_covers, dine_in, device_id, device_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const linesStmt = db.prepare(`
      INSERT INTO sales_lines (
        sale_id, item_name, total_net_amount, menu_list_price, unit_cost_price,
        service_charge, discount_amount, tax_rate_percentage, account_discount_amount,
        total_discount_amount, sku, quantity, accounting_group_id, accounting_group_name,
        accounting_group_code, currency, time_of_sale
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    salesData.forEach((sale) => {
      salesStmt.run(
        sale.accountReference, sale.accountFiscId, sale.receiptId, sale.timeOfOpening,
        sale.timeClosed, sale.tableName, sale.type, sale.nbCovers, sale.dineIn,
        sale.deviceId, sale.deviceName,
        function(err) {
          if (err) {
            console.error('Error inserting sales data:', err);
            reject(err);
          } else {
            const saleId = this.lastID;
            sale.salesLines.forEach((line) => {
              linesStmt.run(
                saleId, line.name, line.totalNetAmountWithTax, line.menuListPrice,
                line.unitCostPrice, line.serviceCharge, line.discountAmount,
                line.taxRatePercentage, line.accountDiscountAmount, line.totalDiscountAmount,
                line.sku, line.quantity, line.accountingGroup.accountingGroupId,
                line.accountingGroup.name, line.accountingGroup.code, line.currency,
                line.timeOfSale
              );
            });
          }
        }
      );
    });

    salesStmt.finalize(() => {
      linesStmt.finalize(() => {
        console.log('Sales data successfully inserted into database');
        resolve();
      });
    });
  });
}

module.exports = {
  persistAccessTokenJSON,
  getPersistedAccessTokenJSON,
  insertSalesData
};
