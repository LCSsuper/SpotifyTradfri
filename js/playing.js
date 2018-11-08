/**
 * Created by lcssuper on 08-11-18.
 */

const Http = new XMLHttpRequest();
const HttpColor = new XMLHttpRequest();
const url = '/album';
const imageEl = document.getElementById('album-cover');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const albumEl = document.getElementById('album');
const body = document.getElementsByTagName('body')[0];
let filename = "";
let hex = "";

window.onload = function() {

    setAlbumColor();

    setInterval(() => {
        setAlbumColor();
    }, 500);
};

function setAlbumColor() {
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange = e => {
        let res = Http.responseText;

        if (res !== "") {

            res = JSON.parse(res);

            console.log(res);

            filename = res.filename;
            let title = res.title;
            let artist = res.artist;
            let album = res.album;
            titleEl.innerText = title;
            artistEl.innerText = artist;
            albumEl.innerText = album;

            if (filename !== "") {
                imageEl.src = "/album/" + filename;
            }
        }

        let rgb = getAverageRGB(imageEl);
        if (rgb.r != 0 || rgb.g != 0 || rgb.b != 0) {
            let newHex = rgbToHex(rgb.r, rgb.g, rgb.b);


            if (newHex !== hex) {
                body.style.background = "linear-gradient(to bottom right, #" + newHex + ", #191414)";

                HttpColor.open("GET", '/color/' + newHex);
                HttpColor.send();

                hex = newHex;
            }
        }
    };
}

function getAverageRGB(imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        console.log("No context");
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        console.log("security error");
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;
}

function decToHex(decimal) {
    let hex = decimal.toString('16');
    return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
    return decToHex(r) + decToHex(g) + decToHex(b);
}