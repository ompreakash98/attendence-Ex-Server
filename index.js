// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors=require('cors')
const app = express();
const PORT = process.env.PORT || 3001;
const username = 'omprakashblackbull';
const password = 'Om@BlackBull';  // Update with your actual password
const clusterName = 'cluster0';
const databaseName = 'myAttendence';
app.use(bodyParser.json());

app.use(cors())

const uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${clusterName}.y7w6p9o.mongodb.net/${databaseName}?retryWrites=true&w=majority`;
mongoose.connect(uri).then(res=>{
    console.log("connected database sucessfully")
}).catch((err)=>{
    console.log(err)

})
// Define Mongoose Schema for Employee and Attendance
const employeeSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: String,
});

const attendanceSchema = new mongoose.Schema({
    employeeEmail: { type: String, required: true },
    allAttendance: [{
      date: String,
      checkIn: String,
      checkOut: String
    }]
  });
  

const Employee = mongoose.model('Employee', employeeSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// API endpoints
app.get('/',(req,res)=>{
  res.send("hello from attendence")
})
app.post('/api/employees', async (req, res) => {
  try {
    const { email, name } = req.body;
    const newEmployee = new Employee({ email, name });
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { email,date,checkIn} = req.body;
    const newAttendance = new Attendance({ employeeEmail: email,date, checkIn});
    await newAttendance.save();
    res.status(201).json(newAttendance);
    console.log(newAttendance)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// app.post('/attendance', async (req, res) => {
//     try {
//       const { employeeEmail, allAttendance } = req.body;
//       console.log(req.body)
//       // Validate that employeeEmail is provided
//       if (!employeeEmail) {
//         return res.status(400).json({ error: "Employee email is required." });
//       }
  
//       // Create a new attendance instance
//       const attendance = new Attendance({employeeEmail:req.body.employeeEmail,allAttendance:req.body.allAttendance});
  
//       // Save the attendance instance to the database
//       await attendance.save();
  
//       res.status(201).json(attendance);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });
app.post('/attendance', async (req, res) => {
    try {
      const { employeeEmail, allAttendance } = req.body;
  
      // Validate that employeeEmail is provided
      if (!employeeEmail) {
        return res.status(400).json({ error: "Employee email is required." });
      }
  
      // Check if there is an existing attendance entry for the provided date
      const existingAttendance = await Attendance.findOne({ employeeEmail, 'allAttendance.date': allAttendance[0].date });
  
      if (existingAttendance) {
        // If an entry for the date exists, update it
        await Attendance.updateOne(
          { employeeEmail, 'allAttendance.date': allAttendance[0].date },
          { $set: { 'allAttendance.$.checkIn': allAttendance[0].checkIn, 'allAttendance.$.checkOut': allAttendance[0].checkOut } }
        );
        res.json({ message: 'Attendance record updated successfully.' });
      } else {
        // If no entry for the date exists, create a new entry
        const attendance = new Attendance({ employeeEmail, allAttendance });
        await attendance.save();
        res.status(201).json(attendance);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/attendance/:employeeEmail', async (req, res) => {
    try {
      const employeeEmail = req.params.employeeEmail;
      const { date, checkIn, checkOut } = req.body;
  
      // Check if the user exists
      const existingAttendance = await Attendance.findOne({ employeeEmail });
  
      if (existingAttendance) {
        // If the user exists, add a new attendance entry for the next day
        existingAttendance.allAttendance.push({ date, checkIn, checkOut });
        await existingAttendance.save();
        res.json({ message: 'Attendance record added for the next day.' });
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  


  app.get('/attendance/:employeeEmail', async (req, res) => {
    try {
      const employeeEmail = req.params.employeeEmail;
      const attendanceData = await Attendance.find({ employeeEmail });
      res.status(200).json(attendanceData[0].allAttendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  

app.post('/api/attendance/checkOut', async (req, res) => {
  try {
    const { email,date ,checkOut } = req.body;
    const newAttendance = new Attendance({ employeeEmail: email,date, checkOut });
    await newAttendance.save();
    res.status(201).json(newAttendance);
    console.log(newAttendance)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attendance/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const attendanceData = await Attendance.find({ employeeEmail: email });
    res.status(200).json(attendanceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/attendance/all', async (req, res) => {
  try {
    const allAttendanceData = await Attendance.find();
    res.status(200).json(allAttendanceData);
    console.log(allAttendanceData)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
