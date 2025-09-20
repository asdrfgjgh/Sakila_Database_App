// src/dao/rentalDAO.js

const pool = require('../config/db');

/**
 * Haalt alle huurgegevens op uit de rental-tabel.
 * @param {function} callback - De callback-functie die wordt aangeroepen met (error, results).
 */
function getAllRentals(callback) {
  const query = 'SELECT * FROM rental';
  
  pool.query(query, (err, results) => {
    if (err) {
      // Als er een fout is met de databasequery, geef de fout door.
      return callback(err, null);
    }
    // Geen fout, geef de resultaten door.
    callback(null, results);
  });
}

module.exports = { getAllRentals };