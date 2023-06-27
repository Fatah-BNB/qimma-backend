const StudentController = require('../controllers/StudentController');
const checkToken = require('../middleware/checkToken')
const checkUserStatus = require('../middleware/checkUserStatus')
const checkEnrollment = require('../middleware/checkEnrolledCourse')
const courseController = require('../controllers/course-controller');

const express = require('express');

const router = express.Router();

//---------------------------------course retrieveing---------------------------------------------------------------------------------
router.get('/course-resources/:courseId', checkToken.verifyToken('student'), checkEnrollment.checkEnrollmentMiddleware, courseController.getCourseResourcesCntrl)
router.get('/course-rating/:courseId', checkToken.verifyToken('student'), checkEnrollment.checkEnrollmentMiddleware, courseController.courseRatingCntrl)
//---------------------------------stduent intractions with course---------------------------------------------------------------------
router.get('/enrolled-courses',checkToken.verifyToken('student'), checkUserStatus.checkUserStatusMiddleware ,StudentController.retrieveEnrolledCoursesCntrl);
router.put('/rate-course/:courseId',checkToken.verifyToken('student'), checkUserStatus.checkUserStatusMiddleware ,StudentController.rateCourseCntrl);
router.get('/answer-quiz/:courseId', checkToken.verifyToken('student'), checkEnrollment.checkEnrollmentMiddleware, StudentController.getQuizCntrl)
router.post('/submit-quiz-answer/:courseId/:quizId', checkToken.verifyToken('student'), checkEnrollment.checkEnrollmentMiddleware, StudentController.answerQuizCntrl)
module.exports = router;