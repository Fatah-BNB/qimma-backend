const jwt = require('jsonwebtoken');
function verifyToken(userType){
  return async function verifyTokenMiddleware(req, res, next){
    const token = req.cookies.user;
    if(!token){
      res.status(403).send({error: 'Token not found'});
    }
    try{
      const authData = await jwt.verify(token, process.env.JWT_SECRET);
      const userTypeArry = ['student', 'instructor', 'parent']
      if(JSON.stringify(userTypeArry) === JSON.stringify(userType)){
        req.authData = authData;
        next()
      }else if ((authData.userType == userType) && (typeof authData.userType == typeof userType)) {
        req.authData = authData;
        next()
      }else{
        return res.status(403).json({ message: 'Forbidden' });
      }
      
    }catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}
module.exports = {verifyToken}