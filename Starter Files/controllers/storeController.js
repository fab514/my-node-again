const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
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
      next({ message: 'That filetype isn\'t allowed!' }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
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

exports.createStore = async (req, res) => {
  req.body.author = req.user._id; // takes the id of the currently logged on user and created store to the author
  const store = await (new Store(req.body)).save(); // gets reflected in connection to mongoose
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`); // flashes can include success, error, warning, info types
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores }); // pass the variable stores to put the arrays in our template.
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
};


exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  // 2. confirm they are the owner of the store
  confirmOwner(store, req.user);
  // 3. Render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  req.body.location.type = 'Point';
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`);
  res.redirect(`/stores/${store._id}/edit`);
  // Redriect them the store and tell them it worked
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  if (!store) return next();
  res.render('store', { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true, $ne: [] };

  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);


  res.render('tag', { tags, title: 'Tags', tag, stores });
};


exports.searchStores = async (req, res) => {
  const stores = await Store
  // first find stores that match
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  })
  // the sort them
  .sort({
    score: { $meta: 'textScore' }
  })
  // limit to only 5 results
  .limit(5);
  res.json(stores);
};

// we're looking for array of longitude and latitude
exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat); // parse float will turn the string into a number
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 // 6.2 miles
      }
    }
  };
  const stores = await Store.find(q).select('slug name description location photo').limit(10); // you can select the items you want shown
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
}

// Video 35
exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
  .findByIdAndUpdate(req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  );
  res.json(user);
};

// Video 36- Any hearted stores will show on the hearted page
exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts } // looks for any id that is in an array for the hearts
  });
    res.render('stores', { title: 'Hearted Stores', stores });
}

// exports.getTopStores = async (req, res) => {
//     const stores = await Store.getTopStores();
//     res.json(stores);
//     // res.render('topStores', { stores, title:'Top Stores!'}
//     // render out a topStores.pug file
//     // );
// }


//- Future considirations: you can have different levels of Users
//-  10 Admin This will be put in storeCard.pug
//-  20 Editor 
//- From line 60 in storeController
//- if (!store.author.equals(user._id) || user.level < 10)