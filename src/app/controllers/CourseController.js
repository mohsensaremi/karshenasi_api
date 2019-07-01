import response from 'app/response';
import Course from 'app/models/Course';
import CourseMember from 'app/models/CourseMember';
import bcrypt from 'bcrypt';

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

    return response.json(ctx, {
        id: course.id,
        edit,
    });
}

export async function join(ctx) {
    const {courseId} = ctx.request.body;
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

    const record = new CourseMember({courseId, userId});
    await record.save();

    return response.json(ctx, {
        id: record.id,
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

    return response.json(ctx, joinedCourses);
}
