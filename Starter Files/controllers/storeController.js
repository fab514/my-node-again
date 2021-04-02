const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else {
            next({ message: `That filetype isn't allowed!` }, false);
        }
    }
};

exports.homePage = (req, res) => {
    res.render('index');
};

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add Store' }); // template can be used when creating a new store or editing an existing store. 
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    // check if there is no file to resize
    if (!req.file) {
        next(); // skip to the next middleware
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    // once we have written the photo to our filesystem, keep going!
    next();
};

// the error that wraps around this function is in errorHandlers.js line 9
exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save(); // gets reflected in connection to mongoose
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`); // flashes can include success, error, warning, info types
    res.redirect(`/store/${store.slug}`);  
};

exports.getStores = async (req, res) => {
    // 1. Query the database for a list of all stores
    const stores = await Store.find();
    res.render('stores', { title: 'Stores', stores }); // pass the variable stores to put the arrays in our template. 
};

exports.editStore = async (req, res) => {
    // 1. find the store given the id 
    const store = await Store.findOne({ _id: req.params.id });
    // 2. TODO confirm they are the owner of the store
    // 3. render out the edit form so the user can update there store
    res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
    // set the location data to be a point
    req.body.location.type = 'Point';
    // find and update the store
    const store = Store.findOneAndUpdate({ _id: req.params.id }, req.body, { // Store.findOneAndUpdate(q, data, options) the three parameters
        new: true, // return the new store instead of the old one
        runValidators: true 
    }).exec(); 
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
    res.redirect(`/stores/${(store)._id}/edit`);
    // redirect them to the store and tell them it worked
};

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({ slug: req.params.slug });
    if(!store) return next();
    res.render('store', { store, title: store.name });
};