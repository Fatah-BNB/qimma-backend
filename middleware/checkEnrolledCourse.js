const db = require('../config/db')

const checkEnrollmentMiddleware = (req, res, next) => {
    const studentId = req.authData.userTypeIds
    const courseId = req.params.courseId
    const EnrollmentPromise = new Promise((resolve, reject) => {
        db.query('SELECT * FROM student_has_course where student_id = ? and course_id = ?', [studentId, courseId],
            (error, results) => {
                if (error) {
                    console.log('error while attempting to check if student has enrolled course', error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
    })
    EnrollmentPromise.then((results) => {
        if (results.length === 0) {
            return res.status(404).json({ error: 'Student or course not found' });
        }
        next();
    }).catch((error) => {
        // Handle any errors that occur during the database query
        console.error('Error executing database query:', error);
        res.status(500).json({ error: 'Internal server error' });
    });
}
module.exports = { checkEnrollmentMiddleware }