import response from 'app/response';
import Post, {PostType} from 'app/models/Post';
import Course from "app/models/Course";

export async function submit(ctx) {
    const {title, content, courseId, id} = ctx.request.body;

    ctx.checkBody('title').notEmpty("وارد کردن عنوان اجباری است");
    if (ctx.errors) {
        return response.validatorError(ctx, ctx.errors);
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
        type: PostType.simple,
    });

    await post.save();

    return response.json(ctx, {
        id: post.id,
        edit,
    });
}


export async function postsByCourseId(ctx) {
    const {courseId} = ctx.query;
    const course = await Course.findById(courseId);
    if (!course) {
        return response.validatorError(ctx, [{me: `course with id:${courseId} not found`}]);
    }
    const userIsMember = await course.checkUserIsMember(ctx.authService.getUserId());
    if (!userIsMember) {
        return response.json(ctx, Post.emptyPaginate());
    }

    const dt = await Post.dataTable(ctx.query, {courseId});

    return response.json(ctx, dt);
}