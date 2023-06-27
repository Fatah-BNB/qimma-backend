const db = require('../config/db')

const checkUserStatusMiddleware = (req, res, next) =>{
    const userId = req.authData.userId
    const UserStatusPromise = new Promise((resolve, reject)=>{
        db.query('SELECT user_status FROM user where user_id = ?', [userId],
        (error, results)=>{
            if(error){
                console.log('error while attempting to check user status', error)
                reject(error)
            }else{
                resolve(results)
            }
        })
    })
    UserStatusPromise.then((results)=>{
        if (results[0].user_status === "blocked") {
            return res.status(404).json({ error: 'you are blocked please contact support to resolve your situation' });
          }
          next();
    }).catch((error) => {
        // Handle any errors that occur during the database query
        console.error('Error executing database query:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
}
module.exports = {checkUserStatusMiddleware}