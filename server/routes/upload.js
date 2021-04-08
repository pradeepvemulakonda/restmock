import { v4 as uuid } from 'uuid'
import fs from 'fs-extra'
import path from 'path'
import { MockPathUtil } from '../components/utils/index.js'
import DBConnector from '../components/persistance/adapter.js'
import { parseSwagger } from '../components/utils/swagger-processor.js'
import { Router } from 'express'

const router = Router()
router.route('/')
  .post(function (req, res, next) {
    const dbPath = req.app.get('dbPath')
    const uploadPath = req.app.get('uploadPath')
    const dbAdapter = new DBConnector(dbPath)
    req.pipe(req.busboy)
    req.busboy.on('file', function (fieldname, file, filename) {
      console.log('Uploading: ', filename, file)
      // Path where image will be uploaded
      const fileToBeUploaded = path.join(uploadPath, filename)
      let finalFileName = fileToBeUploaded
      if (fs.existsSync(fileToBeUploaded)) {
        const fileName = fileToBeUploaded.split('.')[0]
        const fileExtension = fileToBeUploaded.split('.')[1]
        finalFileName = fileName + uuid().substr(1, 6) + '.' + fileExtension
      }
      const fstream = fs.createWriteStream(finalFileName)
      file.pipe(fstream)
      fstream.on('close', async function () {
        console.log('Upload Finished of ' + filename)
        const api = await parseSwagger(finalFileName)
        console.info('api', api)
        const transformedPathData = MockPathUtil.transformPathData(api)
        console.debug('-###->', transformedPathData)

        dbAdapter.insertApiDetail({ name: path.join(api.host, api.basePath), paths: transformedPathData })

        // Set some defaults (d if your JSON file is empty)
        res.redirect('/setup') // where to go next
      })
    })
  })

export default router
