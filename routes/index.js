const router = require('express').Router();

const indexRoute = function (Thread) {
  router.get('/', function (req, res) {
    let page = Number(req.query.page) || 1;
    let skip = Number.isInteger(page)? (page-1) * 30 : 0;
    let currPage = skip!=0 ? page : 1; 
    let query = Thread.find({
      type: 'link',
      status: 'active'
    }).populate('author').sort('-upvoteCount').sort('-createdAt').skip(skip).limit(30);
    query.exec((err, posts) => {
      if (err) return res.end(500);
      res.render('index', {
        authenticated: req.isAuthenticated(),
        user: req.user ? req.user : '',
        posts: posts,
        page: '/',
        pageno: currPage
      });
    });
  });
  return router;
};
module.exports = indexRoute;