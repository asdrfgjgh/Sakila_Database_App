const pool = require('../config/db');

function getMoviesPaginated(limit, offset, searchQuery, callback) {
  let moviesQuery = 'SELECT SQL_CALC_FOUND_ROWS * FROM film';
  const params = [];

  // Voeg een WHERE-clausule toe als er een zoekterm is
  if (searchQuery) {
    moviesQuery += ' WHERE title LIKE ?';
    params.push(`%${searchQuery}%`);
  }

  // Voeg LIMIT en OFFSET toe voor paginatie
  moviesQuery += ' ORDER BY title ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  // Voer de hoofdquery uit
  pool.query(moviesQuery, params, (err, results) => {
    if (err) return callback(err, null);

    // Haal het totale aantal films op (met of zonder zoekfilter)
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
      return callback(null, null); // Geen film gevonden
    }
    callback(null, results[0]); // Eerste resultaat teruggeven
  });
}

module.exports = { getMoviesPaginated, findMovieById };