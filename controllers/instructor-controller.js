instructorService = require('../services/instructor-service')
function coursesInsightsCntrl(req, res){
    const instructorId = req.authData.userTypeIds
    instructorService.coursesInsights(instructorId).then((result)=>{
        res.status(200).send({ succMsg: "instructor courses insights", results: result });
    }).catch((error)=>{
        res.status(200).send({ errMsg: "error while calling instructor courses"});
    })
}

module.exports = {coursesInsightsCntrl}