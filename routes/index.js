const router = require('express').Router();

const indexRoute = function (Thread) {
  router.get('/', function (req, res) {
    let query = Thread.find({
      type: 'link'
    }).populate('author').sort('-upvoteCount').limit(30);
    query.exec((err, posts) => {
      if (err) return res.end(500);
      let username;
      if (req.user) username = req.user.local.username;
      res.render('index', {
        authenticated: req.isAuthenticated(),
        user: username,
        posts: posts
      });
    });
  });
  return router;
};
module.exports = indexRoute;