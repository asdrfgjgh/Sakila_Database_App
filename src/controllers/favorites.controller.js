// controllers/favorites.controller.js

const favoritesService = require('../services/favorites.services');
const moviesDAO = require('../dao/moviesDAO'); // Nodig voor het renderen van de foutmelding bij dubbele favoriet

/**
 * Toont de favorietenlijst van de gebruiker.
 */
const getFavoritesList = async (req, res) => {
    const customerId = req.session.userId;

    try {
        const favoriteMovies = await favoritesService.getFavoriteMoviesByCustomerId(customerId);
        res.render('films/favorites', { 
            title: 'My Favorites', 
            favoriteMovies 
        });
    } catch (error) {
        console.error('Fout bij ophalen favorieten:', error.message);
        res.status(500).render('error', { 
            message: 'Internal Server Error while retrieving favorites.' 
        });
    }
};

/**
 * Voegt een film toe aan de favorieten.
 */
const addFavorite = async (req, res) => {
    const customerId = req.session.userId;
    const { filmId } = req.body;

    if (!filmId) {
        return res.status(400).send('Film ID is vereist.');
    }

    try {
        await favoritesService.addFavoriteMovie(customerId, filmId);
        
        // Optioneel: Flash message toevoegen voor succes
        // if (req.flash) req.flash('success_msg', 'Movie added to favorites!');

        res.redirect(`/favorites`);
    } catch (error) {
        console.error('Fout bij toevoegen favoriet:', error.message);
        
        if (error.message === 'Movie is already a favorite.') {
            // Dit is het complexe deel: we moeten de filmdetails ophalen om de DETAIL pagina opnieuw te renderen
            moviesDAO.findMovieById(filmId, (movieErr, movie) => {
                if (movieErr || !movie) {
                    return res.status(404).send("Film details not found for rendering duplicate error.");
                }
                return res.status(409).render('films/detail', {
                    title: movie.title,
                    movie: movie,
                    error: 'This movie is already in your favorites.'
                });
            });
        } else {
            // Algemene interne serverfout
            return res.status(500).send('Internal Server Error');
        }
    }
};

/**
 * Verwijdert een film uit de favorieten.
 */
const removeFavorite = async (req, res) => {
    const customerId = req.session.userId;
    const { filmId } = req.body;

    if (!filmId) {
        return res.status(400).send('Film ID is vereist.');
    }

    try {
        await favoritesService.removeFavoriteMovie(customerId, filmId);
        
        // Optioneel: Flash message toevoegen voor succes
        // if (req.flash) req.flash('success_msg', 'Movie removed from favorites!');

        res.redirect('/favorites');
    } catch (error) {
        console.error('Fout bij verwijderen favoriet:', error.message);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getFavoritesList,
    addFavorite,
    removeFavorite
};