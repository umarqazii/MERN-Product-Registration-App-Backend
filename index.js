const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const { User, Request, Product } = require('./Models/Database');
const nodemailer = require('nodemailer');


app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/Assignment2', { useNewUrlParser: true, useUnifiedTopology: true });

//initialize userID as null
let userID = null;


// ----------------------------------Login route (used to check if the person is registered)----------------------------------
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if it's the admin login
  if (username === 'admin' && password === 'admin') {
    return res.status(200).json({ isAdmin: true, message: 'Admin login successful' });
  }

  // Check the database for a matching user
  User.findOne({ username: username, password: password })
    .then(user => {
      if (user) {
        // User found, consider it a successful login
        userID = user._id;
        
        return res.status(200).json({ isAdmin: false, token: 'yourAuthToken', user: user, message: 'Login successful' });
      } else {
        // No matching user found in the database
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

// ----------------------------------Register route (used for signup purpose)----------------------------------
app.post('/users', (req, res) => {
  // Assuming you want to create a new user based on the User model
  User.create(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// ----------------------------------Create request route (used to create a request)----------------------------------
app.post('/create-request', async (req, res) => {
  //set each variable of request table explicitly
  const { productName, version, description } = req.body;
  const userId = userID;

  //create request
  Request.create({ userId, productName, version, description })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json(error);
    });

});

// ----------------------------------Show all requests route (show all requests to admin)----------------------------------
app.get('/all-requests', async (req, res) => {
  try {
    const allRequests = await Request.find();
    res.json(allRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ----------------------------------Show user's own requests route (show user's own requests to user)----------------------------------
app.get('/user-own-requests', async (req, res) => {
  try {
    // Use the same userID variable that you've declared before
    const userRequests = await Request.find({ userId: userID });

    res.json(userRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//function to generate license key
function generateLicenseKey() {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  //generate 10 character license key
  for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// ----------------------------------Add product route (used to add a product)----------------------------------
app.post('/add-product', async (req, res) => {
  //set each variable of product table explicitly
  const { userId, productName, version, description } = req.body;
  const licenseKey = generateLicenseKey();
  const activationStatus = 'inactive';

  //corresponding to the userId that the admin entered in the form, find the email id of the user in the user table
  const user = await User.findOne({ _id: userId });
  const email = user.email;

  //send license key to the user's email id

  //create transporter

  var transporter = nodemailer.createTransport({

    service: 'gmail',
    auth: {
      user: 'umarqazii983@gmail.com',
      pass: 'ptwh ivzw izgm hgdl'
    }
  });

  //create mail options
  var mailOptions = {
    from: 'umarqazii983@gmail.com',
    to: email,
    subject: 'License Key',
    text: 'Your license key for the product "' + productName + '" is "' + licenseKey + '".'
  };

  //send mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    else {
      console.log('Email sent: ' + info.response);
    }
  });


  //create product
  Product.create({ userId, productName, version, description, licenseKey, activationStatus })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json(error);
    });

});

// ----------------------------------Show all Products (show all Products to admin)----------------------------------
app.get('/all-products', async (req, res) => {
  try {
    const allProducts = await Product.find();
    res.json(allProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ----------------------------------Show all Products (show all Products to admin)----------------------------------
app.get('/user-own-products', async (req, res) => {
  try {
    const allProducts = await Product.find({ userId: userID });
    res.json(allProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ----------------------------------Activate Product (activate using License Key)----------------------------------
app.post('/activate-license', async (req, res) => {
  try {
    const { productName, licenseKey } = req.body;
    const userId = userID; // Assuming userID is set when the user logs in

    // Check if there is a matching product and user
    const product = await Product.findOne({ productName, licenseKey, userId });

    if (product) {
      // Update the activation status to "Activated"
      await Product.updateOne({ _id: product._id }, { $set: { activationStatus: 'Activated' } });
      
      res.json({ message: 'Activation successful' });
    } else {
      res.status(401).json({ message: 'Invalid product or license key' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
