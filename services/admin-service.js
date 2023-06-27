const bcrypt = require('bcrypt');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary')
//Login section
function login(admin) {
  let adminInfo
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM admin WHERE admin_email = ?', [admin.email], async (error, results) => {
      if (!results[0] || !(await bcrypt.compare(admin.password, results[0].admin_password))) {
        error = new Error("wrong email or password");
        reject(error);
      } else if (error) {
        reject(error)
      } else {
        adminInfo = [...results]
        resolve(adminInfo);
      }
    });
  })
}

//Admin features
function countUsers(type = "user") {
  return new Promise((resolve, reject) => {
    db.query(`SELECT COUNT(*) FROM ${type};`, (error, result) => {
      if (error) {
        console.log("---- Counting error")
        reject(error)
      } else {
        console.log("---- Results retrieved")
        resolve(result[0]["COUNT(*)"])
      }
    })
  })
}
function countUploads(resource) {
  return new Promise((resolve, reject) => {
    const options = {
      resource_type: resource,
      max_results: 500 // Adjust the maximum number of results per request as per your requirement
    };

    let totalCount = 0;

    function getVideos(nextCursor) {
      options.next_cursor = nextCursor;

      cloudinary.api.resources(options, function (error, result) {
        if (error) {
          console.error('Error:', error);
          reject(error);
        } else {
          const videos = result.resources;
          totalCount += videos.length;

          if (result.next_cursor) {
            // Retrieve the next page of results
            getVideos(result.next_cursor);
          } else {
            resolve(totalCount);
          }
        }
      });
    }

    // Start with null to retrieve the first page
    getVideos(null);
  });
}

function DAU() {
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().split('T')[0];
    const query = `SELECT COUNT(DISTINCT user_id) AS dau FROM user_has_activity WHERE DATE(activity_time) = '${today}'`;
    db.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        const dauCount = results[0].dau;
        resolve(dauCount);
      }
    });
  })
}

function totalIncome() {
  return new Promise((resolve, reject) => {
    const query = `SELECT SUM(course_price) as totalIncome FROM course WHERE published = 1`;
    db.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        const totalIncome = results[0].totalIncome;
        resolve(totalIncome.toString() + " DA");
      }
    });
  })
}

function countCourses(published = "empty") {
  let sqlQuery = ""
  if (published !== "empty") {
    sqlQuery = `SELECT COUNT(*) as nbrCourses FROM course WHERE published = ${published}`
  } else {
    sqlQuery = `SELECT COUNT(*) as nbrCourses FROM course`
  }
  return new Promise((resolve, reject) => {
    db.query(sqlQuery,
      (error, results) => {
        if (error) {
          console.log("error on course counting", error)
          reject(error)
        } else {
          resolve(results[0].nbrCourses)
        }
      })
  })
}

async function tierCountCourses() {
  let nbrCoursesPerTier = []
  try {
    const Tiers = await new Promise((resolve, reject) => {//retrieve tiers
      db.query('SELECT * FROM tier', (error, results) => {
        if (error) {
          console.log("error while retrieving tiers", error)
          reject(error)
        } else {
          resolve(results)
        }
      })
    })
    for (tier of Tiers) {
      await new Promise((resolve, reject) => {// count courses per tier
        db.query('SELECT count(*) as nbrCourses  FROM course WHERE tier_code = ?',
          [tier.tier_code], (error, results) => {
            if (error) {
              console.log("error on count course for: " + tier.tier_name, error)
              reject(error)
            } else {
              nbrCoursesPerTier.push({ tier_name: tier.tier_name, nbrCourse: results[0].nbrCourses })
              resolve(results)
            }
          })
      })
    }
    return nbrCoursesPerTier
  } catch (error) {
    console.log("error on try block", error)
    throw error
  }

}

