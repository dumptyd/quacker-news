const router = require('express').Router();
const askRoute = function (Thread) {
  router.get('/', function (req, res) {
    let page = Number(req.query.page) || 1;
    let skip = Number.isInteger(page)? (page-1) * 30 : 0;
    let currPage = skip!=0 ? page : 1; 
    let query = Thread.find({
      type: 'ask',
      status: 'active'
    }).populate('author').sort('-upvoteCount').sort('-createdAt').limit(30);
    query.exec((err, posts) => {
      if (err) return res.end(500);
      let username;
      if (req.user) username = req.user.local.username;
      res.render('index', {
        authenticated: req.isAuthenticated(),
        user: req.user ? req.user : '',
        posts: posts,
        page: 'ask',
        pageno: currPage
      });
    });
  });
  return router;
};
module.exports = askRoute;