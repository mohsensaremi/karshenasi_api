import 'bootstrap';
import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import router from 'app/router';
import contextMiddleware from 'app/middlewares/context';
import exceptionMiddleware from 'app/middlewares/exception';
import i18nLocalMiddleware from 'app/middlewares/i18nLocal';
import render from 'koa-ejs';
import path from 'path';
import serve from 'koa-static';
import mount from 'koa-mount';

const app = new Koa();

app.use(serve(path.join(__dirname, '../apidoc')));
app.use(mount('/storage', serve(path.join(__dirname, '../storage/public'))));

require('koa-validate')(app);

app.use(cors())
    .use(i18nLocalMiddleware)
    .use(koaBody({
        multipart: true,
    }))
    .use(contextMiddleware)
    .use(exceptionMiddleware)
    .use(router.routes())
    .use(router.allowedMethods());


render(app, {
    root: path.join(__dirname, '../views'),
    layout: false,
    viewExt: 'ejs',
    cache: false,
    debug: false,
});


if (process.env.NODE_ENV !== 'test') {
    app.listen({port: process.env.APP_PORT}, () =>
        console.log(`🚀 Server ready at http://localhost:${process.env.APP_PORT}`),
    );
}

export default app;
