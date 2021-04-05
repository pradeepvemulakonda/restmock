import { Router } from 'express'
const router = Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  const basepath = req.app.get('basepath')
  res.render('index.pug', { title: 'restmock', basepath: basepath })
})

export default router
