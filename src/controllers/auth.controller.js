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
    // Haal alle benodigde velden op, inclusief de adresgegevens
    const { 
        first_name, last_name, email, password, passwordConfirm, 
        address, district, city_id, postal_code, phone 
    } = req.body;

    // --- Validatie: Wachtwoorden ---
    if (password !== passwordConfirm) {
        return res.status(400).render('register', {
            title: 'Register',
            error: 'Passwords do not match.',
            // Optioneel: geef ingevoerde velden terug aan de view
        });
    }
    
    // --- Data voor de Service ---
    const registrationData = {
        first_name, last_name, email, password, 
        address, district, city_id: parseInt(city_id), postal_code, phone 
    };
    
    // We roepen de Service aan en gebruiken de Promise-keten (.then().catch())
    authService.registerNewUser(registrationData)
        .then(() => {
            // Registratie succesvol
            // req.flash('success_msg', 'Registration successful! You can now log in.'); 
            res.redirect('/auth/login');
        })
        .catch(error => {
            console.error('Registratie fout:', error.message);
            
            let errorMessage = 'Internal server error during registration.';
            let statusCode = 500;

            // Afhandeling van bedrijfsfout (E-mail bestaat al)
            if (error.message === 'This email address is already in use.') {
                errorMessage = error.message;
                statusCode = 409; // Conflict
            }
            
            // Afhandeling van de transactiefout (van de DAO)
            if (error.message.includes('transaction failed') || error.message.includes('Database Query Error')) {
                 errorMessage = 'Registration failed due to a database error.';
                 statusCode = 500;
            }

            return res.status(statusCode).render('register', {
                title: 'Register',
                error: errorMessage
                // Optioneel: geef ingevoerde velden terug aan de view, behalve het wachtwoord
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