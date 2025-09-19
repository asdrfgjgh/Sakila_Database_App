const pool = require('../config/db');
function findUserById(id, callback) {
  pool.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(new Error('Gebruiker niet gevonden'), null);
    }
    callback(null, results[0]);
  });
}

module.exports = { findUserById };