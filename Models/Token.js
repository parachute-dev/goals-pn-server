// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var tokenSchema = new Schema({
  token: { type: String, required: true, unique : true },
  member_id: { type: String, required: true },
  device_type: { type: String, required: true },  
  created_at: Date,
  updated_at: Date
});



// the schema is useless so far
// we need to create a model using it
var Token = mongoose.model('Token', tokenSchema);

// make this available to our users in our Node applications
module.exports = Token;