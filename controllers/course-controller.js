const courseCreationService = require('../services/course-service')

function createCourseCntrl(req, res) {
    instructorId = req.authData.userTypeIds
    course = req.body
    if (req.file) {
        const pictureUrl = req.file.path
        courseCreationService.createCourse(course, pictureUrl, instructorId).then((results) => {
            res.status(200).send({ succMsg: "Course created", results: results.insertId });
        }).catch((error) => {
            res.status(500).send({ errMsg: 'cannot create course' })
        })
    } else {
        courseCreationService.createCourseSimple(course, instructorId).then((results) => {
            res.status(200).send({ succMsg: "Course created", results: results.insertId });
        }).catch((error) => {
            res.status(500).send({ errMsg: 'cannot create course' })
        })
    }

}

function uploadCoursePictureCntrl(req, res) {
    const pictureUrl = req.file.path;
    courseId = req.params.courseId
    courseCreationService.uploadCoursePicture(courseId, pictureUrl).then((results) => {
        res.status(200).send({ succMsg: "picture upladed " });
    }).catch((error) => {
        res.status(500).send({ errMsg: 'cannot upload picture' })
    })

}

function retrievePublishedCoursesCntrl(req, res) {
    courseCreationService.retrievePublishedCourses().then((results) => {
        res.status(200).send({ succMsg: "retrieve published courses ", results: results });
    }).catch((error) => {
        res.status(500).send({ errMsg: 'Cannot retrieve published courses' })
    })
}

function CourseDetailsCntrl(req, res) {
    const courseId = req.params.courseId
    courseCreationService.CourseDetails(courseId).then((results) => {
        res.status(200).send({ succMsg: "retrieve course details", results: results });
    }).catch((error) => {
        res.status(500).send({ errMsg: 'Cannot retrieve course details' })
    })
}
function courseRatingCntrl(req, res) {
    const courseId = req.params.courseId
    courseCreationService.courseRating(courseId).then((results) => {
        res.status(200).send({ succMsg: "retrieve course rating", rating: results });
    }).catch((error) => {
        res.status(500).send({ errMsg: 'Cannot retrieve course rating' })
    })
}

function EnrollCourseCntrl(req, res) {
    const stduentId = req.authData.userTypeIds
    const courseId = req.params.courseId
    courseCreationService.EnrollCourse(courseId, stduentId).then((results) => {
        res.status(200).send({ succMsg: "added course to stduent library" });
    }).catch((error) => {
        res.status(500).send({ errMsg: 'Cannot add course to stduent library' })
    })
}

function CheckEnrolledCourse(req, res) {
    const stduentId = req.authData.userTypeIds
    const courseId = req.params.courseId
    courseCreationService.CheckEnrolledCourse(courseId, stduentId).then((results) => {
        console.log(results)
        res.status(200).send({ results: results });
    }).catch((error) => {
        res.status(500).send({ errMsg: error })
    })
}

function getCourseResourcesCntrl(req, res) {
    const courseId = req.params.courseId
    console.log('course id', courseId)
    courseCreationService.getCourseResources(courseId).then((results) => {
        res.status(200).send({ succMsg: "course resources", results: results });
    }).catch((error) => {
        res.status(500).send({ errMsg: "cannot retrieve course resources" })
    })
}

function uploadVideoLectureCntrl(req, res) {
    const courseId = req.params.courseId
    const videoUrl = req.file.path;
    const { videoTitle, videoDescription } = req.body
    courseCreationService.uploadVideoLecture(videoTitle, videoDescription, videoUrl, courseId).then((results) => {
        res.status(200).send({ results: results, succMsg: " video lecture uploaded" });
    }).catch((error) => {
        res.status(500).send({ errMg: "cannot upload video lecture: " + error.message });
    })

}

function uploadLectureFileCntrl(req, res) {
    const courseId = req.params.courseId
    const fileUrl = req.file.path;
    const fileName = req.body.file_name
    courseCreationService.uploadLectureFile(fileName, fileUrl, courseId).then((results) => {
        res.status(200).send({ results: results, succMsg: " file lecture uploaded" });
    }).catch((error) => {
        res.status(400).send({ errMg: "cannot upload file lecture" });
    })
}

async function createQuizCntrl(req, res) {
    const courseId = req.params.courseId
    const lectureTitle = req.body.lecture_title
    const lectureDescription = req.body.lecture_description
    const quizTitle = req.body.quiz_title
    const quizDescription = req.body.quiz_description
    //create an array with quiz_description and title
    const questions = (({ lecture_title, lecture_description, quiz_title, quiz_description, ...rest }) => rest)(req.body)
    courseCreationService.createQuiz(lectureTitle, lectureDescription, quizTitle,
        quizDescription, questions, courseId).then((results) => {
            res.status(200).send({ results, succMsg: 'Quiz created successfully' });
        }).catch((error) => {
            console.error('Error creating quiz:', error);
            res.status(400).send({ errMg: 'Unable to create quiz' });
        });
}

async function getQuizCntrl(req, res) {
    const courseId = req.params.courseId
    await courseCreationService.getQuiz(courseId).then((results) => {
        res.status(200).send({ succMsg: "Quiz Info", results })
    }).catch((error) => {
        res.status(400).send({ errMg: 'Unable to get quiz info' });
    });
}

function searchCntrl(req, res) {
    const keyWord = req.params.keyWord
    const tableName = req.query.table
    const allowedTables = ["course", "video"]
    if (!allowedTables.includes(tableName)) {
        res.status(404).send({ errMg: `search term does not exist` });
    } else {
        courseCreationService.search(keyWord, tableName).then((results) => {
            res.status(200).send({ succMsg: `retrieved from ${tableName}`, results: results });
        }).catch((error) => {
            res.status(404).send({ errMg: `does not exist in ${tableName} ` + error });
        })
    }


}
function retrieveCourseByTitleCntrl(req, res) {
    const courseTitle = req.params.courseTitle
    const FilteringOptions = req.query
    console.log("this is the query options: ", FilteringOptions)
    courseCreationService.retrieveCourseByTitle(courseTitle, FilteringOptions).then((results) => {
        res.status(200).send({ succMsg: "course retrieved ", results: results });
    }).catch((error) => {
        res.status(404).send({ errMg: "course does not exist: " + error.message });
    })

}


module.exports = {
    createCourseCntrl, uploadCoursePictureCntrl,
    retrievePublishedCoursesCntrl, CourseDetailsCntrl,
    EnrollCourseCntrl, CheckEnrolledCourse, uploadVideoLectureCntrl,
    getCourseResourcesCntrl, uploadLectureFileCntrl,
    searchCntrl, createQuizCntrl, getQuizCntrl,
    retrieveCourseByTitleCntrl, courseRatingCntrl
}