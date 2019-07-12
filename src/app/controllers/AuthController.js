import response from 'app/response';

/**
 * @api {post} /login login
 * @apiGroup Auth
 * @apiParam {String} email
 * @apiParam {String} password
 * @apiUse SuccessResponse
 * @apiSuccess {String} data.token store it for auth required requests
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": { "token": String } }
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
 * @apiSuccess {String} data.token store it for auth required requests
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": { "token": String } }
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
 * @apiSuccess {Object} data.user current authenticated user data
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": { "user": Object } }
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
 * @api {post} /refresh refresh an expired token
 * @apiGroup Auth
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {String} data.token store it for auth required requests
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": { "token": String } }
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