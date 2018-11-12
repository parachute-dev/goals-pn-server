import express from 'express';
import Expo from 'expo-server-sdk';
var mongoose = require('mongoose');

import User from './model'

const app = express();
const expo = new Expo();


const PORT_NUMBER = process.env.PORT || 3000;

//Set up default mongoose connection
var mongoDB = 'mongodb://parachute:Uzx**978@ds257333-a0.mlab.com:57333,ds257333-a1.mlab.com:57333/heroku_cngjj092?replicaSet=rs-ds257333';

mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

let users = User.find({});

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const handlePushTokens = (message, title) => {
  // Create the messages that you want to send to clents
  let notifications = [];



  User.find({} , (err, users) => {
        if(err) //do something...
          console.log(err)
        users.map(user => {
          console.log(user);


          if (!Expo.isExpoPushToken(user.token)) {
            console.error(`Push token ${user.token} is not a valid Expo push token`);
          }else{

            notifications.push({
              to: user.token,
              sound: 'default',
              title: title,
              priority: "high",
              vibrate: true,
              sound:"default",
            
              body: message,
              data: { message },
            })
          }

        });


        let chunks = expo.chunkPushNotifications(notifications);

        (async () => {

          for (let chunk of chunks) {
            try {
              let receipts = await expo.sendPushNotificationsAsync(chunk);
              console.log(receipts);
            } catch (error) {
              console.error(error);
            }
          }
        })();

      });
}

const saveToken = (token, email, member_id) => {

  var user = new User({
    token,
    email,
    member_id
  });

  User.findOneAndUpdate(
    {token}, 
    {token, email, member_id}, 
    {upsert: true, new: true, runValidators: true},
    function (err, doc) { 
      if (err) {
        console.log(err);

      } else {

      }
    }
    );

}

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Push Notification Server Running');
});

app.post('/token', (req, res) => {
  saveToken(req.body.token.value, req.body.user.email, req.body.user.member_id);
  console.log(`Received push token: ${req.body.token.value}`);
  res.send(`Received push token, ${req.body.token.value}`);
});

app.post('/message', (req, res) => {
  handlePushTokens(req.body.message, req.body.title);
  console.log(`Received message, ${req.body.message}`);
  res.send(`Message successfully sent:  ${req.body.message}`);
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server Online on Port ${PORT_NUMBER}`);
});