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

// Define our indexes, allow user to search by keyword in the name and despription
storeSchema.index({
    name: 'text',
    description: 'text'
  });
  
  storeSchema.index({ location: '2dsphere' });
  
  storeSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
      next(); // skip it
      return; // stop this function from running
    }
    this.slug = slug(this.name);
    // find other stores that have a slug of wes, wes-1, wes-2
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
    if (storesWithSlug.length) {
      this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }
    next();
    // TODO make more resiliant so slugs are unique
  });
  
  storeSchema.statics.getTagsList = function() {
    return this.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }

storeSchema.statics.getTopStores = function() {
    return this.aggregate([
        // aggregate is a query function, it is not mongoose specific so we can't use the virtual reviews. Goes right to MongoDB
        { $lookup: 
            {from: 'reviews', localField: '_id', 
            foreignField: 'store', as: 'reviews'}},
        // Lookup Stores and populate their reviews
        { $match: { 'reviews.1': { $exists: true }}} // reviews.1 access the second item in the reviews
        // Filter for only items that have 2 or more reviews
        // Add the average reviews field
        // Sort it by our new field, highest reviews first
        // Limit to at most 10

    ])
}

// find review where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
    ref: 'Review', // what model to link?
    localField: '_id', // which field on the store?
    foreignField: 'store', // which field on the review?
});


module.exports = mongoose.model('Store', storeSchema);                                            // imports object with many properties instead of a functon 

