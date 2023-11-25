const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, {
  collection: 'users' // Explicitly setting the collection name
});



let requestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String, required: true },
}, {
  collection: 'requests' // Explicitly setting the collection name
});

let productSchema = new Schema({
  userId: { type: String, required: true },
  productName: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String, required: true },
  licenseKey: { type: String, required: true },
  activationStatus: { type: String, required: true },
}, {
  collection: 'products' // Explicitly setting the collection name
});

// Only export once and include all models
module.exports = {
  Request: mongoose.model('Request', requestSchema),
  User: mongoose.model('User', userSchema),
  Product: mongoose.model('Product', productSchema),
};
