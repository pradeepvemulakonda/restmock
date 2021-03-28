class MockPathUtil {
  constructor (fs, path) {
    this.fs = fs
    this.path = path
    this.X_CORRELATION_ID = 'x-correlation-id'
  }

  validatePath (path) {
    const isPathValid = this.fs.existsSync(path)
    if (!isPathValid) {
      throw new Error(`Path not found: ${path}`)
    }
    console.log(`Setting the mock base directory to ${path}`)
  }

  validatePathNotEmpty (path) {
    const isEmptyDirectory = this.fs.readdirSync(path).length === 0
    if (isEmptyDirectory) {
      throw new Error(`No mocks found at : ${path}`)
    }
    console.log(`Serving the mocks from: ${path}`)
  }

  parseCorrelationId (req) {
    const correlationId = this.req.get(this.X_CORRELATION_ID)
    const correlationElements = correlationId.split('-')
    const requestedResponseCode = parseInt(correlationElements[1])
    const responseTimeDelay = parseInt(correlationElements[2]) || 0
    return { requestedResponseCode, responseTimeDelay }
  }

  // the url should not contain the response delay provided as part of correlation id
  updateUrl (basePath, req) {
    const correlationId = this.req.get(this.X_CORRELATION_ID)
    const correlationElements = correlationId.split('-')
    correlationElements.length > 2 && correlationElements.pop()
    const fileName = correlationElements.join('-')
    this.req.url = this.path.join(basePath, this.req.originalUrl, fileName + '.json')
    this.req.method = 'GET'
  }
}

module.exports = MockPathUtil
 