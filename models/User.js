const mongoose = require('mongoose')
const validator = require('validator')

const UserSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true
  },
  email: {
      type: String,
      required: true,
      validate(value){
        const validate = validator.isEmail(value)
        if(validate !== true){
          throw new Error('Must be email.')
        }
      }   
  },
  password: {
      type: String,
      required: true,
      minlength: 6
  },    
  date: {
      type: Date,
      default: Date.now
  },
})

const User = mongoose.model('User', UserSchema)

module.exports = User
