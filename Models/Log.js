// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var logSchema = new Schema({
  type: { type: String, required: true },
  sub_type: { type: String, required: true },
  additional_info: { type: String, required: true },
  description: { type: String, required: true },
  fixture_id: {type: String},
  member_id: { type: String, required: true },
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var Log = mongoose.model('Log', logSchema);

// make this available to our Logs in our Node applications
module.exports = Log; 