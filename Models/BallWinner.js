// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var ballWinnerSchema = new Schema({
  club: { type: String },
  member_id: { type: String, required: true },
  redeemed: {type: Boolean, default: false},
  redeemed_at : {type: Date},
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var BallWinner = mongoose.model('BallWinner', ballWinnerSchema);

// make this available to our users in our Node applications
module.exports = BallWinner;