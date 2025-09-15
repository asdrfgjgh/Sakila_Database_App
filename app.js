const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("./src/util/logger");
const session = require("express-session"); // Importeer de sessie-middleware
const favoritesRouter = require('./src/routes/favorites.routes');

const indexRouter = require("./src/routes/index");
const usersRouter = require("./src/routes/users.routes");
const movieRouter = require("./src/routes/movie.routes");
const aboutRouter = require("./src/routes/about.routes");
const authRouter = require("./src/routes/auth.routes");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configureer en gebruik de sessie-middleware VOOR de routes
app.use(session({
    secret: 'jouw_geheime_sleutel', // Vervang dit door een lange, willekeurige string
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Gebruik 'true' in productie met HTTPS
}));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/movies", movieRouter);
app.use("/about", aboutRouter);
app.use("/auth", authRouter);
app.use("/favorites", favoritesRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;