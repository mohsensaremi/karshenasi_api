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

///////////////////////////

export const startOfWordInAnyOrder = (str) => {
    const regex = str.trim().split(/\s+/)
        .map(item => singleStartOfWordInAnyOrder(item))
        .join('');

    return `^${regex}.*$`;
};

export const singleStartOfWordInAnyOrder = (str) => {
    str = str.trim();
    let regex = [singleStartOfWordWithSpace(str)];

    if (str.startsWith('آ')) {
        regex.push(singleStartOfWordWithSpace(str.replace(/^آ/, 'ا')));
    }
    if (str.startsWith('ا')) {
        regex.push(singleStartOfWordWithSpace(str.replace(/^ا/, 'آ')));
    }

    return `(?=.*(${regex.join('|')}))`;
};

export const singleStartOfWordWithSpace = (str) => {
    str = str.trim();

    return `^${str}|\\s${str}|^${str}$`;
};
