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

function getAllMovies(callback) {
  moviesDAO.GetAllMovies((err, movies) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, movies);
  });
}

module.exports = { getMovieById, getAllMovies };