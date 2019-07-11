import {Schema} from 'app/mongoose';
import {conn} from 'config/database';
import CourseMember from '../CourseMember';
import keyBy from 'lodash/keyBy';

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

CourseSchema.methods.checkUserIsOwner = async function (userId) {
    return userId == this.userId;
};

CourseSchema.methods.checkUserIsMember = async function (userId) {
    const count = await CourseMember.find({
        userId,
        courseId: this.id,
    }).countDocuments();

    return count !== 0;
};

const Course = conn.model('Course', CourseSchema);

export default Course;
