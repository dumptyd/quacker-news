var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');
module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
  passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true
  }, function (req, username, password, done) {
    if (username === '' || password === '') return done(null, false, req.flash('message', 'Username and password can\'t be empty.'));
    User.findOne({
      'local.username': username
    }, function (err, user) {
      if (err) return done(err);
      if (user) {
        return done(null, false, req.flash('message', 'That username is already taken.'));
      }
      else {
        var newUser = new User();
        newUser.local.username = username;
        newUser.local.password = newUser.generateHash(password);
        newUser.save(function (err) {
          if (err) throw err;
          return done(null, newUser, req.flash('message','Signed up successfully. You can now login.'));
        });
      }
    });
  }));
  passport.use('local-login', new LocalStrategy({
    passReqToCallback: true
  }, function (req, username, password, done) {
    User.findOne({
      'local.username': username
    }, function (err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, req.flash('message', 'No user found.'));
      if (!user.validPassword(password)) return done(null, false, req.flash('message', 'Oops! Wrong password.'));
      return done(null, user);
    });
  }));
};