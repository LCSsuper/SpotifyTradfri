const fs = require('fs');

const get = (example = false) => new Promise((resolve, reject) => {
    if (example) {
        fs.readFile('./config.example.json', 'utf8', (_, data) => { resolve(data); });
    } else {
        fs.stat('./config.json', (err) => {
            if (err) {
                reject(err);
            } else {
                fs.readFile('./config.json', 'utf8', (_, data) => { resolve(data); });
            }
        });
    }
});

const save = (json) => {
    fs.writeFile('./config.json', json.replace(/%22/g, '"'), () => { });
};

module.exports = {
    get,
    save,
};
