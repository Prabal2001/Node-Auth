const express = require('express');
const app = express();
app.use(express.json());
let ADMINS = [];
let USERS = [];
let COURSES = [];
//  let ans = jwt.sign("prabal@gmail.com",secret);
//  console.log(ans);
//  jwt.verify(ans,secret,(err,originalString) => {
//               console.log(originalString);
//  })
 const  adminAuthentication = (req,res,next) => {
       const{ username,password } = req.body;
       console.log(username);
       console.log(password);
       const admin = ADMINS.find(a => a.username ===  username  &&  a.password === password);
       if(admin){
        next();
       }
       else {
        res.status(403).json({message:'Admin Auth failed'});
       }
}

const userAuthentication = (req,res,next) => {
      const{username , password} = req.body;
      console.log(username);
      console.log(password);
      const user = USERS.find(u => u.username === username && u.password === password);
      if(user) {
        req.user = user;
        next();
      }
      else {
        res.status(403).json({message:'User Auth failed'});
      }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
     const admin = req.body; 
     const existingAdmin = ADMINS.find(a => a.username === admin.username);
     if(existingAdmin) {
        res.status(403).json({message:"Already exists"});
     }
      else {
        ADMINS.push(admin);
        res.json({message:"Successfully signed up"});
      }
});

app.post('/admin/login', adminAuthentication ,(req, res) => {

        res.json({message:"Login successful"});
});

app.post('/admin/courses', adminAuthentication, (req, res) => {
     const course = req.body;
     course.id = Date.now();
     COURSES.push(course);
     res.json({message:"Course created successfully",courseId:course.id})
});

app.put('/admin/courses/:courseId', adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    res.json({ message: 'Course updated successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/admin/courses', adminAuthentication ,(req, res) => {
         res.json({courses:COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
      const  user = {...req.body,purchasedCourses:[]};
      USERS.push(user);
      res.json({message:'user created successfully'});
});

app.post('/users/login', userAuthentication, (req, res) => {
  res.json({message:"Users Login successful"});
});

app.get('/users/courses', userAuthentication , (req, res) => {
      res.json({courses:COURSES.filter(c => c.published)});
});

app.post('/users/courses/:courseId', userAuthentication , (req, res) => {
      const courseId = Number(req.params.courseId);
        const course = COURSES.find(c => c.id === courseId && c.published);
        if(course) {
           var username = req.headers["username"];
           req.user.purchasedCourses.push(courseId);
           res.json({ message:"Course purchased successfully"});
        }
        else {
           res.status(404).json({message:"Not updated "});
        }
});

app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
       var purchasedCourseIds = req.user.purchasedCourses;
       var purchasedCourses = [];
       for(let i=0;i<COURSES.length;i++){
        if(purchasedCourseIds.indexOf(COURSES[i].id) != -1){
               purchasedCourses.push(COURSES[i]);
        }
       }
       res.json({purchasedCourses});
});

app.listen(3000, () => {
  console.log('Server listening on server without jwt');
});