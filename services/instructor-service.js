const db = require('../config/db')

async function coursesInsights(instructorId){
    console.log("intructorId", instructorId)
    let studentCountPerCourse = []
    try{
        const retrieveInstructorCourses = await new Promise((resolve, reject)=>{
            db.query("SELECT * FROM course WHERE instructor_id = ?", [instructorId], 
            (error, results)=>{
                if(error){
                    console.log("error while retrieveing instructor courses", error)
                    reject(error)
                }else{
                    console.log("inside 1st ", results)
                    resolve(results)
                }
            })
        })
        //loop through the courses and retrieve the id and count students
        for(course of retrieveInstructorCourses){
            await new Promise((resolve, reject)=>{
                db.query("SELECT count(*) nbrStudent FROM student_has_course WHERE course_id = ? ",
                [course.course_id], (error, results)=>{
                    if(error){
                        console.log("error while retrieveing student count for instructor courses", error)
                        reject(error)
                    }else{
                        console.log("inside for loop ", results)
                        studentCountPerCourse.push({course_title: course.course_title, studentCount: results[0].nbrStudent})
                        resolve(results)
                    }
                })
            })
        }
        return studentCountPerCourse
    }catch(error){
        console.log("error on try block", error)
        throw error
    }
}

module.exports = {coursesInsights}