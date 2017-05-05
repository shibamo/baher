'use strict';
const colors = require('colors');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const db = mongoose.connection;
db.on('error', (error)=> {console.log(error);});
db.once('open', () => {console.log("connected to MongoDB");});

mongoose.connect('mongodb://localhost/baher_last');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('port', (process.env.PORT || 3000));

//To fix CORS, see http://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
            "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");            
  next();
});

//Serve static files under public, see http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'))
});

app.use("/api/shopping-list",require("./api/shopping-list"));

const Lib = require("./lib");

io.on('connection', function (socket) {
  let validUser = false; 

  socket.on('user created', function (userAlias, familyId) {
    socket.broadcast.emit('user created', {
      userAlias: socket.userAlias
    });
  });

  socket.on('enter user', function (userAlias,userId) {
    if (validUser) return;
    validUser = true;

    console.log("User " + userAlias + " joined.");

    socket.userAlias = userAlias;
    socket.userId = userId;    
    socket.emit('login', {});

    socket.broadcast.emit('user joined', {
      userAlias: socket.userAlias,
    });
  });

  // sent by user after successfully update the list(new or update list item)
  socket.on('list updated', function(userAlias){
    if (validUser) {
      socket.broadcast.emit('list updated', {
        userAlias: userAlias
      });
    }
  });

  socket.on('disconnect', function () {
    if (validUser) {
      console.log("User " + socket.userAlias + " quited.");
      socket.broadcast.emit('user left', {
        userAlias: socket.userAlias,
      });
    }
  });

});

process.on('SIGINT',function(){
  db.close(function(){
    process.exit(0);
  });
});

server.listen(app.get('port'), function() {
  console.log("Listening on 3000");
});