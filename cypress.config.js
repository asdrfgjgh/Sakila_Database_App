const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Stel de URL in waarop je app lokaal draait
    baseUrl: 'http://localhost:3000', 
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});