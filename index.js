import express from 'express';
import Expo from 'expo-server-sdk';
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
var util = require('util');
const mailer = require('express-mailer'); // call express


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

var trustedIps = ['8.8.8.8',"::1"];

app.engine('html', cons.swig)
app.set('views', __dirname + '/Views');
app.set('view engine', 'html');

const PORT_NUMBER = process.env.PORT || 3000;

mailer.extend(app, {
  from: 'david@parachute.net',
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
    subject: 'Email from SMTP sever',
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
  // Create the messages that you want to send to clents
  let notifications = [];

  let params = {};

  if (member_id != null){
    params = {
      member_id:member_id
    }
  }

  console.log(member_id);
  console.log(message);
  console.log(title);

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



    const getTonightsWinners = () =>{

      var result = [];

      let response = Club.find({}, (err, clubs) => {
        if (!err){



   //generateReport(result);

 }

}).then(function(clubs) {  


  for(var club of clubs){


   Booking.findRandom({club_id: club.club_code}, {}, {limit: 1}, function(err, result) {



    if (!err && result != null) {
      console.log(result[0].club_id);

      var new_winner = new Winner({
        member_id: result[0].member_id,
      });

      new_winner.save(function (err, doc) { 
        if (err) {
          console.log(err);
          
        } else {
          console.log("saved: " + result[0].member_id);

        }
      });
    }
  });

 }

}, function(err) {
  console.log(err);
});






}

const generateReport = (results) => {

  let user = {
    results
  };

  console.log(results);


  sendEmail("david@thisisparachute.com", "CLUB REPORT", user, "report");


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
      console.log(err);

    } else {
      console.log("saved: " + member_id);

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
    booking_mode
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

  let users = User.find({member_id}).then(function(doc) {  
    console.log(doc);
    console.log(`Retrieved Loyalty Points: ${doc[0].loyalty_points} `);
    res.send(`${doc[0].loyalty_points}`);


  }, function(err) {
    console.log(err);
    res.send(`Loyalty Error `);

  });

}

const getLoyaltyOffers = () => {

}

const updateLoyalty = (member_id, points, res) => {

  User.find({member_id}).then(function(doc) {  



    if (doc != null && doc[0] != null){

      console.log(doc[0]);
      console.log("here");
      console.log(doc[0].loyalty_points + points);

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


  const redeemWinner = (member_id) => {

    Winner.findOneAndUpdate(
      { member_id, redeemed: false },
      { $set: { redeemed: true, redeemed_at: Date() }},
      null,
      function (err, doc) { 
        if (err) {
          console.log(err);
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
            sendEmail(doc.email, "SUBJECT", user, "email");
            return doc;
          }else{
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

      updateOffer(req.body.id, req.body.name, req.body.description, req.body.loyalty_points_required, res);
    }else{
        res.send('{ "error": "No Auth"}');
;
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

  if (req.get('api-key') == apikey) {

    redeemWinner(req.body.member_id );
    console.log(`Redeemed Winner: ${req.body.member_id}`);
    res.send(`Rede emed Winner, ${req.body.member_id}`);

  }else{
      res.send('{ "error": "No Auth"}');
;

 }
});

app.post('/loyalty', (req, res) => {



    updateLoyalty(req.body.member_id, req.body.loyalty_points,res);

}); 

app.get('/loyalty/:member_id', (req, res) => {

    console.log(req.params.member_id);
    getLoyalty(req.params.member_id, res);

});

app.post('/token', (req, res) => {


  console.log("HERE");
  console.log(req.body);
  console.log(req.body.token);
  console.log(req.body.member_id);
  console.log(req.body.device_type);
  saveToken(req.body.token, req.body.device_type, req.body.member_id ,res);

  res.send('{ "error": "No Auth"}');

});

app.post('/message', (req, res) => {

  if (req.get('api-key') == apikey) {

    var requestIP = req.connection.remoteAddress;

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

    console.log(title);
    console.log(message);
    handlePushTokens(message, title, req.params.member_id);
    console.log(`Received message, ${message} `);
    res.send(`${message}`);

  }else{
    console.log(`Received not sent - IP rejected`);
    res.send(`not allowed to send - IP rejected`);

  }


}else{
    res.send('{ "error": "No Auth"}');
;

}
}
);

app.post('/user', (req, res) => {

  var user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email:  req.body.email_address,
    member_id: req.body.member_id,

  });
  createUpdateUser(user, res)
});

app.post('/booking', (req, res) => {



    saveBooking(req.body.booking_ref, req.body.booking_date, req.body.member_id, req.body.club_id, req.body.amount_paid, req.body.booking_mode, res );
    console.log(`Received Booking: ${req.body.member_id}`);

});

app.post('/winners/choose', (req, res) => {

  if (req.get('api-key') == apikey) {
    getTonightsWinners();
    res.send(`Getting Tonights Winners, ${req.body.member_id}`);

  }else{
      res.send('{ "error": "No Auth"}');
;

 }
});

app.post('/message/:member_id', (req, res) => {

  if (req.get('api-key') == apikey) {
    var requestIP = req.connection.remoteAddress;


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
    console.log(`Received message, ${title}, ${message}`);
    res.send(`Message successfully sent:  ${message}`);
  }else{
    console.log(`Received not sent - IP rejected`);
    res.send(`not allowed to send - IP rejected`);
  }
}else{
    res.send('{ "error": "No Auth"}');
;

}

}


);

app.get('/winner/verify/:member_id', (req,res) => {


    verifyWinner(req.params.member_id, res);

});

app.post('/hook',(req,res) => {

  if (req.query.apikey == apikey) {


    console.log(req.body);
    console.log(req.query);
    console.log(req.body['contact[fields][member_id]']);

    if (req.body['contact[fields][member_id]'] && req.query.title && req.query.message != null ) {
     handlePushTokens(req.query.message, req.query.title, req.body['contact[fields][member_id]']);
     res.send("Sending Message");
     console.log("Sending");

   }else{
     res.send("Something was omitted");
     console.log("something omitted");
   }

 }else{
  console.log(`Received not sent - IP rejected`);
  res.send(`not allowed to send - IP rejected`);
}
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server Online on Port ${PORT_NUMBER}`);
});