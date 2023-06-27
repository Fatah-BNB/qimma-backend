const adminController = require('../controllers/admin-controller');
const authController = require('../controllers/user-auth-controller')
const checkToken = require('../middleware/checkAdminToken')
const express = require('express');

const router = express.Router();

//------------------auth--------------------------------------------------
router.post('/login', adminController.loginController);
router.post('/logout', adminController.logoutController);
//-------------------Account management----------------------------------------------
router.get('/users', checkToken.verifyToken,adminController.getAllUsersController);
router.post('/add-user',checkToken.verifyToken, authController.registerController)
router.get('/delete-user/:userId',checkToken.verifyToken, adminController.deleteUserCntrl)
router.put('/block-user/:userId',checkToken.verifyToken, adminController.blockUserCntrl)
router.put('/unblock-user/:userId',checkToken.verifyToken, adminController.UnblockUserCntrl)
//--------------------statistics-----------------------------------------------
router.get('/users-count',checkToken.verifyToken, adminController.countUsersController);/*count any type of user just specify 
just specify the value of the 'resource' key in the URL query */
router.get('/count-uploads',checkToken.verifyToken, adminController.countUploadsCntrl);/*count any type of resources(image, video..)
, specify the */
router.get('/daily-active-users',checkToken.verifyToken, adminController.DAUCntrl)
router.get('/total-income', checkToken.verifyToken, adminController.totalIncomeCntrl)
router.get('/courses-count',checkToken.verifyToken, adminController.countCoursesController)/* Count the number of courses, regardless of whether they are published or not. 
just specify the value of the 'published' key in the URL query.*/
router.get('/tier-courses-count',checkToken.verifyToken, adminController.tierCountCoursesController)
router.get('/month-courses-count',checkToken.verifyToken, adminController.monthCountCoursesController)
router.get('/field-courses-count',checkToken.verifyToken, adminController.fieldCountCoursesController)
router.get('/count-student-PerTier',checkToken.verifyToken, adminController.studentCountPerTierController)
router.get('/count-users-PerWilaya',checkToken.verifyToken, adminController.userCountPerWilayaController)
module.exports = router;
