var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
  	type: Number,
  	required: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('User', userSchema);
