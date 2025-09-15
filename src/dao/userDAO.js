// // Simuleert database-interactie
// function findUserById(id, callback) {
//   // Simulatie van een database call
//   setTimeout(() => {
//     const users = [
//       { id: '1', name: 'Mees van Dam' },
//       { id: '2', name: 'Anna de Vries' }
//     ];

//     const user = users.find(u => u.id === id);
//  console.log(user);
//     if (!user) {
//       return callback(new Error('Gebruiker niet gevonden'), null);
//     }

//     callback(null, user);
//   }, 500);
// }

// module.exports = { findUserById };
const pool = require('../config/db');
function findUserById(id, callback) {
  pool.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(new Error('Gebruiker niet gevonden'), null);
    }
    callback(null, results[0]);
  });
}

module.exports = { findUserById };