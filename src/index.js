import 'bootstrap';
import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import router from 'app/router';
import contextMiddleware from 'app/middlewares/context';
import render from 'koa-ejs';
import path from 'path';
import serve from 'koa-static';


const app = new Koa();

app.use(serve(path.join(__dirname, '../public')));

require('koa-validate')(app);

app.use(cors())
    .use(koaBody({
        multipart: true,
    }))
    .use(contextMiddleware)
    .use(router.routes())
    .use(router.allowedMethods());


render(app, {
    root: path.join(__dirname, '../views'),
    layout: false,
    viewExt: 'ejs',
    cache: false,
    debug: false,
});


const server = app.listen({port: process.env.APP_PORT}, () =>
    console.log(`🚀 Server ready at http://localhost:${process.env.APP_PORT}`),
);

export default server;