// controllers/auth.controller.js

const authService = require('../services/auth.services');

// ** GET Views **

const getLogin = (req, res) => {
    res.render('login', { title: 'Log In' });
};

const getRegister = (req, res) => {
    res.render('register', { title: 'Register' });
};

const getLogout = (req, res, next) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.redirect('/');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};

// ** POST Logica **

const postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authService.findUserAndComparePassword(email, password);

        if (user) {
            // Login succesvol
            req.session.userId = user.customer_id;
            console.log(`User with email '${email}' has successfully logged in. Session ID: ${req.session.userId}`);
            req.flash('success_msg', 'You have successfully logged in!');
            // req.flash('success_msg', 'You have successfully logged in!'); // Ga ervan uit dat 'req.flash' beschikbaar is

            return res.redirect('/movies');
        } else {
            // Geen gebruiker gevonden of wachtwoord komt niet overeen
            return res.status(401).render('login', {
                title: 'Log In',
                error: 'Incorrect email address or password.'
            });
        }
    } catch (error) {
        console.error('Login fout:', error.message);
        return res.status(500).render('login', {
            title: 'Log In',
            error: 'Internal server error.'
        });
    }
};

const postRegister = async (req, res) => {
    const { first_name, last_name, email, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
        return res.status(400).render('register', {
            title: 'Register',
            error: 'Passwords do not match.'
        });
    }

    try {
        await authService.registerNewUser({ first_name, last_name, email, password });

        // Registratie succesvol
        // req.flash('success_msg', 'Registration successful! You can now log in.'); // Ga ervan uit dat 'req.flash' beschikbaar is
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registratie fout:', error.message);
        
        let errorMessage = 'Internal server error.';
        let statusCode = 500;

        if (error.message === 'This email address is already in use.') {
            errorMessage = error.message;
            statusCode = 409;
        }

        return res.status(statusCode).render('register', {
            title: 'Register',
            error: errorMessage
        });
    }
};

module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    getLogout
};