var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var yargs = require('yargs');
var fs = require('fs');
const indexRouter = require('./routes/index');
const X_CORRELATION_ID = 'x-correlation-id';

const options = yargs
  .usage('Usage: -b <path/to/mock/file/base/directory')
  .option('b', { alias: 'basepath', description: 'path to base directory where mock project files are present', demandOption: true})
  .option('p', { alias: 'port', description: 'server port', demandOption: false})
  .argv;

function validatePath(path) {
  const isPathValid = fs.existsSync(path);
  if(!isPathValid) {
    throw new Error(`Path not found: ${path}`);
  }
  console.log(`Setting the mock base directory to ${path}`);
}


function validatePathNotEmpty(path) {
  const isEmptyDirectory = fs.readdirSync(path).length === 0;
  if(isEmptyDirectory) {
    throw new Error(`No mocks found at : ${path}`);
  }
  console.log(`Serving the mocks from: ${path}`);
}

validatePath(options.basepath);
validatePathNotEmpty(options.basepath);

var app = express();
app.port = options.port;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use(function(req, res, next) {
  var correlationId = req.header(X_CORRELATION_ID);
  if(correlationId){
    req.url = path.join(req.originalUrl, correlationId + '.json');
    req.method = 'GET';
    next();
  } else {
    return next(createError(400, `Invalid ${X_CORRELATION_ID}`));
  }
});

app.use(function(req, res, next) {
  var correlationId = req.header(X_CORRELATION_ID);
  if(correlationId){
    req.url = path.join(req.originalUrl, correlationId + '.json');
    req.method = 'GET';
    next();
  } else {
    return next(createError(400, `Invalid ${X_CORRELATION_ID}`));
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
