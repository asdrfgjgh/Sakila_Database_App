const express = require('express');
const router = express.Router();

const mw = require("../middleware/auth.js");
const userController = require("../controllers/user.controller");
router.get("/user/:id/", mw.authenicate, userController.getUser);
console.log("user routes loaded");
module.exports = router;
