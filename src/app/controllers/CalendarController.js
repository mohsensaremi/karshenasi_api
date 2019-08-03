import response from 'app/response';
import moment from 'moment-jalaali';
import chunk from 'lodash/chunk';

export async function getCalendar(ctx) {
    const {month} = ctx.requestData();

    let startOfMonth = moment().startOf('jMonth');
    if (month) {
        startOfMonth = moment(month,'YYYY-M-D HH:mm:ss');
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
            x.alert1 = true;
        }
        if (i === 4) {
            x.alert2 = true;
        }
        if (i === 13) {
            x.alert3 = true;
        }
        if (i === 21) {
            x.alert1 = true;
            x.alert2 = true;
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
