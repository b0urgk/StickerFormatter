const e = require('express');
const router = e.Router();
const apiController = require('../controllers/apiController')

router.post('/genBanner', apiController.genBanner);

module.exports = router;