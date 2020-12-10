require('dotenv').config()
const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const bodyParser = require('body-parser')
const { auth, unauth } = require('./middlewares')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

if (process.env.NODE_ENV === 'production') {
	app.set('trust proxy', 1)
}

app.use(session({
	resave: false,
	saveUninitialized: false,
	cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 10 * 3600 * 1000 },
	secret: process.env.SECRET
}))

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(flash())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.locals.ucfirst = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

app.use('/', routes)

app.get('/login', unauth, (req, res) => {
	res.render('login', { message: req.flash('error') })
})

app.get('/logout', auth, (req, res) => {
	req.session.loggedIn = false
	req.session.save()
	res.redirect('/login')
})

app.post('/login', unauth, (req, res) => {
	const password = req.body.password

	if (password === process.env.PASSWORD) {
		req.session.loggedIn = true
		req.session.save()
		res.redirect('/')
	} else {
		req.flash('error', 'Invalid password')
		res.redirect('/login')
	}
})

app.get('/', auth, (req, res) => {
	res.render('home')
})

app.all('*', (req, res) => {
	res.status(404).send('Not found')
})

app.listen(port, () => {
	console.log(`Listening at port ${port}`)
})
