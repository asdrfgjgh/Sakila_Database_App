// src/routes/favorites.routes.js

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

// GET route voor de favorietenlijst
router.get('/', ensureAuthenticated, (req, res) => {
  const userId = req.session.userId;
  pool.getConnection((err, connection) => {
    if (err) {
      // ... (foutafhandeling)
      return;
    }

    const query = `
      SELECT f.*, film.title AS film_title, film.description, film.release_year
      FROM favorites AS f
      JOIN film ON f.film_id = film.film_id
      WHERE f.user_id = ?
    `;

    connection.query(query, [userId], (err, favoriteMovies) => {
      connection.release();
      if (err) {
        // ... (foutafhandeling)
        return;
      }
      res.render('films/favorites', { title: 'Mijn favorieten', favoriteMovies });
    });
  });
});

// POST route om een film toe te voegen aan favorieten
router.post('/add', ensureAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const { filmId } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      // ... (foutafhandeling)
      return;
    }

    const query = 'INSERT INTO favorites (user_id, film_id) VALUES (?, ?)';
    connection.query(query, [userId, filmId], (err) => {
      connection.release();
      if (err) {
        // ... (foutafhandeling)
        return;
      }
      res.redirect('/favorites');
    });
  });
});

// POST route om een film te verwijderen uit favorieten
router.post('/remove', ensureAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const { filmId } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      // ... (foutafhandeling)
      return;
    }

    const query = 'DELETE FROM favorites WHERE user_id = ? AND film_id = ?';
    connection.query(query, [userId, filmId], (err) => {
      connection.release();
      if (err) {
        // ... (foutafhandeling)
        return;
      }
      res.redirect('/favorites');
    });
  });
});

module.exports = router;