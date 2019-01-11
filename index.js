import express from 'express';
import Expo from 'expo-server-sdk';
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
var util = require('util');
const mailer = require('express-mailer'); // call express
const moment = require('moment');

var cons = require('consolidate');
import User from './Models/User'
import Winner from './Models/Winner' 
import Booking from './Models/Booking' 
import Club from './Models/Club' 
import Log from './Models/Log' 
import Offer from './Models/Offer' 
import Token from './Models/Token' 

var random = require('mongoose-simple-random');

const app = express();
const expo = new Expo();

const apikey = 'EA0uhHt8%j';

var trustedIps = ['8.8.8.8',"::1", "109.203.101.235", "::ffff:10.47.207.66"];

app.engine('html', cons.swig)
app.set('views', __dirname + '/Views');
app.set('view engine', 'html');

const PORT_NUMBER = process.env.PORT || 3000;

mailer.extend(app, {
  from: 'donotreply@goalsfootball.co.uk',
  host: 'smtp.elasticemail.com', // hostname
  secureConnection: false, // use SSL
  port: 2525, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'david@parachute.net', // gmail id
    pass: '0450b241-e37e-41d1-a17f-7574b695488d' // gmail password
  }
});

//Set up default mongoose connection
//var mongoDB = 'mongodb://localhost:27017';
var mongoDB = 'mongodb://parachute:Uzx**978@ds257333-a0.mlab.com:57333,ds257333-a1.mlab.com:57333/heroku_cngjj092?replicaSet=rs-ds257333';

mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

let users = User.find({});
let winners = Winner.find({});
let bookings = Booking.find({});


//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const getWinners = (res) =>{

  Winner.find({} , (err, users) => {

  }).then(function(doc){
    console.log(doc);
    res.send(doc);


  }).catch(function(err){
    res.send("No offers: ");

  });


}

const getOffers = (res) =>{

  Offer.find({} , (err, users) => {

  }).then(function(doc){
    console.log(doc);
    res.send(doc);


  }).catch(function(err){
    res.send("No offers: ");

  });

  ;
}

const createOffer = (name, description, loyalty_points_required, res) => {

  var offer = new Offer({
    name,
    description,
    loyalty_points_required
  });

  Offer.create(offer).then(function(doc){
    console.log("Created new Loyalty Offer");
    res.send("Created new Loyalty Offer");
  }).catch(function(err){
    console.log("Offer wasn't created" + err);

    res.send("Offer wasn't created" + err);

  });

}




const updateOffer = (_id, name, description, loyalty_points_required, res) => {

  console.log(_id);
  var offer = new Offer({

    name,
    description,
    loyalty_points_required
  });

  Offer.findOneAndUpdate(
    {_id}, 
    {$set: {name, description, loyalty_points_required }},
    {},
    function (err, doc) { 



    } 
    ).then(function(doc){
      console.log("here22");
      console.log(doc);
      res.send("Updated Offer: " + _id);

    }).catch(function(err){
      console.log("error");
      console.log(err);
      res.send("Offer did not update: " + err);

    });
  }

  const sendEmail = (email, subject, user, template) => {

    console.log("SENDING EMAIL");
  // Setup email data.
  var mailOptions = {
    to: email,
    subject,
    user
  }

  // Send email.
  app.mailer.send(template, mailOptions, function (err, message) {
    if (err) {
      console.log(err);
      return err;
    }
    return "Email Sent";
  });


}

