// user.controller.js
const userService = require('../services/user.services');

function getUser (req, res, next) {
  const userId = req.params.id;

  userService.getUserById(userId, (err, user) => {
    if (err) {
      next({ error: err.message });
    } else {
      const model = user;
      const view = "user";
      res.render("user", { title: 'Gebruiker', user });
      console.log(user);
    }
  });
};
module.exports = { getUser };