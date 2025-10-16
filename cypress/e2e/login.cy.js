describe('Inloggen', () => {
    it('moet een gebruiker succesvol inloggen', () => {
        // Bezoek de inlogpagina van je app
        cy.visit('/auth/login');

        // Typ het e-mailadres en wachtwoord in
        cy.get('input[name="email"]').type('gebruiker@voorbeeld.nl');
        cy.get('input[name="password"]').type('wachtwoord123');

        // Klik op de inlogknop
        cy.get('button[type="submit"]').click();

        // Controleer of de gebruiker is doorgestuurd naar de homepagina
        cy.url().should('include', '/movies');
    });
});


describe('Registratie', () => {
    it('moet een foutmelding tonen als het e-mailadres al in gebruik is', () => {
        // Bezoek de registratiepagina
        cy.visit('/auth/register');

        // --- ACCOUNT DETAILS ---
        cy.get('input[name="first_name"]').type('Nieuwe');
        cy.get('input[name="last_name"]').type('Gebruiker');
        cy.get('input[name="email"]').type('gebruiker@voorbeeld.nl'); // Bestaand e-mailadres
        cy.get('input[name="password"]').type('wachtwoord123');
        cy.get('input[name="passwordConfirm"]').type('wachtwoord123');

        // --- ADRES DETAILS (EXTRA PARAMETERS) ---
        // Namen zijn overgenomen uit de register.pug (address, district, city_id, postal_code, phone)
        cy.get('input[name="address"]').type('Teststraat 10');
        cy.get('input[name="district"]').type('Noord-Holland');
        // Vul een geldige city_id in uit de database (bijv. 300)
        cy.get('select[name="city_id"]').select('600'); 
        cy.get('input[name="postal_code"]').type('1234 AB');
        cy.get('input[name="phone"]').type('0612345678');

        // Klik op de registratieknop
        cy.get('button[type="submit"]').click();

        // Controleer of de foutmelding voor een bestaand e-mailadres wordt weergegeven
        cy.get('.alert.alert-danger').should('contain', 'This email address is already in use.');
    });
});

describe('Registratie', () => {
    it('moet een foutmelding tonen als de wachtwoorden niet overeenkomen', () => {
        // Bezoek de registratiepagina
        cy.visit('/auth/register');

        // --- ACCOUNT DETAILS ---
        cy.get('input[name="first_name"]').type('Nieuwe');
        cy.get('input[name="last_name"]').type('Gebruiker');
        cy.get('input[name="email"]').type('unieke_gebruiker_' + Date.now() + '@voorbeeld.nl'); // Uniek e-mailadres
        
        // Vul verschillende wachtwoorden in
        cy.get('input[name="password"]').type('wachtwoord123');
        cy.get('input[name="passwordConfirm"]').type('wachtwoord321'); // Wachtwoorden komen NIET overeen

        // --- ADRES DETAILS (EXTRA PARAMETERS) ---
        cy.get('input[name="address"]').type('Teststraat 10');
        cy.get('input[name="district"]').type('Noord-Holland');
        cy.get('select[name="city_id"]').select('600'); 
        cy.get('input[name="postal_code"]').type('1234 AB');
        cy.get('input[name="phone"]').type('0612345678');

        // Klik op de registratieknop
        cy.get('button[type="submit"]').click();

        // Controleer of de foutmelding voor niet-overeenkomende wachtwoorden wordt weergegeven
        cy.get('.alert.alert-danger').should('contain', 'Passwords do not match.');
    });
});



describe('Inloggen', () => {
    it('moet een foutmelding tonen bij onjuist wachtwoord', () => {
        // Bezoek de inlogpagina
        cy.visit('/auth/login');

        // Vul het correcte e-mailadres in
        cy.get('input[name="email"]').type('bestaande_gebruiker@voorbeeld.nl');
        
        // Vul een onjuist wachtwoord in
        cy.get('input[name="password"]').type('verkeerd_wachtwoord');

        // Klik op de inlogknop
        cy.get('button[type="submit"]').click();

        // Controleer of de foutmelding wordt getoond
        cy.get('.alert.alert-danger').should('contain', 'Incorrect email address or password.');
    });
});

describe('Inloggen', () => {
    it('moet een foutmelding tonen als de gebruiker niet bestaat', () => {
        // Bezoek de inlogpagina
        cy.visit('/auth/login');

        // Vul een e-mailadres in dat niet in de database staat
        cy.get('input[name="email"]').type('niet_bestaand@voorbeeld.nl');
        
        // Vul een willekeurig wachtwoord in
        cy.get('input[name="password"]').type('wachtwoord123');

        // Klik op de inlogknop
        cy.get('button[type="submit"]').click();

        // Controleer of de foutmelding wordt getoond
        cy.get('.alert.alert-danger').should('contain', 'Incorrect email address or password.');
    });
});