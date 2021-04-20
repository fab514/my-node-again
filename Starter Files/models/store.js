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
    }
        // Give a relationship between the user and the store in MongoDB
}, {
    // will show the virtual fields when called in .dump
        toJSON: { virtuals: true }, 
        toObject: { virtual: true },
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
        // Lookup Stores and populate their reviews
        { $lookup: 
            { from: 'reviews', localField: '_id', 
            foreignField: 'store', as: 'reviews' }},
        // Filter for only items that have 2 or more reviews
        { $match: { 'reviews.1': { $exists: true }}}, // reviews.1 access the second item in the reviews
        // Add the average reviews field
        { $project: { // root shows the original field
          photo: '$$ROOT.photo',
          name: '$$ROOT.name',
          reviews: '$$ROOT.reviews',
          slug: '$$ROOT.slug',
          averageRating: { $avg: '$reviews.rating' }
        }},
        // Sort it by our new field, highest reviews first
        { $sort: { averageRating: -1 }},
        // Limit to at most 10
        { $limit: 10 }
    ])
}

// find review where the stores _id property === reviews store property
// virtual fields does not save any relationship between the fields.  It will not be shown in dump unless specifically called
storeSchema.virtual('reviews', {
    ref: 'Review', // what model to link?
    localField: '_id', // which field on the store?
    foreignField: 'store', // which field on the review?
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema); // imports object with many properties instead of a functon 

