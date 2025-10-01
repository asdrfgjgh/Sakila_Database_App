// routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// GET route voor de loginpagina
router.get('/login', authController.getLogin);

// POST route om in te loggen
router.post('/login', authController.postLogin);

// GET route voor de registratiepagina
router.get('/register', authController.getRegister);

// POST route om te Register
router.post('/register', authController.postRegister);

// GET route voor uitloggen
router.get('/logout', authController.getLogout);

module.exports = router;