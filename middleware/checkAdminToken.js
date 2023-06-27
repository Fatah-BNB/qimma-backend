const jwt = require('jsonwebtoken');


exports.verifyToken = async (req, res, next) => {
    jwt.verify(req.cookies.admin, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.status(403).send({ error: 'invalid token' });
        } else if (authData.role === 'admin') {
            // Save authData to request object for use in route handler 
            req.authData = authData;
            next();
        } else {
            res.status(403).send({ error: 'protected page' });
        }
    });

}