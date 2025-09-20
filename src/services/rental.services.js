// src/services/rental.services.js

const rentalDAO = require('../dao/rentalDAO');

function getAllRentals(callback) {
  rentalDAO.getAllRentals((err, rentals) => {
    if (err) {
      // Als er een fout is in de DAO-laag, geef de fout dan door
      return callback(err, null);
    }
    // Hier kun je extra bedrijfslogica toevoegen, zoals het filteren van data of het
    // verrijken van de resultaten voordat ze worden teruggestuurd.
    // Voor nu sturen we de resultaten direct terug.
    callback(null, rentals);
  });
}

module.exports = { getAllRentals };