const express = require('express');

const router = express.Router();
const userProfileController = require('../controllers/user-profile-controller');
const checkToken = require('../middleware/checkToken');
const checkUserStatus = require('../middleware/checkUserStatus');
const configStorage = require('../middleware/avatarStorage')

//-----------------profile----------------------------------------------------------------------
router.get('/', checkToken.verifyToken(['student', 'instructor', 'parent']), userProfileController.getUserInfoCntrl)
//update a single field
//router.put('/edit-user-info/:field', checkToken.verifyToken(['student', 'instructor', 'parent']), userProfileController.updateFieldCntrl)
//update multiple fields
router.put('/edit-user-info', checkToken.verifyToken(['student', 'instructor', 'parent']), checkUserStatus.checkUserStatusMiddleware, userProfileController.updateInfoCntrl)
router.post('/edit-user-info/avatar', checkToken.verifyToken(['student', 'instructor', 'parent']), checkUserStatus.checkUserStatusMiddleware, configStorage.single('avatar'), userProfileController.uploadAvatarCntrl)
router.get('/edit-user-info/getAvatar', checkToken.verifyToken(['student', 'instructor', 'parent']), checkUserStatus.checkUserStatusMiddleware, userProfileController.getAvatarCntrl)
router.put('/edit-user-info/deleteAvatar', checkToken.verifyToken(['student', 'instructor', 'parent']), checkUserStatus.checkUserStatusMiddleware, userProfileController.deleteAvatar)
router.put('/edit-user-info/security/password', checkToken.verifyToken(['student', 'instructor', 'parent']), checkUserStatus.checkUserStatusMiddleware, userProfileController.updatePasswordCntrl)


module.exports = router;
