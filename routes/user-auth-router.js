const express = require('express');

const router = express.Router();
const userController = require('../controllers/user-auth-controller');
const parentController = require('../controllers/parent-controller');
const checkToken = require('../middleware/checkToken');

//----------------authenticaiton and registration --------------------------------------------
router.post('/register', userController.registerController);
router.get('/register/fields', userController.registerFieldsCntrl);
router.get('/register/tiers', userController.registerTiersCntrl);
router.get('/register/wilayas', userController.registerWilayasCntrl);
router.get('/verify-user-email/:username/:token', userController.updateEmailStatusCntrl);
router.post('/login', userController.loginController);
router.post('/login/resend-email-verification', userController.resendEmailVerificationCntrl);
router.post('/login/password-resetting', userController.passwordResettingCntrl);
router.post('/login/password-resetting/:username/:token', userController.changePasswordCntrl);
router.post('/logout', userController.logoutController);
//-----------------profile----------------------------------------------------------------------
router.get('/user-type', checkToken.verifyToken(['student', 'instructor', 'parent']), userController.retrieveUserType)
//-----------------Parent dashboards--------------------------------------------------------------------
router.post('/dashboard/create-child-account', checkToken.verifyToken('parent'), parentController.createChildAccountCntrl);
router.get('/dashboard/children-accounts', checkToken.verifyToken('parent'), parentController.getChildrenAccountsCntrl);

module.exports = router;
