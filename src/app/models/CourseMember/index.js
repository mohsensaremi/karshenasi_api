import {Schema} from 'app/mongoose';
import {conn} from 'config/database';

export const CourseMemberSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    courseId: {type: Schema.Types.ObjectId, required: true},
});

const CourseMember = conn.model('CourseMember', CourseMemberSchema);

export default CourseMember;
