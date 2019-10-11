import response from 'app/response';
import Post, {PostType} from 'app/models/Post';
import SendPostNotifications from 'app/jobs/SendPostNotifications';
import Course from "app/models/Course";
import Uploader from "../uploader";
import ValidatorException from "app/exeptions/ValidatorException";

/**
 * @api {post} /post/submit submit
 * @apiDescription submit a post
 * @apiGroup Post
 * @apiParam {String} title post title
 * @apiParam {String} content post content
 * @apiParam {String} courseId course id for post
 * @apiParam {String="alert","assignment","attendance","project","grade"} type post type
 * @apiParam {String} [id] if provided, course will be edited otherwise create a new course
 * @apiParam {Date} dueDate ISO date string. if type is `project` or `assignment`, should be provided. example: 2019-08-01T18:19:00.000Z
 * @apiParam {UploadFile[]} files array of files. check `Model > UploadFile`
 * @apiParam {Object} grade if type is `grade`, {[key]=>[value]} object of grades
 * @apiParam {Object} attendance if type is `attendance`, {[key]=>[value]} object of attendances
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {String} id submitted post id
 * @apiSuccess {Boolean} edit for check if post created or edited
 * @apiSuccess {Object} data submitted post data. check `Model > Post`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "id": String, "edit": Boolean, "data": Object }
 * */
export async function submit(ctx) {
    const {title, content, courseId, id, type, dueDate, files, attendance, grade, sendUpdateNotification} = ctx.request.body;

    ctx.checkBody('title').notEmpty("وارد کردن عنوان اجباری است");
    if (ctx.errors) {
        return response.validatorError(ctx, ctx.errors);
    }
    if (!PostType[type]) {
        return response.validatorError(ctx, [{type: `invalid type: ${type}`}]);
    }
    let edit = false;

    let post = new Post();
    if (id) {
        post = await Post.findById(id);
        if (!post) {
            return response.validatorError(ctx, [{me: `post with id:${id} not found`}]);
        }
        edit = true;
    } else {
        post.userId = ctx.authService.getUserId();
        const course = await Course.findById(courseId);
        if (!course) {
            return response.validatorError(ctx, [{me: `course with id:${courseId} not found`}]);
        }
        post.courseId = courseId;
    }

    if ([PostType.project, PostType.assignment].includes(PostType[type])) {
        ctx.checkBody('dueDate').notEmpty("وارد کردن موعد تویل اجباری است");
        if (ctx.errors) {
            return response.validatorError(ctx, ctx.errors);
        }
        post.dueDate = dueDate;
    }

    post.set({
        title,
        content,
        type: PostType[type],
    });

    await post.save();

    if (Array.isArray(files)) {
        const uploader = new Uploader(files, `course/${post.courseId}/post/${post._id}`);
        uploader.upload();
        uploader.delete();
        post.files = uploader.getFiles();
        await post.save();
    }

    if (type === PostType.attendance && attendance) {
        await post.submitAttendance(attendance);
    }

    if (type === PostType.grade && grade) {
        await post.submitGrade(grade);
    }

    if (!edit || sendUpdateNotification) {
        SendPostNotifications.dispatch({
            postId: post.id,
        });
    }

    return response.json(ctx, {
        id: post.id,
        edit,
        data: post,
    });
}

/**
 * @api {get} /post/by-course-id by course id
 * @apiDescription list of post published in given course id
 * @apiParam {String} courseId course id to find its posts
 * @apiParam {String="alert","assignment","attendance","project","grade"} [type] post type
 * @apiGroup Post
 * @apiUse AuthHeader
 * @apiUse Datatable
 * @apiSuccess {Object[]} data array of records. check `Model > Post`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": [Object], "total": Number }
 * */
export async function postsByCourseId(ctx) {
    const {courseId, type} = ctx.requestData();
    const course = await Course.findById(courseId);
    if (!course) {
        return response.validatorError(ctx, [{me: `course with id:${courseId} not found`}]);
    }
    const userIsOwner = course.checkUserIsOwner(ctx.authService.getUserId(), false);
    if (!userIsOwner) {
        const userIsMember = await course.checkUserIsMember(ctx.authService.getUserId());
        if (!userIsMember) {
            return response.json(ctx, Post.emptyPaginate());
        }
    }

    const find = {courseId};
    if (PostType[type]) {
        find.type = PostType[type];
    }
    const dt = await Post.dataTable(ctx.requestData(), find);

    return response.json(ctx, dt);
}

/**
 * @api {get} /post/attendances post attendances
 * @apiParam {String} postId post id
 * @apiGroup Post
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} data {[key]=>[value]} object of post attendances
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": Object }
 * */
export async function attendances(ctx) {
    const {postId} = ctx.requestData();
    const post = await Post.findById(postId);
    if (!post) {
        throw new ValidatorException(`post with id:${postId} not found`);
    }
    const userId = ctx.authService.getUserId();
    const course = await post.getCourse();
    const userIsOwner = course.checkUserIsOwner(userId, false);
    let userIsMember = false;
    if (!userIsOwner) {
        userIsMember = await course.checkUserIsMember(userId);
        if (!userIsMember) {
            throw new ValidatorException(`user is not member`);
        }
    }

    let data = {};
    if (userIsOwner) {
        data = await post.getAttendances();
    } else if (userIsMember) {
        data = await post.getAttendances(userId);
    }

    return response.json(ctx, {data});
}

/**
 * @api {get} /post/grades post grades
 * @apiParam {String} postId post id
 * @apiGroup Post
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} data {[key]=>[value]} object of post grades
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": Object }
 * */
export async function grades(ctx) {
    const {postId} = ctx.requestData();
    const post = await Post.findById(postId);
    if (!post) {
        throw new ValidatorException(`post with id:${postId} not found`);
    }
    const userId = ctx.authService.getUserId();
    const course = await post.getCourse();
    const userIsOwner = course.checkUserIsOwner(userId, false);
    let userIsMember = false;
    if (!userIsOwner) {
        userIsMember = await course.checkUserIsMember(userId);
        if (!userIsMember) {
            throw new ValidatorException(`user is not member`);
        }
    }

    let data = {};
    if (userIsOwner) {
        data = await post.getGrades();
    } else if (userIsMember) {
        data = await post.getGrades(userId);
    }

    return response.json(ctx, {data});
}

/**
 * @api {post} /post/remove remove
 * @apiDescription remove post by id
 * @apiParam {String} postId post id
 * @apiGroup Post
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccessExample example
 * { "success":true, "status": 200 }
 * */
export async function remove(ctx) {
    const {postId} = ctx.request.body;
    const post = await Post.findById(postId);
    const courseId = post.courseId;

    const user = ctx.authService.getMinimalUser();
    await user.findCourseById(courseId);

    await post.remove();

    return response.json(ctx);
}
