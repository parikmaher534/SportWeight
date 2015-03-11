/**
 * MainController
 *
 */
var DEFAULT_LIMIT = 10;

module.exports = {
    index: function(req, res) {
        Items.find()
             .limit(DEFAULT_LIMIT)
             .exec(function(err, items) {
                res.view({
                    items: items
                });
             });
    }
};

