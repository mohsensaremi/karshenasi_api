import response from 'app/response';
import User, {UserType} from 'app/models/User';
import pick from 'lodash/pick';

/**
 * @api {get} /user/by-id by id
 * @apiDescription get user data with its id
 * @apiGroup User
 * @apiParam {String} id course id
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} data user object. check `Model > User`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "id": String, "edit": Boolean, "data": Object }
 * */
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
