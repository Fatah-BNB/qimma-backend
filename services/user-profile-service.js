const db = require('../config/db');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const cloudinary = require('../config/cloudinary')
const multer = require('multer');
const transporter = require('../config/transporter')
dotenv.config({ path: './.env' });

function getUserInfo(userId) {
    return new Promise((resolve, reject) => {
        db.query("select * from user where user_id = ?", [userId], (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    }).then(res => {
        if (res[0].wilaya_code == null) {
            return new Promise((resolve, reject) => {
                const query = 'SELECT user_email, user_password, user_firstName, '
                    + 'user_lastName, user_birthDate, user_phoneNumber, user_picture, user_card_id from user where user_id = ?'
                db.query(query, [res[0].user_id], (error, results) => {
                    if (error) {
                        console.log("cannot get user info", error)
                        reject(error)
                    } else {
                        console.log("can get user info", results)
                        resolve(results)
                    }
                })
            })
        } else {
            return new Promise((resolve, reject) => {
                const query = 'SELECT user_email, user_password, user_firstName, '
                    + 'user_lastName, user_birthDate, user_phoneNumber, user_picture, user_card_id, user.wilaya_code, wilaya_name '
                    + 'FROM user INNER JOIN wilaya ON user.wilaya_code = wilaya.wilaya_code where user.user_id = ?'
                db.query(query, [res[0].user_id], (error, results) => {
                    if (error) {
                        console.log("cannot get user info", error)
                        reject(error)
                    } else {
                        console.log("can get user info", results)
                        resolve(results)
                    }
                })
            })
        }
    })

}

function updateField(userId, field, value) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE user SET ${field} = ? WHERE user_id = ?`, [value, userId], (error, results) => {
            if (error) {
                console.log("cannot update " + field + ": ", error)
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

function updateUserInfo(userId, user) {
    let updateFields = user;
    let params = [];
    let fieldMap = {
        user_firstName: "user_firstName = ?",
        user_lastName: "user_lastName = ?",
        user_birthDate: "user_birthDate = ?",
        user_phoneNumber: "user_phoneNumber = ?",
        user_card_id: "user_card_id = ?",
        wilaya_code: "wilaya_code = ?"
    };

    let fieldList = Object.keys(updateFields).map((fieldName) => {
        if (fieldMap[fieldName]) {
            params.push(updateFields[fieldName]);
            return fieldMap[fieldName];
        }
    }).filter((item) => item).join(", ");
    return new Promise((resolve, reject) => {// update user table
        let sqlQuery = `UPDATE user SET ${fieldList} WHERE user_id = ?`;
        params.push(userId);
        db.query(sqlQuery, params, (error, results) => {
            if (error) {
                console.log("cannot update ", error)
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

function updateProfileInfo(userId, user) {
    return new Promise((resolve, reject) => {
        const updateQuery = "update user set " +
            "user_firstName = ?, " +
            "user_lastName = ?, " +
            "user_phoneNumber = ?, " +
            "wilaya_code = ? " +
            "where user_id = ?;"
        const updateValues = [user.firstname, user.lastname, user.phoneNumber, user.wilayaCode, userId]
        db.query(updateQuery, updateValues, (err, res) => {
            if (err) {
                console.log("err is ", err)
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

function getAvatar(userId) {
    return new Promise((resolve, reject) => {
        db.query("select user_picture from user where user_id = ?",[userId], (err, res) => {
            if(err){
                console.log("cannot get avatar for user ", userId + "erros is ", err)
                reject(err)
            }else{
                resolve(res)
            }
        })
    })
}

function deleteAvatar(userId) {
    return new Promise((resolve, reject) => {
        db.query("update user set user_picture = null where user_id = ?", [userId], (err, res) => {
            if(err) {
                console.log("unable to delete picture from user ", userId + "error is ", err)
                reject(err)
            }else{
                resolve(res)
            }
        })
    })
}

function uploadAvatar(imageUrl, userId) {
    // The uploaded image is available in req.file
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(imageUrl, {
            resource_type: "image",
            type: "upload",
            public_id: "avatar_" + userId,
            overwrite: true
        }, function (error, result) {
            if (error instanceof multer.MulterError) {
                reject('invalid image format');
            } else if (error) {
                console.log(error);
                reject('Error while uploading image');
            } else {
                console.log("IMAGE RESULTS ++++++++++>>>",result)
                resolve(result);
            }
        });
    }).then((result) => {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE user SET user_picture = ? WHERE user_id = ?`, [result.secure_url, userId], (error, results) => {
                if (error) {
                    console.log("cannot update: ", error)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })
    })
}

function updatePassword(userId, passwords) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM user WHERE user_id = ?', [userId], async (error, results) => {
            if (! await bcrypt.compare(passwords.oldPassword, results[0].user_password)) {
                reject('incorrect password')
            } else if (!passwords.newPassword == passwords.newPasswordc) {
                reject('passwords do not match')
            } else {
                resolve(results)
            }
        })
    }).then((OldResults) => {
        return new Promise(async (resolve, reject) => {
            const hash = await bcrypt.hash(passwords.newPassword, 8)
            db.query('UPDATE user SET user_password = ? WHERE user_id = ?', [hash, userId], (error, results) => {
                if (error) {
                    console.log(error)
                    reject(error)
                } else {
                    resolve(OldResults)
                }
            })
        })
    }).then((OldResults) => {
        return new Promise((resolve, reject) => {
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: OldResults[0].user_email,
                subject: "password changed",
                html: "your password has been updated successfully"
            };

            // send mail with defined transport object

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    resolve(info);
                }
            });

        })
    })

}
module.exports = {
    getUserInfo, updateField,
    uploadAvatar, updateUserInfo,
    updatePassword, updateProfileInfo, getAvatar, deleteAvatar
}