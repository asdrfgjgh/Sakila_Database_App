// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const saltRounds = 10;

// GET route voor de loginpagina
router.get('/login', (req, res) => {
  res.render('login', { title: 'Log In' });
});

// POST route om in te loggen
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Fout bij verkrijgen verbinding:', err);
      return res.status(500).render('login', {
        title: 'Log In',
        error: 'Internal server error.'
      });
    }

    // Aangepaste query van username naar email
    connection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
      if (err) {
        connection.release();
        console.error('Fout bij query:', err);
        return res.status(500).render('login', {
          title: 'Log In',
          error: 'Internal server error.'
        });
      }

      if (rows.length === 0) {
        connection.release();
        return res.status(401).render('login', {
          title: 'Log In',
          error: 'Incorrect email-address or password.'
        });
      }

      const user = rows[0];
      
      bcrypt.compare(password, user.password_hash, (err, isMatch) => {
        connection.release();
        if (err) {
          console.error('Error comparing password:', err);
          return res.status(500).render('login', {
            title: 'Log In',
            error: 'Internal server error.'
          });
        }

        if (isMatch) {
          req.session.userId = user.user_id;
          // Aangepaste log van username naar email
          console.log(`User with email '${email}' has successfully logged in. Session ID: ${req.session.userId}`);

          req.flash('success_msg', 'You have successfully logged in!');

          res.redirect('/movies');
        } else {
          res.status(401).render('login', {
            title: 'Log In',
            error: 'Incorrect email-address or password.'
          });
        }
      });
    });
  });
});

// GET route voor de registratiepagina
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// POST route om te Register
router.post('/register', (req, res) => {
  // Aangepaste destructurering van username naar email
  const { email, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return res.status(400).render('register', {
      title: 'Register',
      error: 'Passwords do not match.'
    });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error obtaining connection:', err);
      return res.status(500).render('register', {
        title: 'Register',
        error: 'Internal server error.'
      });
    }

    // Aangepaste query van username naar email
    connection.query('SELECT email FROM users WHERE email = ?', [email], (err, rows) => {
      if (err) {
        connection.release();
        console.error('Error checking user:', err);
        return res.status(500).render('register', {
          title: 'Register',
          error: 'Internal server error.'
        });
      }

      if (rows.length > 0) {
        connection.release();
        return res.status(409).render('register', {
          title: 'Register',
          error: 'This email address is already in use.'
        });
      }

      bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
          connection.release();
          console.error('Error hashing password:', err);
          return res.status(500).render('register', {
            title: 'Register',
            error: 'Internal server error.'
          });
        }

        // Aangepaste query van username naar email
        connection.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hashedPassword], (err) => {
          connection.release();
          if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).render('register', {
              title: 'Register',
              error: 'Internal server error.'
            });
          }

          res.redirect('/auth/login');
        });
      });
    });
  });
});

// GET route voor uitloggen
router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.redirect('/');
      }
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;