/**
 * Created by lcssuper on 08-11-18.
 */
let fs = require('fs'),
    request = require('request'),
    path = require('path');

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

let images = [
    "https://crank11.news/wp-content/uploads/sites/3/2017/09/bbdf945787a99d48cb840a1038da6d4e.jpg",
    "http://www.xxlmag.com/files/2017/06/Amine-Good-For-You.jpeg?w=980&q=75",
    "https://www.billboard.com/files/styles/900_wide/public/media/21-drake-more-life-album-art-2017-billboard-1240.jpg",
    "https://i.pinimg.com/originals/3a/f0/e5/3af0e55ea66ea69e35145fb108b4a636.jpg",
    "https://images.pigeonsandplanes.com/images/c_limit,f_auto,fl_lossy,q_auto,w_1030/bebllwzjpsujz9ffwp6s/tyler-the-creator-scum-fuck-flower-boy-cover"
];

download(images[0], 'album/' + new Date().getTime() + '.jpg', function() {
    console.log('done');
});