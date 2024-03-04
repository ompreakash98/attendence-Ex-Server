
const express = require('express');
const fs = require("fs");
const path=require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors=require('cors')
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 9000;
const route=require('./router/Router');
const router = require('./router/Router');
const username = 'omprakashblackbull';
const password = 'Om@BlackBull';  // Update with your actual password
const clusterName = 'cluster0';
const databaseName = 'myAttendence';
app.use(bodyParser.json());

app.use(cors())
app.use(router);
app.use(bodyParser.json({limit: '50mb' })); // Adjust '10mb' to your desired limit
app.use(bodyParser.urlencoded({limit: '50mb', extended: true })); 
app.use(express.json())
const uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${clusterName}.y7w6p9o.mongodb.net/${databaseName}?retryWrites=true&w=majority`;
mongoose.connect(uri).then(res=>{
    console.log("connected database sucessfully")
}).catch((err)=>{
    console.log(err)

})
// Define Mongoose Schema for Employee and Attendance
const employeeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: String,
});
//***************** aatendence schema ************************************ */
const attendanceSchema = new mongoose.Schema({
    employeeEmail: { type: String, required: true },
    allAttendance: [{
      date: String,
      checkIn: String,
      checkOut: String,
      latitude:String,
      longitude:String,
      userImage:String
      
    }]
  });
  
//** ***********************defining the image schema*/
const imageSchema=new mongoose.Schema({
  data:String
})
const ImageOfEmploye=mongoose.model('ImageOfEmploye',imageSchema)
const Employee = mongoose.model('Employee', employeeSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// API endpoints
app.get('/',(req,res)=>{
  res.send("hello from attendence")
})
// app.post('/api/employees', async (req, res) => {
//   try {
//     const { email, name } = req.body;
//     const newEmployee = new Employee({ email, name });
//     await newEmployee.save();
//     res.status(201).json(newEmployee);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post('/api/attendance', async (req, res) => {
//   try {
//     const { email,date,checkIn} = req.body;
//     const newAttendance = new Attendance({ employeeEmail: email,date, checkIn});
//     await newAttendance.save();
//     res.status(201).json(newAttendance);
//     console.log(newAttendance)
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
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

//**** taking the image of employee Date 20-02-2024 **********/


// Endpoint for uploading image
app.post('/upload', async (req, res) => {
  try {
    const imageData = req.body.imageData;
    const email='omprakash@gmail.com'
    const base64Data = imageData;
    const uploadFolderPath = './uploads';
    if (!fs.existsSync(uploadFolderPath)) {
      fs.mkdirSync(uploadFolderPath);
    }
    const date = new Date();
    const formattedDate = `${(date.getMonth() + 1)}-${date.getDate()}-${date.getFullYear()}`;
    const dynamicFilename = `${email}_${formattedDate}.jpg`;
    // const dynamicFilename = `output_${Date.now()}.jpg`; // Example: output_1646637389763.jpg

    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const filePath = path.join(uploadFolderPath, dynamicFilename);


    // const imageBuffer = Buffer.from(base64Image, 'base64');
    // fs.writeFile(filePath, imageBuffer, 'base64', (err) => {
    //   if (err) {
    //     console.error('Error:', err);
    //   } else {
    //     console.log('Image saved successfully');
    //   }
    // });
    // if (!imageData) {
    //   return res.status(400).send('Image data is missing');
    // }

    // Store image path in MongoDB
    // const newImage = await ImageOfEmploye.create({ email: email, imagePath: filePath });
    // console.log("Image uploaded:", newImage);

    res.status(200).send('Image uploaded successfully!');
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Internal server error');
  }
});
//******************************  this is api for fetch the image on attendence page */

app.get("/fetch/alluserImage",async(req,res)=>{
  try {
    const allImage= await  ImageOfEmploye.find();
     if(!allImage){
      return res.status(404).json({message:"data not found"});

     }
     //asuming the image data is  uploaded
     res.status(200).send(allImage)
  } catch (error) {
    
  }
})
//****************** check in api for employee *****************/
app.post('/attendance/checkIn', async (req, res) => {
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
          { $set: { 'allAttendance.$.checkIn': allAttendance[0].checkIn } }
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

  //*************************** checkout api for attendence ********************* */
  app.patch('/attendance/checkOut', async (req, res) => {
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
          { $set: {'allAttendance.$.checkOut': allAttendance[0].checkOut ,'allAttendance.$.checkOut': allAttendance[0].checkOut } }
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

 //********************************* fetch data on the basis of email attendence ********************************** */
  app.get('/attendance/checkout/:email/:date', async (req, res) => {
    try {
      const{email,date}=req.params
      const { employeeEmail, allAttendance } = req.body;
  
      // Validate that employeeEmail is provided
      if (!employeeEmail) {
        return res.status(400).json({ error: "Employee email is required." });
      }
  
      // Check if there is an existing attendance entry for the provided date
      const existingAttendance = await Attendance.findOne({ 'employeeEmail':"email", 'allAttendance.date':date });
       console.log("data on the date basis" ,existingAttendance)
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
//********************************** fetch data on the basis of email *********************************** */
  app.post('/attendance/:employeeEmail', async (req, res) => {
    try {
      const employeeEmail = req.params.employeeEmail;
      const { date, checkIn, checkOut } = req.body;
  
      // Check if the user exists
      const existingAttendance = await Attendance.findOne({ employeeEmail,});
  
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

  //8888888888888888888888888888888888 checkOut on the basis of email ************************//

  app.post('/attendance/checkout/:employeeEmail', async (req, res) => {
    try {
      const employeeEmail = req.params.employeeEmail;
      const { checkOut } = req.body;
  
      // Check if the user exists
      const existingAttendance = await Attendance.findOne({ employeeEmail });
  
      if (existingAttendance) {
        // If the user exists, add a new attendance entry for the next day
        existingAttendance.allAttendance.push({ checkOut });
        await existingAttendance.save();
        res.json({ message: 'Attendance record added for the next day.' });
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

/************************* check data on the basis of  email ******************************* */
  app.get('/attendance/:employeeEmail', async (req, res) => {
    try {
      const employeeEmail = req.params.employeeEmail;
      const attendanceData = await Attendance.find({ employeeEmail });
      res.status(200).json(attendanceData[0].allAttendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  // app.get('/attendance/:_id', async (req, res) => {
  //   try {
  //     const _id = req.params.employeeEmail;
  //     const attendanceData = await Attendance.findById(_id);
  //     res.status(200).json(attendanceData);
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // });
 
//**************************** checkOut ********************************************************************** */
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
//************************************  fetch data on the basis of email ******************************************************* */
app.get('/api/attendance/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const attendanceData = await Attendance.find({ employeeEmail: email });
    res.status(200).json(attendanceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//*********************************************8 all data of attendence  */
app.get('/api/attendance/all', async (req, res) => {
  try {
    const allAttendanceData = await Attendance.find();
    res.status(200).json(allAttendanceData);
    console.log(allAttendanceData)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







//this is the api for test on the date 31-01-2024//////////////////////////

app.post('/attendance/test/checkIn', async (req, res) => {
  try {
      const { employeeEmail, allAttendance } = req.body;

      // Find if there's an existing check-in for today
      const existingAttendance = await Attendance.findOne({
          employeeEmail,
          'allAttendance.date': allAttendance[0].date,
          'allAttendance.checkIn': { $ne: '' } // Check if check-in is not empty
      });

      if (existingAttendance) {
        // If an entry for the date exists, update it
        // await Attendance.updateOne(
        //   { employeeEmail, 'allAttendance.date': allAttendance[0].date },
        //   { $set: { 'allAttendance.$.checkIn': allAttendance[0].checkIn, 'allAttendance.$.checkOut': allAttendance[0].checkOut } }
        // );
        res.json({ message: 'Attendance record already exists' });
      } else {
        // If no entry for the date exists, create a new entry
        // const attendance = new Attendance({ employeeEmail, allAttendance });
        // await attendance.save();
        res.json({massage:"you can  checked in "});
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/attendance/test/:employeeEmail/:date', async (req, res) => {
  try {
    const{ employeeEmail,date }= req.params;
    const existingAttendance = await Attendance.findOne({
      employeeEmail,
      'allAttendance.date':date,
      'allAttendance.checkIn': { $ne: '' } // Check if check-in is not empty
  });    if(existingAttendance){
      res.json(true);
    }
    else{
      res.json(false);

    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});













//***************** listening app on given port *************************************** */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
