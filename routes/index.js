const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../src/auth')

router.get('/', (req, res) => 
    res.render('welcome')
)

router.get('/dashboard', ensureAuthenticated, (req, res) => 
    res.render('dashboard', {
        name: req.user.name
    })
)

router.get('/map', ensureAuthenticated, (req, res) => 
    res.render('map', {
        name: req.user.name

    })
)

module.exports = router