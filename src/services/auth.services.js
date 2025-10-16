// services/auth.service.js
const bcrypt = require('bcrypt');
const authDAO = require('../dao/authDAO'); // Juiste pad naar de DAO met transactie
const saltRounds = 10;

/**
 * Zoekt een gebruiker op basis van e-mail en vergelijkt het wachtwoord.
 * (Deze functie blijft ongewijzigd, aangezien inloggen geen adresgegevens vereist).
 */
const findUserAndComparePassword = async (email, password) => {
    // 1. Database-actie (via DAO): Zoek gebruiker op
    const user = await authDAO.findUserByEmail(email);

    if (!user) {
        return null; // Geen gebruiker gevonden
    }

    // 2. Cryptografische logica (in Service): Vergelijk het wachtwoord
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
        delete user.password_hash;
        return user; 
    } else {
        return null; 
    }
};


const registerNewUser = async (userData) => {
    const { email, password } = userData;

    // 1. Bedrijfslogica: Controleer of gebruiker al bestaat (via DAO)
    const existingUser = await authDAO.findUserByEmail(email);
    if (existingUser) {
        // Gooi een specifieke fout die de Controller kan afhandelen
        throw new Error('This email address is already in use.');
    }

    // 2. Cryptografische logica (in Service): Hash het wachtwoord
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    const result = await authDAO.registerNewUser({
        ...userData,
        hashedPassword,
    });

    return result;
};

module.exports = {
    findUserAndComparePassword,
    registerNewUser,
};