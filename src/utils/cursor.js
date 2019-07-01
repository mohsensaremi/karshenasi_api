export const encode = (...args) => {
    return Buffer.from(args.join(':')).toString('base64');
};

export const decode = (str, defaultValue = []) => {
    return str ?
        Buffer.from(str, 'base64').toString('ascii').split(':') :
        defaultValue;
};