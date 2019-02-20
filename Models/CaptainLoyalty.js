// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var captainLoyaltySchema = new Schema({
  member_id: { type: String, required: true },
  fixture_id: {type: String},
  points_given: {type: String},
  redeemed_at : {type: Date},
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var CaptainLoyalty = mongoose.model('CaptainLoyalty', captainLoyaltySchema);

// make this available to our users in our Node applications
module.exports = CaptainLoyalty;