/**
 * This file contains the server for the Spotify - Trådfri app, created by Lucas Bos
 */

/**
 * Requires all dependencies
 */
let http = require('http'),
    fs = require('fs'),
    SpotifyWebApi = require('spotify-web-api-node'),
    tradfri = require("node-tradfri-client"),
    request = require('request'),
    path = require('path');

/**
 * Declares global variables
 */
let client = null,
    spotifyApi = null,
    initialized = false,
    lightbulbs = [];

/**
 * Creates a simple HTTP server and start listening on port 8080
 */
http.createServer((request, response) => {

    /**
     * Makes sure the front-end is allowed access to the server
     */
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    response.setHeader('Access-Control-Allow-Headers', '*');

    let url = request.url;
    console.log(url);

    /**
     * Endpoint: /color/{color}
     * Receives the hex color and sets the lightbulbs to that color
     */
    if (url.startsWith('/color/')) {
        let color = url.replace('/color/', '');
        setColor(color);

        response.writeHeader(200, {"Content-Type": "text/plain"});
        response.end();
    }

    if (url.startsWith('/generateTradfriData/')) {
        let securityCode = url.replace('/generateTradfriData/', '');
        generateTradfriData(response, securityCode);
    }

    if (url === '/authorize') {
        let scopes = 'user-read-private user-read-email user-read-playback-state';
        let configuration = JSON.parse(fs.readFileSync('config.json', 'utf8'));

        response.writeHeader(200, {"Content-Type": "text/plain"});
        response.end('https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + configuration.spotify.clientId +
            (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
            '&redirect_uri=' + encodeURIComponent(configuration.spotify.redirectUri));
    }

    if (url.startsWith('/access/')) {

        let token = url.split("/access/")[1];

        startTradfri();
        initializeSpotify(token);

        response.writeHeader(200, {"Content-Type": "text/plain"});
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

    if (url === '/getConfig') {
        fs.stat('./config.json', err => {
            if(err == null) {
                getConfig('./config.json', response)
            } else {
                getConfig('./config.example.json', response);
            }
        });
    }

    if (url === '/getCurrentlyPlaying') {
        getPlaying(response);
    }
}).listen(8080);

let getConfig = (filename, response) => {
    fs.readFile(filename, 'utf8', (err, data) => {
        response.writeHeader(200, {"Content-Type": "application/json"});
        response.end(data);
    });
};

let generateTradfriData = async (response, securityCode) => {
    response.writeHeader(200, {"Content-Type": "application/json"});

    const result = await tradfri.discoverGateway();
    let c = new tradfri.TradfriClient(result.name);

    try {
        const data = await c.authenticate(securityCode);
        response.end(JSON.stringify({result: result, data: data}));
    } catch (e) {
        response.end(null);
    }

    response.end(JSON.stringify(result));
};

let startTradfri = () => {

    let configuration = JSON.parse(fs.readFileSync('config.json', 'utf8'));

    try {
        if (client === null) {
            client = new tradfri.TradfriClient(configuration.tradfri.name);
        }

        client.connect(configuration.tradfri.identity, configuration.tradfri.psk).then(result => {
            if (result) {
                initializeTradfri();
            }
        })
    } catch (e) {}
};

let initializeTradfri = () => {
    client
        .on("device updated", deviceUpdated)
        .on("device removed", deviceRemoved)
        .observeDevices();
};

let deviceUpdated = device => {
    if (device.type === tradfri.AccessoryTypes.lightbulb && device.lightList[0].spectrum === "rgb") {
        lightbulbs[device.instanceId] = device;
    }
};

let deviceRemoved = instanceId => {
    delete lightbulbs[instanceId];
};

let setColor = color => {
    lightbulbs.forEach(lightbulb => {
        const light = lightbulb.lightList[0];
        light.setColor(color);
    });
};

let initializeSpotify = token => {

    let configuration = JSON.parse(fs.readFileSync('config.json', 'utf8'));

    spotifyApi = new SpotifyWebApi({
        clientId: configuration.spotify.clientId,
        clientSecret: configuration.spotify.clientSecret,
        redirectUri: configuration.spotify.redirectUri
    });

    spotifyApi
        .authorizationCodeGrant(token)
        .then(data => {
            spotifyApi.setAccessToken(data.body['access_token']);
            initialized = true;
        });
};

let save = json => {
    json = json.replace(/%22/g, '"');

    fs.writeFile('config.json', json, () => {});
};

let getPlaying = response => {
    if (initialized) {
        spotifyApi.getMyCurrentPlaybackState({})
            .then(data => {

                let album = "";
                let title = "";
                let artist = "";
                let albumCover = "";

                if (!isEmpty(data.body)) {
                    album = data.body.item.album.name;
                    title = data.body.item.name;
                    artist = data.body.item.artists[0].name;
                    albumCover = data.body.item.album.images[0].url;

                    filename = 'album/' + new Date().getTime() + '.jpeg';

                    download(albumCover, filename, () => {
                        let base64str = base64_encode(filename);

                        response.writeHeader(200, {"Content-Type": "application/json"});
                        response.end(JSON.stringify({
                            albumCover: base64str,
                            album: album,
                            title: title,
                            artist: artist
                        }));
                    });
                } else {
                    response.writeHeader(200, {"Content-Type": "application/json"});
                    response.end(JSON.stringify({
                        albumCover: albumCover,
                        album: album,
                        title: title,
                        artist: artist
                    }));
                }
            }, err => {});
    }
};

/****************************************************************************************
 *** Helper functions *******************************************************************
 ***************************************************************************************/

let download = (uri, filename, callback) => {

    const directory = 'album';

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {});
        }
    });

    request.head(uri, () => {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

let base64_encode = file => {
    let bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
};

let isEmpty = obj => {
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
};