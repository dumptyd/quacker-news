const router = require('express').Router();
const MIN_KARMA_TO_POST = 10;
const submitRoute = function (isLoggedIn, Thread, recaptcha) {
  router.get('/', isLoggedIn, function (req, res) {
    let recaptchaHTML = false;
    if(req.user.karma < MIN_KARMA_TO_POST && req.user.role != 'admin') {
      recaptchaHTML = recaptcha.render();
    }
    res.render('submit', {
      message: req.flash('submitmsg'),
      recaptcha: recaptchaHTML
    });
  });
  
  router.post('/', isLoggedIn, function (req, res) {
    recaptcha.verify(req, function (err) {
      if (!err) {
        let title = req.body.title;
        if (title.length) {
          if (req.body.url && req.body.url.length && /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(req.body.url)) { // link/show
            let type = 'link';
            if (title.startsWith('Show QN:')) type = 'show';
            let thread = new Thread({
              author: req.user._id,
              title: title,
              url: req.body.url,
              type: type
            });
            thread.save((err, doc) => {
              if (err) {
                console.log(err);
                req.flash('submitmsg', 'An error occured.');
                return res.redirect('/submit');
              }
              req.user.threads.push(doc._id);
              req.user.save();
              res.redirect('/thread/' + doc._id);
            });
          } else if (req.body.text && req.body.text.length > 9) { // ask
            let thread = new Thread({
              author: req.user._id,
              title: title,
              text: req.body.text,
              type: 'ask'
            });
            thread.save((err, doc) => {
              if (err) {
                console.log(err);
                req.flash('submitmsg', 'An error occured.');
                return res.redirect('/submit');
              }
              req.user.threads.push(doc._id);
              req.user.save();
              res.redirect('/thread/' + doc._id);
            });
          } else {
            req.flash('submitmsg', 'URL field must contain a valid url. For text posts, text field must contain at least 10 characters.');
            res.redirect('/submit');
          }
        } else {
          req.flash('submitmsg', 'Title cannot be empty.');
          res.redirect('/submit');
        }
      }
      else {
        req.flash('submitmsg', 'ReCaptcha failed, try again.');
        res.redirect('/submit');
      }
    });
  });
  
  return router;
};
module.exports = submitRoute;