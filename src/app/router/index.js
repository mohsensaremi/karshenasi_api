import * as AuthController from 'app/controllers/AuthController';
import * as CourseController from 'app/controllers/CourseController';
import * as PostController from 'app/controllers/PostController';
import Router from "koa-router";
import authMiddleware from 'app/middlewares/auth';

const router = new Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/refresh', AuthController.refresh);

router.use(authMiddleware);

router.get('/me', AuthController.me);
router.post('/logout', AuthController.logout);

router.post('/course/submit', CourseController.submit);
router.post('/course/join', CourseController.join);
router.post('/course/leave', CourseController.leave);
router.get('/course/joined-courses', CourseController.joinedCourses);
router.get('/course/owned-courses', CourseController.ownedCourses);
router.get('/course/single', CourseController.single);

router.post('/post/submit', PostController.submit);
router.get('/post/posts-by-course-id', PostController.postsByCourseId);

export default router;
