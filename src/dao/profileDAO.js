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

      const user = rows.length > 0 ? rows[0] : null;
      callback(null, user);
    });
  });
}


function updateUserProfile(id, firstName, lastName, email, callback) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error while trying to connect:', err);
      return callback(err);
    }

    const query = 'UPDATE customer SET first_name = ?, last_name = ?, email = ? WHERE customer_id = ?';
    const values = [firstName, lastName, email, id];

    connection.query(query, values, (err, result) => {
      connection.release();

      if (err) {
        console.error('Error while updating profile data:', err);
        return callback(err);
      }


      callback(null, result);
    });
  });
}

module.exports = {
  findUserById,
  updateUserProfile 
};