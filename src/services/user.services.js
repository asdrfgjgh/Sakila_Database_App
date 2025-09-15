const userDAO = require('../dao/userDAO');

function getUserById(id, callback) {
  userDAO.findUserById(id, (err, user) => {
    if (err) {
      return callback(err, null);
    }
    // Eventuele extra businesslogica hier
    callback(null, user);
  });
}

module.exports = { getUserById };