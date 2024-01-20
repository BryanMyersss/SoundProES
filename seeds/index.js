const mongoose = require('mongoose');
const Product = require('../models/product');
const Order = require('../models/order');

mongoose.connect(`mongodb://localhost:27017/SoundProDemo`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

const seedDB = async () => {
const order = new Order({
  user: "65919c343d35862ba45b062e",
  products: [
    {
      product: "6551926d8d46154f5c4042b7",
      priceAtRentalDay: 58,
      qty: 1
    },
    {
      product: "655194e32d172d3a940f2df5",
      priceAtRentalDay: 40,
      qty: 1
    }
  ],
  price: {
    total: 294,
    deposit: 300
  },
  pickup: {
    date: "2024-01-03"
  },
  return: {
    date: "2024-01-04"
  },
  state: "RENTED",
  delivery: {
    state: "NO"
  }
})
await order.save();
}

const getOrder = async () => {
  const order = await Order.findById("65921cbc8612353d98f58393");
  console.log(order.pickup.date);
}

try {
  seedDB().then(() => {
    console.log('successfully seeded database')
    mongoose.connection.close()
  })
  // getOrder()
} catch (error) {
  console.log(error)
}


// app.get('/seedthediscontinued', catchAsync(async (req, res) => {
//   try {
//     const products = await Product.find();

//     for (const product of products) {
//       product.discontinued = false;
//       await product.save();
//     }

//     res.status(200).send('Products updated successfully');
//   } catch (err) {
//     res.status(500).send('Error updating products');
//   }
// }));