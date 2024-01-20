require('dotenv').config();
const express = require('express');
const app = express();
const Grid = require("gridfs-stream");
const ejsMate = require('ejs-mate');
const connection = require("./db");
const path = require('path');
const mongoose = require('mongoose');
const upload = require('./middleware/upload');
const methodOverride = require('method-override');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const Order = require('./models/order');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const getStock = require('./utils/getStock');
const getProductFromCart = require('./utils/getProductFromCart');
const validateDates = require('./utils/validateDates');

const {isLoggedIn, isAdmin, logout} = require('./middleware/middlewares');

// const corsOptions = {
//   origin: serverBaseUrl,
// };
// app.use(cors(corsOptions));

connection();

let gfs;
const conn = mongoose.connection;
conn.once("open", function () {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("photos");
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const sessionConfig = {
  secret: 'thishouldbeasecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // stores a variable called success that can be accessed in all ejs templates
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

const priceDiscount = process.env.PRICEDISCOUNT || 0;
const priceDecay = process.env.PRICEDECAY || 8;

app.get('/', (req, res) => {
  res.redirect('/shop');
});

app.get('/admin/orders', isLoggedIn, isAdmin, catchAsync(async (req, res) => { 
  const orders = await Order.find().populate('user products.product');
  // console.log('orders[0]:')
  // console.log(orders[0]);
  // console.log('orders[0].products:')
  // console.log(orders[0].products);
  res.render('admin/orders', {orders});
}));

app.get('/admin/orders/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => { 
  const {id} = req.params;
  console.log(id)
  const order = await Order.findById(id)
  console.log(order)
  order.finished = true;
  await order.save();
  // console.log('orders[0]:')
  // console.log(orders[0]);
  // console.log('orders[0].products:')
  // console.log(orders[0].products);
  res.redirect('/admin/orders');
}));

app.get('/admin/stock', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  const products = await Product.find({ discontinued: false }).limit();
  res.render('admin/stock', { products });
}));

app.get('/admin/product/add', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  const product = await Product.findOne();
  const categories = ['speaker', 'subwoofer', 'mixer', 'microphone', 'lighting', 'visualFX',
  'audioAmp', 'instrument', 'djMixer'];
  res.render('admin/addProduct', { product, categories});
}));

app.get('/admin/product/edit/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const categories = ['speaker', 'subwoofer', 'mixer', 'microphone', 'lighting', 'visualFX',
  'audioAmp', 'instrument', 'djMixer'];
  res.render('admin/editProduct', { product, categories});
}));

app.delete('/admin/product/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    console.log(product)
    if (!product) { throw new ExpressError('Product not found', 404); }
    
    product.discontinued = true;
    await product.save();

    res.status(200).send("success");
}));

app.patch('/admin/product/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  try {
    console.log("crude req.body from request:");
    console.log(req.body);

    const product = await Product.findById(req.params.id);
    const { name, stock, category, priceday, manufacturer, bulletpoints } = req.body;

    let formatedCategory;
    if (!category) {
      formatedCategory = undefined;
      console.log("category set to undefined");
    } else {
      formatedCategory = category;
    }
    console.log('modified category if undefined: ' + formatedCategory);
    const formatedBulletPoints = bulletpoints.split('\n').map(line => line.trim());

    product.name = name;
    product.stock.totalOwned = stock;
    product.category = formatedCategory;
    product.priceDay = priceday;
    product.manufacturer = [manufacturer];
    product.bulletPoints = formatedBulletPoints;
    product.lastUpdated = new Date();
    await product.save();

    message = `
    product edited successfully.
    product: ${product}
    `
    req.flash('success', message);
    res.redirect('/admin/stock');
    // res.send(message)
  } catch (error) {
    throw new ExpressError(`product error: ${error}`, 404); 
  }
}));

