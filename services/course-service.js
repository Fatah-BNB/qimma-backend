const db = require('../config/db');
const cloudinary = require('../config/cloudinary')

function createCourse(course, pictureUrl, instructor_id) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            pictureUrl, {
            resource_type: "image",
            type: "upload",
            use_filename: true,
            unique_filename: true
        }, function (error, result) {
            if (error) {
                console.log('error while uploading course picture', error)
                reject(error);

            } else {
                console.log("IMAGE RESULTS ++++++++++>>>", result)
                resolve(result);
            }
        });
    }).then((result) => {
        const { course_title, course_description, course_price, tier_code, field_code } = course
        const course_picture = result.secure_url
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO course SET ?', { course_title, course_description, course_picture, course_price, tier_code, field_code, instructor_id }, (error, results) => {
                if (error) {
                    console.log('error while inserting course', error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    })
}

function createCourseSimple(course, instructor_id) {
    return new Promise((resolve, reject) => {
        const { course_title, course_description, course_price, tier_code, field_code } = course
        db.query('INSERT INTO course SET ?', { course_title, course_description, course_price, tier_code, field_code, instructor_id }, (error, results) => {
            if (error) {
                console.log('error while inserting course', error)
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

function uploadCoursePicture(course_id, pictureUrl) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            pictureUrl, {
            resource_type: "image",
            type: "upload",
            use_filename: true,
            unique_filename: true
        }, function (error, result) {
            if (error) {
                console.log('error while uploading course picture', error)
                reject(error);
            } else {
                console.log("IMAGE RESULTS ++++++++++>>>", result)
                resolve(result);
            }
        })
    }).then((result) => {
        const course_picture = result.secure_url
        return new Promise((resolve, reject) => {
            db.query('UPDATE course SET course_picture = ? where course_id = ?', [course_picture, course_id], (error, results) => {
                if (error) {
                    console.log('error while inserting course picture', error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    })

}

function retrievePublishedCourses() {
    return new Promise((resolve, reject) => {
        const SqlQuery = "SELECT course.course_id, course.course_rating, course.course_title, course.course_picture, course.course_price, user.user_firstName, user.user_lastName " +
            " FROM course " +
            "INNER JOIN instructor ON course.instructor_id = instructor.instructor_id " +
            "INNER JOIN user ON instructor.user_id = user.user_id " +
            "WHERE published = 1 order by course_created_at desc"
        db.query(SqlQuery, (error, results) => {
            if (error) {
                console.log("error while retrieveing published courses", error)
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

function CourseDetails(course_id) {
    return new Promise((resolve, reject) => {
        const SqlQuery = "SELECT course.course_id, course.course_title, course.course_picture, course.course_price, course_rating, course.course_description, tier.tier_name, field.field_name, DATE_FORMAT(course.course_created_at, \'%Y-%m-%d\') AS course_created_date, " +
            "user.user_firstName, user.user_lastName " +
            "FROM course " +
            "INNER JOIN tier ON course.tier_code = tier.tier_code " +
            "INNER JOIN field ON course.field_code = field.field_code " +
            "INNER JOIN instructor ON course.instructor_id = instructor.instructor_id " +
            "INNER JOIN user ON instructor.user_id = user.user_id " +
            "WHERE course.course_id = ?"
        db.query(SqlQuery, [course_id], (error, results) => {
            if (error) {
                console.log("error while retrieveing course details", error)
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}
function courseRating(course_id) {
    return new Promise((resolve, reject) => {
        const SqlQuery = "select course_rating from student_has_course where course_id = ?"
        db.query(SqlQuery, [course_id], (error, results) => {
            if (error) {
                console.log("error while getting course rating", error)
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

function EnrollCourse(course_id, student_id) {
    const SqlQuery = "insert into student_has_course set ?"
    const args = { course_id: course_id, student_id: student_id }
    return new Promise((resolve, reject) => {
        db.query(SqlQuery, args, (error, results) => {
            if (error) {
                console.log("error while adding course to stduent library", error)
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

function CheckEnrolledCourse(course_id, student_id) {
    console.log("course id is ", course_id)
    console.log("student id is ", student_id)
    const SqlQuery = "select count(*) as counts from student_has_course where student_id = ? and course_id = ?"
    const args = [student_id, course_id]
    return new Promise((resolve, reject) => {
        db.query(SqlQuery, args, (error, results) => {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

async function getCourseResources(courseId) {
    try {
        const Videos = await new Promise((resolve, reject) => {//retrieve videos
            db.query("SELECT * FROM video WHERE course_id = ? order by uploaded_at desc", [courseId],
                (error, results) => {
                    if (error) {
                        console.log("error while retrieving course videos", error)
                        reject(error)
                    } else {
                        console.log(results)
                        resolve(results)
                    }
                })
        })
        const Files = await new Promise((resolve, reject) => {//retrieve files
            db.query("SELECT * FROM file WHERE course_id = ? order by uploaded_at desc", [courseId],
                (error, results) => {
                    if (error) {
                        console.log("error while retrieving course files", error)
                        reject(error)
                    } else {
                        resolve(results)
                    }
                })
        })
        console.log("the videos:", Videos)
        const courseResources = [...Videos, ...Files]//merge lists
        const sortedResources = courseResources.sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));//order by time
        return sortedResources

    } catch (error) {
        console.log(error)
        throw error
    }
}
function uploadVideoLecture(video_title, video_description, videoUrl, course_id) {
    return new Promise((resolve, reject) => {

        cloudinary.uploader.upload(
            videoUrl,
            {
                resource_type: "video",
                type: "upload",
                use_filename: true,
                unique_filename: true
            },
            function (error, result) {
                if (error) {
                    console.error("Error uploading video:", error);
                    reject(error)
                } else {
                    console.log("Video uploaded successfully:", result);
                    resolve(result)
                }
            }
        );
    }).then((result) => {
        return new Promise((resolve, reject) => {
            const video_url = result.secure_url
            const video_cloud_id = result.public_id
            db.query('INSERT INTO video SET ?', { video_title, video_description, video_url, video_cloud_id, course_id }, (error, results) => {
                if (error) {
                    console.log("error while inserting video", error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    })
}

function uploadLectureFile(file_name, fileUrl, course_id) {
    return new Promise((resolve, reject) => {

        cloudinary.uploader.upload(
            fileUrl,
            {
                resource_type: "raw",
                type: "upload",
                use_filename: true,
                unique_filename: true
            },
            function (error, result) {
                if (error) {
                    console.error("Error uploading file:", error);
                    reject(error)
                } else {
                    console.log("file uploaded successfully:", result);
                    resolve(result)
                }
            }
        );
    }).then((result) => {
        return new Promise((resolve, reject) => {
            const file_url = result.secure_url
            const file_cloud_id = result.public_id
            db.query('INSERT INTO file SET ?', { file_name, file_url, file_cloud_id, course_id }, (error, results) => {
                if (error) {
                    console.log("error while inserting file", error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    })
}
async function createQuiz(lecture_title, lecture_description, quiz_title, quiz_desc, questions, course_id) {
    try {
        const quizResult = await new Promise((resolve, reject) => {
            db.query("INSERT INTO quiz SET ?", { quiz_title, quiz_desc }, (error, results) => {
                if (error) {
                    console.log("error while inserting new quiz", error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        const quizId = quizResult.insertId;

        const lectureResult = await new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO lectures SET ? ",
                { lecture_title, lecture_description, quiz_id: quizId, course_id },
                (error, results) => {
                    if (error) {
                        console.log("error while inserting new lecture", error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                }
            );
        });

        for (const [key, value] of Object.entries(questions)) {
            if (key.startsWith("question") && questions.hasOwnProperty(`answer${key.slice(8)}`)) {
                const question = value;
                const answer = questions[`answer${key.slice(8)}`];

                await new Promise((resolve, reject) => {
                    db.query(
                        "INSERT INTO questions SET ?",
                        { question_text: question, quiz_id: quizId },
                        (error, questionResult) => {
                            if (error) {
                                console.log("error while inserting new question", error);
                                reject(error);
                            } else {
                                db.query(
                                    "INSERT INTO answers SET ?",
                                    { answer_text: answer, question_id: questionResult.insertId },
                                    (error) => {
                                        if (error) {
                                            console.log("error while inserting question answer", error);
                                            reject(error);
                                        } else {
                                            resolve();
                                        }
                                    }
                                );
                            }
                        }
                    );
                });
            }
        }

        return quizResult;
    } catch (error) {
        console.error("Error on quiz creation", error);
        throw error;
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

function search(keyWord, tableName) {
    return new Promise((resolve, reject) => {//retrieve columns of the specified table
        db.query(
            `SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?`,
            [tableName],
            (error, result) => {
                if (error) {
                    console.log("Error while searching for columns:", error);
                    reject(error);
                } else {
                    if (tableName === "user") {
                        const columnsArray = result.slice(0, 15).map(row => row.COLUMN_NAME);
                        resolve(columnsArray)
                    } else {
                        const columnsArray = result.map(row => row.COLUMN_NAME);
                        resolve(columnsArray);
                    }

                }
            }
        );
    }).then((result) => {// construct the search query for each column and perform a search with the specified keyWord
        const searchQuery = result.map(column => `${column} LIKE ?`).join(' OR ');
        console.log("this the search: ", searchQuery)
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM ${tableName} WHERE ${searchQuery}`,
                result.map(() => `%${keyWord}%`)
                , (error, result) => {
                    if (error) {
                        console.log("error while retrieving results from table", error)
                        reject(error)
                    } else {
                        resolve(result)
                    }
                })
        })
    });
}

function retrieveCourseByTitle(courseTitle, FilteringOptions) {
    const { tier, price, rating } = FilteringOptions;
    let SqlQuery = `SELECT * FROM course WHERE course_title LIKE '%${courseTitle}%'`
    if (tier) {
        SqlQuery += ` AND tier_code = '${tier}'`;
    }
    if (rating) {
        SqlQuery += ` AND course_rating >= '${rating}'`;
    }
    if (price) {
        SqlQuery += ` AND course_price <= ${price}`;
    } else if (price.toLowerCase() === 'free') {
        SqlQuery += ` AND price = 0`;
    }
    return new Promise((resolve, reject) => {

        db.query(SqlQuery, (error, results) => {
            if (error) {
                console.log("error while retrieveing course by title", error)
                reject(error)

            } else {
                resolve(results)
            }
        })
    })
}



module.exports = {
    createCourse, uploadCoursePicture, createCourseSimple,
    retrievePublishedCourses, CourseDetails,
    EnrollCourse, CheckEnrolledCourse, uploadVideoLecture,
    getCourseResources, uploadLectureFile, search,
    createQuiz, getQuiz, retrieveCourseByTitle, courseRating
}