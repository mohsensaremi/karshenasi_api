import response from 'app/response';
import bcrypt from "bcrypt";
import Uploader from "../uploader";
import pick from 'lodash/pick';

/**
 * @api {post} /login login
 * @apiGroup Auth
 * @apiParam {String} email
 * @apiParam {String} password
 * @apiUse SuccessResponse
 * @apiSuccess {String} token store it for auth required requests
 * @apiSuccessExample example
 * { "success":true, "status": 200, "token": String }
 */
export async function login(ctx) {
    const {email, password} = ctx.request.body;

    ctx.checkBody('email').notEmpty("وارد کردن ایمیل اجباری است");
    ctx.checkBody('password').notEmpty("وارد کردن کلمه عبور اجباری است");
    if (ctx.errors) {
        return response.validatorError(ctx, ctx.errors);
    }

    try {
        await ctx.authService.attemptLogin(email, password);
        return response.json(ctx, {
            token: ctx.authService.token,
        });
    } catch (e) {
        return response.validatorError(ctx, [{login: e.message}]);
    }
}

/**
 * @api {post} /register register
 * @apiGroup Auth
 * @apiParam {String} email
 * @apiParam {String} password
 * @apiParam {String} passwordConfirmation
 * @apiParam {String} firstName
 * @apiParam {String} lastName
 * @apiParam {String="instructor","student"} type user type
 * @apiUse SuccessResponse
 * @apiSuccess {String} token store it for auth required requests
 * @apiSuccessExample example
 * { "success":true, "status": 200, "token": String }
 */
export async function register(ctx) {
    const {email, password, passwordConfirmation, ...other} = ctx.request.body;

    ctx.checkBody('firstName').notEmpty("وارد کردن نام اجباری است");
    ctx.checkBody('lastName').notEmpty("وارد کردن نام خانوادگی اجباری است");
    ctx.checkBody('type').notEmpty("وارد کردن نوع کاربری اجباری است");
    ctx.checkBody('email').notEmpty("وارد کردن ایمیل اجباری است");
    ctx.checkBody('password').notEmpty("وارد کردن کلمه عبور اجباری است");
    if (ctx.errors) {
        return response.validatorError(ctx, ctx.errors);
    }

    if (password !== passwordConfirmation) {
        return response.validatorError(ctx, [{passwordConfirmation: 'کلمه عبور با تاییدیه مطابقت ندارد'}]);
    }

    try {
        await ctx.authService.attemptRegister(email, password, other);
        return response.json(ctx, {
            token: ctx.authService.token,
        });
    } catch (e) {
        return response.validatorError(ctx, [{register: e.message}]);
    }
}


/**
 * @api {get} /me me
 * @apiGroup Auth
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} me current authenticated user data. check `Model > User`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "me": Object }
 */
export async function me(ctx) {
    try {
        const user = await ctx.authService.getUser();
        return response.json(ctx, {
            me: user,
        });
    } catch (e) {
        return response.validatorError(ctx, [{me: e.message}]);
    }
}

/**
 * @api {post} /refresh refresh
 * @apiDescription an expired token
 * @apiGroup Auth
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {String} token store it for auth required requests
 * @apiSuccessExample example
 * { "success":true, "status": 200, "token": String }
 * */
export async function refresh(ctx) {
    try {
        await ctx.authService.refreshExpiredToken();
        return response.json(ctx, {
            token: ctx.authService.token,
        });
    } catch (e) {
        return response.unauthorized(ctx);
    }
}

/**
 * @api {post} /logout logout
 * @apiGroup Auth
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccessExample example
 * { "success":true, "status": 200 }
 */
export async function logout(ctx) {
    try {
        await ctx.authService.logout();
        return response.json(ctx);
    } catch (e) {
        return response.validatorError(ctx, [{logout: e.message}]);
    }
}

/**
 * @api {post} /update-profile update profile
 * @apiDescription update authenticated user profile
 * @apiGroup Auth
 * @apiParam {String} [firstName]
 * @apiParam {String} [lastName]
 * @apiParam {String} [email]
 * @apiParam {String} [password] if provided, password will be updated
 * @apiParam {String} [passwordConfirmation]
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} data current authenticated user data. check `Model > User`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": Object }
 * */
export async function updateProfile(ctx) {

    const user = await ctx.authService.getUser();
    const data = pick(ctx.request.body, ['firstName', 'lastName', 'email', 'password', 'passwordConfirmation']);
    if (data.password) {
        if (data.password !== data.passwordConfirmation) {
            return response.validatorError(ctx, [{passwordConfirmation: 'کلمه عبور با تاییدیه مطابقت ندارد'}]);
        }

        data.password = bcrypt.hashSync(data.password, 10);
    } else {
        delete data.password;
    }

    user.set(data);
    await user.save();

    return response.json(ctx, {
        data: user,
    });
}

/**
 * @api {post} /update-avatar update avatar
 * @apiDescription update authenticated user avatar
 * @apiGroup Auth
 * @apiParam {UploadFile[]} files array of files. check `Model > UploadFile`
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object} data current authenticated user data. check `Model > User`
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": Object }
 * */
export async function updateAvatar(ctx) {

    const user = await ctx.authService.getUser();
    const {files} = ctx.request.body;

    if (Array.isArray(files)) {
        const uploader = new Uploader(files, `user/${user._id}`);
        uploader.upload();
        uploader.delete();
        user.avatar = uploader.getFiles();
        await user.save();
    }

    return response.json(ctx, {
        data: user,
    });
}
