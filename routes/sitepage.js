const express = require('express')
const router = new express.Router()

router.get('', (req, res) => {
	res.render('sitepage', { message: req.flash('info') })
})

module.exports = router
