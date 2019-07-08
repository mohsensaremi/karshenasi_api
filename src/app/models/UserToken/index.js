import {Schema} from 'app/mongoose';
import {conn} from 'config/database';
import jwt from 'jsonwebtoken';

export const UserTokenSchema = new Schema({
    sub: {type: String, required: true},
    iat: {type: Number, required: true},
});

UserTokenSchema.statics.generateTokenFor = async function (user) {
    const now = new Date();
    const seconds = parseInt(now.getTime() / 1000);
    const record = new UserToken({
        sub: user._id.toString(),
        iat: seconds,
    });
    await record.save();
    return jwt.sign({
        id: record._id,
        sub: record.sub,
        type: user.type,
        iat: seconds,
        exp: seconds + (60 * 60 * 24 * 30),
    }, process.env.JWT_SECRET);
};

const UserToken = conn.model('UserToken', UserTokenSchema);

export default UserToken;
