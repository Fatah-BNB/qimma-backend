const express = require('express');
const router = express.Router();
const checkToken = require('../middleware/checkToken')
const checkUserStatus = require('../middleware/checkUserStatus')
const manageCoursesController = require('../controllers/manage-courses-controller')
router.get('/my-courses', checkToken.verifyToken('instructor'), checkUserStatus.checkUserStatusMiddleware, manageCoursesController.retrieveInstructorCoursesCntrl)
router.delete('/:courseId', checkToken.verifyToken('instructor'), checkUserStatus.checkUserStatusMiddleware, manageCoursesController.deleteCourseCntrl)
router.put('/publish-course', checkToken.verifyToken('instructor'), checkUserStatus.checkUserStatusMiddleware, manageCoursesController.publishCourseCntrl)

module.exports = router