const Product = require('../models/product');
const Order = require('../models/order');

module.exports.single = async (id, pickupD, returnD) => {
  id = id.toString();
  try {
    const product = await Product.findById(id);
    if(!product){throw new Error('no product found')}
    const {totalOwned} = product.stock;
    const pickupDate = new Date(pickupD); // Desired pickup date
    const returnDate = new Date(returnD); // Desired return date
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
      // console.log(order.products)
      const index = order.products.findIndex(obj => String(obj.product) === id);
      // console.log(id);
      // console.log(typeof id);
      // console.log(index)
      stock = stock - order.products[index].qty
    })

    if(orders.length > 0){
      return stock
    } else {
      return totalOwned
    }

    // return stockAmount;
  } catch (error) {
    console.log(error)
    
  }
}

