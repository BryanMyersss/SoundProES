const User = require('../models/user');
const Cart = require('../models/cart');

module.exports = async (productId, userId) => {
  try {
    const user = await User.findById(userId);
    const cart = await Cart.findById(user.cart).populate('list.product');

    const foundProductIndex = cart.list.findIndex(item => {
      return (item.product._id.toString() === productId);
    });

    if(foundProductIndex === -1) { return }

    return cart.list[foundProductIndex];
  } catch (error) {
    // Handle errors
    console.error('Error:', error.message);
    throw new Error('An error occurred');
  }
}