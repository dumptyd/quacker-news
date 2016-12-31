const router = require('express').Router();
const loginRoute = function (passport) {
  router.get('/', function (req, res) {
    let msg = req.flash('message');
    //console.log(msg);
    res.render('login', {
      message: msg
    });
  });
  
  router.post('/', passport.authenticate('local-login', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));
  return router;
};
module.exports = loginRoute;