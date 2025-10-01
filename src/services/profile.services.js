// src/services/profile.service.js

const profileDAO = require('../dao/profileDAO');

function getProfileById(id, callback) {
  profileDAO.findUserById(id, (err, user) => {
    if (err) {
      return callback(err, null);
    }
    if (!user) {
      const notFoundError = new Error('User not found');
      return callback(notFoundError, null);
    }
    callback(null, user);
  });
}

function updateProfileData(customerId, firstName, lastName, email, callback) {
  // Roep de DAO aan om de database-update uit te voeren
  profileDAO.updateUserProfile(customerId, firstName, lastName, email, (err, result) => {
    if (err) {
      // Vang database-specifieke fouten op (bijv. unieke e-mail constraint)
      if (err.code === 'ER_DUP_ENTRY') { // Meest voorkomende MySQL-foutcode voor duplicaat
        const duplicateError = new Error('Email already in use');
        return callback(duplicateError);
      }
      return callback(err);
    }

    if (result.affectedRows === 0) {
      // Als er 0 rijen zijn beïnvloed, bestaat de gebruiker waarschijnlijk niet (hoewel gevonden door DAO)
      return callback(new Error('User not found'));
    }

    // Update succesvol
    callback(null, result);
  });
}

module.exports = {
  getProfileById,
  updateProfileData // <--- DEZE ONTBREKENDE FUNCTIE MOET JE EXPORTEREN!
};