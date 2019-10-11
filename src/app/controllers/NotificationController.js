import response from 'app/response';
import Notification from 'app/models/Notification';

/**
 * @api {get} /notification/count count
 * @apiDescription get notifications count
 * @apiGroup Notification
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Number} count notifications count
 * @apiSuccessExample example
 * { "success":true, "status": 200, "count": Number }
 * */
export async function count(ctx) {
    const userId = ctx.authService.getUserId();
    const count = await Notification.find({
        userId,
    }).countDocuments();

    return response.json(ctx, {
        count,
    });
}

/**
 * @api {post} /notification/read read
 * @apiDescription mark notifications as read
 * @apiGroup Notification
 * @apiParam {String[]} array of notifications id
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Number} count notifications count
 * @apiSuccessExample example
 * { "success":true, "status": 200, "count": Number }
 * */
export async function read(ctx) {
    const {ids} = ctx.request.body;
    const userId = ctx.authService.getUserId();

    await Notification.deleteMany({
        _id: {$in: ids},
        userId,
    });

    const count = await Notification.find({
        userId,
    }).countDocuments();

    return response.json(ctx, {
        count,
    });
}

/**
 * @api {get} /notification/list list
 * @apiDescription list of notifications
 * @apiGroup Notification
 * @apiUse AuthHeader
 * @apiUse Datatable
 * @apiSuccess {Object[]} data array of records. check `Model > Notification`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": [Object], "total": Number }
 * */
export async function list(ctx) {
    const userId = ctx.authService.getUserId();
    const dt = await Notification.dataTable(ctx.requestData(), {
        userId,
    });
    await Notification.populate(dt.data, {
        path: 'notifiable',
        populate: {
            path: 'course',
        },
    });

    return response.json(ctx, dt);
}
