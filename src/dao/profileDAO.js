// src/dao/profileDAO.js

const pool = require('../config/db');


function findUserById(id, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error while trying to connect:', err);
            return callback(err, null);
        }

        // Haal customer, address en city details op
        const query = `
            SELECT 
                c.first_name, c.last_name, c.email, 
                c.address_id,         /* Nodig voor update */
                a.address, a.district, a.postal_code, a.phone, 
                a.city_id,            /* Nodig voor update */
                cy.city 
            FROM 
                customer c
            JOIN 
                address a ON c.address_id = a.address_id
            JOIN 
                city cy ON a.city_id = cy.city_id
            WHERE 
                c.customer_id = ?`;

        connection.query(query, [id], (err, rows) => {
            connection.release();

            if (err) {
                console.error('Error while fetching profile data:', err);
                return callback(err, null);
            }

            const user = rows.length > 0 ? rows[0] : null;
            callback(null, user);
        });
    });
}


/**
 * Voert een callback-gebaseerde transactie uit om customer en address bij te werken.
 */
function updateFullUserProfile(id, data, callback) {
    // 1. Haal de waarden DIRECT uit het data object
    const { 
        firstName, lastName, email, 
        address, district, cityId, postalCode, phone, addressId 
    } = data; // <--- DIT IS CRUCIAAL

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting for transaction:', err);
            return callback(err);
        }

        // 1. START TRANSACTION
        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return callback(err);
            }

            const handleRollback = (rollbackErr) => {
                connection.rollback(() => {
                    connection.release();
                    if (rollbackErr) {
                        console.error('Rollback failed:', rollbackErr);
                    }
                    callback(rollbackErr);
                });
            };

            // 2. UPDATE customer tabel
            // Zorg ervoor dat de waarden correct uit het data object worden gebruikt
            const customerQuery = 'UPDATE customer SET first_name = ?, last_name = ?, email = ? WHERE customer_id = ?';
            connection.query(customerQuery, [firstName, lastName, email, id], (err, result) => { // <--- Hierdoor wordt NULL nu de correcte waarde
                if (err) return handleRollback(err);

                // 3. UPDATE address tabel
                const addressQuery = `
                    UPDATE address 
                    SET address = ?, district = ?, city_id = ?, postal_code = ?, phone = ?, last_update = NOW()
                    WHERE address_id = ?`;
                
                connection.query(addressQuery, [address, district, cityId, postalCode, phone, addressId], (err, addressResult) => {
                    if (err) return handleRollback(err);

                    // 4. COMMIT TRANSACTION
                    connection.commit(err => {
                        if (err) return handleRollback(err);

                        connection.release();
                        if (result.affectedRows === 0 && addressResult.affectedRows === 0) {
                            return callback(new Error('User not found for update'));
                        }
                        callback(null, result); // Succes
                    });
                });
            });
        });
    });
}

module.exports = {
    findUserById,
    updateUserProfile: updateFullUserProfile
};