const router = require('express').Router();
const commentsRoute = function (Comment) {
  router.get('/', function (req, res) {
    let page = Number(req.query.page) || 1;
    let skip = Number.isInteger(page)? (page-1) * 30 : 0;
    let currPage = skip!=0 ? page : 1; 
    Comment.find({status:'active'}).
    limit(30).
    skip(skip).
    select('author thread text createdAt upvoteCount downvoteCount upvotes downvotes status').
    populate('thread').
    populate('author').
    sort('-createdAt').
    exec(function (err, comments) {
      res.render('comment', {
        authenticated: req.isAuthenticated(),
        comments: comments,
        user: req.user ? req.user : '',
        page: 'comments',
        pageno: currPage
      });
    });
  });
  return router;
};
module.exports = commentsRoute;