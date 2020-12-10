module.exports = {
	auth: (req, res, next) => {
		if (!req.session.loggedIn) {
			return res.redirect('/login')
		}
		next()
	},
	unauth: (req, res, next) => {
		if (req.session.loggedIn) {
			return res.redirect('/')
		}
		next()
	}
}
