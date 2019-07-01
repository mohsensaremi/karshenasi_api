import response from 'app/response';

export default async function (ctx, next) {
    try {
        await ctx.authService.verify();
    } catch (e) {
        return response.unauthorized(ctx);
    }
    await next();
}
