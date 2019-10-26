const fs = require('fs');

const base64_encode = async (file) => {
    const buffer = await new Promise((resolve) => {
        fs.readFile(file, (e, data) => {
            if (e) resolve();
            resolve(data);
        });
    });

    if (!buffer) return null;
    return buffer.toString('base64');
};

module.exports = {
    base64_encode,
};
