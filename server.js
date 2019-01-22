const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const mongo = require('mongodb')
const Schema = mongoose.Schema;
const cors = require('cors')
const shortid = require('shortid')

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let userSchema = new Schema ({
  username : {type: String, required: true, unique: true, maxLength: [20, 'too long max 20 char']},
  _id: {type: String, index: true, default: shortid.generate }
});

let logSchema = new Schema ({
  username : String,
  description : {type: String, required: true, maxLength: [20, 'too long max 20 char']},
  duration : {type: Number, required: true},
  date : {type: Date, default: Date.now},
  userId: {type: String, ref: 'userSchema', index: true}
});

let userModel = mongoose.model("userModel", userSchema);

let logModel = mongoose.model("logModel", logSchema);


app.post("/api/exercise/new-user", (req, res) => {
  let newUser = req.body
  
  console.log(req.body)
  
  newUser.username !== '' 
    ? userModel.findOne(newUser, (rq, rs) => {
              rs !== null 
                ?
                res.json(rs) 
              : 
                userModel.create(newUser, (err, data) => { err 
                    ? 
                    console.log("error ", err) 
                    : 
                    userModel.findOne(newUser, (rqst, resp) => { res.json(resp)})})
    
        }) : res.json({error: 'Invalid Username'});
})


app.post("/api/exercise/add", (req, res, next) => {
  userModel.findById(req.body.userId, (err, user) => {
  let logs = new logModel(req.body)
  
  logs.username = user.username
    console.log(logs)
  if(logs.date === null) {
    logs.date = Date.now();
  }  
    logModel.create(logs, (err, data) => { err 
                    ? 
                    console.log("error ", err) 
                    : 
                    userModel.findOne(logs.username, (rqst, resp) => { res.json(resp)})
                                         })
    
        
 
  })
         
         
         })
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
