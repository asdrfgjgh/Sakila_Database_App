// src/services/profile.service.js

const profileDAO = require('../dao/profileDAO');

function getProfileById(id, callback) {
  profileDAO.findUserById(id, (err, user) => {
    if (err) {
      // Geef de fout door
      return callback(err, null);
    }
    if (!user) {
      // Creëer een specifieke foutmelding voor "niet gevonden"
      const notFoundError = new Error('User not found');
      return callback(notFoundError, null);
    }
    // Geef de gebruiker terug
    callback(null, user);
  });
}

module.exports = {
  getProfileById
};