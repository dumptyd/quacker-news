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
  Thread = require('./models/threads');
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
app.get('/', function (req, res) {
  console.log(req.isAuthenticated());
  let query = Thread.find({}).populate('author');
  query.exec((err, posts) => {
    if(err)return res.end(500);
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
  res.render('submit');
});
app.post('/submit', function (req, res) {
  let title = req.body.title;
  if (title.length) {
    if (req.body.url && req.body.url.length && /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(req.body.url)) {
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
          return res.end(500);
        }
        res.redirect('/'); //+doc._id); 
      });
    }
    else if (req.body.text && req.body.text.length) {
      let thread = new Thread({
        author: req.user._id,
        title: title,
        text: req.body.text,
        type: 'ask'
      });
      thread.save((err, doc) => {
        if (err) {
          console.log(err);
          return res.end(500);
        }
        res.redirect('/'); //+doc._id);          
      });
    }
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
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/', // redirect to the secure profile section
  failureRedirect: '/login', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));
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