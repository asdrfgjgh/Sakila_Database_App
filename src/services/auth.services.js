// services/auth.service.js
const bcrypt = require('bcrypt');
const authDAO = require('../dao/authDAO'); // Nu roepen we de DAO aan
const saltRounds = 10;


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

    // 3. Database-actie (via DAO): Voeg de gebruiker toe
    const result = await authDAO.insertNewUser({
        ...userData,
        hashedPassword,
    });

    return result;
};

module.exports = {
    findUserAndComparePassword,
    registerNewUser,
};