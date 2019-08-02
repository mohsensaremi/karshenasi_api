import response from 'app/response';
import Course from 'app/models/Course';
import CourseMember from 'app/models/CourseMember';
import bcrypt from 'bcrypt';
import * as regexUtil from 'utils/regex';
import pick from 'lodash/pick';

/**
 * @api {post} /course/submit submit
 * @apiDescription submit a course
 * @apiGroup Course
 * @apiParam {String} title course title
 * @apiParam {String} [id] if provided, course will be edited otherwise create a new course
 * @apiParam {String} [password] if provided, user will be asked to enter this password for join to this course
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {String} id submitted course id
 * @apiSuccess {Boolean} edit for check if course created or edited
 * @apiSuccess {Object} data submitted course data. check `Model > Course`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "id": String, "edit": Boolean, "data": Object }
 * */
export async function submit(ctx) {
    const {title, password, id} = ctx.request.body;

    ctx.checkBody('title').notEmpty("وارد کردن عنوان اجباری است");
    if (ctx.errors) {
        return response.validatorError(ctx, ctx.errors);
    }
    let edit = false;
    let course = new Course();
    const userId = ctx.authService.getUserId();
    if (id) {
        course = await Course.findOne({
            _id: id,
            userId,
        });
        if (!course) {
            return response.validatorError(ctx, [{me: `course with id:${id} not found`}]);
        }
        edit = true;
    } else {
        course.userId = userId;
    }

    course.set({title});
    if (password) {
        course.password = bcrypt.hashSync(password, 10);
    }

    await course.save();
    course.userIsMember = false;
    course.userIsOwner = true;

    return response.json(ctx, {
        id: course.id,
        edit,
        data: course,
    });
}

/**
 * @api {get} /course/by-id by id
 * @apiDescription get course data with its id
 * @apiGroup Course
 * @apiParam {String} id course id
 * @apiParam {String} [withUser] if provided, the course owner data will be returned
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} data course object. check `Model > Course`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "id": String, "edit": Boolean, "data": Object }
 * */
export async function byId(ctx) {
    const {id, withUser} = ctx.query;
    const query = Course.findById(id);

    if (withUser) {
        query.populate('user')
    }

    let data = await query.exec();
    const authUserId = ctx.authService.getUserId();
    data = await Course.setUserIsMember([data], authUserId);
    data = await Course.setUserIsOwner(data, authUserId);
    data = data[0];

    return response.json(ctx, {
        data,
    });
}

/**
 * @api {post} /course/join join course
 * @apiGroup Course
 * @apiParam {String} courseId course id to join
 * @apiParam {String} [password] if course has password
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} id course id
 * @apiSuccess {Object} data course object. check `Model > Course`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "id": String, "data": Object }
 * */
export async function join(ctx) {
    const {courseId, password} = ctx.request.body;
    const userId = ctx.authService.getUserId();

    ctx.checkBody('courseId').notEmpty("courseId is required");
    if (ctx.errors) {
        return response.validatorError(ctx, ctx.errors);
    }
    const duplicate = await CourseMember.findOne({courseId, userId});
    if (duplicate) {
        return response.validatorError(ctx, [{me: `شما در این کلاس عضو هستید`}]);
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return response.validatorError(ctx, [{me: `کلاس وجود تدارد`}]);
    }

    if (course.hasPassword) {
        if (!bcrypt.compareSync(password, course.password)) {
            return response.validatorError(ctx, [{me: `کلمه عبور کلاس اشتباه است`}]);
        }
    }

    const record = new CourseMember({courseId, userId});
    await record.save();

    await Course.populate(course, 'user');

    course.userIsMember = true;
    course.userIsOwner = false;

    return response.json(ctx, {
        id: record.id,
        data: course,
    });
}

/**
 * @api {post} /course/leave leave course
 * @apiGroup Course
 * @apiParam {String} courseId course id to leave
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} id course id
 * @apiSuccessExample example
 * { "success":true, "status": 200, "id": String }
 * */
