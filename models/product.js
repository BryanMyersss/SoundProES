const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  stock: {
    totalOwned: {
      type: Number,
      min: 0,
      required: true
    },
    totalRented: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  discontinued: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['speaker', 'subwoofer', 'mixer', 'microphone', 'lighting', 'visualFX',
     'audioAmp', 'instrument', 'djMixer'],
  },
  priceDay: {
    type: Number,
    min: 0,
    max: 3000,
    required: true
  },
  manufacturer: [{
    type: String,
    required: true
  }],
  bulletPoints: [String],
  images: [
    {
      filename: String
    }
  ],
  createdAt: {
    type: Date,
    default: new Date()
  },
  lastUpdated: {
    type: Date,
    default: new Date()
  }
})

module.exports = mongoose.model('Product', productSchema);
