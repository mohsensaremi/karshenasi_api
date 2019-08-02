import {Schema} from 'app/mongoose';
import {conn} from 'config/database';
import UserToken from 'app/models/UserToken';
import Course from "../Course";
import ValidatorException from 'app/exeptions/ValidatorException';

export const UserType = {
    instructor: "instructor",
    student: "student",
};

export const UserSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    type: {type: String, required: true, enum: Object.values(UserType)},
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

UserSchema.virtual('typeFa').get(function () {
    switch (this.type) {
        case UserType.instructor:
            return "استاد";
        case UserType.student:
            return "دانشجو";
    }
});

UserSchema.methods.generateToken = async function () {
    return await UserToken.generateTokenFor(this);
};

UserSchema.methods.isInstructor = function () {
    return this.type === UserType.instructor;
};

UserSchema.methods.isStudent = function () {
    return this.type === UserType.student;
};

UserSchema.methods.findCourseById = async function (courseId, throwErr = true) {

    const course = await Course.findOne({
        _id: courseId,
        userId: this._id,
    });
    if (throwErr && !course) {
        throw new ValidatorException(`course with id:${courseId} not found`);
    }

    return course;
};

const User = conn.model('User', UserSchema);

export default User;
