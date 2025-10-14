// services/favorite.service.js
const favoriteDAO = require('../dao/favoritesDAO'); // Nu roepen we de DAO aan

/**
 * Haalt alle favoriete films van een gebruiker op.
 */
const getFavoriteMoviesByCustomerId = (customerId) => {
    // Hier is alleen het aanroepen van de DAO nodig, geen extra logica.
    return favoriteDAO.findFavoritesByCustomerId(customerId);
};

/**
 * Voegt een film toe aan de favorieten van de gebruiker.
 */
const addFavoriteMovie = async (customerId, filmId) => {
    // 1. Bedrijfslogica: Controleer op duplicaten met behulp van de DAO
    const existing = await favoriteDAO.findFavoriteByCustomerAndFilm(customerId, filmId);

    if (existing.length > 0) {
        // Bedrijfsfout/validatie
        throw new Error('Movie is already a favorite.');
    }

    // 2. Database-actie: Voeg toe met behulp van de DAO
    await favoriteDAO.insertFavorite(customerId, filmId);
    return true;
};

/**
 * Verwijdert een film uit de favorieten van de gebruiker.
 */
const removeFavoriteMovie = (customerId, filmId) => {
    // Hier is alleen het aanroepen van de DAO nodig, geen extra logica.
    return favoriteDAO.deleteFavorite(customerId, filmId);
};

module.exports = {
    getFavoriteMoviesByCustomerId,
    addFavoriteMovie,
    removeFavoriteMovie
};