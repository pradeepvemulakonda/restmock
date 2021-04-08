import fs from 'fs'
import _ from 'lodash'

class MockPathUtil {
  static get X_CORRELATION_ID () {
    return 'x-correlation-id'
  }

  constructor (mockPath) {
    this.mockPath = mockPath
  }

  static transformPathData (api) {
    const { paths } = api

    return _.mapValues(paths, (pathDetails) => {
      return _.mapValues(pathDetails, (pathDetail) => {
        return _.get(pathDetail, 'responses')
      })
    })
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
