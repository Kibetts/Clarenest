const express = require('express');
const router = express.Router();
const scheduleController = require('../controller/schedule.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const checkFeesPaid = require('../middleware/checkFees.middleware');
const { allowWrite } = require('../middleware/permissions.middleware');

router.get('/', authenticateJWT, checkFeesPaid, scheduleController.getSchedule);
router.post('/', [authenticateJWT, allowWrite], scheduleController.createSchedule);
router.put('/:id', [authenticateJWT, allowWrite], scheduleController.updateSchedule);
router.delete('/:id', [authenticateJWT, allowWrite], scheduleController.deleteSchedule);

module.exports = router;