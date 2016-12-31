const router = require('express').Router();
const adminRoute = function (Comment, Thread) {
  router.post('/markremoved', function (req, res) {
    if(req.isAuthenticated() && req.user.role == 'admin') {
      let type = req.body.type;
      let itemId = req.body.itemId;
      if(type == 'thread'){
        Thread.update({_id: itemId}, {status: 'removed'}, function(err, raw) {
          if(err)
            return res.sendStatus(500);
          return res.sendStatus(200);
        });
      } 
      else if(type == 'comment') {
        Comment.update({_id: itemId}, {status: 'removed'}, function(err, raw) {
          if(err)
            return res.sendStatus(500);
          return res.sendStatus(200);
        });
      }
    }
    else
      res.sendStatus(404);
  });
  
  router.post('/unmarkremoved', function (req, res) {
    if(req.isAuthenticated() && req.user.role == 'admin') {
      let type = req.body.type;
      let itemId = req.body.itemId;
      if(type == 'thread'){
        Thread.update({_id: itemId}, {status: 'active'}, function(err, raw) {
          if(err)
            return res.sendStatus(500);
          return res.sendStatus(200);
        });
      } 
      else if(type == 'comment') {
        Comment.update({_id: itemId}, {status: 'active'}, function(err, raw) {
          if(err)
            return res.sendStatus(500);
          return res.sendStatus(200);
        });
      }
    }
    else
      res.sendStatus(404);
  });
  
  router.get('/removedcomments', function(req, res) {
    if(req.isAuthenticated() && req.user.role == 'admin') {
      let page = Number(req.query.page) || 1;
      let skip = Number.isInteger(page)? (page-1) * 30 : 0;
      let currPage = skip!=0 ? page : 1; 
      Comment.find({status:'removed'}).
      limit(30).
      skip(skip).
      select('author thread text createdAt upvoteCount downvoteCount upvotes downvotes status').
      populate('thread').
      populate('author').
      sort('-updatedAt').
      exec(function (err, comments) {
        res.render('comment', {
          authenticated: req.isAuthenticated(),
          comments: comments,
          user: req.user ? req.user : '',
          page: 'removedcomments',
          pageno: currPage
        });
      });
    }
    else
      res.render('404');
  });
  
  router.get('/removedthreads', function(req, res) {
    if(req.isAuthenticated() && req.user.role == 'admin') {
      let page = Number(req.query.page) || 1;
      let skip = Number.isInteger(page)? (page-1) * 30 : 0;
      let currPage = skip!=0 ? page : 1; 
      let query = Thread.find({
        status: 'removed'
      }).
      populate('author').
      sort('-updatedAt').
      skip(skip).
      limit(30);
      query.exec((err, posts) => {
        if (err) return res.end(500);
        res.render('index', {
          authenticated: req.isAuthenticated(),
          user: req.user ? req.user : '',
          posts: posts,
          page: 'removedthreads',
          pageno: currPage
        });
      });
    }
    else
      res.render('404');
  });
  
  return router;
};
module.exports = adminRoute;