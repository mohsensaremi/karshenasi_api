import response from 'app/response';
import Post, {PostType} from 'app/models/Post';
import Course from "app/models/Course";

export async function submit(ctx) {
    const {title, content, courseId, id, type} = ctx.request.body;

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

    post.set({
        title,
        content,
        type: PostType[type],
    });

    await post.save();

    return response.json(ctx, {
        id: post.id,
        edit,
        data: post,
    });
}


export async function postsByCourseId(ctx) {
    const {courseId, type} = ctx.query;
    const course = await Course.findById(courseId);
    if (!course) {
        return response.validatorError(ctx, [{me: `course with id:${courseId} not found`}]);
    }
    const userIsOwner = course.checkUserIsOwner(ctx.authService.getUserId());
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
    const dt = await Post.dataTable(ctx.query, find);

    return response.json(ctx, dt);
}