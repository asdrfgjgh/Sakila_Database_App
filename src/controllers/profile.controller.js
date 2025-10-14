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

        res.render('profile', { title: 'My Profile', user: user });
    });
}

function getEditProfile(req, res, next) {
    const customerId = req.session.userId;

    profileService.getProfileById(customerId, (err, user) => {
        if (err) {
            if (err.message === 'User not found') {
                return res.status(404).render('error', { message: 'User not found.' });
            }
            return res.status(500).render('error', { message: 'Internal Server Error' });
        }
        
        // Render de 'profile_edit.pug' view. User bevat nu address_id, city_id, etc.
        res.render('profile_edit', { 
            title: 'Edit Profile', 
            user: user 
        });
    });
}


/**
 * Controller function to update a profile and address. 
 * Haalt alle velden uit req.body en geeft ze gebundeld door aan de Service.
 */
function updateProfile(req, res, next) {
    const customerId = req.session.userId;
    
    // 1. Haal ALLE 9 benodigde velden uit req.body (moeten overeenkomen met de formuliernamen)
    const { 
        firstName, lastName, email, 
        address, district, cityId, postalCode, phone, 
        addressId // Dit is het verborgen veld uit profile_edit.pug
    } = req.body; 

    // 2. Eenvoudige validatie voor essentiële velden
    if (!firstName || !lastName || !email || !address || !cityId || !addressId) {
        // Gebruik de ingevoerde data van req.body om het formulier opnieuw te vullen bij een fout
        return res.status(400).render('profile_edit', { 
            title: 'Edit Profile', 
            error: 'All fields must be filled out, including address details.',
            user: req.body // Gebruik req.body voor de foute invoer
        });
    }

    // 3. Bundel de data in één object voor de Service
    const updateData = {
        firstName, lastName, email,
        address, 
        district: district || null, // Sta district optioneel toe indien niet vereist in DB
        cityId: parseInt(cityId), 
        postalCode, phone,
        addressId: parseInt(addressId)
    };

    // 4. Roep de Service aan met het gebundelde data-object
    profileService.updateProfileData(customerId, updateData, (err, result) => {
        if (err) {
            let errorMessage = 'Error updating the profile.';
            if (err.message === 'Email already in use') {
                errorMessage = 'This email address is already in use.';
            } else if (err.message === 'User not found') {
                return res.status(404).render('error', { message: 'User not found to update.' });
            }

            // On error: render de edit page opnieuw met de foutboodschap en de ingevoerde data
            return res.status(500).render('profile_edit', { 
                title: 'Edit Profile', 
                error: errorMessage,
                user: req.body // Geef de oorspronkelijke foute input terug
            });
        }

        // Success!
        req.session.successMessage = 'Your profile and address have been successfully updated!';
        res.redirect('/profile'); 
    });
}


module.exports = {
    getProfile,
    updateProfile,
    getEditProfile 
};