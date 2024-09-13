const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
name:String,
email:String,
password:String,
Visitors: { type: Number, default: 0 } 
});

const UserModel = mongoose.model('UserModel', userSchema);
module.exports = UserModel;
