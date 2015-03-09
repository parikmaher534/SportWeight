var fs = require('fs'),
    url = require('url'),
    cheerio = require('cheerio'),
    Iconv = require('iconv').Iconv,
    spawn = require('child_process').spawn;


var proxyList = [
        '112.78.150.30:8080',
        '66.90.121.114:80',
        '42.121.13.194:80',
        '213.157.36.82:3128',
        '115.124.73.53:80',
        '46.252.38.130:8080'
    ];


function getPageDOM(data) {
    var html = '',
        name = url.parse(data.url).path.replace(/\//g, '_'),
        currentProxy = proxyList[0],
        wget = spawn('wget', ['-L', '-S', '-O', './wget/' + name, '--proxy', currentProxy, data.url]);

    console.log('wget -L -S -O ../wget/' + name + ' --proxy ' + currentProxy + ' ' + data.url);

    wget.on('close', function(code) {
        if (code == 0) {
            html = fs.readFileSync('./wget/' + name);

            if (data.decode) {
                html = new Iconv('windows-1251', 'utf8').convert(new Buffer(html, 'binary')).toString();
            } else {
                html = html.toString();
            };

            data.callback(htmlToDOM(html));
        } else {
            getPageError('Ошибонька при загрузке.');
            data.callback();
        }

        console.log('Done: ', './wget/' + name);
        fs.unlinkSync('./wget/' + name);
    });
};

function htmlToDOM(html) {
    return cheerio.load(html);
};

function getPageError(error) {
    console.log(error);
};


module.exports = {
    get: getPageDOM
};