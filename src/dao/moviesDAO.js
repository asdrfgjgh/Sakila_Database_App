
const pool = require('../config/db');

function getMoviesPaginated(limit, offset, callback) {
  pool.query('SELECT SQL_CALC_FOUND_ROWS * FROM film LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
    if (err) return callback(err, null);

    pool.query('SELECT FOUND_ROWS() AS count', (err2, countResults) => {
      if (err2) return callback(err2, null);
      const totalMovies = countResults[0].count;
      callback(null, { movies: results, totalMovies });
    });
  });
}

function findMovieById(id, callback) {
  pool.query('SELECT * FROM film WHERE film_id = ?', [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(null, null); // geen film gevonden
    }
    callback(null, results[0]); // eerste resultaat teruggeven
  });
}


module.exports = { getMoviesPaginated, findMovieById };