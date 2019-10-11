import {Schema} from 'app/mongoose';
import {conn} from 'config/database';
import Course from "../Course";
import PostAttendance from "../PostAttendance";
import PostGrade from "../PostGrade";
import keyBy from 'lodash/keyBy';

export const PostType = {
    alert: "alert",
    assignment: "assignment",
    attendance: "attendance",
    project: "project",
    grade: "grade",
};

export const FileSchema = new Schema({
    name: {type: String, required: true},
    fileName: {type: String, required: true},
}, {
    _id: false,
    timestamps: false,
});

export const PostSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    courseId: {type: Schema.Types.ObjectId, required: true},
    type: {type: String, required: true},
    title: {type: String, required: true},
    content: {type: String},
    dueDate: {type: Date, default: null},
    files: {type: [FileSchema]},
});

PostSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true,
});

PostSchema.path('files').get(function (v) {
    if (Array.isArray(v)) {
        return v.filter(x => x && x.name && x.fileName).map(x => ({
            fileName: x.fileName,
            name: x.name,
            url: `${process.env.APP_URL}/storage/course/${this.courseId}/post/${this._id}/${x.name}`,
        }));
    }
    return [];
});

PostSchema.methods.submitAttendance = async function (data) {
    const members = await this.getCourseMembers();
    const membersId = members.map(x => x.id);
    let oldData = await PostAttendance.find({
        postId: this._id,
        userId: {$in: membersId},
    });
    oldData = keyBy(oldData, 'userId');
    const promises = members.map(async m => {
        let item = oldData[m.id];
        if (!item) {
            item = new PostAttendance({
                postId: this._id,
                userId: m._id,
            });
        }
        item.attendance = !!data[m._id];
        await item.save();
        return item;
    });

    return await Promise.all(promises);
};

PostSchema.methods.submitGrade = async function (data) {
    const members = await this.getCourseMembers();
    const membersId = members.map(x => x.id);
    let oldData = await PostGrade.find({
        postId: this._id,
        userId: {$in: membersId},
    });
    oldData = keyBy(oldData, 'userId');
    const promises = members.map(async m => {
        let item = oldData[m.id];
        if (!item) {
            item = new PostGrade({
                postId: this._id,
                userId: m._id,
            });
        }
        item.grade = data[m._id];
        await item.save();
        return item;
    });

    return await Promise.all(promises);
};

PostSchema.methods.getCourse = async function () {
    return await Course.findById(this.courseId);
};

PostSchema.methods.getCourseMembers = async function () {
    const course = await this.getCourse();
    return await course.getMembers();
};

PostSchema.methods.getAttendances = async function (userId) {
    const find = {
        postId: this._id,
    };
    if (userId) {
        find.userId = userId;
    }
    const items = await PostAttendance.find(find);
    const data = {};
    items.forEach(x => {
        data[x.userId] = x.attendance;
    });

    return data;
};

PostSchema.methods.getGrades = async function (userId) {
    const find = {
        postId: this._id,
    };
    if (userId) {
        find.userId = userId;
    }
    const items = await PostGrade.find(find);
    const data = {};
    items.forEach(x => {
        data[x.userId] = x.grade;
    });

    return data;
};

PostSchema.pre('remove', async function () {
    const postAttendances = await PostAttendance.find({
        postId: this._id,
    });
    for (let i = 0; i < postAttendances.length; i++) {
        await postAttendances[i].remove();
    }

    const postGrades = await PostGrade.find({
        postId: this._id,
    });
    for (let i = 0; i < postGrades.length; i++) {
        await postGrades[i].remove();
    }
});

const Post = conn.model('Post', PostSchema);

export default Post;
