import {Schema} from 'app/mongoose';
import {conn} from 'config/database';
import CourseMember from '../CourseMember';
import keyBy from 'lodash/keyBy';
import ValidatorException from "app/exeptions/ValidatorException";
import User from "../User";
import toString from 'lodash/toString';

export const CourseSchema = new Schema({
    title: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, required: true},
    password: {type: String},
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


CourseSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

CourseSchema.virtual('hasPassword').get(function () {
    return !!this.password;
});

CourseSchema.virtual('userIsMember');
CourseSchema.virtual('userIsOwner');

CourseSchema.statics.setUserIsMember = async function (items, userId) {

    const ids = items.map(({_id}) => _id);

    const joinedCourses = await CourseMember.find({
        userId: userId,
        courseId: {$in: ids}
    });
    const joinedCoursesById = keyBy(joinedCourses, "courseId");

    return items.map(item => {
        item.userIsMember = !!joinedCoursesById[item.id];
        return item;
    });
};

CourseSchema.statics.setUserIsOwner = async function (items, userId) {
    return items.map(item => {
        item.userIsOwner = item.userId.toString() === userId;
        return item;
    });
};

CourseSchema.methods.checkUserIsOwner = function (userId, throwErr = true) {
    const result = toString(userId) === toString(this.userId);
    if (throwErr && !result) {
        throw new ValidatorException(`user: ${userId} is not course owner`);
    }
    return result;
};

CourseSchema.methods.checkUserIsMember = async function (userId) {
    const count = await CourseMember.find({
        userId,
        courseId: this.id,
    }).countDocuments();

    return count !== 0;
};

CourseSchema.methods.getMembers = async function () {
    const coursesPivot = await CourseMember.find({courseId: this._id});
    const userIds = coursesPivot.map(({userId}) => userId);
    return await User.find({
        _id: {$in: userIds},
    }).sort({
        lastName: 1,
        firstName: 1,
    });
};

const Course = conn.model('Course', CourseSchema);

export default Course;