async function studentCountPerTier() {
  let nbrStudentPerTier = []
  try {
    const Tiers = await new Promise((resolve, reject) => {//retrieve tiers
      db.query('SELECT * FROM tier', (error, results) => {
        if (error) {
          console.log("error while retrieving tiers", error)
          reject(error)
        } else {
          resolve(results)
        }
      })
    })
    for (tier of Tiers) {
      await new Promise((resolve, reject) => {// count courses per tier
        db.query('SELECT count(*) as nbrStudent  FROM student WHERE tier_code = ?',
          [tier.tier_code], (error, results) => {
            if (error) {
              console.log("error on count students for: " + tier.tier_name, error)
              reject(error)
            } else {
              nbrStudentPerTier.push({ tier_name: tier.tier_name, nbrStudent: results[0].nbrStudent })
              resolve(results)
            }
          })
      })
    }
    return nbrStudentPerTier
  } catch (error) {
    console.log("error on try block", error)
    throw error
  }

}

async function userCountPerWilaya() {
  let nbrUsersPerWilaya = []
  try {
    const Wilayas = await new Promise((resolve, reject) => {//retrieve 
      db.query('SELECT * FROM wilaya', (error, results) => {
        if (error) {
          console.log("error while retrieving wilayas", error)
          reject(error)
        } else {
          resolve(results)
        }
      })
    })
    for (wilaya of Wilayas) {
      await new Promise((resolve, reject) => {// count courses per tier
        db.query('SELECT count(*) as nbrUsers  FROM user WHERE wilaya_code = ?',
          [ wilaya.wilaya_code], (error, results) => {
            if (error) {
              console.log("error on count users for: " + wilaya.wilaya_name, error)
              reject(error)
            } else {
              nbrUsersPerWilaya.push({ wilaya_name:  wilaya.wilaya_name, nbrUsers: results[0].nbrUsers })
              resolve(results)
            }
          })
      })
    }
    return nbrUsersPerWilaya
  } catch (error) {
    console.log("error on try block", error)
    throw error
  }

}

async function fieldCountCourses() {
  let nbrCoursesPerField = []
  try {
    const Fields = await new Promise((resolve, reject) => {//retrieve tiers
      db.query('SELECT * FROM field', (error, results) => {
        if (error) {
          console.log("error while retrieving fields", error)
          reject(error)
        } else {
          resolve(results)
        }
      })
    })
    for (field of Fields) {
      await new Promise((resolve, reject) => {// count courses per tier
        db.query('SELECT count(*) as nbrCourses  FROM course WHERE field_code = ?',
          [field.field_code], (error, results) => {
            if (error) {
              console.log("error on count course for: " + field.field_name, error)
              reject(error)
            } else {
              nbrCoursesPerField.push({ field_name: field.field_name, nbrCourse: results[0].nbrCourses })
              resolve(results)
            }
          })
      })
    }
    return nbrCoursesPerField
  } catch (error) {
    console.log("error on try block")
    throw error
  }

}

function monthCountCourses() {
  return new Promise((resolve, reject) => {//  count the number of courses for each month
    const sqlQuery = "SELECT YEAR(course_created_at) AS year, MONTH(course_created_at) AS month, COUNT(*) AS course_count" +
      " FROM course" +
      " GROUP BY YEAR(course_created_at), MONTH(course_created_at)" +
      " ORDER BY YEAR(course_created_at), MONTH(course_created_at);"
    db.query(sqlQuery, (error, results) => {
      if (error) {
        console.log("error while counting courses per month", error)
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}

function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM user WHERE user_id = ?", [userId], (error, results) => {
      if (error) {
        console.log("error while deleting user", error)
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}

function blockUser(userId) {
  return new Promise((resolve, reject) => {
    db.query("UPDATE user SET user_status = ? WHERE user_id = ?", ["blocked", userId], (error, results) => {
      if (error) {
        console.log("error while restricteing user", error)
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}

function UnblockUser(userId) {
  return new Promise((resolve, reject) => {
    db.query("UPDATE user SET user_status = ? WHERE user_id = ?", ["enabled", userId], (error, results) => {
      if (error) {
        console.log("error while approve user", error)
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}

function createToken(adminId) {
  const token = jwt.sign({ adminId: adminId, role: 'admin'}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  return token
}
module.exports = {
  login, countUsers,
  deleteUser, blockUser, UnblockUser, createToken,
  countUploads, DAU, totalIncome, countCourses, tierCountCourses,
  monthCountCourses, fieldCountCourses, studentCountPerTier,
  userCountPerWilaya
};