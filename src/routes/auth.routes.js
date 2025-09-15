// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const saltRounds = 10;

// GET route voor de loginpagina
router.get('/login', (req, res) => {
  res.render('login', { title: 'Inloggen' });
});

// POST route om in te loggen
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Fout bij verkrijgen verbinding:', err);
      return res.status(500).render('login', {
        title: 'Inloggen',
        error: 'Er is een interne serverfout opgetreden.'
      });
    }

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
      
      bcrypt.compare(password, user.password_hash, (err, isMatch) => {
        connection.release();
        if (err) {
          console.error('Fout bij wachtwoordvergelijking:', err);
          return res.status(500).render('login', {
            title: 'Inloggen',
            error: 'Er is een interne serverfout opgetreden.'
          });
        }

        if (isMatch) {
          req.session.userId = user.user_id;
          console.log(`Gebruiker '${username}' is succesvol ingelogd. Sessie-ID: ${req.session.userId}`);
          
          // Voeg een succesbericht toe aan de sessie
          req.flash('success_msg', 'Je bent succesvol ingelogd!');

          // Stuur de gebruiker door naar de movies pagina
          res.redirect('/movies');
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

  if (password !== passwordConfirm) {
    return res.status(400).render('register', {
      title: 'Registreren',
      error: 'Wachtwoorden komen niet overeen.'
    });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Fout bij verkrijgen verbinding:', err);
      return res.status(500).render('register', {
        title: 'Registreren',
        error: 'Er is een interne serverfout opgetreden.'
      });
    }

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

      bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
          connection.release();
          console.error('Fout bij hashen wachtwoord:', err);
          return res.status(500).render('register', {
            title: 'Registreren',
            error: 'Er is een interne serverfout opgetreden.'
          });
        }

        connection.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], (err) => {
          connection.release();
          if (err) {
            console.error('Fout bij invoegen gebruiker:', err);
            return res.status(500).render('register', {
              title: 'Registreren',
              error: 'Er is een interne serverfout opgetreden.'
            });
          }

          res.redirect('/auth/login');
        });
      });
    });
  });
});

// NIEUWE GET route voor uitloggen
// src/routes/auth.routes.js

// ... (andere imports en routes)

// GET route voor uitloggen
router.get('/logout', (req, res, next) => {
  // Controleer of er een sessie bestaat
  if (req.session) {
    // Vernietig de sessie
    req.session.destroy(err => {
      if (err) {
        // Log de fout, maar stuur de gebruiker alsnog door
        console.error('Fout bij het vernietigen van de sessie:', err);
        return res.redirect('/');
      }
      // Stuur de gebruiker door naar de homepagina
      res.redirect('/');
    });
  } else {
    // Als er geen sessie is, stuur de gebruiker gewoon door
    res.redirect('/');
  }
});

// ... (andere routes)

module.exports = router;