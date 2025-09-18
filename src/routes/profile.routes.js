// src/routes/profile.routes.js

const express = require('express');
const router = express.Router();

const pool = require('../config/db');

// Middleware om te controleren of de gebruiker is ingelogd
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
}

// GET route voor de profielpagina
router.get('/', ensureAuthenticated, (req, res) => {
  const customerId = req.session.userId;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error while trying to connect:', err);
      return res.status(500).render('error', { message: 'Internal Server Error' });
    }

    const query = 'SELECT first_name, last_name, email FROM customer WHERE customer_id = ?';
    
    connection.query(query, [customerId], (err, rows) => {
      connection.release();

      if (err) {
        console.error('Error while fetching profile data:', err);
        return res.status(500).render('error', { message: 'Internal Server Error' });
      }

      if (rows.length === 0) {
        return res.status(404).render('error', { message: 'User not found.' });
      }

      const user = rows[0];
      res.render('profile', { title: 'My Profile', user: user });
    });
  });
});

console.log("profile routes loaded");
module.exports = router;