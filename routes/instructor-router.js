const instrucotrController = require('../controllers/instructor-controller');
const checkToken = require('../middleware/checkToken')

const express = require('express');

const router = express.Router();

router.get('/instructor-dashboard/courses-insights', checkToken.verifyToken("instructor"), instrucotrController.coursesInsightsCntrl)

module.exports = router