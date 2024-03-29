const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
    created: {
        type: Date, 
        default: Date.now,
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: 'You must Supply a Author'
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store', 
        required: 'You must Supply a Store',
    },
    text:{
        type: String, 
        required: 'Your review must have text!',
    },
    rating: {
       type: Number, 
       min: 1, 
       max: 5, 
    },
})

// automatically populate the author field in reviews
function autopopulate(next) {
    this.populate('author');
    next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);   