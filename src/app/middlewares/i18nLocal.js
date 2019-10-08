import i18n from 'config/i18n';

export default async function (ctx, next) {
    i18n.setLocale(ctx.query.hl || "en");
    ctx.i18n = i18n;
    await next();
}
