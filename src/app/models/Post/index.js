import {Schema} from 'app/mongoose';
import {conn} from 'config/database';

export const PostType = {
    simple: 'simple',
};

export const PostSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    courseId: {type: Schema.Types.ObjectId, required: true},
    type: {type: String, required: true},
    title: {type: String, required: true},
    content: {type: String},
});

const Post = conn.model('Post', PostSchema);

export default Post;
