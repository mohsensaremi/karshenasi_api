import response from 'app/response';

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

export async function logout(ctx) {
    try {
        await ctx.authService.logout();
        return response.json(ctx);
    } catch (e) {
        return response.validatorError(ctx, [{logout: e.message}]);
    }
}

export async function loginById(ctx) {
    const {userId} = ctx.request.body;
    const token = await ctx.authService.loginById(userId);
    return response.json(ctx, {
        token,
    });
}
