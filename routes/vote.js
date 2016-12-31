const router = require('express').Router();
const commentsRoute = function (isLoggedIn, Comment, User, Thread) {
  router.post('/', isLoggedIn, function (req, res) {
    if(!(req.body.on && req.body.type &&req.body.itemId)){
      return res.status(500).end();
    }
    let cUserId = req.user._id;
    if(req.body.on=='comment'){
      Comment.findOne({_id:req.body.itemId}, function(err, comment) {
        if(err||!comment){
          console.log(err);
          return res.status(500).end();
        }
        let upvoted = comment.upvotes.findIndex(function(element){
          return cUserId.equals(element);
        }); 
        let downvoted = comment.downvotes.findIndex(function(element){
          return cUserId.equals(element);
        });
        if(req.body.type=='upvote') {
          if(upvoted>=0) { //if already upvoted, then unvote
            comment.upvotes.splice(comment.upvotes.indexOf(cUserId),1);
            comment.upvoteCount = comment.upvoteCount - 1; 
            comment.save();
            User.update({_id:comment.author}, {$inc: { karma: -1 }}, function(err, changed){ 
              return res.status(200).end();
            });
          }
          else { //not upvoted, so upvote
            let incBy = 1;
            comment.upvotes.push(cUserId);
            comment.upvoteCount = comment.upvoteCount + 1; 
            if(downvoted>=0){
              comment.downvotes.splice(comment.downvotes.indexOf(cUserId),1);
              comment.downvoteCount = comment.downvoteCount - 1;
              incBy++;
            }
            comment.save();
            User.update({_id:comment.author}, {$inc: { karma: incBy }}, function(err, changed){  
              return res.status(200).end();
            });
          }
        }
        else if(req.body.type=='downvote') {
          if(downvoted>=0) { //if already downvoted, then unvote
            comment.downvotes.splice(comment.downvotes.indexOf(cUserId),1);
            comment.downvoteCount = comment.downvoteCount - 1;
            comment.save();
            User.update({_id:comment.author}, {$inc: { karma: 1 }}, function(err, changed){
              return res.status(200).end();
            });
          }
          else { // not downvoted, so downvote
            let decBy = -1;
            comment.downvotes.push(cUserId);
            comment.downvoteCount = comment.downvoteCount + 1;
            if(upvoted>=0){
              comment.upvotes.splice(comment.upvotes.indexOf(cUserId),1);
              comment.upvoteCount = comment.upvoteCount - 1;
              decBy--;
            }
            comment.save();
            User.update({_id:comment.author}, {$inc: { karma: decBy }}, function(err, changed){
              return res.status(200).end();
            });
          }
        }
      });
    }
    else if(req.body.on=='thread'){
      Thread.findOne({_id:req.body.itemId}, function(err, thread) {
        if(err||!thread){
          console.log(err);
          return res.status(500).end();
        }
        let upvoted = thread.upvotes.findIndex(function(element){
          return cUserId.equals(element);
        }); 
        if(req.body.type=='upvote') {
          if(upvoted>=0) { //if already upvoted, then unvote
            thread.upvotes.splice(thread.upvotes.indexOf(cUserId),1);
            thread.upvoteCount = thread.upvoteCount - 1; 
            thread.save();
            User.update({_id:thread.author}, {$inc: { karma: -1 }}, function(err, changed){ 
              return res.status(200).end();
            });
          }
          else { //not upvoted, so upvote
            thread.upvotes.push(cUserId);
            thread.upvoteCount = thread.upvoteCount + 1; 
            thread.save();
            User.update({_id:thread.author}, {$inc: { karma: 1 }}, function(err, changed){  
              return res.status(200).end();
            });
          }
        }
      });
    }
  });
  return router;
};
module.exports = commentsRoute;