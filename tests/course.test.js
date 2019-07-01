//routes.test.js
import server from "../src/index.js";
import uuid from 'uuid/v4';
const  request = require("supertest").agent(server.listen());

describe('course route tests', () => {
    const EMAIL = `test`;
    const PASS = "test";
    let TOKEN = null;
    let CREATED_ID = null;

    test('login', async () => {
        const response = await request.post('/login')
            .send({
                email: EMAIL,
                password: PASS,
            });

        TOKEN = response.body.data.token;

    });

    test('create course', async () => {
        const response = await request
            .post('/course/submit')
            .send({
                title: `course_${uuid()}`,
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);

        CREATED_ID = response.body.data.id;
    });

    test(`edit course ${CREATED_ID}`, async () => {
        const response = await request
            .post('/course/submit')
            .send({
                title: `course_${uuid()}`,
                id: CREATED_ID,
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
        expect(response.body.data.edit).toEqual(true);
    });

    test('create course with password', async () => {
        const response = await request
            .post('/course/submit')
            .send({
                title: `course_${uuid()}`,
                password: "test",
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
    });

    test('edit with wring id', async () => {
        const response = await request
            .post('/course/submit')
            .send({
                title: `course_${uuid()}`,
                id: "wrongId",
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(false);
    });

    test(`join course ${CREATED_ID}`, async () => {
        const response = await request
            .post('/course/join')
            .send({
                courseId: CREATED_ID,
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
    });

    test(`get joined courses after join`, async () => {
        const response = await request
            .get('/course/joined-courses')
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
        expect(response.body.data.list.length).toEqual(1);
    });

    test(`leave course ${CREATED_ID}`, async () => {
        const response = await request
            .post('/course/leave')
            .send({
                courseId: CREATED_ID,
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
    });

    test(`get joined courses after leave`, async () => {
        const response = await request
            .get('/course/joined-courses')
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
        expect(response.body.data.list.length).toEqual(0);
    });
});