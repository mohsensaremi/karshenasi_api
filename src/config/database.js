import mongoose from 'mongoose';

mongoose.set('debug', process.env.NODE_ENV === 'development');

function createConnection(url, options) {
    return mongoose.createConnection(url, options);
}

export const conn = createConnection(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`, {
    useNewUrlParser: true,
    dbName: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME || undefined,
    pass: process.env.DB_PASSWORD || undefined,
});

export default conn;
