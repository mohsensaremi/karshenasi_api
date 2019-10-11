import {Schema} from 'app/mongoose';
import {conn} from 'config/database';

export const NotificationSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    notificationType: {type: String, required: true},
    notificationId: {type: Schema.Types.ObjectId, required: true},
});

NotificationSchema.virtual('notifiable', {
    ref: doc => {
        return doc.notificationType;
    },
    localField: 'notificationId',
    foreignField: '_id',
    justOne: true,
});

const Notification = conn.model('Notification', NotificationSchema);

export default Notification;
