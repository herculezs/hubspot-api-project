const express = require('express')
const router = new express.Router()

const updateBlog = require('../blog')

router.get('', (req, res) => {
	res.render('blog', { message: req.flash('info') })
})

router.post('', (req, res) => {
	const { postIds, startDate, endDate, type } = req.body
	updateBlog(postIds, startDate, endDate, type)
	req.flash('info', 'The update is running in the background...')
	res.redirect('/blog')
})

module.exports = router
