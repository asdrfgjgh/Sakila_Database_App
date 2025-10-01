// src/routes/profile.routes.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { route } = require('./about.routes');

// Middleware om te controleren of de gebruiker is ingelogd
// Je kunt deze middleware ook in een apart bestand plaatsen, bijvoorbeeld in src/middleware
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    // Als de gebruiker niet is ingelogd, stuur hem naar de loginpagina
    res.redirect('/auth/login'); 
}
router.get('/', ensureAuthenticated, profileController.getProfile); // Route om het profiel weer te geven

router.get('/edit', ensureAuthenticated, profileController.getEditProfile);

router.post('/', ensureAuthenticated, profileController.updateProfile); // Route om het profiel bij te werken

console.log("profile routes loaded");
module.exports = router;