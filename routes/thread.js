const router = require('express').Router();
const threadRoute = function (Thread, Comment, User) {
  router.get('/:id', function (req, res) {
    let id = req.params.id;
    Thread.findOne({
      _id: id
    }).populate('author').populate({
      path: 'comments',
      populate: {
        path: 'author',
        model: 'Users'
      }
    }).exec((err, thread) => {
      if(err) {
        console.log(err);
        res.redirect('/');
      }
      else {
        thread.comments.sort( (a,b) => (b.upvoteCount - b.downvoteCount) - (a.upvoteCount - a.downvoteCount) );
        res.render('thread', {
          authenticated: req.isAuthenticated(),
          thread: thread,
          user: req.user ? req.user : ''
        });
      }
    });
  });
  
  router.post('/:id', function (req, res) {
    let id = req.params.id;
    let text = req.body.text;
    if (!req.isAuthenticated()) {
      req.flash('message', 'You need to be logged in.');
      return res.redirect('/login');
    }
    if (!text) {
      return res.redirect('/thread/' + id);
    }
    let comment = new Comment({
      author: req.user._id,
      thread: id,
      text: text
    });
    Thread.findOne({
      _id: id
    }, (err, thread) => {
      if (thread && !err) {
        comment.save((err, com) => {
          thread.comments.push(com._id);
          thread.save((err, doc) => {
            req.user.comments.push(com._id);
            req.user.save();
            res.redirect('/thread/' + id);
          });
        });
      }
      else {
        res.redirect('/');
      }
    });
  });
  return router;
};
module.exports = threadRoute;