const router = require('express').Router();
const signupRoute = function (passport) {  
  router.post('/', passport.authenticate('local-signup', {
    successRedirect: '/login',
    failureRedirect: '/login',
    failureFlash: true
  }));
  return router;
};
module.exports = signupRoute;