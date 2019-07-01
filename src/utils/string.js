export const normalizeString = (str) => {
    return str.replace(/ك/g, 'ک')
        .replace(/ي/g, 'ی');
};

export const ucfirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
