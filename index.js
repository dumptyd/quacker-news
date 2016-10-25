require('dotenv').config({silent:true});
const express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  mongoose = require('mongoose'),
  passport = require('passport'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  path = require('path'),
  User = require('./models/users');
// ----------------------configuration------------------------//
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URL, {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS
});
var db = mongoose.connection;
require('./config/passport')(passport);
app.use(cookieParser());
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.static(path.join(__dirname , 'public')));
//-------------------------routes------------------------------//
//routes go here
//----------------------------routes----------------------------//
app.get('/', function (req, res) {
  res.render('index');
});
app.get('/profile', isLoggedIn, function (req, res) {
  res.render('profile');
});
//-----route registration-----//
//route registration here
//----------------------------//
app.use(function(req,res){
    res.redirect('/');
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){return next();}
  res.redirect('/');
}
//--------------------------------------------------------------//
db.once('open', function (err) {
  app.listen(port);
  console.log('Running on ' + port);
});