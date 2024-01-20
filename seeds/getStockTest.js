const mongoose = require('mongoose');
const Product = require('../models/product');
const Order = require('../models/order');

mongoose.connect(`mongodb://localhost:27017/SoundProDemo`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// gets stock of a single product
async function getStockSingle(id, pickupD, returnD) {
  try {
    const product = await Product.findById(id);
    if(!product){throw new Error('no product found')}
    const {totalOwned} = product.stock;
    const pickupDate = new Date(pickupD); // Desired pickup date
    const returnDate = new Date(returnD); // Desired return date
    console.log(returnDate)
    const orders = await Order.find({
      $and:[
        {$or: [
            { 'pickup.date': { $lte: returnDate, $gte: pickupDate } }, // Order overlaps the specified date range
            { 'return.date': { $lte: returnDate, $gte: pickupDate } }, // Order overlaps the specified date range
            { $and: [{ 'pickup.date': { $gte: pickupDate } }, { 'return.date': { $lte: returnDate } }] } // Order starts and ends within the specified date range
        ]},
        {products: { $elemMatch: { product: id } }},
        {finished: false}
      ]
    })

    let stock = totalOwned;

    orders.forEach(order => {
      console.log(order.products)
      const index = order.products.findIndex(obj => String(obj.product) === id);
      stock = stock - order.products[index].qty
    })

    if(orders.length > 0){
      return stock
    } else {
      console.log("no orders")
      return totalOwned
    }

    // return stockAmount;
  } catch (error) {
    console.log(error)
    
  }
}

async function someFunction() {
  try {
    const response = await getStockSingle('655194e32d172d3a940f2df5', '2024-01-01', '2024-01-03');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

someFunction();


