const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const { saveRedirectUrl } = require("../utils/middleware");

const userController = require("../controllers/user.js");

router
.route("/signup")
.get(userController.rendersignupform)
.post(userController.signup);

router
.route("/login")
.get(userController.renderloginform)
.post(
  saveRedirectUrl,  // Save the URL of the page the user was trying to access before being redirected to the login page.  // Save the URL of the page the user was trying to access before being redirected to the login page.  // Save the URL of the page the user was trying to access before being redirected to the login page.   // Save the URL of the page the user was trying to access before being redirected to the login page.   // Save the URL of the
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  userController.login
);


router.get("/logout", userController.logout);
module.exports = router;
