import response from 'app/response';
import Course from 'app/models/Course';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export async function submit(ctx) {
    const {title, password, id} = ctx.request.body;

    ctx.checkBody('title').notEmpty("وارد کردن عنوان اجباری است");
    if (ctx.errors) {
        return response.validatorError(ctx, ctx.errors);
    }
    let edit = false;
    let course = new Course();
    if (id) {
        if (mongoose.Types.ObjectId.isValid(id)) {
            course = await Course.findById(id);
            if (!course) {
                return response.validatorError(ctx, [{me: `course with id:${id} not found`}]);
            }
        } else {
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