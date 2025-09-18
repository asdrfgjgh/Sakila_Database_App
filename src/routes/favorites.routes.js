// src/routes/favorites.routes.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware om te controleren of de gebruiker is ingelogd
function ensureAuthenticated(req, res, next) {
  // Controleert of een customer_id in de sessie staat
  if (req.session.userId) { 
    return next();
  }
  res.redirect('/auth/login');
}

// GET route voor de favorietenlijst
router.get('/', ensureAuthenticated, (req, res) => {
  const customerId = req.session.userId; // Gebruik customerId
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).render('error', { message: 'Internal Server Error' });
    }

    const query = `
      SELECT f.*, film.title AS film_title, film.description, film.release_year
      FROM favorites AS f
      JOIN film ON f.film_id = film.film_id
      WHERE f.customer_id = ?  -- Veranderd van user_id naar customer_id
    `;

    connection.query(query, [customerId], (err, favoriteMovies) => {
      connection.release();
      if (err) {
        console.error('Fout bij query:', err);
        return res.status(500).render('error', { message: 'Internal Server Error' });
      }
      res.render('films/favorites', { title: 'My Favorites', favoriteMovies });
    });
  });
});

// POST route om een film toe te voegen aan favorieten
router.post('/add', ensureAuthenticated, (req, res) => {
  const customerId = req.session.userId; // Gebruik customerId
  const { filmId } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Controleer eerst of de film al favoriet is
    const checkQuery = 'SELECT * FROM favorites WHERE customer_id = ? AND film_id = ?';
    connection.query(checkQuery, [customerId, filmId], (err, rows) => {
      if (err) {
        connection.release();
        console.error('Error checking for duplicates:', err);
        return res.status(500).send('Internal Server Error');
      }

      // Als de film al favoriet is, stuur dan een foutmelding of redirect
      if (rows.length > 0) {
        connection.release();
        console.log(`Movie ${filmId} is already a favorite for user ${customerId}.`);
        return res.status(409).send('Movie is already a favorite.');
      }

      // Voeg de film toe
      const insertQuery = 'INSERT INTO favorites (customer_id, film_id) VALUES (?, ?)'; // Veranderd van user_id naar customer_id
      connection.query(insertQuery, [customerId, filmId], (err) => {
        connection.release();
        if (err) {
          console.error('Error adding favorite:', err);
          return res.status(500).send('Internal Server Error');
        }
        res.redirect('/favorites');
      });
    });
  });
});

// POST route om een film te verwijderen uit favorieten
router.post('/remove', ensureAuthenticated, (req, res) => {
  const customerId = req.session.userId; // Gebruik customerId
  const { filmId } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).send('Internal Server Error');
    }

    const query = 'DELETE FROM favorites WHERE customer_id = ? AND film_id = ?'; // Veranderd van user_id naar customer_id
    connection.query(query, [customerId, filmId], (err) => {
      connection.release();
      if (err) {
        console.error('Error removing favorite:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.redirect('/favorites');
    });
  });
});

module.exports = router;