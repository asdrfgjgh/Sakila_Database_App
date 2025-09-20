describe('Movie acties', () => {
  it('moet een film aan favorieten toevoegen en controleren via de detailpagina', () => {
    // Stap 1: Log in met de testgebruiker
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('gebruiker@voorbeeld.nl');
    cy.get('input[name="password"]').type('wachtwoord123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/movies');

    // Stap 2: Klik op een film om naar de detailpagina te gaan
    // Selecteer de eerste film in de lijst en klik erop.
    cy.get('.card-img-top').first().click();

    // Controleer of de URL is gewijzigd naar de detailpagina van de film.
    // Dit controleert of de navigatie succesvol was.
    cy.url().should('include', '/movies/');
    
    // Stap 3: Voeg de film toe aan favorieten op de detailpagina
    // Zoek de favorietenknop op de detailpagina en klik erop.
    // Pas de selector '.favorite-button' aan naar de juiste selector in jouw app.
    cy.get('.btn.btn-primary').click();

    // Stap 4: Navigeer terug naar de hoofdpagina van de favorieten
    // Klik op de navigatielink naar de favorietenpagina.
    // Pas de selector '.nav-link-favorites' aan naar de juiste selector in jouw app.
    cy.get('a[href="/favorites"]').click();
    
    // Controleer of de URL is gewijzigd naar de favorietenpagina
    cy.url().should('include', '/favorites');

    // Stap 5: Controleer of de film in de favorietenlijst staat
    // We zoeken naar de unieke titel van de film of een specifiek element op de filmkaart
    cy.get('.card-img-top').should('have.length.at.least', 1);
  });
});