export async function leave(ctx) {
    const {courseId} = ctx.request.body;
    const userId = ctx.authService.getUserId();

    ctx.checkBody('courseId').notEmpty("courseId is required");
    if (ctx.errors) {
        return response.validatorError(ctx, ctx.errors);
    }
    const record = await CourseMember.findOne({courseId, userId});
    if (!record) {
        return response.validatorError(ctx, [{me: `شما در این کلاس عضو نیستید`}]);
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return response.validatorError(ctx, [{me: `کلاس وجود تدارد`}]);
    }

    const recordId = record;

    await record.delete();

    return response.json(ctx, {
        id: recordId,
    });
}

/**
 * @api {get} /course/joined-courses joined courses
 * @apiDescription list of joined courses
 * @apiGroup Course
 * @apiUse AuthHeader
 * @apiUse Datatable
 * @apiSuccess {Object[]} data array of records. check `Model > Course`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": [Object], "total": Number }
 * */
export async function joinedCourses(ctx) {
    const userId = ctx.authService.getUserId();

    const joinedCoursesPivot = await CourseMember.find({userId});
    const joinedCoursesId = joinedCoursesPivot.map(({courseId}) => courseId);
    const joinedCourses = await Course.dataTable(ctx.query, {
        _id: {$in: joinedCoursesId},
    });
    await Course.populate(joinedCourses.data, 'user');

    joinedCourses.data = joinedCourses.data.map(item => {
        item.userIsMember = true;
        item.userIsOwner = false;
        return item;
    });

    return response.json(ctx, joinedCourses);
}

/**
 * @api {get} /course/owned-courses owned courses
 * @apiDescription list of owned courses
 * @apiGroup Course
 * @apiUse AuthHeader
 * @apiUse Datatable
 * @apiSuccess {Object[]} data array of records. check `Model > Course`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": [Object], "total": Number }
 * */
export async function ownedCourses(ctx) {
    const userId = ctx.authService.getUserId();

    const ownedCourses = await Course.dataTable(ctx.query, {
        userId: userId,
    });

    ownedCourses.data = ownedCourses.data.map(item => {
        item.userIsMember = false;
        item.userIsOwner = true;
        return item;
    });

    return response.json(ctx, ownedCourses);
}

/**
 * @api {get} /course/by-user-id by user id
 * @apiDescription list of courses created by given user id
 * @apiParam {String} userId user id to find its courses
 * @apiGroup Course
 * @apiUse AuthHeader
 * @apiUse Datatable
 * @apiSuccess {Object[]} data array of records. check `Model > Course`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": [Object], "total": Number }
 * */
export async function byUserId(ctx) {
    const {userId} = ctx.query;

    const courses = await Course.dataTable(ctx.query, {
        userId: userId,
    });
    const authUserId = ctx.authService.getUserId();
    courses.data = await Course.setUserIsMember(courses.data, authUserId);
    courses.data = await Course.setUserIsOwner(courses.data, authUserId);

    return response.json(ctx, courses);
}

/**
 * @api {get} /course/similar similar
 * @apiDescription search the courses for given input
 * @apiParam {String} input input for search
 * @apiGroup Course
 * @apiUse AuthHeader
 * @apiSuccess {Object[]} data array of records. check `Model > Course`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": [Object] }
 * */
export async function similar(ctx) {
    const {input} = ctx.query;

    if (input) {
        let data = await Course.find({
            title: new RegExp(regexUtil.startOfWordInAnyOrder(input), "i"),
        }).populate('user');

        const authUserId = ctx.authService.getUserId()
        data = await Course.setUserIsMember(data, authUserId);
        data = await Course.setUserIsOwner(data, authUserId);

        return response.json(ctx, {
            data: data.map(x => pick(x, [
                '_id', 'id', 'title', 'hasPassword',
                'user._id', 'user.id', 'user.firstName', 'user.lastName'
            ])),
        });
    }

    return response.json(ctx, {
        data: [],
    });
}

/**
 * @api {get} /course/members course members
 * @apiDescription get list of members
 * @apiParam {String} courseId course id
 * @apiGroup Course
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {User[]} data array of members. check `Model > User`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": [User] }
 * */
export async function members(ctx) {
    const {courseId} = ctx.query;
    const user = ctx.authService.getMinimalUser();
    const course = await user.findCourseById(courseId);
    course.checkUserIsOwner(user._id);

    const data = await course.getMembers();
    return response.json(ctx, {
        data,
    });

}
