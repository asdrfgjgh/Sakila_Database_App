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

function updateProfileData(customerId, data, callback) {
    // Roep de DAO aan om de database-update uit te voeren
    // We roepen de callback-gebaseerde DAO functie aan
    profileDAO.updateUserProfile(customerId, data, (err, result) => { 
        if (err) {
            console.error('Service Fout bij profielupdate:', err.message);
            
            // Vang database-specifieke fouten op (bijv. unieke e-mail constraint)
            if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate entry')) { 
                const duplicateError = new Error('Email already in use');
                return callback(duplicateError);
            }
            // Fout van de DAO (inclusief transactie rollback-fouten)
            return callback(err); 
        }

        if (result.affectedRows === 0) {
            // Als er 0 rijen zijn beïnvloed (en geen fout), is de gebruiker niet gevonden.
            return callback(new Error('User not found'));
        }

        // Update succesvol
        callback(null, result);
    });
}


module.exports = {
    getProfileById,
    updateProfileData
};