const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      _id: false,
      product : {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      priceAtRentalDay: {
        type: Number,
        min: 0,
        required: true,
      },
      qty: {
        type: Number,
        min: 1,
        required: true
      }
    }
  ],
  price: {
    total: Number,
    deposit: Number,
  },
  pickup: {
    hour: Number,
    date: Date
  },
  return: {
    hour: Number,
    date: Date
  },
  state: {
    type: String,
    enum: ['RETURNED', 'RENTED', 'DELAYED_RETURN', 'LOST/STOLEN', 'CHECKING_PRODUCTS', 'CANCELED'],
  },
  finished: {
    type: Boolean,
    default: false
  },
  comments: {
    atPickup: {
      fromClient: String,
    },
    atReturn: {
      noteToMyself: String,
      toClient: String
    }
  },
  delivery: {
    state: {
      type: String,
      enum: ['NO', 'DELIVER', 'PICK_UP', 'INSTALL_PICKUP'],
      required: true
    },
    deliveryPlace: String,
    pickupPlace: String,
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});

// To do: add virtuals because classes and single functions for future use of this model is better with virtuals

module.exports = mongoose.model('Order', OrderSchema);