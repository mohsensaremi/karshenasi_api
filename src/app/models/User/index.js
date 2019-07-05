import {Schema} from 'app/mongoose';
import {conn} from 'config/database';
import UserToken from 'app/models/UserToken';

export const UserType = {
    instructor: "instructor",
    student: "student",
};

export const UserSchema = new Schema({
    firstName: {type: String},
    lastName: {type: String},
    type: {type: String},
    password: {type: String, required: true},
    email: {type: String, required: true},
}, {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
        },
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
        },
    },
});

UserSchema.methods.generateToken = async function () {
    return await UserToken.generateTokenFor(this);
};

const User = conn.model('User', UserSchema);

export default User;
