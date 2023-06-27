const courseController = require('../controllers/course-controller');
const configCoursePictureStorage = require('../middleware/coursePictureSorage')
const checkUserStatus = require('../middleware/checkUserStatus')
const checkToken = require('../middleware/checkToken')
const configVideoStorage = require('../middleware/VideoLectureStorage')
const configFileStorage = require('../middleware/LectureFileStorage')

const express = require('express');

const router = express.Router();


router.post('/create-course',checkToken.verifyToken('instructor'), checkUserStatus.checkUserStatusMiddleware, configCoursePictureStorage.single('picture'), courseController.createCourseCntrl);
router.get('/published-courses', courseController.retrievePublishedCoursesCntrl);
router.get('/:courseId/course-details', courseController.CourseDetailsCntrl);
router.post('/enroll-course/:courseId', checkToken.verifyToken('student'), checkUserStatus.checkUserStatusMiddleware, courseController.EnrollCourseCntrl);
router.get('/:courseId/enrolled-course', checkToken.verifyToken('student'), checkUserStatus.checkUserStatusMiddleware, courseController.CheckEnrolledCourse);
//---------------------course resources routes-----------------------------------------------------------------
router.get('/get-course-resources/:courseId', checkToken.verifyToken('instructor'), courseController.getCourseResourcesCntrl)
router.post('/upload-video/:courseId', checkToken.verifyToken('instructor'), configVideoStorage.single('video'), courseController.uploadVideoLectureCntrl)
router.post('/upload-file/:courseId', checkToken.verifyToken('instructor'), configFileStorage.single('file'), courseController.uploadLectureFileCntrl)
router.post('/create-quiz/:courseId', checkToken.verifyToken('instructor'), courseController.createQuizCntrl)
router.get('/get-quiz/:courseId', checkToken.verifyToken('instructor'), courseController.getQuizCntrl)

//------------------------search-----------------------------------------------------------------------------
router.get('/search/:keyWord', courseController.searchCntrl)
router.get('/retrieve-course/:courseTitle', courseController.retrieveCourseByTitleCntrl)

module.exports = router;