const db = require('../config/db')

function retrieveEnrolledCourses(student_id) {
    const SqlQuery = "select course_id from student_has_course where student_id = ?"
    return new Promise((resolve, reject) => {
        db.query(SqlQuery, [student_id], (error, results) => {// retrieve enrolled courses for specific student
            if (error) {
                console.log('error while retrieving enrolled courses', error)
                reject(error)
            } else {
                resolve(results)
            }
        })
    }).then((FiResults) => {
        let CourseDetails = []
        return new Promise(async (resolve, reject) => {// loop through course ids and retrieve details for each course and return enrolled courses
            try {
                for (let i = 0; i < FiResults.length; i++) {
                    const course_id = FiResults[i].course_id
                    const courseDetailsPromise = await new Promise((resolve, reject) => {
                        const SqlQuery = "SELECT course.course_id, course.course_title, course.course_picture, course.course_price, user.user_firstName, user.user_lastName " +
                            " FROM course " +
                            "INNER JOIN instructor ON course.instructor_id = instructor.instructor_id " +
                            "INNER JOIN user ON instructor.user_id = user.user_id " +
                            "WHERE course_id = ?; "
                        db.query(SqlQuery, [course_id], (error, results) => {
                            if (error) {
                                console.log("error while retrieveing enrolled course details", error)
                                reject(error)
                            } else {
                                console.log("course details", results)
                                resolve(results)
                            }
                        })
                    })
                    CourseDetails.push(courseDetailsPromise);
                }
                resolve(CourseDetails)
            } catch (error) {
                console.log("error on try block", error)
                reject(error)
            }

        })
    })
}

async function rateCourse(course_rating, course_id, student_id) {
    try {
        const saveStudentRating = await new Promise((resolve, reject) => {
            const SqlQuery = "update student_has_course set course_rating = ? where course_id = ? and student_id = ?"
            db.query(SqlQuery, [course_rating, course_id, student_id], (error, results) => {
                if (error) {
                    console.log("error while updating student_has_course", error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
        const courseRatingPerStudent = await new Promise((resolve, reject) => {
            const SqlQuery = "SELECT * FROM student_has_course WHERE course_id = ?"
            db.query(SqlQuery, [course_id], (error, results) => {
                if (error) {
                    console.log("error while getting course rating per user", error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
        let total_rating = 0
        console.log("rating promise ", courseRatingPerStudent)
        for (rating of courseRatingPerStudent) {
            console.log("obj", rating.course_rating)
            total_rating = total_rating + rating.course_rating
        }
        console.log("total ratint", total_rating)
        await new Promise((resolve, reject) => {
            const courseGlobalRating = total_rating / courseRatingPerStudent.length
            console.log("new global ratinig", courseGlobalRating)
            const SqlQuery = "UPDATE course SET course_rating = ? WHERE course_id = ?"
            db.query(SqlQuery, [courseGlobalRating, course_id], (error, results) => {
                if (error) {
                    console.log("error while updating course rating", error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
        return saveStudentRating
    } catch (error) {
        console.log("error on try block of rateCourse", error)
        throw error
    }
}

async function getQuiz(course_id) {
    try {
        let questionAnswerArray = []
        const LecturePromise = await new Promise((resolve, reject) => {//retrieve lecture by course id(singel lecture case)
            db.query('SELECT lectures.lecture_title, lectures.lecture_description, lectures.quiz_id, quiz.quiz_title, quiz.quiz_desc '
                + 'FROM lectures INNER JOIN quiz ON lectures.quiz_id = quiz.quiz_id '
                + 'WHERE course_id = ?', [course_id], (error, LectureResults) => {
                    if (error) {
                        console.log("error while retrieveing Lecture info", error)
                        reject(error)

                    } else {
                        resolve(LectureResults)
                    }
                })
        })
        const questionsPromise = await new Promise((resolve, reject) => {//retrieve questions
            db.query('SELECT question_id, question_text FROM questions WHERE quiz_id = ?', [LecturePromise[0].quiz_id], (error, questionsResults) => {
                if (error) {
                    console.log("error while retrieveing questions from quiz: " + LecturePromise.quiz_id, error)
                    reject(error)

                } else {
                    resolve(questionsResults)
                }
            })
        })
        for (question of questionsPromise) {
            const questionId = question.question_id
            const questionText = question.question_text
            const answersPromise = await new Promise((resolve, reject) => {//retrieve answers
                db.query('SELECT answer_text FROM answers WHERE question_id = ?', [questionId], (error, answerResults) => {
                    if (error) {
                        console.log("error while retrieveing answer of question: " + questionId, error)
                        reject(error)
                    } else {
                        const QuestionAnswer = { questionText: questionText, answerText: answerResults[0].answer_text }
                        questionAnswerArray.push(QuestionAnswer)
                        resolve(answerResults)
                    }
                })
            })
        }
        questionAnswerArray.unshift({ quizTitle: LecturePromise[0].quiz_title, quizDescription: LecturePromise[0].quiz_desc })
        questionAnswerArray.unshift({ lectureTitle: LecturePromise[0].lecture_title, lectureDescription: LecturePromise[0].lecture_description })
        return questionAnswerArray
    } catch (error) {
        console.error("Error while getting quiz info", error);
        throw error;
    }
}

async function answerQuiz(quiz_id, answers, student_id) {
    try {
        let AnswersArray = []
        //retrieve quiz questions
        const quizQuestionsPromise = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM questions WHERE quiz_id = ?', [quiz_id], (error, results) => {
                if (error) {
                    console.log("error while retrieveing quiz questions: ", error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
        let answersPromise
        for (question of quizQuestionsPromise) {
            const questionId = question.question_id
            answersPromise = await new Promise((resolve, reject) => {//retrieve answers
                db.query('SELECT * FROM answers WHERE question_id = ?', [questionId], (error, answerResults) => {
                    if (error) {
                        console.log("error while retrieving answers: " + questionId, error)
                        reject(error)
                    } else {
                        AnswersArray.push(answerResults[0])
                        resolve(answerResults)
                    }
                })
            })
        }
        for (let i = 0; i < answers.length; i++) {
            let isCorrect = false
            if (answers[i] == AnswersArray[i].answer_text) {
                isCorrect = true
            }
            const answer_id = AnswersArray[i].answer_id
            const answer_text = answers[i]
            const saveAnswerPromise = await new Promise((resolve, reject) => {
                db.query('INSERT INTO student_has_answers SET ?', { student_id, answer_id, isCorrect, answer_text }, (error, results) => {
                    if (error) {
                        console.log("error while saving stduent answer: ", error)
                        reject(error)
                    } else {
                        resolve(results)
                    }
                })
            })
        }
        return AnswersArray
    } catch (error) {
        console.error("Error while getting quiz answers", error);
        throw error;
    }

}

module.exports = {
    retrieveEnrolledCourses, rateCourse, getQuiz,
    answerQuiz
}