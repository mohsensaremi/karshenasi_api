import i18n from 'config/i18n';

export default async function (ctx, next) {
    i18n.setLocale(ctx.query.hl || "en");
    await next();
}
