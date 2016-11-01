require('dotenv').config({
  silent: true
});
const express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  mongoose = require('mongoose'),
  passport = require('passport'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  flash = require('connect-flash'),
  path = require('path'),
  User = require('./models/users'),
  Thread = require('./models/threads'),
  Comment = require('./models/comments');
app.locals.moment = require('moment');
app.locals.node_url = require('url');
// ----------------------configuration------------------------//
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URL, {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS
});
const db = mongoose.connection;
require('./config/passport')(passport);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'pug');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.static(path.join(__dirname, 'public')));
//-------------------------routes------------------------------//
//routes go here
//----------------------------routes----------------------------//
app.get('/new', function (req, res) {
  console.log(req.isAuthenticated());
  let query = Thread.find({
    type: 'link'
  }).populate('author').sort('-createdAt').limit(30);
  query.exec((err, posts) => {
    if (err) return res.end(500);
    let username;
    if (req.user) username = req.user.local.username;
    res.render('index', {
      authenticated: req.isAuthenticated(),
      user: username,
      posts: posts,
      page: 'new'
    });
  });
});
app.get('/show', function (req, res) {
  console.log(req.isAuthenticated());
  let query = Thread.find({
    type: 'show'
  }).populate('author').sort('-upvoteCount').limit(30);
  query.exec((err, posts) => {
    if (err) return res.end(500);
    let username;
    if (req.user) username = req.user.local.username;
    res.render('index', {
      authenticated: req.isAuthenticated(),
      user: username,
      posts: posts,
      page: 'show'
    });
  });
});
app.get('/ask', function (req, res) {
  console.log(req.isAuthenticated());
  let query = Thread.find({
    type: 'ask'
  }).populate('author').sort('-upvoteCount').limit(30);
  query.exec((err, posts) => {
    if (err) return res.end(500);
    let username;
    if (req.user) username = req.user.local.username;
    res.render('index', {
      authenticated: req.isAuthenticated(),
      user: username,
      posts: posts,
      page: 'ask'
    });
  });
});
app.get('/', function (req, res) {
  console.log(req.isAuthenticated());
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
app.get('/login', function (req, res) {
  let msg = req.flash('message');
  //console.log(msg);
  res.render('login', {
    message: msg
  });
});
app.get('/submit', isLoggedIn, function (req, res) {
  res.render('submit', {
    message: req.flash('submitmsg')
  });
});
app.post('/submit', function (req, res) {
  let title = req.body.title;
  if (title.length) {
    if (req.body.url && req.body.url.length && /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(req.body.url)) {
      let type = 'link';
      if (title.startsWith('Show HNC:')) type = 'show';
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
        res.redirect('/' + doc._id);
      });
    }
    else if (req.body.text && req.body.text.length > 9) {
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
        res.redirect('/' + doc._id);
      });
    }
    else {
      req.flash('submitmsg', 'URL field must contain a valid url. For text posts, text field must contain at least 10 characters.');
      res.redirect('/submit');
    }
  }
  else {
    req.flash('submitmsg', 'Title cannot be empty.');
    res.redirect('/submit');
  }
});
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/login',
  failureRedirect: '/login',
  failureFlash: true
}));
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});
app.get('/thread/:id', function (req, res) {
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
    console.log(thread);
    res.render('thread', {
      authenticated: req.isAuthenticated(),
      thread: thread,
      user: req.user ? req.user.local.username : ''
    });
  });
});
app.post('/thread/:id', function (req, res) {
  let id = req.params.id;
  let text = req.body.text;
  if (!req.isAuthenticated()) {
    req.flash('message', 'You need to be logged in.');
    return res.redirect('/login');
  }
  if (!text) {}
  console.log(id, text);
  let comment = new Comment({
    author: req.user._id,
    thread: id,
    text: text
  });
  Thread.findOne({
    _id: id
  }, (err, thread) => {
    if (thread) {
      comment.save((err, com) => {
        thread.comments.push(com._id);
        thread.save((err, doc) => {
          res.redirect('/thread/' + id);
        });
      });
    }
  });
});
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/', // redirect to the secure profile section
  failureRedirect: '/login', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));
app.get('/user/:username', function (req, res) {
  let username = req.params.username;
  User.findOne({
    'local.username': username
  }).select('local.username karma about').exec(function (err, user) {
    console.log(user);
    if(user)
      res.render('user',{user:user,authenticated:req.isAuthenticated()});
    else
      res.render('404');
  });
});
//-----route registration-----//
//route registration here
//----------------------------//
//app.use(function (req, res) {
//  res.redirect('/');
//});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('message', 'You need to be logged in.');
  res.redirect('/login');
}
//--------------------------------------------------------------//
db.once('open', function (err) {
  app.listen(port);
  console.log('Running on ' + port);
});