const bcrypt = require('bcrypt');
const db = require('../config/db');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

function registerChild(student, parentId) {
    console.log("register called")
    return bcrypt.hash(student.password, 8).then((hash) => {
        console.log("password crypted")
        return new Promise((resolve, reject) => {//insert new user to user table
            const query = "INSERT INTO user (user_email, user_password, user_firstName, user_lastName, user_gender, user_birthDate, user_phoneNumber, user_card_id, wilaya_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const queryVar = [student.email, hash, student.firstname, student.lastname, student.gender, student.birthdate, student.phonenumber, student.cardId, student.wilaya_code];
            db.query(query, queryVar, (error, results) => {
                if (error) {
                    console.log("not working : ", error)
                    reject(error);
                } else {
                    resolve(results);
                }

            });
        })}).then((OldResults) => {
            console.log('inserted user: ', OldResults)
            return new Promise((resolve, reject) => {// get the id of the selected field
                db.query('SELECT * FROM user WHERE user_id = ?', [OldResults.insertId], (error, results) => {
                    if (error) {
                        console.log(error)
                        reject(error)
                    } else {// save field code in oldResults
                        console.log("2 promise: ", results)
                        resolve(results);
                    }
                })
            })
        }).then((OldResults)=>{
            return new Promise((resolve, reject) => {// get the id of the selected field
                db.query('SELECT tier_code FROM tier WHERE tier_name = ?', [student.tier], (error, results) => {
                    if (error) {
                        console.log(error)
                        reject(error)
                    } else {// save field code in oldResults
                        OldResults[0].tierCode = results[0].tier_code
                        console.log("all user", OldResults[0])
                        resolve(OldResults);
                    }
                })
            })
        }).then((OldResults) => {
            return new Promise((resolve, reject) => {//set userType 
                queryVar = { parent_id: parentId, user_id: OldResults[0].user_id, tier_code: OldResults[0].tierCode }
                db.query("INSERT INTO student SET ?", queryVar, (error, results) => {
                    if (error) {
                        console.log(error);
                        reject(error)
                    } else {
                        resolve(OldResults)
                    }

                });
            })
        });
}

function ChildrenAccounts(parentId) {
    return new Promise((resolve, reject) => {// get all children accounts related to parent id
        const query = "SELECT user_email, user_firstName, user_lastName, user_gender, user_birthDate, wilaya_code, tier_name  FROM user INNER JOIN student ON user.user_id = student.user_id INNER JOIN tier ON student.tier_code = tier.tier_code INNER JOIN parent ON student.parent_id = parent.parent_id  WHERE parent.parent_id  = ?"
        const queryVar = [parentId]
        db.query(query, queryVar, (error, results) => {
            if (error) {
                console.log(error)
                reject(error)
            }
            resolve(results)
        })
    })
}

module.exports = { registerChild, ChildrenAccounts }