// src/routes/profile.routes.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

// Middleware om te controleren of de gebruiker is ingelogd
// Je kunt deze middleware ook in een apart bestand plaatsen, bijvoorbeeld in src/middleware
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
}

// GET route voor de profielpagina
router.get('/', ensureAuthenticated, profileController.getProfile);

console.log("profile routes loaded");
module.exports = router;