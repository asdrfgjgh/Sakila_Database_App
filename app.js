const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("./src/util/logger");
const session = require("express-session"); 
const flash = require('connect-flash'); 
const favoritesRouter = require('./src/routes/favorites.routes');

const indexRouter = require("./src/routes/index");
const usersRouter = require("./src/routes/profile.routes");
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

// Configure and use session middleware FIRST
app.use(session({
    secret: 'your_secret_key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Add flash middleware AFTER the session middleware
app.use(flash()); 

// Middleware to make variables available to all views
app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.userId;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Your routes
app.use("/", indexRouter);
app.use("/profile", usersRouter);
app.use("/movies", movieRouter);
app.use("/about", aboutRouter);
app.use("/auth", authRouter);
app.use("/favorites", favoritesRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;