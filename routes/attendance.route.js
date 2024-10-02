const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, attendanceController.getAllAttendances);
router.get('/:id', authMiddleware, attendanceController.getAttendanceById);
router.post('/', authMiddleware, attendanceController.createAttendance);
router.put('/:id', authMiddleware, attendanceController.updateAttendance);
router.delete('/:id', authMiddleware, attendanceController.deleteAttendance);

module.exports = router;
