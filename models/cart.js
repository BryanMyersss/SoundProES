const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  list: [{
    _id: false, // Prevent Mongoose from generating _id for subdocuments
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    qty: Number
  }]
});

module.exports = mongoose.model('Cart', cartSchema);