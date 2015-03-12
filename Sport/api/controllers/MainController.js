/**
 * MainController
 *
 */
var DEFAULT_LIMIT = 300,
    DEFAULT_CATEGORY = 'Гейнер';

module.exports = {
    index: function(req, res) {

        Categories.find(function(err, categories) {
            if (!err) {

                Items.find({
                        category: DEFAULT_CATEGORY
                     })
                     .limit(DEFAULT_LIMIT)
                     .exec(function(err, items) {
                        res.view({
                            items: items,
                            categories: categories
                        });
                     });

            } else {
                res.view();
            }
        });
    }
};

