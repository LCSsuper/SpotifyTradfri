/**
 * Created by lcssuper on 08-11-18.
 */
let http = require('http'),
    fs = require('fs'),
    SpotifyWebApi = require('spotify-web-api-node'),
    tradfri = require("node-tradfri-client"),
    request = require('request'),
    path = require('path');

const configuration = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const client = new tradfri.TradfriClient(configuration.tradfri.name);
let initialized = false;

/**
 * Connect to the tradfri client
 */
try {
    client.connect(configuration.tradfri.identity, configuration.tradfri.psk).then(result => {
        if (result) {
            initializeTradfri();
        }
    })
} catch (e) {
    console.log('Something went wrong!', e);
}

/**
 * Create the array that will hold all rgb lightbulbs
 * @type {Array}
 */
let lightbulbs = [];

let spotifyApi = new SpotifyWebApi({
    clientId: configuration.spotify.clientId,
    clientSecret: configuration.spotify.clientSecret,
    redirectUri: configuration.spotify.redirectUri
});

fs.readFile('./html/index.html', function (err, html) {
    if (err) {
        console.log(err);
    }

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

                getCurrentlyPlaying(response, filename);
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

        if (url.startsWith('/color/')) {
            let color = url.replace('/color/', '');
            setColor(color);

            response.writeHeader(200, {"Content-Type": "text/plain"});
            response.end("");
        }

        if (url.startsWith('/IDandPSK/')) {
            let name = url.replace('/IDandPSK/', '');
            getIDandPSK(name, response);
        }

        if (url === '/connect') {
            var scopes = 'user-read-private user-read-email user-read-playback-state';

            response.writeHead(302, {
                'Location': 'https://accounts.spotify.com/authorize' +
                    '?response_type=code' +
                    '&client_id=' + configuration.spotify.clientId +
                    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
                    '&redirect_uri=' + encodeURIComponent(configuration.spotify.redirectUri)
            });
            response.end();
        }

        if (url.startsWith('/callback/')) {

            let token = url.split("code=")[1];

            initializeSpotify(token);

            response.writeHead(302, {
                'Location': '/playing'
            });
            response.end();
        }

        if (url.startsWith('/save')) {

            let json = url.split("json=")[1];

            save(json);

            response.writeHead(302, {
                'Location': '/'
            });
            response.end();
        }

        if (url === '/playing') {
            fs.readFile('./html/playing.html', function (err, html) {
                if (err) {
                    console.log(err);
                }

                response.writeHeader(200, {"Content-Type": "text/html"});
                response.end(html);
            });
        }

        if (url === '/config') {
            fs.readFile('./html/config.html', function (err, html) {
                if (err) {
                    console.log(err);
                }

                response.writeHeader(200, {"Content-Type": "text/html"});
                response.end(html);
            });
        }
    }).listen(8080);
});

let getIDandPSK = async function(name, response) {
    try {
        const data = await client.authenticate(configuration.tradfri.securityCode);

        response.writeHeader(200, {"Content-Type": "text/plain"});
        response.end(JSON.stringify(data));
    } catch (e) {
        response.writeHeader(200, {"Content-Type": "text/plain"});
        response.end(null);
    }
};

let initializeTradfri = function() {
    client
        .on("device updated", deviceUpdated)
        .on("device removed", deviceRemoved)
        .observeDevices();

    // client.destroy();
};

/**
 * Check if device is an rgb lightbulb and add it to the array
 * @param device
 */
let deviceUpdated = function(device) {
    if (device.type === tradfri.AccessoryTypes.lightbulb && device.lightList[0].spectrum === "rgb") {
        lightbulbs[device.instanceId] = device;
    }
};

/**
 * Remove the device from the lightbulb array
 * @param instanceId
 */
let deviceRemoved = function(instanceId) {
    delete lightbulbs[instanceId];
};

/**
 * Set the color of the rgb lightbulbs to the main color of the given image
 * @param color
 */
let setColor = function(color) {
    lightbulbs.forEach(function(lightbulb) {
        const light = lightbulb.lightList[0];
        light.setColor(color);
    });
};

/**
 * Authorize the spotify web api
 */
let initializeSpotify = function(token) {
    spotifyApi
        .authorizationCodeGrant(token)
        .then(function(data) {
            console.log('Retrieved access token', data.body['access_token']);

            spotifyApi.setAccessToken(data.body['access_token']);
            initialized = true;
        });
};

let save = function(json) {
    json = json.replace(/%22/g, '"');

    fs.writeFile('config.json', json, function() {
        console.log("saved!");
    });
};

/**
 * Current playing album
 * @type {string}
 */
let currentAlbum = "";

/**
 * Get the current playing album
 */
let getCurrentlyPlaying = function(response, filename) {
    if (initialized) {
        spotifyApi.getMyCurrentPlaybackState({})
            .then(function(data) {

                let album = "";
                let title = "";
                let artist = "";

                if (!isEmpty(data.body)) {
                    album = data.body.item.album.name;
                    title = data.body.item.name;
                    artist = data.body.item.artists[0].name;

                    if (album !== currentAlbum) {
                        currentAlbum = album;
                        let albumCover = data.body.item.album.images[0].url;
                        filename = 'album/' + new Date().getTime() + '.jpeg';
                        download(albumCover, filename, function() {
                            response.writeHeader(200, {"Content-Type": "application/json"});
                            response.end(JSON.stringify({
                                filename: filename.replace('album/', ''),
                                album: album,
                                title: title,
                                artist: artist
                            }));
                        });
                    } else {
                        response.end(JSON.stringify({
                            filename: filename,
                            album: album,
                            title: title,
                            artist: artist
                        }));
                    }
                }

                console.log("Now Playing: ", title);

            }, function(err) {
                console.log('Something went wrong!', err);
            });
    }
};

/****************************************************************************************
 *** Helper functions *******************************************************************
 ***************************************************************************************/

/**
 * Get hex color value from rgb
 * @param r
 * @param g
 * @param b
 * @returns {*}
 */
let rgbToHex = function(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
};

/**
 * Get hex value from decimal value
 * @param c
 * @returns {string}
 */
let componentToHex = function(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

let download = function(uri, filename, callback) {

    const directory = 'album';

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });

    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function isEmpty(obj) {
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}