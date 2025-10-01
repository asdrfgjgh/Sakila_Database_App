// services/favorites.service.js

const pool = require('../config/db'); // De databaseverbinding

/**
 * Haalt alle favoriete films van een gebruiker op.
 * @param {number} customerId - Het ID van de klant.
 * @returns {Promise<Array>} Een Promise die resolved met een array van favoriete films.
 */
const getFavoriteMoviesByCustomerId = (customerId) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection:', err);
                return reject(new Error('Internal Server Error'));
            }

            const query = `
                SELECT f.*, film.title AS film_title, film.description, film.release_year
                FROM favorites AS f
                JOIN film ON f.film_id = film.film_id
                WHERE f.customer_id = ?
            `;

            connection.query(query, [customerId], (err, favoriteMovies) => {
                connection.release();
                if (err) {
                    console.error('Fout bij query (getFavorites):', err);
                    return reject(new Error('Internal Server Error'));
                }
                resolve(favoriteMovies);
            });
        });
    });
};

/**
 * Voegt een film toe aan de favorieten van de gebruiker.
 * @param {number} customerId - Het ID van de klant.
 * @param {number} filmId - Het ID van de film.
 * @returns {Promise<boolean>} Een Promise die resolved met true als de toevoeging succesvol is.
 */
const addFavoriteMovie = (customerId, filmId) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection:', err);
                return reject(new Error('Internal Server Error'));
            }

            // 1. Controleer op duplicaten
            const checkQuery = 'SELECT * FROM favorites WHERE customer_id = ? AND film_id = ?';
            connection.query(checkQuery, [customerId, filmId], (err, rows) => {
                if (err) {
                    connection.release();
                    console.error('Error checking for duplicates:', err);
                    return reject(new Error('Internal Server Error'));
                }

                if (rows.length > 0) {
                    connection.release();
                    return reject(new Error('Movie is already a favorite.')); // Custom foutmelding
                }

                // 2. Voeg toe
                const insertQuery = 'INSERT INTO favorites (customer_id, film_id) VALUES (?, ?)';
                connection.query(insertQuery, [customerId, filmId], (err) => {
                    connection.release();
                    if (err) {
                        console.error('Error adding favorite:', err);
                        return reject(new Error('Internal Server Error'));
                    }
                    resolve(true);
                });
            });
        });
    });
};

/**
 * Verwijdert een film uit de favorieten van de gebruiker.
 * @param {number} customerId - Het ID van de klant.
 * @param {number} filmId - Het ID van de film.
 * @returns {Promise<boolean>} Een Promise die resolved met true als de verwijdering succesvol is.
 */
const removeFavoriteMovie = (customerId, filmId) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection:', err);
                return reject(new Error('Internal Server Error'));
            }

            const query = 'DELETE FROM favorites WHERE customer_id = ? AND film_id = ?';
            connection.query(query, [customerId, filmId], (err) => {
                connection.release();
                if (err) {
                    console.error('Error removing favorite:', err);
                    return reject(new Error('Internal Server Error'));
                }
                resolve(true);
            });
        });
    });
};

module.exports = {
    getFavoriteMoviesByCustomerId,
    addFavoriteMovie,
    removeFavoriteMovie
};