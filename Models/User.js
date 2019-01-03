// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  email: { type: String, required: true },

  member_id: { type: String, required: true, unique:true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },    
  loyalty_points: { type: Number, min: [0, 'Cant have less than zero!'], max: 200, required: true, default: 0  },
  created_at: Date,
  updated_at: Date
});

// Pre hook for `findOneAndUpdate`
userSchema.pre('findOneAndUpdate', function(next) {
  this.options.runValidators = true;
  next();
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;