// services/auth.service.js

const bcrypt = require('bcrypt');
const pool = require('../config/db'); // Ga ervan uit dat je de database-configuratie hier kunt importeren
const saltRounds = 10;

/**
 * Zoekt een gebruiker op basis van e-mail en vergelijkt het wachtwoord.
 * @param {string} email - De e-mail van de gebruiker.
 * @param {string} password - Het ingevoerde, onversleutelde wachtwoord.
 * @returns {object} De gevonden gebruiker (met password_hash) bij succes, of null bij fout/geen match.
 */
const findUserAndComparePassword = (email, password) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Fout bij verkrijgen verbinding:', err);
                return reject(new Error('Internal server error.'));
            }

            connection.query('SELECT customer_id, email, password_hash FROM customer WHERE email = ?', [email], (err, rows) => {
                connection.release(); // Verbreek de verbinding na gebruik, ongeacht de uitkomst
                if (err) {
                    console.error('Fout bij query:', err);
                    return reject(new Error('Internal server error.'));
                }

                if (rows.length === 0) {
                    return resolve(null); // Geen gebruiker gevonden
                }

                const user = rows[0];

                bcrypt.compare(password, user.password_hash, (err, isMatch) => {
                    if (err) {
                        console.error('Error comparing password:', err);
                        return reject(new Error('Internal server error.'));
                    }

                    if (isMatch) {
                        resolve(user); // Retourneer de gebruiker bij match
                    } else {
                        resolve(null); // Wachtwoord komt niet overeen
                    }
                });
            });
        });
    });
};

/**
 * Registreert een nieuwe gebruiker in de database.
 * @param {object} userData - Bevat first_name, last_name, email, password.
 * @returns {object} Het resultaat van de database-insert.
 */
const registerNewUser = (userData) => {
    const { first_name, last_name, email, password } = userData;

    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error obtaining connection:', err);
                return reject(new Error('Internal server error.'));
            }

            // 1. Controleer of de gebruiker al bestaat
            connection.query('SELECT email FROM customer WHERE email = ?', [email], (err, rows) => {
                if (err) {
                    connection.release();
                    console.error('Error checking user:', err);
                    return reject(new Error('Internal server error.'));
                }

                if (rows.length > 0) {
                    connection.release();
                    return reject(new Error('This email address is already in use.'));
                }

                // 2. Hash het wachtwoord
                bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                    if (err) {
                        connection.release();
                        console.error('Error hashing password:', err);
                        return reject(new Error('Internal server error.'));
                    }

                    // 3. Voeg de gebruiker in
                    // Let op: 'address_id' en 'store_id' worden hier hardcoded op '1' zoals in je originele code.
                    const insertQuery =
                        'INSERT INTO customer (store_id, first_name, last_name, email, address_id, active, create_date, password_hash) VALUES (?, ?, ?, ?, ?, 1, NOW(), ?)';
                    
                    connection.query(
                        insertQuery,
                        [1, first_name, last_name, email, 1, hashedPassword],
                        (err, result) => {
                            connection.release();
                            if (err) {
                                console.error('Error inserting user:', err);
                                return reject(new Error('Internal server error.'));
                            }
                            resolve(result);
                        }
                    );
                });
            });
        });
    });
};

module.exports = {
    findUserAndComparePassword,
    registerNewUser
};