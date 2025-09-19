// src/services/categories.services.js
const categoriesDAO = require('../dao/categoriesDAO');

function getAllCategories(callback) {
  categoriesDAO.getAllCategories((err, categories) => {
    if (err) {
      return callback(err, null);
    }
    // Eventuele extra businesslogica kan hier komen
    callback(null, categories);
  });
}

module.exports = { getAllCategories };