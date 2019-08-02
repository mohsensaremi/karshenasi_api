import {Schema} from 'app/mongoose';
import {conn} from 'config/database';

export const PostAttendanceSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    postId: {type: Schema.Types.ObjectId, required: true},
    attendance: {type: Boolean, required: true},
},{timestamps:undefined});

const PostAttendance = conn.model('PostAttendance', PostAttendanceSchema);

export default PostAttendance;
