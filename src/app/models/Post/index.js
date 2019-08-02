import {Schema} from 'app/mongoose';
import {conn} from 'config/database';

export const PostType = {
    alert: "alert",
    assignment: "assignment",
    attendance: "attendance",
    project: "project",
    grade: "grade",
};

export const PostSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    courseId: {type: Schema.Types.ObjectId, required: true},
    type: {type: String, required: true},
    title: {type: String, required: true},
    content: {type: String},
    dueDate: {type: Date, default: null},
    files: {type: [String]},
});

PostSchema.path('files').get(function (v) {
    if (Array.isArray(v)) {
        return v.map(x => ({
            name: x,
            url: `${process.env.APP_URL}/storage/course/${this.courseId}/post/${this._id}/${x}`,
        }));
    }
    return [];
});

const Post = conn.model('Post', PostSchema);

export default Post;
