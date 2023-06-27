const db = require('../config/db')
const courseSrevice = require('./course-service')
function retrieveInstructorCourses(instructor_id) {
    return new Promise((resolve, reject) => {
        db.query('select course_id, course_title, course_description, course_picture, published, course_price, DATE_FORMAT(course_created_at, \'%Y-%m-%d\') AS course_created_date from course where instructor_id = ?  ORDER BY course_created_at DESC;', [instructor_id],
            (error, results) => {
                if (error) {
                    console.log("error while retrieving coures info", error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
    })
}

async function publishCourse(course_id, course_instructor_id, user_id) {
    try{
        const publishCoursePromise = await new Promise((resolve, reject) => {
            db.query("update course set published = 1 where course_id = ? and instructor_id = ?", [course_id, course_instructor_id], (err, res) => {
                if (err) {
                    console.log("ERROR PUBLISHING COURSE: ", err)
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
        // courseSrevice.saveActivity(user_id, "publish course")
        return publishCoursePromise
    }catch(error){
        console.error(error)
        throw error
    }
}

function deleteCourse(course_id){
    return new Promise((resolve, reject) => {
        db.query("delete from course where course_id = ?", [course_id], (err, res) => {
            if (err) {
                console.log("ERROR DELETING COURSE: ", err)
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

module.exports = { retrieveInstructorCourses, publishCourse, deleteCourse }