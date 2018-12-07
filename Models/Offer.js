// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var offerSchema = new Schema({

  name: { type: String, required: true },
  description: {type: String, required: true}, 
  loyalty_points_required: { type: Number, required: true },
  created_at: Date,
  updated_at: Date

});

// the schema is useless so far
// we need to create a model using it
var Offer = mongoose.model('Offer', offerSchema);

// make this available to our Offers in our Node applications
module.exports = Offer;