import {BaseJob} from './BaseJob';
import Notification from 'app/models/Notification';

class SendNotification extends BaseJob {

    async handle() {
        const {
            userId,
            notificationType,
            notificationId,
        } = this.job.data;
        await Notification.deleteMany({
            userId,
            notificationType,
            notificationId,
        });
        const notification = new Notification({
            userId,
            notificationType,
            notificationId,
        });

        await notification.save();
    }
}

export default SendNotification;
