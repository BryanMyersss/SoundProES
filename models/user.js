const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  // displayUsername: {
  //   type: String,
  //   required: true,
  //   unique: true
  // },
  email: {
    type: String,
    required: true,
    unique: true
  },
  business: String,
  phone: Number,
  dni: {
    type: String,
    required: true,
    unique: true
  },
  birth: Date,
  createdAt: {
    type: Date,
    default: new Date()
  },
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);