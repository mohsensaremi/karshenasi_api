import response from 'app/response';
import Course from 'app/models/Course';
import CourseMember from 'app/models/CourseMember';
import bcrypt from 'bcrypt';
import * as regexUtil from 'utils/regex';
import pick from 'lodash/pick';

/**
 * @api {post} /course/submit submit a course. if
 * @apiGroup Course
 * @apiParam {String} title course title
 * @apiParam {String} [id] if provided, course will be edited otherwise create a new course
 * @apiParam {String} [password] if provided, user will be asked to enter this password for join to this course
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {String} data.id submitted course id
 * @apiSuccess {Boolean} data.edit for check if course created or edited
 * @apiSuccess {Object} data.data submitted course data
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": { "id": String, "edit": Boolean, "data": Object } }
 * */
export async function submit(ctx) {
    const {title, password, id} = ctx.request.body;

    ctx.checkBody('title').notEmpty("وارد کردن عنوان اجباری است");
    if (ctx.errors) {
        return response.validatorError(ctx, ctx.errors);
    }
    let edit = false;
    let course = new Course();
    if (id) {
        course = await Course.findById(id);
        if (!course) {
            return response.validatorError(ctx, [{me: `course with id:${id} not found`}]);
        }
        edit = true;
    } else {
        course.userId = ctx.authService.getUserId();
    }

    course.set({title});
    if (password) {
        course.password = bcrypt.hashSync(password, 10);
    }

    await course.save();
    course.userIsMember = true;

    return response.json(ctx, {
        id: course.id,
        edit,
        data: course,
    });
}

/**
 * @api {get} /course/single get course data with its id
 * @apiGroup Course
 * @apiParam {String} id course id
 * @apiParam {String} [withUser] if provided, the course owner data will return
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} data.data course object
 * @apiSuccess {Boolean} data.edit for check if course created or edited
 * @apiSuccess {Object} data.data submitted course data
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": { "id": String, "edit": Boolean, "data": Object } }
 * */
export async function single(ctx) {
    const {id, withUser} = ctx.query;
    const query = Course.findById(id);

    if (withUser) {
        query.populate('user')
    }

    let data = await query.exec();
    data = await Course.setUserIsMember([data], ctx.authService.getUserId());
    data = data[0];

    return response.json(ctx, {
        data,
    });
}

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

    return response.json(ctx, {
        id: record.id,
        data: course,
    });
}

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
        return item;
    });

    return response.json(ctx, {
        data: joinedCourses,
    });
}

export async function ownedCourses(ctx) {
    const userId = ctx.authService.getUserId();

    const ownedCourses = await Course.dataTable(ctx.query, {
        userId: userId,
    });

    ownedCourses.data = ownedCourses.data.map(item => {
        item.userIsMember = true;
        return item;
    });

    return response.json(ctx, ownedCourses);
}

export async function byUserId(ctx) {
    const {userId} = ctx.query;

    const courses = await Course.dataTable(ctx.query, {
        userId: userId,
    });
    const authUserId = ctx.authService.getUserId();
    courses.data = await Course.setUserIsMember(courses.data, authUserId);

    return response.json(ctx, {
        data: courses,
    });
}

export async function similar(ctx) {
    const {input} = ctx.query;

    if (input) {
        let data = await Course.find({
            title: new RegExp(regexUtil.startOfWordInAnyOrder(input), "i"),
        }).populate('user');

        data = await Course.setUserIsMember(data, ctx.authService.getUserId());

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
