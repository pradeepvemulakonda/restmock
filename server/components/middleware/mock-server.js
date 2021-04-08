import createError from 'http-errors'
import fs from 'fs-extra'
import path from 'path'
import { UrlUpdater } from '../utils/index.js'

const mockServer = function (req, res, next) {
  const urlUtil = new UrlUpdater(req)
  const { requestedResponseCode, responseTimeDelay } = urlUtil.parseCorrelationId()
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
}

export default mockServer
