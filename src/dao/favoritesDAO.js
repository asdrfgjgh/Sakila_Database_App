// daos/favorite.dao.js
const pool = require('../config/db'); // De databaseverbinding

const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('DAO Error getting connection:', err);
                return reject(new Error('Database Connection Error'));
            }

            connection.query(query, params, (err, results) => {
                connection.release();
                if (err) {
                    console.error('DAO Database Query Error:', err);
                    return reject(new Error('Database Query Error'));
                }
                resolve(results);
            });
        });
    });
};


const findFavoritesByCustomerId = (customerId) => {
    const query = `
        SELECT f.*, film.title AS film_title, film.description, film.release_year
        FROM favorites AS f
        JOIN film ON f.film_id = film.film_id
        WHERE f.customer_id = ?
    `;
    return executeQuery(query, [customerId]);
};


const findFavoriteByCustomerAndFilm = (customerId, filmId) => {
    const query = 'SELECT * FROM favorites WHERE customer_id = ? AND film_id = ?';
    return executeQuery(query, [customerId, filmId]);
};


const insertFavorite = (customerId, filmId) => {
    const query = 'INSERT INTO favorites (customer_id, film_id) VALUES (?, ?)';
    return executeQuery(query, [customerId, filmId]);
};


const deleteFavorite = (customerId, filmId) => {
    const query = 'DELETE FROM favorites WHERE customer_id = ? AND film_id = ?';
    return executeQuery(query, [customerId, filmId]);
};

module.exports = {
    findFavoritesByCustomerId,
    findFavoriteByCustomerAndFilm,
    insertFavorite,
    deleteFavorite
};