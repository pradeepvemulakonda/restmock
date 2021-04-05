import fs from 'fs'

class MockPathUtil {
  static get X_CORRELATION_ID () {
    return 'x-correlation-id'
  }

  constructor (mockPath) {
    this.mockPath = mockPath
  }

  validatePath () {
    const isPathValid = fs.existsSync(this.mockPath)
    if (!isPathValid) {
      throw new Error(`Path not found: ${this.mockPath}`)
    }
    console.log(`Setting the mock base directory to ${this.mockPath}`)
  }

  validatePathNotEmpty () {
    const isEmptyDirectory = fs.readdirSync(this.mockPath).length === 0
    if (isEmptyDirectory) {
      throw new Error(`No mocks found at : ${this.mockPath}`)
    }
    console.log(`Serving the mocks from: ${this.mockPath}`)
  }
}

export { MockPathUtil }
