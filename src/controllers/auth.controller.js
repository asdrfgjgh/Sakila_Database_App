// controllers/auth.controller.js

const authService = require('../services/auth.services');


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


const postLogin = (req, res) => {
    const { email, password } = req.body;

    // We roepen de Service aan en gebruiken de Promise-keten (.then().catch())
    authService.findUserAndComparePassword(email, password)
        .then(user => {
            if (user) {
                // Login succesvol
                req.session.userId = user.customer_id;
                console.log(`User with email '${email}' has successfully logged in. Session ID: ${req.session.userId}`);
                // req.flash('success_msg', 'You have successfully logged in!'); 
                
                return res.redirect('/movies');
            } else {
                // Geen gebruiker gevonden of wachtwoord komt niet overeen
                return res.status(401).render('login', {
                    title: 'Log In',
                    error: 'Incorrect email address or password.'
                });
            }
        })
        .catch(error => {
            // Afhandeling van technische fouten (Database/Serverfouten)
            console.error('Login fout:', error.message);
            return res.status(500).render('login', {
                title: 'Log In',
                error: 'Internal server error.'
            });
        });
};

const postRegister = (req, res) => {
    const { first_name, last_name, email, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
        return res.status(400).render('register', {
            title: 'Register',
            error: 'Passwords do not match.'
        });
    }
    
    // We roepen de Service aan en gebruiken de Promise-keten (.then().catch())
    authService.registerNewUser({ first_name, last_name, email, password })
        .then(() => {
            // Registratie succesvol
            // req.flash('success_msg', 'Registration successful! You can now log in.'); 
            res.redirect('/auth/login');
        })
        .catch(error => {
            console.error('Registratie fout:', error.message);
            
            let errorMessage = 'Internal server error.';
            let statusCode = 500;

            // Afhandeling van bedrijfsfout (E-mail bestaat al)
            if (error.message === 'This email address is already in use.') {
                errorMessage = error.message;
                statusCode = 409; // Conflict
            }

            return res.status(statusCode).render('register', {
                title: 'Register',
                error: errorMessage
            });
        });
};

module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    getLogout
};