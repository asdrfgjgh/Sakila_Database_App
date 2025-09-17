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

    // Vul een e-mailadres in dat al bestaat in de database
    cy.get('input[name="email"]').type('gebruiker@voorbeeld.nl');
    cy.get('input[name="password"]').type('wachtwoord123');
    cy.get('input[name="passwordConfirm"]').type('wachtwoord123');

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

    // Vul een e-mailadres in
    cy.get('input[name="email"]').type('nieuwe_gebruiker@voorbeeld.nl');
    
    // Vul verschillende wachtwoorden in
    cy.get('input[name="password"]').type('wachtwoord123');
    cy.get('input[name="passwordConfirm"]').type('wachtwoord321');

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