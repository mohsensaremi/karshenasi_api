import {Schema} from 'app/mongoose';
import {conn} from 'config/database';

export const PostGradeSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    postId: {type: Schema.Types.ObjectId, required: true},
    grade: {type: Number, required: true},
}, {timestamps: undefined});

const PostGrade = conn.model('PostGrade', PostGradeSchema);

export default PostGrade;
