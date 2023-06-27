const userProfileService = require('../services/user-profile-service')


function getUserInfoCntrl(req, res) {
    const userId = req.authData.userId
    userProfileService.getUserInfo(userId).then((results) => {
        res.status(200).send({ succMsg: "user info", results: results[0] });
    }).catch((error) => {
        res.status(500).send({ errMsg: "cannot get user info" })
    })
}


function updatePasswordCntrl(req, res) {
    console.log("called")
    const userId = req.authData.userId
    const passwords = req.body
    console.log(passwords)
    userProfileService.updatePassword(userId, passwords).then((results) => {
        res.status(200).send({ succMsg: "password updated ", results: results[0] });
    }).catch((error) => {
        res.status(400).send({ errMsg: error })
    })
}

function updateInfoCntrl(req, res) {
    const userId = req.authData.userId
    const user = req.body.user
    console.log("user is --> ", user)
    console.log("user id is --> ", userId)
    userProfileService.updateProfileInfo(userId, user).then(() => {
        res.status(200).send({ succMsg: "user info updated" });
    }).catch((error) => {
        res.status(400).send({ errMsg: "cannot update user info" })
    })
}

function uploadAvatarCntrl(req, res) {
    const imageUrl = req.file.path;
    const userId = req.authData.userId
    userProfileService.uploadAvatar(imageUrl, userId).then((results) => {
        res.status(200).send({ results: results, succMsg: "profile picture updated" });
    }).catch((error) => {
        res.status(400).send({ errMg: "cannot update profile picture", err: error });
    })
}

function getAvatarCntrl(req, res) {
    const userId = req.authData.userId
    userProfileService.getAvatar(userId).then(results => {
        res.status(200).send({picture: results[0].user_picture})
    }).catch(error => {
        res.status(400).send({errMsg: "cannot retrieve profile picture", err: error})
    })
}

function deleteAvatar(req, res) {
    const userId = req.authData.userId
    userProfileService.deleteAvatar(userId).then(results => {
        res.status(200).send({succMsg: "profile picture deleted"})
    }).catch(error => {
        res.status(400).send({errMsg: "cannot delete profile picture", err: error})
    })
}

module.exports = {
    getUserInfoCntrl,
    updateInfoCntrl, uploadAvatarCntrl, updatePasswordCntrl, getAvatarCntrl, deleteAvatar
}