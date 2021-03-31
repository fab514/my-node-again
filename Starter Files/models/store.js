const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // built in es6 promise, global variable.
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String, // when saved to database it would be saved as a string
        trim: true, // it will trim off any empty space the user might type in
        required: 'Please enter a store name!' // will make it true and show the error message
    },
    slug: String, // a slug is a unique identifying part of a web address(usually at the end of the url)
    description: {
        type: String, 
        trim: true
    },
    tags: [String], // array of strings(tags)
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String, 
            default: 'Point'
        },
        coordinates: [{
            type: Number, 
            required: 'You must supply coordinate!'
        }],
        address: {
            type: String, 
            required: 'You must supply an address!'
        }
    }
    
});
storeSchema.pre('save', function(next) { // save will not happen until work is done within this function
    if (!this.isModified('name')) {
        next(); // skip it 
        return; // stop this function from running
    }
    this.slug = slug(this.name); 
    next();
    // TODO make more resiliant so slugs are unique
});

module.exports = mongoose.model('Store', storeSchema);                                            // imports object with many properties instead of a functon 

