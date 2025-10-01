// routes/favorites.routes.js

const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');

// Middleware om te controleren of de gebruiker is ingelogd
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) { 
        return next();
    }
    // Redirect naar login als niet ingelogd
    res.redirect('/auth/login');
}

// GET route voor de favorietenlijst
router.get('/', ensureAuthenticated, favoritesController.getFavoritesList);

// POST route om een film toe te voegen aan favorieten
router.post('/add', ensureAuthenticated, favoritesController.addFavorite);

// POST route om een film te verwijderen uit favorieten
router.post('/remove', ensureAuthenticated, favoritesController.removeFavorite);

module.exports = router;