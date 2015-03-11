/**
 * ItemsController
 *
 * @description :: Server-side logic for managing items
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var DEFAULT_OFFSET = 0,
    DEFAULT_LIMIT = 10;


module.exports = {
    index: function(req, res) {
        var offset = req.query.offset || DEFAULT_OFFSET,
            limit = req.query.limit || DEFAULT_LIMIT;

        Items.find()
             .skip(offset)
             .limit(limit)
             .exec(function(err, items) {
                res.header("Content-Type", "application/json; charset=utf-8");
                res.end(JSON.stringify(items));
             });
    }
};

