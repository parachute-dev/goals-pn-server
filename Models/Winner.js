// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var winnerSchema = new Schema({
  club: { type: String, required: true },
  member_id: { type: String, required: true },
  redeemed: {type: Boolean, default: false},
  redeemed_at : {type: Date},
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var Winner = mongoose.model('Winner', winnerSchema);

// make this available to our users in our Node applications
module.exports = Winner;