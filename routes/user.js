const router = require('express').Router();
const ObjectId = require('mongoose').Schema.ObjectId;
const userRoute = function (User, Comment) {
  router.get('/:username', function (req, res) {
    let username = req.params.username;
    User.findOne({
      'local.username': username
    }).select('local.username karma about threads comments createdAt').exec(function (err, user) {
      if (user && !err) {
        let thisuser = false;
        if (req.user)
          if (req.user.local.username == user.local.username)
            thisuser = true;
        res.render('user', {
          user: user,
          authenticated: req.isAuthenticated(),
          cUsername: req.user?req.user.local.username:'',
          thisuser: thisuser,
          currUser: req.user ? req.user : ''
        });
      } 
      else
        res.render('404');
    });
  });
  
  router.get('/:username/comments', function (req, res) {
    User.findOne({
      'local.username':req.params.username
    }).
    select('_id comments').
    populate({
      path: 'comments',
      populate: {
         path: 'thread author',
         select: 'title local.username'
      }      
    }).sort('-createdAt').
    exec(function(err,user){
      if(err || !user) {
        return res.render('404');
      }
      res.render('comment', {
        authenticated: req.isAuthenticated(),
        comments: user.comments,
        user: req.user ? req.user : '',
        pageno: 1
      });  
    });
  });
  
  router.get('/:username/threads', function (req, res) {
    User.findOne({
      'local.username':req.params.username
    }).
    select('_id threads').
    populate({
      path: 'threads',
      populate: {
         path: 'author',
         select: 'role local.username'
      }      
    }).sort('-createdAt').
    exec(function(err,user){
      if(err || !user) {
        return res.render('404');
      }
      res.render('index', {
        authenticated: req.isAuthenticated(),
        posts: user.threads,
        user: req.user ? req.user : '',
        pageno: 1
      });  
    });
  });
  return router;
};
module.exports = userRoute;