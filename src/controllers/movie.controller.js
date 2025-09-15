const moviesDAO = require("../dao/moviesDAO");

function getAllMovies(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = 50; // number of movies per page
  const offset = (page - 1) * limit;

  moviesDAO.getMoviesPaginated(limit, offset, (err, data) => {
    if (err) return next(err);

    const totalPages = Math.ceil(data.totalMovies / limit);
    
    // Logic to create an array of pages to display
    const pagesToShow = [];
    const maxPagesToShow = 3; // The maximum number of page links to show
    const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(i);
    }

    const model = {
      title: "Movielist",
      movies: data.movies,
      currentPage: page,
      totalPages,
      pagesToShow, // Add the new array of page numbers
      hasPrevious: page > 1,
      hasNext: page < totalPages,
    };

    res.render("films/movies", model);
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