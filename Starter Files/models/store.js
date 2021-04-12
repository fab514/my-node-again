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
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String, 
            required: 'You must supply an address!'
        }
    }, 
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must Supply an Author'
        // Give a relationship between the user and the store in MongoDB
    }
});
storeSchema.pre('save', async function(next) { // save will not happen until work is done within this function
    if (!this.isModified('name')) {
        next(); // skip it 
        return; // stop this function from running
    }
    this.slug = slug(this.name); 
    // find other stores that have a slug of wes, wes-1, wes-2
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
    if(storesWithSlug.length) {
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }

    next();
    // TODO make more resiliant so slugs are unique
});

storeSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 }}
    ]);
}


module.exports = mongoose.model('Store', storeSchema);                                            // imports object with many properties instead of a functon 

