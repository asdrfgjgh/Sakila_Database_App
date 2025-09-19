// src/dao/profileDAO.js

const pool = require('../config/db');

function findUserById(id, callback) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error while trying to connect:', err);
      return callback(err, null);
    }

    const query = 'SELECT first_name, last_name, email FROM customer WHERE customer_id = ?';
    
    connection.query(query, [id], (err, rows) => {
      connection.release();

      if (err) {
        console.error('Error while fetching profile data:', err);
        return callback(err, null);
      }

      // Geef de eerste rij terug (of null als er geen resultaat is)
      const user = rows.length > 0 ? rows[0] : null;
      callback(null, user);
    });
  });
}

module.exports = {
  findUserById
};