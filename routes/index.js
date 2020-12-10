const express = require('express')
const blogRouter = require('./blog')
const videoLibraryRouter = require('./video-library')
const sitePageRouter = require('./sitepage')
const { auth } = require('../middlewares')

const router = new express.Router()

router.use('/blog', auth, blogRouter)
router.use('/video-library', auth, videoLibraryRouter)
router.use('/sitepage', auth, sitePageRouter)

module.exports = router
