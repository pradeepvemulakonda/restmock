import busboy from 'connect-busboy'
import cookieParser from 'cookie-parser'
import createError from 'http-errors'
import express from 'express'
import logger from 'morgan'
import path, { dirname } from 'path'
import yargs from 'yargs'
import { fileURLToPath } from 'url'
import indexRouter from './routes/index.js'
import setupRouter from './routes/setup.js'
import uploadRouter from './routes/upload.js'
import requestFaker from './components/middleware/request-faker.js'
import { MockPathUtil } from './components/utils/index.js'
import globalErrorHandler from './components/middleware/global-error-handler.js'
export const __dirname = dirname(fileURLToPath(import.meta.url))

// accept mock location
const options = yargs
  .usage('Usage: -b < /to/mock/file/base/directory')
  .option('b', { alias: 'basepath', description: 'path to base directory where mock project files are present', demandOption: false })
  .option('p', { alias: 'port', description: 'server port', demandOption: false })
  .argv

const basePath = options.basepath || path.join(__dirname, 'public')
const uploadPath = options.basepath || path.join(__dirname, '..', 'swagger')
const dbPath = options.basepath || path.join(__dirname, '..', 'database')

// validated mock location path
const mockpathUtil = new MockPathUtil(basePath)
mockpathUtil.validatePath()
mockpathUtil.validatePathNotEmpty()

// setup a mock server
export const app = express()
app.port = options.port
app.set('basepath', basePath)
app.set('uploadPath', uploadPath)
app.set('dbPath', dbPath)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// setup server for uploads and json
app.use(busboy())
app.use(express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// setup routers
app.use('/', indexRouter)
app.use('/setup', setupRouter)
app.use('/upload', uploadRouter)

// convert the request to a fake GET request
app.use(requestFaker())

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// catch any global errors and process them
app.use(globalErrorHandler)

export default app
