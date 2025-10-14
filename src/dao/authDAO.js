// daos/auth.dao.js
const pool = require('../config/db'); 


const findUserByEmail = async (email) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('DAO Fout bij verkrijgen verbinding:', err);
                return reject(new Error('Database Connection Error'));
            }

            const query = 'SELECT customer_id, email, password_hash FROM customer WHERE email = ?';
            connection.query(query, [email], (err, rows) => {
                connection.release();
                if (err) {
                    console.error('DAO Fout bij query (findUserByEmail):', err);
                    return reject(new Error('Database Query Error'));
                }

                resolve(rows.length > 0 ? rows[0] : null);
            });
        });
    });
};


const insertNewUser = async ({ first_name, last_name, email, hashedPassword }) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('DAO Error obtaining connection:', err);
                return reject(new Error('Database Connection Error'));
            }

            // Let op: 'address_id' en 'store_id' zijn hardcoded
            const insertQuery =
                'INSERT INTO customer (store_id, first_name, last_name, email, address_id, active, create_date, password_hash) VALUES (?, ?, ?, ?, ?, 1, NOW(), ?)';

            connection.query(
                insertQuery,
                [1, first_name, last_name, email, 1, hashedPassword],
                (err, result) => {
                    connection.release();
                    if (err) {
                        console.error('DAO Error inserting user:', err);
                        return reject(new Error('Database Query Error'));
                    }
                    resolve(result);
                }
            );
        });
    });
};

module.exports = {
    findUserByEmail,
    insertNewUser,
};