const handlePushTokens = (message, title, member_id) => {
  console.log("member_id: " + member_id);

  console.log("message: " + message);
  console.log("title: " + title);


  // Create the messages that you want to send to clents
  let notifications = [];

  let params = {};

  if (member_id != null){
    params = {
      member_id:member_id
    }
  }


  Token.find(params , (err, users) => {
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
              data: { message, title },

              android: {
                channelId: 'promotion-messages',
              },
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

const saveToken = (token, device_type, member_id, res) => {

  console.log(token);
  console.log(device_type);
  console.log(member_id);

  Token.findOneAndUpdate(
    {token}, 
    {token, member_id, device_type}, 
    {upsert: true, new: true, runValidators: true},
    function (err, doc) { 
      console.log(err);

    }
    ).then(function(doc){
      console.log(`Received push token: ${token} `);
      res.send(`true`);
    }
    ).catch(function(err){
      console.log(err);
      console.log("errored here");
      console.log(`${token}`);
      res.send(`false`);
    });

  }

  const createUpdateUser = (user,res) =>{


    console.log(user);



    User.findOneAndUpdate(
      {member_id: user.member_id}, 
      {first_name: user.first_name, last_name: user.last_name, email: user.email }, 
      {upsert: true, new: true, runValidators: true},
      function (err, doc) { 

      }
      ).then(function(doc){
        console.log(`${user.member_id}`);
        console.log(`success updating user`);

        res.send(`${user.member_id}`);
      }
      ).catch(function(err){
        console.log(err);
        console.log("errored here");
        console.log(`${user.member_id}`);
        res.send(`${user.member_id}`);
      });
    }

    const verifyWinner = (member_id,res) => {

      let verify = false;
      Winner.find({member_id, redeemed: false} , (err, users) => {

        console.log(users);
        if (users != null && users.length ){
          verify = true;
        }

        res.send(verify);

      });
    }


    const messageWinners = (member_id,club_id,ref,booking_date) => {

      let club_email = club_id.toLowerCase().replace("-","").replace(/\s/g, '').replace("birminghamperrybarr","perrybarr").replace("birminghamstarcity","birmingham") + "@goalsfootball.co.uk";

      let users = User.find({member_id}).then(function(doc) {  


        let user = {
         first_name: doc[0].first_name,
         last_name: doc[0].last_name,
         name: doc[0].first_name + " " + doc[0].last_name,
         email: club_email,
         club: club_id,
         booking_ref: ref,
         member_id: doc[0].member_id,
         booking_date:booking_date,
       };

        sendEmail(doc[0].email, "You've won a free game at Goals!", user, "winner");
        sendEmail(club_email, "Someone's won a free game", user, "winner-club");
        handlePushTokens("Just use the QuickPay option in the app to redeem.", "You've won a FREE game!", member_id);


     }, function(err) {
      console.log(err);

    });
    }
    const getTonightsWinners = () =>{
      const today = moment().startOf('day');
      Winner.find({
        created_at: {
          $gte: today.toDate(),
          $lte: moment(today).endOf('day').toDate()
        }
      }).then(function(doc){

        if (!doc.length) {    
        console.log("all good");   
         var result = [];
         let response = Club.find({}, (err, clubs) => {
          if (!err){
          }

        }).then(function(clubs) {  

          for(var club of clubs){

            Booking.findRandom({club_id: club.Name, booking_mode: "1", created_at: {
              $gte: today.toDate(),
              $lte: moment(today).endOf('day').toDate()
            }}, {}, {limit: 1}, function(err, result) {

              if (!err && result != null) {
              

                console.log(result[0].club_id);
                console.log(result[0].member_id);
                console.log(result[0].created_at);
                console.log(result[0].booking_mode);
console.log(" ");
                var new_winner = new Winner({
                  member_id: result[0].member_id,
                  created_at: Date(),
                  club: result[0].club_id
                });

                new_winner.save(function (err, doc) { 
                  if (err) {

                  } else {
                    //messageWinners(result[0].member_id, result[0].club_id, result[0].booking_ref, result[0].booking_date );

                  }
                });
              } 
            });

          }

        }, function(err) {
          console.log(err);
        });

      }

    }).catch(function(err){
      console.log("here");
      console.log(err);
    });

  }

  const generateReport = (results) => {

   let user = {
   }
   sendEmail("david@thisisparachute.com,jp@goalsfootball.co.uk", "APP PAYMENT REPORT", user, "report");

 }

 const saveWinner = (member_id, club_id, email, first_name, last_name) => {

  var new_winner = new Winner({
    member_id,
    club_id,
    email,
    first_name,
    last_name
  });

  new_winner.save(function (err, doc) { 
    if (err) {

    } else {

    }
  });

}

const saveBooking = (booking_ref, booking_date, member_id, club_id, amount_paid, booking_mode, res) => {



  var new_booking = new Booking({
    booking_date,
    booking_ref,
    member_id,
    club_id,
    amount_paid,
    booking_mode,
    created_at: Date()
  }); 
  console.log(new_booking);

  new_booking.save(function (err, doc) { 
    if (err) {
      console.log(err);
      res.send("false");

    } else {
      res.send("true");

    }
  });

}

const getLoyalty = (member_id, res) => {

  // let users = User.find({member_id}).then(function(doc) {  
  //   console.log(doc);
  //   console.log(`Retrieved Loyalty Points: ${doc[0].loyalty_points} `);
  //   res.send(`${doc[0].loyalty_points}`);


  // }, function(err) {
  //   console.log(err);
  //   res.send(`Loyalty Error `);

  // });
          res.send("");

}

const getLoyaltyOffers = () => {

}

const updateLoyalty = (member_id, points, res) => {

  User.find({member_id}).then(function(doc) {  

    if (doc != null && doc[0] != null){

      const newPoints = doc[0].loyalty_points + points;


      User.findOneAndUpdate(
        { member_id },
        {loyalty_points: newPoints },
        {new: true }
        ,
        function (err, doc) { 
          console.log("HERE2");
          console.log(doc);
        }
        ).then(function(doc){
          console.log(doc);

          res.send(`${newPoints}`);

        }).catch(function(err){
          res.send(`Loyalty Error ${newPoints}`);

        });

      }else{
        res.send(`no updated`);
      }

    }).catch(function(err){
      res.send(`Loyalty Error last`);
    });
  }

  const redeemWinner = (member_id, res) => {
    console.log("member id:" + member_id);
    Winner.findOneAndUpdate(
      { member_id, redeemed: false },
      { $set: { redeemed: true, redeemed_at: Date() }},
      null,
      function (err, doc) { 
        if (err) {
          console.log(err);
          res.send(`{ "error": "No Winner"}`);

          return false;
        } else {
          console.log(doc);
          if (doc != null){
            console.log("redeemed: " + member_id);
            let user = {
              email: doc.email,
              first_name: doc.first_name,
              last_name: doc.last_name,
              club_id: doc.club_id,
              redeemedDate: doc.redeemedDate,
              createdDate: doc.created_at
            }
                //sendEmail(doc.email, "SUBJECT", user, "email");
                res.send(`{"success": "Redeemed"}`);
                console.log("redeemed");

                return doc;
              }else{
                res.send(`{ "error": "No Winner"}`);
                console.log("no reedeem");

                return false;
              }
            }
          } 
          );
  }

  app.use(bodyParser.json()); 
  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/', (req, res) => {
    res.send('Push Notification Server Running');
  });

  app.get('/offers', (req, res) => {
    getOffers(res);
  });

  app.put('/offers', (req, res) => {
    if (req.get('api-key') == apikey) {
      console.log("applying");
      updateOffer(req.body.id, req.body.name, req.body.description, req.body.loyalty_points_required, res);
    }else{
      res.send('{ "error": "No Auth"}');      
    }
  });


  app.post('/offers', (req, res) => {
    if (req.get('api-key') == apikey) {
      createOffer( req.body.name, req.body.description, req.body.loyalty_points_required, res);
    }else{
      res.send('{ "error": "No Auth"}');
      ;
    }
  });

// app.post('/winner', (req, res) => {
//   saveWinner(req.body.member_id, req.body.club_id, req.body.email, req.body.first_name, req.body.last_name );
//   console.log(`Received Winner: ${req.body.member_id}`);
//   res.send(`Received Winner, ${req.body.member_id}`);
// });

app.post('/winner/redeem', (req, res) => {

  redeemWinner(req.body.member_id, res );

});

app.post('/loyalty', (req, res) => {

  updateLoyalty(req.body.member_id, req.body.loyalty_points,res);

}); 

app.get('/loyalty/:member_id', (req, res) => {

  getLoyalty(req.params.member_id, res);

});

app.post('/token', (req, res) => {
  saveToken(req.body.token, req.body.device_type, req.body.member_id ,res);
});

app.post('/message', (req, res) => {

  if (req.get('api-key') == apikey) {

    var requestIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if(trustedIps.indexOf(requestIP) >= 0) {

     let title = null;
     let message = null;

     console.log(message);
     console.log(title);

     handlePushTokens(req.body.message, req.body.title, req.params.member_id);
     res.send(`${message}`);

   }else{
    res.send(`{"error" : "not allowed to send - IP rejected", "IP" : ${requestIP}}`);
  }

}else{
  res.send('{ "error": "No Auth"}');    
}
});

app.post('/user', (req, res) => {

  var user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email:  req.body.email_address,
    member_id: req.body.member_id
  });
  createUpdateUser(user, res);
});


