import AuthService from 'app/services/Auth';
import dataLoader from 'app/dataLoader';

export default async function (ctx, next) {
    ctx.authService = new AuthService(ctx);
    ctx.dataLoader = dataLoader(ctx);
    ctx.requestData = () => {
        if (ctx.request.method === "GET") {
            return ctx.query;
        } else if (ctx.request.method === "POST") {
            return ctx.request.body;
        }

        return {};
    };

    await next();
}
