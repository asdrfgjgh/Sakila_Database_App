// src/dao/categoriesDAO.js

const pool = require('../config/db');

function getAllCategories(callback) {
  const query = 'SELECT category_id, name FROM category ORDER BY name ASC';
  pool.query(query, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

module.exports = { getAllCategories };