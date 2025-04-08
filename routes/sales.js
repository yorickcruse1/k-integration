const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'k-integration-db.db');

router.get('/', (req, res) => {
    const db = new sqlite3.Database(dbPath);
    
    const query = `
        SELECT 
            s.*,
            GROUP_CONCAT(DISTINCT p.description) as payment_methods,
            SUM(sl.totalNetAmountWithTax) as total_amount
        FROM sales s
        LEFT JOIN payments p ON s.id = p.saleId
        LEFT JOIN salesLines sl ON s.id = sl.saleId
        GROUP BY s.id
        ORDER BY s.timeOfOpening DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
    
    db.close();
});

module.exports = router;