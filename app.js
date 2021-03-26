var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var yargs = require('yargs');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var busboy = require('connect-busboy');
var fs = require('fs-extra'); 
const indexRouter = require('./routes/index');
const setupRouter = require('./routes/setup');
const X_CORRELATION_ID = 'x-correlation-id';

const options = yargs
  .usage('Usage: -b < /to/mock/file/base/directory')
  .option('b', { alias: 'basepath', description: 'path to base directory where mock project files are present', demandOption: false })
  .option('p', { alias: 'port', description: 'server port', demandOption: false })
  .argv;

const basePath =   options.basepath || path.join(__dirname, 'public');

function validatePath(path) {
  const isPathValid = fs.existsSync(path);
  if (!isPathValid) {
    throw new Error(`Path not found: ${path}`);
  }
  console.log(`Setting the mock base directory to ${path}`);
}

function validatePathNotEmpty(path) {
  const isEmptyDirectory = fs.readdirSync(path).length === 0;
  if (isEmptyDirectory) {
    throw new Error(`No mocks found at : ${path}`);
  }
  console.log(`Serving the mocks from: ${path}`);
}

function parseCorrelationId(req) {
  const correlationId = req.get(X_CORRELATION_ID);
  const correlationElements = correlationId.split('-');
  const requestedResponseCode = parseInt(correlationElements[1]);
  const responseTimeDelay = parseInt(correlationElements[2]) || 0;
  return { requestedResponseCode, responseTimeDelay };
}

// the url should not contain the response delay provided as part of correlation id
function updateUrl(req) {
  const correlationId = req.get(X_CORRELATION_ID);
  const correlationElements = correlationId.split('-');
  correlationElements.length > 2 && correlationElements.pop();
  const fileName = correlationElements.join('-');
  req.url = path.join(basePath, req.originalUrl, fileName + '.json');
  req.method = 'GET';
}

validatePath(basePath);
validatePathNotEmpty(basePath);

var app = express();
app.port = options.port;
app.set('basepath', basePath);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/setup', setupRouter);

app.route('/upload')
  .post(function (req, res, next) {
    req.pipe(req.busboy)
    req.busboy.on('file', function (fieldname, file, filename) {
      console.log('Uploading: ', filename, file)
      // Path where image will be uploaded
      const fileToBeUploaded = path.join(__dirname, '/swagger/', filename)
      let finalFileName = fileToBeUploaded
      if (fs.existsSync(fileToBeUploaded)) {
        const fileName = fileToBeUploaded.split('.')[0]
        const fileExtension = fileToBeUploaded.split('.')[1]
        finalFileName = fileName + uuidv4().substr(1, 6) + '.' + fileExtension
      }
      const fstream = fs.createWriteStream(finalFileName)
      file.pipe(fstream)
      fstream.on('close', function () {
        console.log('Upload Finished of ' + filename)
        res.redirect('/setup') // where to go next
      })
    })
  })


app.use(function (req, res, next) {
  var correlationId = req.header(X_CORRELATION_ID);
  if (correlationId) {
    updateUrl(req);
    next();
  } else {
    return next(createError(400, `Invalid ${X_CORRELATION_ID}`));
  } 
});

app.use(function (req, res, next) {
  const { requestedResponseCode, responseTimeDelay } = parseCorrelationId(req);
  const filePath = path.join(req.url);
  console.log(`Mock file being processed is: ${filePath}`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return next(createError(400, err))
    }
    console.log(`requested response code : ${requestedResponseCode} and response delay is ${responseTimeDelay}`);
    if (requestedResponseCode >= 200 && requestedResponseCode < 600) {
      setTimeout(() => {
        res.status(requestedResponseCode);
        res.json(JSON.parse(data));
      }, responseTimeDelay);
    } else {
      return next(createError(500, `Inalid http status code ${requestedResponseCode}`));
    }
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  var errorMessage = err.message || 'error in processing request';
  // render the error page
  res.json({
    message: errorMessage,
    error: '1001'
  });
});

module.exports = app;
