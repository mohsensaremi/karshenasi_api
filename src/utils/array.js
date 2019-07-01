export const spreadArrayBy = (k) => (keys, items, defaultValue = null) => {
    return keys.map(key => items.find(item =>
        item[k] === key
    ) || defaultValue);
};

export const spreadArrayById = spreadArrayBy('id');
