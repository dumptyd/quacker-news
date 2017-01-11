require('dotenv').config({
  silent: true
});
const express = require('express'),
      app = express(),
      port = process.env.OPENSHIFT_NODEJS_PORT || 8080,
      ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
      mongoose = require('mongoose'),
      passport = require('passport'),
      session = require('express-session'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      flash = require('connect-flash'),
      path = require('path'),
      recaptcha = require('./lib/express-recaptcha'),
      User = require('./models/users'),
      Thread = require('./models/threads'),
  //Comment is some sort of reserved keyword in JSHint it seems
      Comment = require('./models/comments'); //jshint ignore:line
app.locals.moment = require('moment');
app.locals.node_url = require('url');
// ----------------------configuration------------------------//
recaptcha.init(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);
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
app.get('/admin/js/main.js', function(req, res){
  if(req.isAuthenticated() && req.user.role == 'admin')
    return res.sendFile(path.join(__dirname, './admin/js/main.js'));
  else
    return res.sendStatus(404);
});
//-------------------------routes------------------------------//
//routes go here
const indexRoute = require('./routes/index')(Thread);
const commentsRoute = require('./routes/comments')(Comment);
const updateuserRoute = require('./routes/updateuser')(User);
const newRoute = require('./routes/new')(Thread);
const showRoute = require('./routes/show')(Thread);
const askRoute = require('./routes/ask')(Thread);
const loginRoute = require('./routes/login')(passport);
const signupRoute = require('./routes/signup')(passport);
const logoutRoute = require('./routes/logout')();
const submitRoute = require('./routes/submit')(isLoggedIn, Thread, recaptcha);
const threadRoute = require('./routes/thread')(Thread, Comment, User, recaptcha);
const userRoute = require('./routes/user')(User, Comment);
const voteRoute = require('./routes/vote')(isLoggedIn, Comment, User, Thread);
const adminRoute = require('./routes/admin')(Comment, Thread);
//----------------------------routes-end----------------------------//
//-----route registration-----//
//route registration here
app.use('/',indexRoute);
app.use('/comments',commentsRoute);
app.use('/updateUser',updateuserRoute);
app.use('/new',newRoute);
app.use('/show', showRoute);
app.use('/ask', askRoute);
app.use('/login', loginRoute);
app.use('/signup', signupRoute);
app.use('/logout', logoutRoute);
app.use('/submit', submitRoute);
app.use('/thread', threadRoute);
app.use('/user', userRoute);
app.use('/vote', voteRoute);
app.use('/admin', adminRoute);
//-----route registration end-----//

app.get('*', function(req, res){
  console.log('404ing');
  res.render('404');
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('message', 'You need to be logged in.');
  res.redirect('/login');
}
//--------------------------------------------------------------//
db.once('open', function (err) {
  app.listen(port, ip, function(){
    console.log(`Running on ${ip}:${port} `);
  });
});
