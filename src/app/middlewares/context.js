import AuthService from 'app/services/Auth';
import dataLoader from 'app/dataLoader';

export default async function (ctx, next) {
    ctx.authService = new AuthService(ctx);
    ctx.dataLoader = dataLoader(ctx);

    await next();
}
