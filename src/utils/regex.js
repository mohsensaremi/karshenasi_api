export const wordInAnyOrder = (str) => {
    const regex = str.trim().split(/\s+/)
        .map(item => singleWordInAnyOrder(item))
        .join('');

    return `^${regex}.*$`;
};

export const singleWordInAnyOrder = (str) => {
    str = str.trim();
    let regex = [singleWordWithSpace(str)];

    if (str.startsWith('آ')) {
        regex.push(singleWordWithSpace(str.replace(/^آ/, 'ا')));
    }
    if (str.startsWith('ا')) {
        regex.push(singleWordWithSpace(str.replace(/^ا/, 'آ')));
    }

    return `(?=.*(${regex.join('|')}))`;
};

export const singleWordWithSpace = (str) => {
    str = str.trim();

    return `^${str}\\s|\\s${str}$|\\s${str}\\s|^${str}$`;
};
