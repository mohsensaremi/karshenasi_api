import {BaseJob} from './BaseJob';
import Post from 'app/models/Post';
import SendNotification from './SendNotification';

class SendPostNotifications extends BaseJob {

    async handle() {
        const {
            postId,
        } = this.job.data;

        const post = await Post.findById(postId).populate("course");
        if (post && post.course) {
            const members = await post.course.getMembers();
            members.map(member => {
                SendNotification.dispatch({
                    userId: member.id,
                    notificationType: "Post",
                    notificationId: post.id,
                })
            });
        }
    }
}

export default SendPostNotifications;
