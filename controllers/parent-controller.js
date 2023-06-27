const parentService = require('../services/parent-service');
const userService = require('../services/user-auth-service');

function createChildAccountCntrl(req, res) {
    const student = req.body
    const parentId = req.authData.userTypeIds
    console.log("parent ID", parentId)
    parentService.registerChild(student, parentId).then(async (results) => {//after the user register the server send an email to the user
        //1) create token for email 
        const emailToken = userService.createEmailToken(results[0].user_firstName, results[0].user_id);
        //2) send the email
        var fullUrl = req.protocol + '://' + req.get('host') + '/verify-user-email' + '/' + results[0].user_firstName + '/' + emailToken
        userService.sendEmail(results[0].user_email, fullUrl, 'Email confirmation');
        res.status(200).send({ succMsg: "Account created", results: results[0] });
    }).catch((error) => {
        res.status(401).send({ errMsg: "Faild to create account" });
    });

}
function getChildrenAccountsCntrl(req, res){
    const parentId = req.authData.userTypeIds
    parentService.ChildrenAccounts(parentId).then((results)=>{
        res.status(200).send({ succMsg: "children accounts", results: results });
    }).catch((error) => {
        res.status(401).send({ errMsg: "cannot get children accounts" });
    });
    
}
module.exports = { createChildAccountCntrl, getChildrenAccountsCntrl }