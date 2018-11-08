/**
 * Created by lcssuper on 08-11-18.
 */
let http = require('http'),
    fs = require('fs');

fs.readFile('./html/index.html', function (err, html) {
    if (err) {
        console.log(err);
    }

    console.log(1);

    http.createServer(function(request, response) {
        let url = request.url;

        console.log(url);

        if (url === '/') {
            response.writeHeader(200, {"Content-Type": "text/html"});
            response.end(html);
        }

        if (url.startsWith('/images/')) {
            fs.readFile('.' + url, function (err, image) {
                if (err) {
                    console.log(err);
                }

                let splitted = url.split('.'),
                    imageType = splitted[splitted.length - 1];

                response.writeHeader(200, {"Content-Type": "image/" + imageType});
                response.end(image, 'binary');
            });
        }

        if (url.startsWith('/images/')) {
            fs.readFile('.' + url, function (err, image) {
                if (err) {
                    console.log(err);
                }

                let splitted = url.split('.'),
                    imageType = splitted[splitted.length - 1];

                response.writeHeader(200, {"Content-Type": "image/" + imageType});
                response.end(image, 'binary');
            });
        }

        if (url === '/album') {
            fs.readdir('./album', (err, files) => {
                let filename = "";

                if (files.length > 0) {
                    filename = files[0];
                }

                response.writeHeader(200, {"Content-Type": "text/plain"});
                response.end(filename);
            })
        } else if (url.startsWith('/album/')) {
            fs.readFile('.' + url, function (err, image) {
                if (err) {
                    console.log(err);
                }

                let splitted = url.split('.'),
                    imageType = splitted[splitted.length - 1];

                response.writeHeader(200, {"Content-Type": "image/" + imageType});
                response.end(image, 'binary');
            });
        }

        if (url === '/favicon.ico') {
            fs.readFile('.' + url, function (err, image) {
                if (err) {
                    console.log(err);
                }

                response.writeHeader(200, {"Content-Type": "image/ico"});
                response.end(image, 'binary');
            });
        }

        if (url.startsWith('/css/')) {
            fs.readFile('.' + url, function (err, css) {
                if (err) {
                    console.log(err);
                }

                response.writeHeader(200, {"Content-Type": "text/css"});
                response.end(css);
            });
        }

        if (url.startsWith('/js/')) {
            fs.readFile('.' + url, function (err, js) {
                if (err) {
                    console.log(err);
                }

                response.writeHeader(200, {"Content-Type": "application/javascript"});
                response.end(js);
            });
        }

        //TODO: change to '/connect'
        if (url === '/playing') {
            //TODO: redirect to spotify authenticator
        }

        //TODO: change to '/playing'
        if (url === '/connect') {
            fs.readFile('./html/playing.html', function (err, html) {
                if (err) {
                    console.log(err);
                }

                response.writeHeader(200, {"Content-Type": "text/html"});
                response.end(html);
            });
        }
    }).listen(8080);
});