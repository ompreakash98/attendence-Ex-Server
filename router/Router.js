const express = require('express');
const router = express.Router();

// Define a route to fetch attendance data based on email and date, and update checkout date
router.route('/api/attendance/:email/:date')
  .get(async (req, res) => {
    try {
      const email = req.params.email;
      const date = req.params.date;
      const attendanceData = await Attendance.findOne({ employeeEmail: email, 'allAttendance.date': date });
      res.status(200).json(attendanceData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .patch(async (req, res) => {
    try {
      const id = req.params.id;
      const { checkOut } = req.body;
      await Attendance.updateOne(
        { 'allAttendance._id': id },
        { $set: { 'allAttendance.$.checkOut': checkOut } }
      );
      res.status(200).json({ message: 'Checkout date updated successfully.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
