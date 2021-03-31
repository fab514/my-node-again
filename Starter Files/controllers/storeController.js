const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
    res.render('index');
};

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add Store' }); // template can be used when creating a new store or editing an existing store. 
}

// the error that wraps around this function is in errorHandlers.js line 9
exports.createStore = async (req, res) => {
    const store = new Store(req.body); // gets reflected in connection to mongoose
    await store.save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`); // flashes can include success, error, warning, info types
    res.redirect(`/store/${store.slug}`);  
};

exports.getStores = async (req, res) => {
    // 1. Query the database for a list of all stores
    const stores = await Store.find();
    console.log(stores);
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
    // find and update the store
    const store = Store.findOneAndUpdate({ _id: req.params.id }, req.body, { // Store.findOneAndUpdate(q, data, options) the three parameters
        new: true, // return the new store instead of the old one
        runValidators: true, 
    }).exec(); 
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}"></a>`)
    res.redirect(`/stores/${(await store)._id}/edit`);
    // redirect them to the store and tell them it worked
}
