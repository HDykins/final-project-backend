var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = mongoose.Schema.Types.Mixed;

var ordersSchema = new Schema({
  userChoices: {
    type: Mixed
  },
  id : {
  	type: Number
  }
});

module.exports = mongoose.model('Orders', ordersSchema, 'orders');