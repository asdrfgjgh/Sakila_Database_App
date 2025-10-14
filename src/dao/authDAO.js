// daos/auth.dao.js
const pool = require('../config/db'); 

// Gebruik een helper functie voor Promise-gebaseerde query's binnen de transactie.
const executeTransactionQuery = (connection, sql, values) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

const findUserByEmail = (email) => {
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

const registerNewUserWithAddress = async (customerData) => {
    let connection;
    try {
        // Haal een verbinding uit de pool
        connection = await new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) return reject(new Error('Database Connection Error'));
                resolve(conn);
            });
        });

        // 1. Start de transactie
        await executeTransactionQuery(connection, 'START TRANSACTION');

        // Gegevens uit de input
        const { first_name, last_name, email, hashedPassword, address, district, city_id, postal_code, phone } = customerData;
        
        // 2. Insert het nieuwe Adres
        // FIX: Voeg 'location' toe aan de kolommenlijst en geef deze een geldige GEOMETRY waarde (POINT(0 0)).
        const insertAddressQuery = 
            `INSERT INTO address (address, address2, district, city_id, postal_code, phone, location) 
             VALUES (?, ?, ?, ?, ?, ?, ST_GeomFromText('POINT(0 0)'))`;
        
        const addressResult = await executeTransactionQuery(
            connection,
            insertAddressQuery,
            [address, null, district, city_id, postal_code, phone] // address2 is null
        );

        const newAddressId = addressResult.insertId;

        // 3. Insert de nieuwe Gebruiker met de nieuwe address_id
        const insertCustomerQuery =
            'INSERT INTO customer (store_id, first_name, last_name, email, address_id, active, create_date, password_hash) VALUES (?, ?, ?, ?, ?, 1, NOW(), ?)';

        const customerResult = await executeTransactionQuery(
            connection,
            insertCustomerQuery,
            [1, first_name, last_name, email, newAddressId, hashedPassword]
        );

        // 4. Commit de transactie
        await executeTransactionQuery(connection, 'COMMIT');
        
        // Geef het resultaat van de customer insert terug
        return customerResult; 

    } catch (error) {
        // Foutafhandeling: rollback bij een fout
        if (connection) {
            await executeTransactionQuery(connection, 'ROLLBACK').catch(rollbackErr => 
                console.error('Rollback Error:', rollbackErr.message)
            );
        }
        
        // Let op: De fout van de database bevat nu hopelijk niet meer de 'location' melding, 
        // maar een andere fout als de data incorrect is.
        console.error('DAO Transactie Fout:', error.message);
        throw new Error('Database transaction failed.');

    } finally {
        // Zorg ervoor dat de verbinding altijd wordt vrijgegeven
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    findUserByEmail,
    registerNewUser: registerNewUserWithAddress,
};