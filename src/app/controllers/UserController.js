import response from 'app/response';
import User, {UserType} from 'app/models/User';
import pick from 'lodash/pick';

export async function byId(ctx) {
    const {userId} = ctx.query;

    const user = await User.findOne({
        _id: userId,
        type: UserType.instructor,
    });

    return response.json(ctx, {
        data: pick(user, [
            'firstName',
            'lastName',
            'type',
            'email',
        ])
    });
}
