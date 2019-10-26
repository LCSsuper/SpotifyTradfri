const fs = require('fs');
const path = require('path');
const request = require('superagent');

const download = async (uri, filename) => {
    const directory = 'album';

    fs.readdir(directory, (e, files) => {
        if (e) {
            console.error('Error: album folder not found');
        } else {
            for (const file of files) {
                fs.unlink(path.join(directory, file), () => {});
            }
        }
    });

    const { body } = await request.get(uri);
    await new Promise((resolve) => {
        fs.writeFile(filename, body, () => { resolve(); });
    });
};

module.exports = {
    download,
};
