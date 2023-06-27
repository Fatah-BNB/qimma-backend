const adminService = require('../services/admin-service');
const userService = require('../services/user-auth-service')


function loginController(req, res) {
  const admin = req.body;
  adminService.login(admin).then((results) => {
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      httpOnly: false,
      secure: true
    }
    const adminId = results[0].admin_id
    const token = adminService.createToken(adminId)
    res.cookie('admin', token, cookieOptions);
    res.status(200).send(results);
  })
    .catch((error) => {
      res.status(401).send({ errMsg: "incorrect email or password: " + error.message });
    });
}

function logoutController(req, res) {
  res.clearCookie('admin')
  res.status(200).send({ succMsg: "admin cookie is cleard" });
}

function getAllUsersController(req, res) {
  userService.getFromTable('user').then((results) => {
    res.status(200).send({ ok: true, users: results });
  })
    .catch((error) => {
      res.status(400).send({ ok: false, error: error.message });
    });
}
function deleteUserCntrl(req, res) {
  const userId = req.params.userId
  adminService.deleteUser(userId).then((result) => {
    res.status(200).send({ succMsg: "user successfully deleted" });
  })
    .catch((error) => {
      res.status(400).send({ error: error.message });
    })
}

function blockUserCntrl(req, res) {
  const userId = req.params.userId
  adminService.blockUser(userId).then((result) => {
    res.status(200).send({ succMsg: "User Successfully Blocked" });
  })
    .catch((error) => {
      res.status(500).send({ error: error.message });
    })
}

function UnblockUserCntrl(req, res) {
  const userId = req.params.userId
  adminService.UnblockUser(userId).then((result) => {
    res.status(200).send({ succMsg: "User Successfully Unblocked" });
  })
    .catch((error) => {
      res.status(500).send({ error: error.message });
    })
}

//Admin features
function countUsersController(req, res) {
  const type = req.query.type
  if (!type) {// called without a query
    adminService.countUsers().then((result) => {
      res.status(200).send({ nbrUsers: result });
    })
      .catch((error) => {
        res.status(400).send({ error: error.message });
      })
  } else { //called with query "student or instructor"
    adminService.countUsers(type).then((result) => {
      res.status(200).send({ nbrUsers: result });
    })
      .catch((error) => {
        res.status(400).send({ error: error.message });
      })
  }

}

function countUploadsCntrl(req, res) {
  const resource = req.query.resource
  adminService.countUploads(resource).then((result) => {
    res.status(200).send({ nbrUplaods: result });
  })
    .catch((error) => {
      res.status(400).send({ error: error.message });
    })
}

function DAUCntrl(req, res) {
  adminService.DAU().then((result) => {
    res.status(200).send({ DAU: result });
  })
    .catch((error) => {
      res.status(400).send({ error: error.message });
    })
}
function totalIncomeCntrl(req, res) {
  adminService.totalIncome().then((result) => {
    res.status(200).send({ totalIncome: result });
  })
    .catch((error) => {
      res.status(400).send({ error: error.message });
    })
}
function countCoursesController(req, res) {
  const published = req.query.published
  if (typeof variable !== 'undefined' && published === "0") {
    adminService.countCourses(published).then((result) => {
      res.status(200).send({ nbrUnpublishedCourses: result });
    })
      .catch((error) => {
        res.status(400).send({ error: "cannot retrieve the unpublished courses count" });
      })
  } else if (typeof variable !== 'undefined' && published === "1") {
    adminService.countCourses(published).then((result) => {
      res.status(200).send({ nbrPublishedCourses: result });
    })
      .catch((error) => {
        res.status(400).send({ error: "cannot retrieve the published courses count" });
      })
  } else {
    adminService.countCourses(published).then((result) => {
      res.status(200).send({ nbrCourses: result });
    })
      .catch((error) => {
        res.status(400).send({ error: "cannot retrieve total courses count" });
      })
  }

}
function tierCountCoursesController(req, res) {
  adminService.tierCountCourses().then((results) => {
    res.status(200).send({ nbrCoursesPerTier: results });
  }).catch((error) => {
    res.status(400).send({ error: "cannot retrieve courses count per tier" });
  })
}

function monthCountCoursesController(req, res) {
  adminService.monthCountCourses().then((results) => {
    res.status(200).send({ nbrCoursesPerMonth: results });
  }).catch((error) => {
    res.status(400).send({ error: "cannot retrieve courses count per month" });
  })
}

function fieldCountCoursesController(req, res) {
  adminService.fieldCountCourses().then((results) => {
    res.status(200).send({ nbrCoursesPerField: results });
  }).catch((error) => {
    res.status(400).send({ error: "cannot retrieve courses count per field" });
  })
}
function studentCountPerTierController(req, res) {
  adminService.studentCountPerTier().then((results) => {
    res.status(200).send({ nbrStudentPerTier: results });
  }).catch((error) => {
    res.status(400).send({ error: "cannot retrieve student count per tier" });
  })
}

function userCountPerWilayaController(req, res) {
  adminService.userCountPerWilaya().then((results) => {
    res.status(200).send({ nbrUsersPerWilaya: results });
  }).catch((error) => {
    res.status(400).send({ error: "cannot retrieve users count per wilaya" });
  })
}
module.exports = {
  loginController, logoutController, getAllUsersController,
  deleteUserCntrl, countUsersController,
  blockUserCntrl, UnblockUserCntrl, countUploadsCntrl,
  DAUCntrl, totalIncomeCntrl, countCoursesController, tierCountCoursesController,
  monthCountCoursesController, fieldCountCoursesController, studentCountPerTierController,
  userCountPerWilayaController
};
