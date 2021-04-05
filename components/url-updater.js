
import path from 'path'

class UrlUpdater {
  constructor (req) {
    this.req = req
  }

  // the url should not contain the response delay provided as part of correlation id
  updateUrl (basePath) {
    const correlationId = this.req.get(this.X_CORRELATION_ID)
    const correlationElements = correlationId.split('-')
    correlationElements.length > 2 && correlationElements.pop()
    const fileName = correlationElements.join('-')
    this.req.url = path.join(basePath, this.req.originalUrl, fileName + '.json')
    this.req.method = 'GET'
  }

  parseCorrelationId () {
    const correlationId = this.req.get(this.X_CORRELATION_ID)
    const correlationElements = correlationId.split('-')
    const requestedResponseCode = parseInt(correlationElements[1])
    const responseTimeDelay = parseInt(correlationElements[2]) || 0
    return { requestedResponseCode, responseTimeDelay }
  }
}

export { UrlUpdater }