app.get('/winners', (req, res) => {
 if (req.get('api-key') == apikey) {
  getWinners(res);
}
});

app.post('/booking', (req, res) => {
  saveBooking(req.body.booking_ref, req.body.booking_date, req.body.member_id, req.body.club_id, req.body.amount_paid, req.body.booking_mode, res );
});

app.post('/winners/choose', (req, res) => {


  var d = new Date();
  var n = d.getHours();

  if (req.get('api-key') == apikey && n > 21) {
    getTonightsWinners();
    generateReport();
    res.send(`Getting Tonights Winners, ${req.body.member_id}`);
  }else{
    res.send('{ "error": "No Auth"}');
  }
});

app.post('/message/:member_id', (req, res) => {

  if (req.get('api-key') == apikey) {
    var requestIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if(trustedIps.indexOf(requestIP) >= 0) {

     let title = null;
     let message = null;

     if (req.body.message != null && req.body.message != ""){
      message = req.body.message;
    }

    if (req.body.title != null && req.body.title != ""){
      title = req.body.title;
    }

    if (req.query.message != null && req.query.message != ""){
      message = req.query.message;
    }

    if (req.query.title != null && req.query.title != ""){
      title = req.query.title;
    }

    handlePushTokens(message, title, req.params.member_id);
    res.send(`Message successfully sent:  ${message}`);

  }else{
    res.send(`not allowed to send - IP rejected`);
  }

}else{
  res.send('{ "error": "No Auth"}');  
}

});

app.get('/winner/verify/:member_id', (req,res) => {
  verifyWinner(req.params.member_id, res);
});

app.post('/hook',(req,res) => {
  if (req.query.apikey == apikey) {
    if (req.body['contact[fields][member_id]'] && req.query.title && req.query.message != null ) {
     handlePushTokens(req.query.message, req.query.title, req.body['contact[fields][member_id]']);
     res.send("Sending Message");
   }else{
     res.send("Something was omitted");
   }
 }else{
  res.send(`not allowed to send - IP rejected`);
}
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server Online on Port ${PORT_NUMBER}`);
});