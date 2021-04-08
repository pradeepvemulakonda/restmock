
import createError from 'http-errors'
import { UrlUpdater } from '../utils/index.js'

const X_CORRELATION_ID = 'x-correlation-id'

const requestFaker = function (options) {
  return function (req, res, next) {
    const correlationId = req.header(X_CORRELATION_ID)
    if (correlationId) {
      const urlUtil = new UrlUpdater(req)
      urlUtil.updateUrl()
      next()
    } else {
      return next(createError(400, `Invalid ${X_CORRELATION_ID}`))
    }
  }
}

export default requestFaker
