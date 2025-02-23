const Listing = require('../models/listing');
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;  // Save the URL of the page the user was trying to access before being redirected to the login page.
      req.flash('error', 'You must be logged in to create a listing');
      return res.redirect('/login');
    }
    next();
  };
  
  module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing.owner.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/listings/${id}`);
    }
    next();
  };
  module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
      res.locals.redirectUrl = req.session.redirectUrl;
    } else {
      res.locals.redirectUrl = '/listings'; // Default redirect URL if none is saved
    }
    next();
  };