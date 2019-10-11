import SendNotification from './SendNotification';
import SendPostNotifications from './SendPostNotifications';

const jobs = [
    {
        name: SendNotification.name,
        cls: SendNotification,
        count: 10,
    },
    {
        name: SendPostNotifications.name,
        cls: SendPostNotifications,
        count: 1,
    },
];

export default jobs;
