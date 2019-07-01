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

    test('create course', async () => {
        const response = await request
            .post('/course/submit')
            .send({
                title: `post_course_${uuid()}`,
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);

        CREATED_COURSE_ID = response.body.data.id;
    });

    test('create post', async () => {
        const response = await request
            .post('/post/submit')
            .send({
                title: `post_${uuid()}`,
                courseId: CREATED_COURSE_ID,
            })
            .set('authorization', `Bearer ${TOKEN}`)

        expect(response.body.success).toEqual(true);

        CREATED_ID = response.body.data.id;
    });

    test('create post with content', async () => {
        const response = await request
            .post('/post/submit')
            .send({
                title: `post_${uuid()}`,
                content: `post_content_${uuid()}`,
                courseId: CREATED_COURSE_ID,
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
    });

    test(`edit post ${CREATED_ID}`, async () => {
        const response = await request
            .post('/post/submit')
            .send({
                title: `post_edited_${uuid()}`,
                content: `post_content_edited_${uuid()}`,
                id: CREATED_ID,
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
        expect(response.body.data.edit).toEqual(true);
    });

    test('get not joined course posts', async () => {
        const response = await request
            .get(`/post/posts-by-course-id`)
            .query({
                courseId: CREATED_COURSE_ID,
            })
            .set('authorization', `Bearer ${TOKEN}`);


        expect(response.body.success).toEqual(true);
        expect(response.body.data.total).toEqual(0);
    });

    test(`join course ${CREATED_COURSE_ID}`, async () => {
        const response = await request
            .post('/course/join')
            .send({
                courseId: CREATED_COURSE_ID,
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
    });

    test('get joined course posts', async () => {
        const response = await request
            .get('/post/posts-by-course-id')
            .query({
                courseId: CREATED_COURSE_ID,
            })
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
        expect(response.body.data.total).toEqual(2);
    });
});