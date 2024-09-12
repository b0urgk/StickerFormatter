const e = require('express');
const router = e.Router();


router.get('/', (req, res, next) => {
    res.render('index.ejs');
})

module.exports = router;