var pageToDOM = require('./pageToDOM.js');
    Q = require('q');
    url = require('url'),
    fs = require('fs'),
    request = require('request'),
    mongoose = require('mongoose');

var Item;

var page = 1,
    category = 0,
    host = 'http://bsp.in.ua',
    urls = [
        "http://bsp.in.ua/gejner",
        "http://bsp.in.ua/protein",
        "http://bsp.in.ua/aminokisloty",
        "http://bsp.in.ua/kreatin",
        "http://bsp.in.ua/sportivnye-vitaminy",
        "http://bsp.in.ua/dlya-sustavov-i-svyazok",
        "http://bsp.in.ua/zhiroszhigateli",
        "http://bsp.in.ua/sportivnye-batonchiki",
        "http://bsp.in.ua/predtrenirovochnye-kompleksy",
        "http://bsp.in.ua/sportivnye-energetiki",
        "http://bsp.in.ua/specialnye-sportivnye-preparaty"
    ],
    links = [];

function ItemSchema() {
    return mongoose.model('Item',
        mongoose.Schema({

            active: {
                type: Boolean,
                default: false
            },

            createdAt: {
                type: Date,
                default: Date.now
            },

            updatedAt: {
                type: Date,
                default: Date.now
            },

            name: {
                type: String,
                trim: true,
                require: true
            },

            category:  {
                type: String,
                require: true
            },

            description: {
                type: String,
                trim: true
            },

            price: {
                type: String,
                require: true
            },

            photo: {
                type: String,
                trim: true
            },

            photoFull: {
                type: String,
                trim: true
            },

            manufacturer: {
                type: String,
                trim: true
            }
        })
    );
};


// Просто коннект к базюльке
;(function() {
    mongoose.connect('127.0.0.1', 'sails', 27017);
    mongoose.connection
        .once('open', function() {
            Item = ItemSchema();
            console.log('Mongoose was connected successfully.');

            getCategory();
        })
        .once('error', function(err) {
            console.log('Mongoose connection error: ', err);
            process.exit();
        });
})();

function getCategory() {
    if (urls[category]) {
        pageToDOM.get({
            url: urls[category],
            callback: getItemsLinks
        });
    } else {
        console.log('All items was loaded.', links.length);
        loadItem();
    }
};

function getItemsLinks($) {
    if ($) {
        ++page;

        $('.padding_tovar .product_image a').each(function(i, a) {
            console.log($(a).attr('href'));
            links.push(host + $(a).attr('href'));
        });

        pageToDOM.get({
            url: urls[category] + '/page/' + page,
            callback: function($) {
                if ($) {
                    getItemsLinks($);
                } else {
                    page = 1;
                    category++;
                    getCategory();
                }
            }
        });
    } else {
        console.log('ERROR');
    }
};

function loadItem() {
    var defs = [];

    links.forEach(function(link, i) {
        var d = Q.defer();
        defs.push(d.promise);

        setTimeout(function() {
            pageToDOM.get({
                url: link,
                callback: function($) {
                    var src = $('.item_bigpic img').attr('src'),
                        pathArr = src.split('/'),
                        imgFullId = pathArr.pop(),
                        imgId = imgFullId.replace('_2', '');

                    pathArr.pop();
                    src = pathArr.join('/') + '/' + imgId;

                    Item.create({
                        name: $('.pagetitle').text(),
                        category: $('#breadcrumb li').last().prev().prev().text(),
                        manufacturer: $('#prodprice_table .hidden-xs').first().contents().eq(3).text(),
                        photoFull: host + '/' + src,
                        photo: host + '/' + $('.item_bigpic img').attr('src'),
                        description: $('.tab-content .tab-pane p').text(),
                        price: $('.tre_price').text()
                    }, function(err, doc) {
                        if (!err) {
                            d.resolve();
                        } else {
                            d.reject(err);
                        }
                    });
                }
            });
        }, 100 * i);
    });

    Q.allResolved(defs).then(function() {
        console.log('All items added to DB.', links.length);
        loadItemsImages();
    });
};

function loadItemsImages() {
    Item.find()
        .exec(function(err, docs) {
            var imgDefers = [];

            docs.forEach(function(item, i) {
                var d = Q.defer();
                imgDefers.push(d.promise);

                setTimeout(function() {
                    var minImgD = Q.defer(),
                        originImgD = Q.defer(),
                        defs = [minImgD.promise, originImgD.promise];

                    download(item.photo, 'images/' + item.photo.split('/').pop(), function() {
                        console.log(item.photo, ' done downloading...');
                        minImgD.resolve();
                    });

                    download(item.photoFull, 'images/' + item.photoFull.split('/').pop(), function() {
                        console.log(item.photoFull, ' done downloading...');
                        originImgD.resolve();
                    });

                    Q.allResolved(defs).then(function() {
                        d.resolve();
                    });
                }, 100 * i);
            });

            Q.allResolved(imgDefers).then(function() {
                updateItemImagesLinks();
            });
        });
};

function updateItemImagesLinks() {
    Item.find()
        .exec(function(err, docs) {
            docs.forEach(function(item, i) {
                item.photo = 'images/' + item.photo.split('/').pop();
                item.photoFull = 'images/' + item.photoFull.split('/').pop();
                item.save();
            });

            console.log('All done');
        });
};

function download(uri, filename, callback){
    request.head(uri, function(err, res, body){
        var r = request(uri).pipe(fs.createWriteStream(filename));
        r.on('close', callback);
    });
};
