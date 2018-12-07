// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var logSchema = new Schema({
  type: { type: String, required: true },
  token: { type: String, required: true, unique : true },
  member_id: { type: String, required: true },
  loyalty_points: { type: Number, required: true },
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var Log = mongoose.model('Log', logSchema);

// make this available to our Logs in our Node applications
module.exports = Log;