app.post('/admin/product', isLoggedIn, isAdmin, upload.single("file"), catchAsync(async (req, res) => {
  try {
    console.log("crude req.body from request:");
    console.log(req.body);
    if (req.file === undefined) throw new ExpressError('You must select a file', 400);
    const imgUrl = `http://localhost:${process.env.PORT}/file/${req.file.filename}`;
    const { name, stock, category, priceday, manufacturer, bulletpoints } = req.body;
    let formatedCategory;
    if (!category) {
      formatedCategory = undefined;
      console.log("category set to undefined")
    } else {
      formatedCategory = category;
    }
    console.log('modified category if undefined: ' + category);
    const formatedBulletPoints = bulletpoints.split('\n').map(line => line.trim());

    const product = new Product({
      name,
      stock: {totalOwned: stock},
      formatedCategory,
      priceDay: priceday,
      manufacturer: [manufacturer],
      bulletPoints: formatedBulletPoints,
      images: [{filename: req.file.filename}],
    })

    await product.save();

    message = `
    product and image saved successfully
    product image url: ${imgUrl}
    product: ${product}
    `
    req.flash('success', message);
    res.redirect('/admin/stock');
    // res.send(message)
  } catch (error) {
    // Find the file entry in photos.files collection
    let file;
    try {
      file = await gfs.files.findOne({ filename: req.file.filename});
    } catch (error) {
      throw new ExpressError(`Image could not be deleted after the product was attempted to be created.
      Check database for residual files

      Error from the product model: ${error} `, 404); 
    }
    
    // Delete the file entry from photos.files collection
    await gfs.files.deleteOne({ _id: file._id });
    
    // Delete the corresponding chunks from photos.chunks collection
    await conn.db.collection('photos.chunks').deleteMany({ files_id: file._id });
    
    throw new ExpressError(`product error: ${error}
    
    Adjacent image deleted successfully, no residual files.`, 404); 
  }
}));

app.get('/account', isLoggedIn, (req, res) => {
  res.render('account/account');
});

app.post('/account/orders', isLoggedIn, catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    const {pickupDate, returnDate, selectedProducts} = req.body;
    console.log(req.body)
    validateDates(pickupDate, returnDate);

    const maxOrdersPerUser = process.env.MAXORDERSPERUSER || 3;
    const userOrders = await Order.find({
      $and: [
        {user: userId},
        {finished: false}
      ]
    })
    if (userOrders.length >= maxOrdersPerUser) {
      res.status(400).json({message: `Only ${maxOrdersPerUser} order/s can be active per user`});
      throw new Error(`Only ${maxOrdersPerUser} order/s can be active per user`); 
    }

    if(!pickupDate || !returnDate || selectedProducts.length < 1) { 
      res.status(400).json({message: 'Either a date or products are missing'});
      throw new Error('Either a date or products are missing'); 
    }
    
    let products = [];
    let allProductsPriceSum = 0;
    let totalOrderPrice;

    for (const item of selectedProducts) {
      const productId = item.productId

      const productFromCart = await getProductFromCart(productId, userId);
      if (!productFromCart) {
        throw new Error('Products where not found in the cart');
      }

      const stock = await getStock.single(productId, pickupDate, returnDate);
      if(stock < productFromCart.qty) {
        throw new ExpressError(`Stock not enough for product:
        product Id: ${productId}
        product name: ${productFromCart.product.name}
        current stock: ${stock}
        requested qty: ${productFromCart.qty}`, 400); 
      }

      products.push({
        product: productId,
        priceAtRentalDay: productFromCart.product.priceDay,
        qty: productFromCart.qty
      })

      allProductsPriceSum += (productFromCart.product.priceDay * productFromCart.qty);

      console.log('product from cart:')
      console.log(productFromCart);
    }

    console.log('Products array:')
    console.log(products)

    console.log('allProductsPriceSum:')
    console.log(allProductsPriceSum)
    
    let daysDifference = 1;
    // Convert the input strings to Date objects
    const startDate = new Date(pickupDate);
    const endDate = new Date(returnDate);
    // Calculate the difference in milliseconds
    const timeDifference = endDate - startDate;
    if(timeDifference) {
      daysDifference = timeDifference / (1000 * 60 * 60 * 24);
    }
    
    function modifyPrice(pricePerDay) {
      let returnValue = pricePerDay;
      let percentage = 100;
      
      for (let index = 1; index < daysDifference;) {
        index += 1;
        if(index < 7){
          percentage -= priceDecay;
        }
        returnValue += pricePerDay * (percentage/100)
        // console.log('day: ' + (index + 1))
        // console.log('discount: ' + (percentage/100))
        // console.log('price a day: ' + (pricePerDay * (percentage/100)))
        // console.log(percentage)
        // console.log((percentage/100))
        // console.log(returnValue * (percentage/100))
      }
      
      const price = parseFloat(returnValue);
      const formattedPrice = price.toFixed(2);
      
      return formattedPrice
    }

    totalOrderPrice = modifyPrice(allProductsPriceSum);
    
    console.log('totalOrderPrice :')
    console.log(totalOrderPrice)
    
    
    
    const order = new Order({
      user: userId,
      products,
      price: {
        total: totalOrderPrice,
        deposit: 400
      },
      pickup: {
        date: pickupDate
      },
      return: {
        date: returnDate
      },
      state: "RENTED",
      delivery: {
        state: "NO"
      }
    })
    
    await order.save();

    // let response = {
    //   success: true,
    //   message,
    //   cart // You can include other relevant data in the response
    // };
    
    setTimeout(() => {
      res.status(200).json({message: 'All went well'});
    }, 2000)
  } catch (error) {
    console.log(error)
  }
}));

