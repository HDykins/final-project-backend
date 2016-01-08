var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = mongoose.Schema.Types.Mixed;

var ordersSchema = new Schema({
  userChoices: {
    type: Mixed
  }
});

module.exports = mongoose.model('OrdersSchema', ordersSchema, 'ordersschema');