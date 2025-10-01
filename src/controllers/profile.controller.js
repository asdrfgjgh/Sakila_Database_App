// src/controllers/profile.controller.js

const profileService = require('../services/profile.services');

function getProfile(req, res, next) {
    const customerId = req.session.userId;

    profileService.getProfileById(customerId, (err, user) => {
        if (err) {
            if (err.message === 'User not found') {
                return res.status(404).render('error', { message: 'User not found.' });
            }
            return res.status(500).render('error', { message: 'Internal Server Error' });
        }

        // Render the view with the fetched data
        res.render('profile', { title: 'My Profile', user: user });
    });
}

/**
 * Controller function to display the profile edit form.
 * This is the function that was missing!
 */
function getEditProfile(req, res, next) {
    const customerId = req.session.userId;

    profileService.getProfileById(customerId, (err, user) => {
        if (err) {
            // Error handling
            if (err.message === 'User not found') {
                return res.status(404).render('error', { message: 'User not found.' });
            }
            return res.status(500).render('error', { message: 'Internal Server Error' });
        }
        
        // Render the 'profile_edit.pug' view
        res.render('profile_edit', { 
            title: 'Edit Profile', 
            user: user // Pass the current data as initial values
        });
    });
}


/**
 * Controller function to update a profile. (Existing function)
 */
function updateProfile(req, res, next) {
    const customerId = req.session.userId;
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
        // On error: render the edit page again with an error message and the input data
        return res.status(400).render('profile_edit', { 
            title: 'Edit Profile', 
            error: 'All fields (First Name, Last Name, Email) are required.',
            user: { first_name: firstName, last_name: lastName, email: email } 
        });
    }

    profileService.updateProfileData(customerId, firstName, lastName, email, (err, result) => {
        if (err) {
            let errorMessage = 'Error updating the profile.';
            if (err.message === 'Email already in use') {
                 errorMessage = 'This email address is already in use.';
            } else if (err.message === 'User not found') {
                return res.status(404).render('error', { message: 'User not found to update.' });
            }

            // On error: render the edit page again with an error message
            return res.status(500).render('profile_edit', { 
                title: 'Edit Profile', 
                error: errorMessage,
                user: { first_name: firstName, last_name: lastName, email: email }
            });
        }

        // Success!
        req.session.successMessage = 'Your profile has been successfully updated!';
        res.redirect('/profile'); 
    });
}


module.exports = {
    getProfile,
    updateProfile,
    // This was the missing piece that caused the 404!
    getEditProfile 
};