app.get('/account/orders', isLoggedIn, catchAsync(async (req, res) => {
  const userId = req.user.id
  const orders = await Order.find({user: userId}).populate('products.product');
  // console.log('THIS ARE THE RAW ORDERS')
  // console.log(orders);
  
  function formatDateSpanish(mongoDate) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      timeZone: 'UTC'
    };
  
    const date = new Date(mongoDate);
    const formattedDate = new Intl.DateTimeFormat('es-ES', options).format(date);
  
    // Remove trailing " UTC"
    trimmedDate = formattedDate.replace(/\sUTC$/, '');
  
    return trimmedDate;
  }

  const formattedOrders = orders.map(order => {
    const pickupDateES = formatDateSpanish(order.pickup.date);
    const returnDateES = formatDateSpanish(order.return.date);
    const orderDate = formatDateSpanish(order.createdAt);

    return {...order.toObject(), pickupDateES, returnDateES, orderDate}
  })
  
  // console.log('THIS FROM THE MAP FUNCTION')
  // console.log(formattedOrders[0].products);
  // console.log(formattedOrders[0].products[0].product.images[0]);

  // console.log(formattedDate); // Output: "4 de enero de 2024, 00:00"


  res.render('account/orders', {formattedOrders});
}));

app.get('/cart', isLoggedIn, catchAsync(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  const userCart = await Cart.findById(user.cart).populate('list.product');
  const cart = userCart.list
  res.render('shop/cart', {cart, priceDiscount, priceDecay});
}));

app.post('/cart/:productId', isLoggedIn, catchAsync(async (req, res) => {
  try {
    const { operation, value, requestFromCartPage, dateOnly, pickupDate, returnDate} = req.body;
    
    const user = await User.findById(req.user.id);
    let cart;
    let message;

    if (requestFromCartPage == true) {
      cart = await Cart.findById(user.cart).populate('list.product');
    } else {
      cart = await Cart.findById(user.cart);
    }

    if(dateOnly != true) {
      const productId = req.params.productId;
      const foundProductIndex = cart.list.findIndex(item => item.product.equals(productId));
  
      switch (operation) {
        case 'add':
          if (foundProductIndex === -1) {
            message = 'Product not found. Adding the product';
            cart.list.push({ product: productId, qty: 1 });
            break;
          }
          cart.list[foundProductIndex].qty += 1;
          message = 'Added one';
          break;
        case 'remove':
          if (foundProductIndex === -1) {
            message = 'Product not found';
            break;
          }
          if (cart.list[foundProductIndex].qty > 1) {
            cart.list[foundProductIndex].qty -= 1;
            message = 'Removed one';
          } else {
            message = 'Quantity cannot be less than 1';
          }
          break;
        case 'set':
          message = 'Operation disabled';
          break;
          if (value) {
            if(value < 1) {
              message = 'value cant be lower than 1'
              break;
            }
            cart.list[foundProductIndex].qty = value;
            message = `the value has been set to ${value}`
          } else {
            message = 'there is no value specified'
          }
        case 'delete':
          if (foundProductIndex === -1) {
            message = 'Product not found or already deleted';
            break;
          }
          cart.list.splice(foundProductIndex, 1);
          message = 'successfully removed'
          break
        default:
          message = 'No operation provided';
          break;
        }

      await cart.save();
    }
    

    if(requestFromCartPage == true) {
      // console.log('the raw cart:')
      // console.log(cart)
      let newCart = {};
      newCart._id = cart._id;
      newCart.list = await Promise.all(cart.list.map(async (item) => {
  
        let currentStock = 0;
        if (pickupDate && returnDate) {
          currentStock = await getStock.single(item.product._id, pickupDate, returnDate);
        } else {
          currentStock = item.product.stock.totalOwned;
        }  
  
        return {
          product: item.product,
          qty: item.qty,
          currentStock
        };
      }));   
      
      // console.log("and the result: ")
      // console.log(newCart)
      cart = newCart;
    }

    let response = {
      success: true,
      message,
      cart // You can include other relevant data in the response
    };
    // console.log(req.body);
    
    setTimeout(() => {
    }, 20000)
    setTimeout(() => {
      // Code to be executed after the delay
      res.status(200).json(response);
    }, Math.floor(Math.random() * 1000)); 

  } catch (error) {
    console.log(error)
    res.status(500).send(`Something went wrong: ${error}`);
  }
}));


