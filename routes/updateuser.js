const router = require('express').Router();
const updateuserRoute = function (User) {
  router.post('/', function (req, res) {
    //console.log('hue',req.body.about);
    if (typeof req.body.about === 'undefined' || !req.isAuthenticated()) {
      if (req.user) return res.redirect('/user/' + req.user.local.username);
      else return res.redirect('/');
    }
    let about = req.body.about;
    User.findOne({
      '_id': req.user._id
    }).select('about').exec(function (err, user) {
      if (user) {
        user.about = about;
        user.save(function (err, doc) {
          return res.redirect('/user/' + req.user.local.username);
        });
      }
      else res.redirect('/user/' + req.user.local.username);
    });
  });
  return router;
};
module.exports = updateuserRoute;