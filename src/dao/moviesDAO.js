const pool = require('../config/db');

function getMoviesPaginated(limit, offset, searchQuery, selectedGenre, callback) {
  let moviesQuery = 'SELECT SQL_CALC_FOUND_ROWS DISTINCT f.*, c.name AS category_name FROM film f';
  let whereClauses = [];
  const params = [];


  moviesQuery += ' LEFT JOIN film_category fc ON f.film_id = fc.film_id';
  moviesQuery += ' LEFT JOIN category c ON fc.category_id = c.category_id';


  if (searchQuery) {
    whereClauses.push('f.title LIKE ?');
    params.push(`%${searchQuery}%`);
  }


  if (selectedGenre) {
    whereClauses.push('fc.category_id = ?');
    params.push(selectedGenre);
  }


  if (whereClauses.length > 0) {
    moviesQuery += ' WHERE ' + whereClauses.join(' AND ');
  }


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
    const query = `
      SELECT 
        f.*, 
        c.name AS genre_name
      FROM film f
      JOIN film_category fc ON f.film_id = fc.film_id
      JOIN category c ON fc.category_id = c.category_id
      WHERE f.film_id = ?
    `;
    pool.query(query, [id], (err, results) => {
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