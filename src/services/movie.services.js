const moviesDAO = require('../dao/moviesDAO');

function getMovieById(id, callback) {
  moviesDAO.findMovieById(id, (err, movie) => {
    if (err) {
      return callback(err, null);
    }
    // Eventuele extra businesslogica hier
    callback(null, movie);
  });
}

function getAllMovies(page, limit, searchQuery, selectedGenre, callback) {
  // De paginatie- en zoeklogica die voorheen in de controller zat, wordt nu hier verwerkt.
  const offset = (page - 1) * limit;

  moviesDAO.getMoviesPaginated(limit, offset, searchQuery, selectedGenre, (err, data) => {
    if (err) {
      return callback(err, null);
    }
    // Businesslogica voor paginering kan ook hier zitten
    const totalPages = Math.ceil(data.totalMovies / limit);
    const result = {
      movies: data.movies,
      totalMovies: data.totalMovies,
      totalPages,
    };
    callback(null, result);
  });
}

module.exports = { getMovieById, getAllMovies };