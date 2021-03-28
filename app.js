const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const yargs = require('yargs')
const { v4: uuidv4 } = require('uuid')
const busboy = require('connect-busboy')
const fs = require('fs-extra')
const low = require('lowdb')
const _ = require('lodash')
const SwaggerParser = require('@apidevtools/swagger-parser')
const FileSync = require('lowdb/adapters/FileSync')
const indexRouter = require('./routes/index')
const setupRouter = require('./routes/setup')
const MockPathUtil = require('./modules/mock-path')
const X_CORRELATION_ID = 'x-correlation-id'

const options = yargs
  .usage('Usage: -b < /to/mock/file/base/directory')
  .option('b', { alias: 'basepath', description: 'path to base directory where mock project files are present', demandOption: false })
  .option('p', { alias: 'port', description: 'server port', demandOption: false })
  .argv

const basePath = options.basepath || path.join(__dirname, 'public')

const adapter = new FileSync('database/db.json')
const db = low(adapter)
db.defaults({ apis: [] })
  .write()

db._.mixin({
  pushUnique: function (collection, uniqueKey, newElement) {
    const index = collection.findIndex((databaseElement) => databaseElement[uniqueKey] === newElement[uniqueKey])
    index !== -1 && collection.splice(index, 1)
    collection.push(newElement)
    return collection
  }
})

const transformPathData = (api) => {
  const { paths } = api

  return _.mapValues(paths, (pathDetails) => {
    return _.mapValues(pathDetails, (pathDetail) => {
      return _.get(pathDetail, 'responses')
    })
  })
}

const mockpathUtil = new MockPathUtil(fs, path)

mockpathUtil.validatePath(basePath)
mockpathUtil.validatePathNotEmpty(basePath)

const app = express()
app.port = options.port
app.set('basepath', basePath)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(busboy())
app.use(express.static(path.join(__dirname, 'public')))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/setup', setupRouter)

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
      fstream.on('close', async function () {
        console.log('Upload Finished of ' + filename)
        const api = await parseSwagger(finalFileName)
        console.info('api', api)
        const transformedPathData = transformPathData(api)
        console.debug('-###->', transformedPathData)

        db.get('apis')
          .pushUnique('name', { name: path.join(api.host, api.basePath), paths: transformedPathData })
          .write()

        // Set some defaults (required if your JSON file is empty)
        res.redirect('/setup') // where to go next
      })
    })
  })

const parseSwagger = async (swagger) => {
  return await SwaggerParser.validate(swagger)
}

app.use(function (req, res, next) {
  const correlationId = req.header(X_CORRELATION_ID)
  if (correlationId) {
    mockpathUtil.updateUrl(req)
    next()
  } else {
    return next(createError(400, `Invalid ${X_CORRELATION_ID}`))
  }
})

app.use(function (req, res, next) {
  const { requestedResponseCode, responseTimeDelay } = mockpathUtil.parseCorrelationId(req)
  const filePath = path.join(req.url)
  console.log(`Mock file being processed is: ${filePath}`)
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return next(createError(400, err))
    }
    console.log(`requested response code : ${requestedResponseCode} and response delay is ${responseTimeDelay}`)
    if (requestedResponseCode >= 200 && requestedResponseCode < 600) {
      setTimeout(() => {
        res.status(requestedResponseCode)
        res.json(JSON.parse(data))
      }, responseTimeDelay)
    } else {
      return next(createError(500, `Inalid http status code ${requestedResponseCode}`))
    }
  })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  const errorMessage = err.message || 'error in processing request'
  // render the error page
  res.json({
    message: errorMessage,
    error: '1001'
  })
})

module.exports = app
