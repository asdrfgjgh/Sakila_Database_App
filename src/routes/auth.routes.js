// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db'); // Importeer de pool direct
const saltRounds = 10;

// GET route voor de loginpagina
router.get('/login', (req, res) => {
  res.render('login', { title: 'Inloggen' });
});

// POST route om in te loggen
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verkrijg een databaseverbinding uit de pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Fout bij verkrijgen verbinding:', err);
      return res.status(500).render('login', {
        title: 'Inloggen',
        error: 'Er is een interne serverfout opgetreden.'
      });
    }

    // Zoek de gebruiker in de database
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
      if (err) {
        connection.release();
        console.error('Fout bij query:', err);
        return res.status(500).render('login', {
          title: 'Inloggen',
          error: 'Er is een interne serverfout opgetreden.'
        });
      }

      if (rows.length === 0) {
        connection.release();
        return res.status(401).render('login', {
          title: 'Inloggen',
          error: 'Onjuiste gebruikersnaam of wachtwoord.'
        });
      }

      const user = rows[0];
      
      // Vergelijk het ingevoerde wachtwoord met het gehashte wachtwoord
      bcrypt.compare(password, user.password_hash, (err, isMatch) => {
        connection.release(); // Geef de verbinding vrij
        if (err) {
          console.error('Fout bij wachtwoordvergelijking:', err);
          return res.status(500).render('login', {
            title: 'Inloggen',
            error: 'Er is een interne serverfout opgetreden.'
          });
        }

        if (isMatch) {
          // Sla de gebruikers-ID op in de sessie
          req.session.userId = user.user_id;
          console.log(`Gebruiker '${username}' is succesvol ingelogd. Sessie-ID: ${req.session.userId}`);
          res.redirect('/movies'); // Stuur de gebruiker door naar de movies pagina na succesvol inloggen
        } else {
          res.status(401).render('login', {
            title: 'Inloggen',
            error: 'Onjuiste gebruikersnaam of wachtwoord.'
          });
        }
      });
    });
  });
});

// GET route voor de registratiepagina
router.get('/register', (req, res) => {
  res.render('register', { title: 'Registreren' });
});

// POST route om te registreren
router.post('/register', (req, res) => {
  const { username, password, passwordConfirm } = req.body;

  // Valideer de wachtwoorden
  if (password !== passwordConfirm) {
    return res.status(400).render('register', {
      title: 'Registreren',
      error: 'Wachtwoorden komen niet overeen.'
    });
  }

  // Verkrijg een databaseverbinding
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Fout bij verkrijgen verbinding:', err);
      return res.status(500).render('register', {
        title: 'Registreren',
        error: 'Er is een interne serverfout opgetreden.'
      });
    }

    // Controleer of de gebruikersnaam al bestaat
    connection.query('SELECT username FROM users WHERE username = ?', [username], (err, rows) => {
      if (err) {
        connection.release();
        console.error('Fout bij controleren gebruiker:', err);
        return res.status(500).render('register', {
          title: 'Registreren',
          error: 'Er is een interne serverfout opgetreden.'
        });
      }

      if (rows.length > 0) {
        connection.release();
        return res.status(409).render('register', {
          title: 'Registreren',
          error: 'Deze gebruikersnaam is al in gebruik.'
        });
      }

      // Hash het wachtwoord
      bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
          connection.release();
          console.error('Fout bij hashen wachtwoord:', err);
          return res.status(500).render('register', {
            title: 'Registreren',
            error: 'Er is een interne serverfout opgetreden.'
          });
        }

        // Voeg de nieuwe gebruiker toe
        connection.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], (err) => {
          connection.release(); // Geef de verbinding vrij
          if (err) {
            console.error('Fout bij invoegen gebruiker:', err);
            return res.status(500).render('register', {
              title: 'Registreren',
              error: 'Er is een interne serverfout opgetreden.'
            });
          }

          res.redirect('/auth/login'); // Registratie succesvol, stuur door naar inloggen
        });
      });
    });
  });
});

module.exports = router;