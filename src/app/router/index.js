import * as AuthController from 'app/controllers/AuthController';
import * as CourseController from 'app/controllers/CourseController';
import * as PostController from 'app/controllers/PostController';
import * as CalendarController from 'app/controllers/CalendarController';
import * as UserController from 'app/controllers/UserController';
import * as UploadController from 'app/controllers/UploadController';
import Router from "koa-router";
import authMiddleware from 'app/middlewares/auth';
import userTypeMiddleware from 'app/middlewares/userType';

const router = new Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/refresh', AuthController.refresh);

router.use(authMiddleware);

router.all('/me', AuthController.me);
router.post('/logout', AuthController.logout);

router.post('/upload/tmp', UploadController.tmp);

router.post('/course/submit', userTypeMiddleware(['instructor']), CourseController.submit);
router.post('/course/join', userTypeMiddleware(['student']), CourseController.join);
router.post('/course/leave', userTypeMiddleware(['student']), CourseController.leave);
router.all('/course/joined-courses', userTypeMiddleware(['student']), CourseController.joinedCourses);
router.all('/course/owned-courses', userTypeMiddleware(['instructor']), CourseController.ownedCourses);
router.all('/course/by-id', CourseController.byId);
router.all('/course/similar', CourseController.similar);
router.all('/course/by-user-id', CourseController.byUserId);
router.all('/course/members', userTypeMiddleware(['instructor']), CourseController.members);
router.post('/course/remove', userTypeMiddleware(['instructor']), CourseController.remove);

router.post('/post/submit', userTypeMiddleware(['instructor']), PostController.submit);
router.all('/post/by-course-id', PostController.postsByCourseId);
router.all('/post/attendances', PostController.attendances);
router.all('/post/grades', PostController.grades);
router.post('/post/remove', userTypeMiddleware(['instructor']), PostController.remove);

router.all('/calendar/get', CalendarController.getCalendar);

router.all('/user/by-id', UserController.byId);


export default router;
