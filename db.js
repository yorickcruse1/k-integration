const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'k-integration-db.db');
const db = new sqlite3.Database(dbPath);

console.log('Database path:', dbPath);

db.serialize(() => {
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

module.exports = {
  persistAccessTokenJSON,
  getPersistedAccessTokenJSON
};
