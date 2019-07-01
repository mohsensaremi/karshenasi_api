import {Schema} from 'app/mongoose';
import {conn} from 'config/database';

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

const Course = conn.model('Course', CourseSchema);

export default Course;
