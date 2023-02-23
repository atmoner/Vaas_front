const { Router } = require('express')
var bodyParser = require('body-parser')
import axios from 'axios'

const router = Router()

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json())

/* GET users listing. */
router.get('/auth/:addr', async function (req, res, next) {
  console.log(req.params.addr)

  const { data } = await axios.get(
    'https://api.cros-nest.com/accounts/' + req.params.addr + '/register?format=json', { validateStatus: () => true }
  )

  res.json(data)
})

module.exports = router
