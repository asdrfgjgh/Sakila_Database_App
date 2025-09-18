// src/controllers/movie.controller.js

const moviesDAO = require("../dao/moviesDAO");
const categoriesDAO = require("../dao/categoriesDAO");

function getAllMovies(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  const searchQuery = req.query.search || '';
  const selectedGenre = req.query.genre || '';

  categoriesDAO.getAllCategories((err, genres) => {
    if (err) return next(err);

    // Controleer of de aanroep van getMoviesPaginated correct is
    moviesDAO.getMoviesPaginated(limit, offset, searchQuery, selectedGenre, (err, data) => {
      if (err) return next(err);

      const totalPages = Math.ceil(data.totalMovies / limit);
      
      const pagesToShow = [];
      const maxPagesToShow = 3;
      const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      for (let i = startPage; i <= endPage; i++) {
        pagesToShow.push(i);
      }

      const model = {
        title: "Movielist",
        movies: data.movies,
        genres: genres,
        selectedGenre: selectedGenre,
        currentPage: page,
        totalPages,
        pagesToShow,
        searchQuery,
        hasPrevious: page > 1,
        hasNext: page < totalPages,
      };

      res.render("films/movies", model);
    });
  });
}

function getMovieById(req, res, next) {
  const movieId = req.params.id;
  moviesDAO.findMovieById(movieId, (err, movie) => {
    if (err) {
      return next(err);
    }
    if (!movie) {
      return res.status(404).send("Film niet gevonden");
    }
    const model = {
      title: movie.title,
      movie
    };
    res.render("films/detail", model);
  });
}

module.exports = { getAllMovies, getMovieById };