var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session=require('express-session');
var MongoStore=require('connect-mongo')(session);
var settings=require('./settings');
var flash = require('connect-flash');

var index = require('./routes/index');
var users = require('./routes/users');
var diary = require('./routes/diary');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret:settings.cookieSecret,
  store:new MongoStore({
    // db:settings.db
    url: 'mongodb://@localhost/diary'
  }),
  saveUninitialized: true,
  resave: false,
  secure: true
}));

app.use(flash());
app.use(function(req,res,next){
  res.locals.user = req.session.user;
  var error = req.flash('error');
  res.locals.error = error.length>0 ? error : null;
  var success = req.flash('success');
  res.locals.success = success.length>0 ? success : null;
  next();
});//需要写在app.use('/', index);前面
app.use('/', index);
app.use('/users', users);
app.use('/diary', diary);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*这里process.env.PORT是指环境变量要是设置了PORT，
那么就用环境变量的PORT，环境变量没有我们就用3000.*/
app.set('post',process.env.POST||2018);
// 监听端口如果有用户进入页面发送请求我们输出以下语句
app.listen(app.get('post'),function(){
  console.log('express started on post 2018')
});

module.exports = app;
