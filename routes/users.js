const express = require('express')
const router = express.Router()
const User = require('../models/User')
const isEmail = require('isemail')
const bcrypt = require('bcryptjs')
const passport = require('passport')


//login page
router.get('/login', (req, res) => 
  res.render('login')
)

//login handle

//register page
router.get('/register', (req, res) => 
  res.render('register')
)

//register handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body
  //console.log(name, email, password, password2)
  let errors = []

  //check required fields
  if(!name||!email||!password||!password){
    errors.push({msg: 'Please fill in all fields.'})
  }

  //validate email
  if(isEmail.validate(email) == false){
    errors.push({msg: 'Please enter proper email.'})
  }

  //check password fields
  if(password !== password2){
      errors.push({msg: 'Passwords do not match.'})
  }

  //check password at least 6 characters long
  if(password.length < 6){
      errors.push({msg: 'Password must be at least 6 characters long.'})
  }

  if(errors.length > 0){
    console.log(errors)
      res.render('register', {
          errors,
          name,
          email,
          password,
          password2
      })
  } else {
    //validation passed, authentication begins
    User.findOne({email})
      .then(user => {
        if(user){
          //user exists
          errors.push({msg: 'Email is already registered.'})
            res.render('register', {
              errors,
                name,
                email,
                password,
                password2
            })
        } else {
          //Create new user
          const newUser = new User ({
            name,
            email,
            password
          })
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err
              newUser.password = hash
              newUser.save()
                .then(user => {
                  console.log(`${newUser.name} is saved.`)
                  req.flash('success_msg', 'You are now registered.')
                  res.redirect('/users/login')
                })
                .catch(err => console.log(err))
            })
          })
        }
      })
      .catch()
  }       
})        

//login handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
      successRedirect: '/map',
      failureRedirect: '/users/login',
      failureFlash: true,
  })(req, res, next)
})

//logout handle
router.get('/logout', (req, res, next) => {
  req.logout()
  req.flash('success_msg', 'You are logged out.')
  res.redirect('/users/login')
})

// const me = new User({
//   name: 'Len',
//   email: '77gjgt',
//   password: '123456',
// })

// me.save().then(me => console.log(me)).catch(err => console.log(err))

module.exports = router