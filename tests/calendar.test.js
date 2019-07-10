//routes.test.js
import server from "../src/index.js";
import uuid from 'uuid/v4';

const request = require("supertest").agent(server.listen());

describe('post route tests', () => {
    const EMAIL = `test`;
    const PASS = "test";
    let TOKEN = null;
    let CREATED_ID = null;
    let CREATED_COURSE_ID = null;

    test('login', async () => {
        const response = await request.post('/login')
            .send({
                email: EMAIL,
                password: PASS,
            });

        TOKEN = response.body.data.token;

    });

    test('get calendar', async () => {
        const response = await request
            .get('/calendar/get')
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
    });
});