app.get('/register', (req, res) => {
  res.render('user/register');
})

app.post('/register', catchAsync(async (req, res) => {
  try {
    const { username, email, business, phone, birth, dni, password } = req.body;
    const cart = new Cart({list: []});
    const user = new User({username, email, business, phone, birth, dni, cart: cart._id});
    const registeredUser = await User.register(user, password);
    cart.save();
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Bienvenido a SoundPro!');
      res.redirect('/shop');
    })
  } catch (e) {
    req.flash('error', e.message)
    res.redirect('/register')
  }
}));

app.get('/login', (req, res) => {
  res.render('user/login');
});

app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
  req.flash('success', 'Welcome back!');
  res.redirect('/shop');
});

app.get('/logout', logout);

app.get('/shop', catchAsync(async (req, res) => {
  const limit = 0;
  const products = await Product.find({ discontinued: false }).limit(limit);
  res.render('shop/shop', { products });
}));

app.post('/shop/update-filters', catchAsync(async (req, res) => {
  try {
    const {filters, pickupDate, returnDate} = req.body
    const searchParams = [];
    for (let key in filters) {
      if (filters[key]) {
        searchParams.push(key)
      }
    }
  
    let rawproducts;
    if (searchParams.length === 0) {
      rawproducts = await Product.find({ discontinued: false }).limit();
    } else {
      rawproducts = await Product.find({ category: { $in: searchParams }, discontinued: false});
    }
  
    const products = await Promise.all(rawproducts.map(async (product) => {
      let currentStock = 0;
  
      if (pickupDate && returnDate) {
        currentStock = await getStock.single(product._id, pickupDate, returnDate);
      } else {
        currentStock = product.stock.totalOwned;
      }
  
      return { ...product.toObject(), currentStock }; // Create a new object with added currentStock property
    }))
  
    // console.log(products)
    setTimeout(() => {
      res.json(products);
    }, Math.floor(Math.random() * 1000))
  } catch (error) {
    console.log('there was an error: ' + error)
  }
}));

app.get("/file/:filename", catchAsync(async (req, res) => {
  const file = await gfs.files.findOne({ filename: req.params.filename });
  if (!file) { throw new ExpressError('File not found', 404); }
  const readStream = gfs.createReadStream(file.filename);
  readStream.pipe(res);
}));

app.delete("/file/:filename", isLoggedIn, isAdmin, catchAsync(async (req, res) => {
  // Find the file entry in photos.files collection
  const file = await gfs.files.findOne({ filename: req.params.filename });

  if (!file) { throw new ExpressError('File not found', 404); }

  // Delete the file entry from photos.files collection
  await gfs.files.deleteOne({ _id: file._id });

  // Delete the corresponding chunks from photos.chunks collection
  await conn.db.collection('photos.chunks').deleteMany({ files_id: file._id });

  res.send("success");
}));

app.post("/file/upload", isLoggedIn, isAdmin, upload.single("file"), catchAsync(async (req, res) => {
  if (req.file === undefined) throw new ExpressError('You must select a file', 400);
  const imgUrl = `http://localhost:${process.env.PORT}/file/${req.file.filename}`;
  return res.send(imgUrl);
}));

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const {statusCode = 500, message = 'Something went wrong'} = err;
  res.status(statusCode).render('error', {err});
});

const port = process.env.PORT || 3000;
app.listen(port, console.log(`Listening on port ${port}...`));