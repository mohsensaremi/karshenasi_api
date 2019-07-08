import response from 'app/response';

export default (inputTypes) => async function (ctx, next) {

    const user = ctx.authService.getMinimalUser();

    if (!inputTypes.includes(user.type)) {
        return response.json(ctx, {
            errors: [`invalid user type: ${user.type}`]
        }, 403);
    }

    await next();
}
