const manageCourses = require('../services/manage-courses-service')

function retrieveInstructorCoursesCntrl(req, res) {
    const instructorId = req.authData.userTypeIds
    manageCourses.retrieveInstructorCourses(instructorId).then((results) => {
        res.status(200).send({ succMsg: "instructor courses", results: results });
    }).catch((error) => {
        res.status(500).send({ errMsg: 'cannot get instructor courses' })
    })
}

function publishCourseCntrl(req, res) {
    const instructorId = req.authData.userTypeIds
    const userId = req.authData.userId
    const courseId = req.body.courseId
    console.log("course id is ", courseId)
    manageCourses.publishCourse(courseId, instructorId,userId).then((results) => {
        console.log("RESULTS ===? ", results)
        res.status(200).send({ succMsg: "course published", results: results });
    }).catch((error) => {
        console.log("EROORS ===? ", error)
        res.status(400).send({ errMsg: 'cannot publish course ' })
    })
}

function deleteCourseCntrl(req, res){
    const courseId = req.params.courseId
    manageCourses.deleteCourse(courseId).then((results) => {
        res.status(200).send({ succMsg: "course deleted"});
    }).catch((error) => {
        res.status(400).send({ errMsg: 'cannot delete course' })
    })
}
module.exports = { retrieveInstructorCoursesCntrl, publishCourseCntrl,
    deleteCourseCntrl }