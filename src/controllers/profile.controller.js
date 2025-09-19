// src/controllers/profile.controller.js

const profileService = require('../services/profile.services');

function getProfile(req, res, next) {
  const customerId = req.session.userId;

  profileService.getProfileById(customerId, (err, user) => {
    if (err) {
      // De service kan verschillende soorten fouten teruggeven, afhankelijk van de businesslogica
      if (err.message === 'User not found') {
        return res.status(404).render('error', { message: 'User not found.' });
      }
      // Standaard foutafhandeling voor andere fouten
      return res.status(500).render('error', { message: 'Internal Server Error' });
    }
    
    // Render de view met de opgehaalde gegevens
    res.render('profile', { title: 'My Profile', user: user });
  });
}

module.exports = {
  getProfile
};