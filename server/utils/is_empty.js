const is_empty = (obj) => {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    }
    return true;
};

module.exports = {
    is_empty,
};
