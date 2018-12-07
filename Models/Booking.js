// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var random = require('mongoose-simple-random');

// create a schema
var bookingSchema = new Schema({
  booking_date: {type: Date, required:true},	
  member_id: { type: String, required: true },
  created_at: Date,
  updated_at: Date
}).plugin(random);

// the schema is useless so far
// we need to create a model using it
var Booking = mongoose.model('Booking', bookingSchema);

// make this available to our users in our Node applications
module.exports = Booking;