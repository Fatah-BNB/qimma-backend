const userService = require('../services/user-auth-service');
const jwt = require('jsonwebtoken');



function registerController(req, res) {

  if ((req.body.tier !== '')) {
    const student = req.body
    console.log('in student reg: ' , student)
    userService.userRegister(student).then(userService.studentRegister).then(async (results) => {
      const emailToken = userService.createEmailToken(results[0].user_firstName, results[0].user_id);
      var fullUrl = req.protocol + '://' + "localhost:3000" + '/verify-user-email' + '/' + results[0].user_firstName + '/' + emailToken
      userService.sendEmail(results[0].user_email, fullUrl, 'Email confirmation');
      res.status(200).send({ succMsg: "Account created", results: results[0] });
    }).catch((error) => {
      res.status(401).send({ errMsg: error.message });
    });
  } else if ((req.body.field !== '')) {
    const instructor = req.body
    userService.userRegister(instructor).then(userService.instuctorRegister).then(async (results) => {
      const emailToken = userService.createEmailToken(results[0].user_firstName, results[0].user_id);
      var fullUrl = req.protocol + '://' + "localhost:3000" + '/verify-user-email' + '/' + results[0].user_firstName + '/' + emailToken
      userService.sendEmail(results[0].user_email, fullUrl, 'Email confirmation');
      res.status(200).send({ succMsg: "Account created", results: results[0] });
    }).catch((error) => {
      res.status(401).send({ errMsg: error.message });
    });
  } else {
    const parent = req.body
    userService.userRegister(parent).then(userService.parentRegister).then(async (results) => {
      const emailToken = userService.createEmailToken(results[0].user_firstName, results[0].user_id);
      var fullUrl = req.protocol + '://' + "localhost:3000" + '/verify-user-email' + '/' + results[0].user_firstName + '/' + emailToken
      userService.sendEmail(results[0].user_email, fullUrl, 'Email confirmation');
      res.status(200).send({ succMsg: "Account created", results: results[0] });
    }).catch((error) => {
      res.status(401).send({ errMsg: error.message });
    });
  }
}

function loginController(req, res) {
  const user = req.body;
  userService.login(user).then((results) => {
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      httpOnly: false,
      secure: true
    }
    const token = userService.createToken(results[0].user_id, results[0].userTypeIds, results[0].userType)
    res.cookie('user', token, cookieOptions);
    res.status(200).send(results[0]);
  })
    .catch((error) => {
      res.status(401).send({ errMsg: error.message });
    });
}


function logoutController(req, res) {
  res.clearCookie('user')
  // res.cookie('user', 'logout', {
  //   expires: new Date(Date.now() + 1 * 1000),
  //   httpOnly: false
  // });
  res.status(200).send({ succMsg: "cookie is cleard" });
}
function updateEmailStatusCntrl(req, res) {
  const token = req.params.token
  userService.updateEmailStatus(token).then(() => {
    res.status(200).send({ succMsg: "update email status" });
  })
    .catch((error) => {
      console.log(error)
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).send({ errMsg: "expired token, regenerate ur token" });
      } else {
        res.status(400).send({ errMsg: "cannot update" });
      }
    });
}
function resendEmailVerificationCntrl(req, res) {
  const email = req.body.email;
  userService.retrieveUserByEmail(email).then((results) => {//after the user register the server send an email to the user
    try {
      //1) create token for email 
      const emailToken = userService.createEmailToken(results[0].user_firstName, results[0].user_id);
      var fullUrl = req.protocol + '://' + req.get('host') + '/verify-user-email' + '/' + results[0].user_firstName + '/' + emailToken
      //2) send the email
      userService.sendEmail(results[0].user_email, fullUrl, 'Email confirmation');
      res.status(200).send({ succMsg: "Verification email sent" });
    } catch (error) {
      res.status(401).send({ errMsg: "Faild to send email (possible reason: no email address specified)" })
    }
  })
    .catch((error) => {
      res.status(401).send({ errMsg: "invalid email" });
    });
}

function passwordResettingCntrl(req, res) {
  const email = req.body.email;
  userService.retrieveUserByEmail(email).then((results) => {//after the user register the server send an email to the user
    try {
      //1) create token for email 
      const emailToken = userService.createEmailToken(results[0].user_firstName, results[0].user_id);
      var fullUrl = req.protocol + '://' + "localhost:3000" + '/password-reset/'+ results[0].user_firstName + '/' + emailToken

      //2) send the email
      userService.sendEmail(results[0].user_email, fullUrl, 'Password resetting');
      res.status(200).send({ succMsg: "check your email" });
    } catch (error) {
      res.status(401).send({ errMsg: "Faild to send email" })
    }
  })
    .catch((error) => {
      res.status(401).send({ errMsg: "invalid email" });
    });
}

function changePasswordCntrl(req, res) {
  const token = req.params.token
  const password = req.body.password
  userService.updatePassword(token, password).then(() => {
    res.status(200).send({ succMsg: "password changed successfully" });
  })
    .catch((error) => {
      console.log(error)
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).send({ errMsg: "expired token, regenerate ur token" });
      } else {
        res.status(400).send({ errMsg: "cannot change password" });
      }
    });
}

function registerFieldsCntrl(req, res) {
  userService.getFromTable('field').then((results) => {
    res.status(200).send({ fields: results });
  }).catch((error) => {
    res.status(400).send({ errMsg: error.message });
  })
}

function registerTiersCntrl(req, res) {
  userService.getFromTable('tier').then((results) => {
    res.status(200).send({ tiers: results });
  }).catch((error) => {
    res.status(400).send({ errMsg: error.message });
  })
}

function registerWilayasCntrl(req, res) {
  userService.getFromTable('wilaya').then((results) => {
    res.status(200).send({ wilayas: results });
  }).catch((error) => {
    res.status(400).send({ errMsg: error.message });
  })
}
function retrieveUserType(req, res){
  const userType = req.authData.userType
  res.status(200).send({ userType: userType });
}

module.exports = {
  registerController, loginController, registerTiersCntrl, registerWilayasCntrl,
  logoutController, updateEmailStatusCntrl, resendEmailVerificationCntrl,
  passwordResettingCntrl, changePasswordCntrl, registerFieldsCntrl, retrieveUserType
};
