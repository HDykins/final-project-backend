var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');

var userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [ validator.isEmail, 'invalid email' ]
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
  	type: Number,
  	required: true
  }
});

module.exports = mongoose.model('User', userSchema);
