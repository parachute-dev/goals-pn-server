// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var random = require('mongoose-simple-random');

// create a schema
var clubSchema = new Schema({
  email: { type: String, required: true },
  Address: { type: String, required: true },
  club_code: { type: String, required: true },
  club_id: { type: String, required: true },
  Email: { type: String , required: true},
  IP: { type: String, required: true },
  Name: { type: String , required: true},
  Telephone: { type: String , required: true},
  created_at: Date,
  updated_at: Date
}).plugin(random);

// the schema is useless so far
// we need to create a model using it
var Club = mongoose.model('Club', clubSchema);

// make this available to our users in our Node applications
module.exports = Club;