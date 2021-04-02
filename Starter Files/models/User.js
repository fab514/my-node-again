const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('password-local-mongoose'); // adds additional fields to schema and any additional mehods for using passwords

const userSchema = new Schema({
    email: {
        type: String, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        validate: [validator.isEmail, 'Invalid Email Address'], 
        required: 'Please Supply an Email Address'
    },
    name: {
        type: String, 
        required: 'Please Supply a Name',
        trim: true
    }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler); // gives the user nicer error messages

module.exports = mongoose.model('User', userSchema);