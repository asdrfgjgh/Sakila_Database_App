// src/routes/favorites.routes.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const moviesDAO = require('../dao/moviesDAO'); // Zorg dat je moviesDAO importeert

// Middleware om te controleren of de gebruiker is ingelogd
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) { 
        return next();
    }
    res.redirect('/auth/login');
}

// GET route voor de favorietenlijst
router.get('/', ensureAuthenticated, (req, res) => {
    const customerId = req.session.userId;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).render('error', { message: 'Internal Server Error' });
        }

        const query = `
            SELECT f.*, film.title AS film_title, film.description, film.release_year
            FROM favorites AS f
            JOIN film ON f.film_id = film.film_id
            WHERE f.customer_id = ?
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
    const customerId = req.session.userId;
    const { filmId } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).send('Internal Server Error');
        }

        const checkQuery = 'SELECT * FROM favorites WHERE customer_id = ? AND film_id = ?';
        connection.query(checkQuery, [customerId, filmId], (err, rows) => {
            if (err) {
                connection.release();
                console.error('Error checking for duplicates:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Als de film al favoriet is
            if (rows.length > 0) {
                connection.release();
                console.log(`Movie ${filmId} is already a favorite for user ${customerId}.`);
                
                // Om de pagina opnieuw te renderen, moeten we eerst de filmdetails ophalen
                moviesDAO.findMovieById(filmId, (movieErr, movie) => {
                    if (movieErr || !movie) {
                        return res.status(404).send("Film details not found for rendering error.");
                    }
                    // Nu renderen we de pagina met de foutmelding
                    res.status(409).render('films/detail', {
                        title: movie.title,
                        movie: movie,
                        error: 'This movie is already in your favorites.'
                    });
                });
            } else {
                // Voeg de film toe als deze nog geen favoriet is
                const insertQuery = 'INSERT INTO favorites (customer_id, film_id) VALUES (?, ?)';
                connection.query(insertQuery, [customerId, filmId], (err) => {
                    connection.release();
                    if (err) {
                        console.error('Error adding favorite:', err);
                        return res.status(500).send('Internal Server Error');
                    }
                    res.redirect(`/movies/${filmId}`);
                });
            }
        });
    });
});

// POST route om een film te verwijderen uit favorieten
router.post('/remove', ensureAuthenticated, (req, res) => {
    const customerId = req.session.userId;
    const { filmId } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).send('Internal Server Error');
        }

        const query = 'DELETE FROM favorites WHERE customer_id = ? AND film_id = ?';
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