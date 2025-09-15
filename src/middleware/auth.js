function authenicate(req, res, next) {
  // Dummy authenticatie, altijd doorlaten
  console.log("Authenticatie middleware actief");
  next();
}

module.exports = { authenicate };