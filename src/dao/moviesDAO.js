const pool = require('../config/db');

function getMoviesPaginated(limit, offset, searchQuery, selectedGenre, callback) {
  let moviesQuery = 'SELECT SQL_CALC_FOUND_ROWS DISTINCT f.*, c.name AS category_name FROM film f';
  let whereClauses = [];
  const params = [];

  // JOIN om de categorie te kunnen filteren
  moviesQuery += ' LEFT JOIN film_category fc ON f.film_id = fc.film_id';
  moviesQuery += ' LEFT JOIN category c ON fc.category_id = c.category_id';

  // Voeg een WHERE-clausule toe als er een zoekterm is
  if (searchQuery) {
    whereClauses.push('f.title LIKE ?');
    params.push(`%${searchQuery}%`);
  }

  // Voeg een WHERE-clausule toe als er een genre is geselecteerd
  if (selectedGenre) {
    whereClauses.push('fc.category_id = ?');
    params.push(selectedGenre);
  }

  // Combineer de WHERE-clausules
  if (whereClauses.length > 0) {
    moviesQuery += ' WHERE ' + whereClauses.join(' AND ');
  }

  // Voeg LIMIT en OFFSET toe voor paginatie
  moviesQuery += ' ORDER BY f.title ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  // Voer de hoofdquery uit
  pool.query(moviesQuery, params, (err, results) => {
    if (err) return callback(err, null);

    // Haal het totale aantal films op (met of zonder filters)
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
      return callback(null, null);
    }
    callback(null, results[0]);
  });
}

module.exports = { getMoviesPaginated, findMovieById };