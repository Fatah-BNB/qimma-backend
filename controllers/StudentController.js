const studentService = require('../services/student-service');


function retrieveEnrolledCoursesCntrl(req, res) {
    const studentId = req.authData.userTypeIds
    studentService.retrieveEnrolledCourses(studentId).then((results) => {
        res.status(200).send({ succMsg: "retrieve enrolled courses", results: results});
    }).catch((error) => {
        res.status(500).send({ errMsg: "Cannot get enrolled courses" });
    });

}

function rateCourseCntrl(req, res){
    const studentId = req.authData.userTypeIds
    const courseId = req.params.courseId
    const courseRating = req.body.course_rating
    studentService.rateCourse(courseRating, courseId, studentId).then((results) => {
        res.status(200).send({ succMsg: "course rated"});
    }).catch((error) => {
        res.status(500).send({ errMsg: "Cannot rate course"});
    });
}

async function getQuizCntrl(req, res){
    const courseId = req.params.courseId
    await studentService.getQuiz(courseId).then((results)=>{
        res.status(200).send({succMsg: "Quiz Info", results})
    }).catch((error) => {
        res.status(400).send({ errMg: 'Unable to get quiz info' });
    });
}

async function answerQuizCntrl(req, res){
    const quizId = req.params.quizId
    const answers = Object.values(req.body)
    const studentId = req.authData.userTypeIds
    await studentService.answerQuiz(quizId, answers, studentId).then((results)=>{
        res.status(200).send({succMsg: "quiz answer submited", results})
    }).catch((error) => {
        res.status(400).send({ errMg: 'Unable to submit your answer' });
    });
}
module.exports = { 
    retrieveEnrolledCoursesCntrl, rateCourseCntrl,
    getQuizCntrl,answerQuizCntrl}