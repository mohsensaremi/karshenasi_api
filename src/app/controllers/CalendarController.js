import response from 'app/response';
import moment from 'moment-jalaali';
import chunk from 'lodash/chunk';

/**
 * @api {get} /calendar/get get calendar
 * @apiDescription get calendar data
 * @apiGroup Calendar
 * @apiParam {String} [month] get calendar for specific month. if not provided current month calendar returned
 * @apiParam {String} id course id
 * @apiParam {String} [withUser] if provided, the course owner data will be returned
 * @apiUse AuthHeader
 * @apiUse SuccessResponse
 * @apiSuccess {Object[][]} data calendar data. each item represent week
 * @apiSuccess {Object} data[][].day calendar day.if 0 it means this day is not for this month and should not shot anything for it. its just for grid
 * @apiSuccess {Object[]} data[][].alert array of alert for one day
 * @apiSuccess {Object[]} data[][].alert.type alert type
 * @apiSuccess {Object[]} data[][].alert.text alert text
 * @apiSuccess {String} monthName current month name
 * @apiSuccess {String} nextMonth use it for getting next month calendar
 * @apiSuccess {String} prevMonth use it for getting prev month calendar
 * @apiSuccessExample example
 * { "success":true, "status": 200, "data": Object }
 * */
export async function getCalendar(ctx) {
    const {month} = ctx.requestData();

    let startOfMonth = moment().startOf('jMonth');
    if (month) {
        startOfMonth = moment(month, 'YYYY-M-D HH:mm:ss');
    }
    const jDay = (startOfMonth.day() + 1) % 7;
    const jDaysInMonth = moment.jDaysInMonth(startOfMonth.jYear(), startOfMonth.jMonth());
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
        if (i === 15) {
            x.alert = [
                {
                    type: 1,
                    text: "امتحان سیگنال سیستم",
                }
            ];
        }
        if (i === 4) {
            x.alert = [
                {
                    type: 2,
                    text: "تکلیف آزمایشگاه سبستم عامل",
                }
            ];
        }
        if (i === 13) {
            x.alert = [
                {
                    type: 3,
                    text: "تحویل پروژه معماری کامپیوتر",
                }
            ];
        }
        if (i === 21) {
            x.alert = [
                {
                    type: 1,
                    text: "امتحان سیگنال سیستم",
                },
                {
                    type: 2,
                    text: "تکلیف آزمایشگاه سبستم عامل",
                }
            ];
        }
        monthDays.push(x);
    }

    return response.json(ctx, {
        nextMonth: moment(startOfMonth).add(jDaysInMonth, 'days').startOf('jMonth').format('YYYY-M-D HH:mm:ss'),
        prevMonth: moment(startOfMonth).add(-1, 'days').startOf('jMonth').format('YYYY-M-D HH:mm:ss'),
        monthName: startOfMonth.format("jMMMM"),
        data: chunk(monthDays, 7),
    });
}
