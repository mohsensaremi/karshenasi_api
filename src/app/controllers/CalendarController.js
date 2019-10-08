import response from 'app/response';
import momentJalaali from 'moment-jalaali';
import moment from 'moment';
import chunk from 'lodash/chunk';
import Post from 'app/models/Post';

/**
 * @api {get} /calendar/get get calendar
 * @apiDescription get calendar data
 * @apiGroup Calendar
 * @apiParam {String} [month] get calendar for specific month. if not provided current month calendar returned
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object[][]} data 2d array for week and days
 * @apiSuccess {Number} day calendar day.if 0 it means this day is not for this month and should not shot anything for it. its just for grid
 * @apiSuccess {Object[]} alert array of alert for one day
 * @apiSuccess {Number} alert.type alert type
 * @apiSuccess {String} alert.text alert text
 * @apiSuccess {String} monthName current month name
 * @apiSuccess {String} nextMonth use it for getting next month calendar
 * @apiSuccess {String} prevMonth use it for getting prev month calendar
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": Object }
 * */
export async function getCalendar(ctx) {
    const locale = ctx.i18n.getLocale();
    const momentLocale = locale === "fa" ? momentJalaali : moment;

    const {month} = ctx.requestData();

    let startOfMonth = momentLocale().startOf(locale === "fa" ? 'jMonth' : "month");
    if (month) {
        startOfMonth = momentLocale(month, 'YYYY-M-D HH:mm:ss');
    }
    const jDay = (startOfMonth.day() + 1) % 7;
    const jDaysInMonth = locale === "fa" ?
        momentLocale.jDaysInMonth(startOfMonth.jYear(), startOfMonth.jMonth()) :
        momentLocale(startOfMonth).daysInMonth();
    const endOfMonth = momentLocale(startOfMonth).add(jDaysInMonth, "days");
    const posts = await Post.find({
        dueDate: {
            $gt: startOfMonth.toDate(),
            $lt: endOfMonth.toDate(),
        }
    });
    const monthDays = [];
    for (let i = 0; i < jDay; i++) {
        monthDays.push({
            day: 0,
        });
    }
    for (let i = 0; i < jDaysInMonth; i++) {
        const x = {
            day: i + 1,
        };
        const dateFrom = momentLocale(startOfMonth).add(i, "days").startOf("day").toDate();
        const dateTo = momentLocale(startOfMonth).add(i, "days").endOf("day").toDate();
        const alertPosts = posts.filter(post => {
            return (post.dueDate.getTime() <= dateTo.getTime() && post.dueDate.getTime() >= dateFrom.getTime());
        });
        x.alert = alertPosts.map(post => {
            return {
                type: post.type,
                text: post.title,
            }
        });
        monthDays.push(x);
    }

    return response.json(ctx, {
        nextMonth: momentLocale(startOfMonth).add(jDaysInMonth, 'days').startOf(locale === "fa" ? 'jMonth' : "month").format('YYYY-M-D HH:mm:ss'),
        prevMonth: momentLocale(startOfMonth).add(-1, 'days').startOf(locale === "fa" ? 'jMonth' : "month").format('YYYY-M-D HH:mm:ss'),
        monthName: momentLocale(startOfMonth).lang(locale).format(locale === "fa" ? "jMMMM" : "MMMM"),
        data: chunk(monthDays, 7),
    });
}
