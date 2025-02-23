
const User = require('../models/user');

module.exports.renderloginform =(req, res) => {
    res.render('users/login.ejs');
  };
module.exports.rendersignupform = (req, res) => {
    res.render("users/signup.ejs");
  };

module.exports.signup= async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.flash('success', 'Welcome to Wanderlust');
        res.redirect('/listings');
      } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
      }
};

module.exports.login = (req, res) => {
    // Clear any previous flash messages before setting a new one
    req.flash('error', '');  // This ensures any lingering error messages are removed

    req.flash('success', 'Welcome back!');
    
    const redirectUrl = req.session.redirectUrl || '/listings';
    delete req.session.redirectUrl;
    
    res.redirect(redirectUrl);
};

module.exports.logout =  (req, res) => {
    req.logout((err) => {
        if (err) {
          return next(err);
        }
        req.flash('success', 'You have logged out successfully!');
        res.redirect('/listings');
      });
  };