var mailer = require('nodemailer');

/**
 * BuyController
 *
 * @description :: Server-side logic for managing items
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = {
    index: function(req, res) {
        var tel, email;

        if (req.method == 'POST') {
            tel = req.body.tel;
            email = req.body.email;

            res.header("Content-Type", "application/json; charset=utf-8");

            // Validation
            if (tel && email) {

                if (
                    !/^\d+$/.test(tel) ||
                    !/\S+@\S+\.\S+/.test(email)
                ) {
                    res.end(JSON.stringify({error: 'Поля заполнены не верно'}));
                } else {
                    res.end(JSON.stringify({status: 200}));
                }

            } else {
                res.end(JSON.stringify({error: 'Не заполнены все поля'}));
            }
        } else {
            res.statusCode = 404;
            res.end('404');
        }
    }
};

