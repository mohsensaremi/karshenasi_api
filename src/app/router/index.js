import * as AuthController from 'app/controllers/AuthController';
import * as CourseController from 'app/controllers/CourseController';
import * as PostController from 'app/controllers/PostController';
import * as CalendarController from 'app/controllers/CalendarController';
import * as UserController from 'app/controllers/UserController';
import Router from "koa-router";
import authMiddleware from 'app/middlewares/auth';
import userTypeMiddleware from 'app/middlewares/userType';

const router = new Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/refresh', AuthController.refresh);

router.use(authMiddleware);

router.get('/me', AuthController.me);
router.post('/logout', AuthController.logout);

router.post('/course/submit', userTypeMiddleware(['instructor']), CourseController.submit);
router.post('/course/join', userTypeMiddleware(['student']), CourseController.join);
router.post('/course/leave', userTypeMiddleware(['student']), CourseController.leave);
router.get('/course/joined-courses', userTypeMiddleware(['student']), CourseController.joinedCourses);
router.get('/course/owned-courses', userTypeMiddleware(['instructor']), CourseController.ownedCourses);
router.get('/course/single', CourseController.single);
router.get('/course/similar', CourseController.similar);
router.get('/course/by-user-id', CourseController.byUserId);

router.post('/post/submit', userTypeMiddleware(['instructor']), PostController.submit);
router.get('/post/posts-by-course-id', PostController.postsByCourseId);

router.get('/calendar/get', CalendarController.getCalendar);

router.get('/user/by-id', UserController.byId);

export default router;
