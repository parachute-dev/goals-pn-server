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
import BallWinner from './Models/BallWinner' 
import CaptainLoyalty from './Models/CaptainLoyalty' 

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
var mongoDB = 'mongodb+srv://doadmin:K5mNA39uiS8120x7@db-mongodb-lon1-23735-cc76f8e3.mongo.ondigitalocean.com/admin?authSource=admin&tls=true&tlsCAFile=ca-certificate';

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


const getBookings = (res) =>{

  Booking.find({} , (err, users) => {

  }).then(function(doc){
    res.send(doc);


  }).catch(function(err){
    res.send("{'error': 'No Bookings'}");

  });


}



const getWinners = (res) =>{

  Winner.find({} , (err, users) => {

  }).then(function(doc){
    console.log(doc);
    res.send(doc);


  }).catch(function(err){
    res.send("No offers: ");

  });


}

const alotWinner = (member_id, club_id, res) =>{

  var new_winner = new Winner({
    member_id: member_id,
    created_at: Date()
  });

  new_winner.save(function (err, doc) { 
    if (err) {
      console.log(err);
    } else {
      //
      console.log("winner saved");

    }
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


const createCaptainsBonus = (member_id, fixture_id, points, res) => {
console.log(member_id);
console.log(fixture_id);
  CaptainLoyalty.find({
    fixture_id
  }).then(function(doc){

    if (doc.length == 0) {


      var captainLoyalty = new CaptainLoyalty({
        member_id,
        fixture_id,
        points
      });

      CaptainLoyalty.create(captainLoyalty).then(function(doc){
        res.send(`{"success" :"created captains bonus"}`);
      }).catch(function(err){
        res.send(`{"error" :"couldn't created captains bonus"}`);

      });

    }else{
      res.send(`{"error" :"points already redeemed for this game"}`);


    }

  });

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

  message = message.replace(/\\/g, "");
  title = title.replace(/\\/g, "");

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





const setLoyaltyOptIn = (member_id, loyalty_opted_in, res) => {

  console.log(member_id);
  console.log(loyalty_opted_in);

  User.findOneAndUpdate(

    {member_id}, 
    {loyalty_opted_in: loyalty_opted_in }, 
    {},
    function (err, doc) { 

    }
    ).then(function(doc){

      res.send(doc);
      console.log(doc);
    }
    ).catch(function(err){
      console.log(err);

      res.send(`{"error" :"Couldnt update opt in"}`);
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

      User.findOneAndUpdate(
        {member_id: user.member_id}, 
        {first_name: user.first_name, last_name: user.last_name, email: user.email, club_id:user.club_id }, 
        {upsert: true, new: true, runValidators: true},
        function (err, doc) { 

        }
        ).then(function(doc){
          console.log(`${user.member_id}`);
          console.log(`success updating user`);

          res.send(doc);
        }
        ).catch(function(err){
          console.log(err);
          console.log("errored here");
          console.log(`${user.member_id}`);
          res.send(`{"error" :"Couldnt update user"}`);
        });
      }


      const verifyBallWinner = (member_id,res) => {

        let verify = false;
        BallWinner.find({member_id, redeemed: false} , (err, users) => {

          if (users != null && users.length ){
            verify = true;
          }

          res.send(verify);

        });
      }


       const verifyCaptainsBonus = (member_id, fixture_id, res) => {

        let verify = true;

        CaptainLoyalty.find({member_id, fixture_id} , (err, users) => {

          if (users != null && users.length ){
            verify = false;
          }

        res.send(verify);

      });
      }




      const verifyWinner = (member_id,res) => {

        let verify = false;
        Winner.find({member_id, redeemed: false} , (err, users) => {


          if (users != null && users.length ){
            verify = true;
          }

        // Hard set to false -
        res.send(verify);

      });
      }

      const createLog = ( type,sub_type,description,additional_info,fixture_id, member_id,res) =>{

        var log = new Log({
          type,
          sub_type,
          description,
          additional_info,
          member_id,
          fixture_id,
          created_at : Date()
        });

        Log.create(log).then(function(doc){
          console.log("Created Log");
          if (res) {
            res.send('{"success": "log created"}');
          }
        }).catch(function(err){
          console.log("Log Not Created" + err);
          if (res) {
            res.send('{"Error": "' + err + '"}');
          }

        });


      }


      const findLoyaltyTransactions = (member_id,res) => {
        console.log(member_id);
        var params = {
          type: "loyalty"

        };
        Log.find( params, (err, logs) => {
          if (logs != null && logs.length ){
            res.send(logs);
          }else{
            res.send(null);
          }
        }).sort({created_at:-1});
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

      const messageBallWinners = (member_id) => {


        let users = User.find({member_id}).then(function(doc) {  
          if (doc != null && doc.length ) {
            let user = {
              first_name: doc[0].first_name,
              last_name: doc[0].last_name,
              name: doc[0].first_name + " " + doc[0].last_name,
              email: doc[0].email,
              member_id: doc[0].member_id,
              booking_date:Date(),
            };

            sendEmail(doc[0].email, "You've won a free ball at Goals!", user, "ball-winner");



            let clubs = Club.find({club_id: doc[0].club_id}).then(function(doc2) {  

              user = {
                first_name: doc[0].first_name,
                last_name: doc[0].last_name,
                name: doc[0].first_name + " " + doc[0].last_name,
                email: doc[0].email,
                club: doc[0].club_id,      
                club_name: doc2[0].Name,
                member_id: doc[0].member_id,
                booking_date:Date(),
              };
              if (doc2 != null && doc2.length ) {
                console.log("SENDING CLUB EMAIL");
                let club_email = doc2[0].Name.toLowerCase().replace("-","").replace(/\s/g, '').replace("birminghamperrybarr","perrybarr").replace("birminghamstarcity","birmingham") + "@goalsfootball.co.uk";

                //sendEmail(club_email, "Someone's won a free ball", user, "ball-winner-club");
                //sendEmail("marketing@goalsfootball.co.uk", "Someone's won a free ball", user, "ball-winner-club");

              }


            }, function(err) {
              console.log(err);

            });
          }
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
                        messageWinners(result[0].member_id, result[0].club_id, result[0].booking_ref, result[0].booking_date );

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

      const createBallWinner = (member_id, res) =>{

        var new_winner = new BallWinner({
          member_id,
          created_at: Date(),

        });

        new_winner.save(function (err, doc) { 
          if (err) {

          } else {
            messageBallWinners(member_id );
            updateLoyalty(member_id, -30, null,null, res);
            createLog("loyalty", "Redeem-Ball", "User Redeemed Ball", "30",null,member_id, null)
          }
        });


      }

      const generateReport = (results) => {

        let user = {
        }
        sendEmail("david@thisisparachute.com,jp@goalsfootball.co.uk", "APP PAYMENT REPORT", user, "report");

      }

      const saveWinner = (member_id) => {

        var new_winner = new Winner({
          member_id,
          redeemed: false,
          created_at: Date()         

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
        console.log("here");
        console.log(member_id);
        let users = User.find({member_id}).then(function(doc) {  
          console.log(doc);
          if (doc.length) {
            if (doc[0].loyalty_points == null || doc[0].loyalty_points == "") {
              res.send(`0`);
            }else{
              res.send(`${doc[0].loyalty_points}`);
            }

          }else{
            console.log("didnt seem to find this user");

            res.send(`0`);
          }


        }, function(err) {
          console.log(err);
          res.send(`{"error" : "Loyalty Error 7"}`);

        });


      }

      const getLoyaltyOffers = () => {

      }

      const changeLoyalty = (member_id, points) => {

        User.find({member_id}).then(function(doc) {  

          if (doc != null && doc[0] != null){

            console.log(doc[0].loyalty_points);
            console.log(points);
            const newPoints = parseInt(doc[0].loyalty_points) + parseInt(points);

            User.findOneAndUpdate(
              { member_id },
              {loyalty_points: newPoints },
              { }
              ,
              function (err, doc) { 
                console.log("HERE2");
                console.log(doc);
              }
              ).then(function(doc){
                console.log(doc);

              }).catch(function(err){

              });

            }
          }).catch(function(err){
            res.send(`{"error" : "Loyalty Error 9"}`);
          });

        }

        const updateLoyalty = (member_id, points, title,message, res) => {

          User.find({member_id}).then(function(doc) {  

            if (doc != null && doc[0] != null){

              console.log(doc[0].loyalty_points);
              console.log(points);
              const newPoints = parseInt(doc[0].loyalty_points) + parseInt(points);


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

                  res.send(doc);

                  if (message != null && title != null) {
                    handlePushTokens(message, title, member_id);
                  }

                }).catch(function(err){
                  console.log(err);
                  res.send(`{"error" : "Loyalty Error 8"}`);

                });

              }else{
                res.send(`no updated`);
              }

            }).catch(function(err){
              res.send(`{"error" : "Loyalty Error 9"}`);
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

          app.post('/winner', (req, res) => {
            saveWinner(req.body.member_id );
            console.log(`Received Winner: ${req.body.member_id}`);
            res.send(`{"success": "Received Winner, ${req.body.member_id}"}`);
          });

          app.post('/winner/redeem', (req, res) => {

            redeemWinner(req.body.member_id, res );

          });

          app.post('/loyalty', (req, res) => {

            updateLoyalty(req.body.member_id, req.body.loyalty_points, null, null, res);

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
              club_id: req.body.club_id,
              member_id: req.body.member_id
            });
            createUpdateUser(user, res);
          });




          app.get('/winners', (req, res) => {
            if (req.get('api-key') == apikey) {
              getWinners(res);
            }else{
              res.send('{ "error": "No Auth"}');

            }
          });

          app.get('/bookings', (req, res) => {
            if (req.get('api-key') == apikey) {
              getBookings(res);
            }else{
              res.send('{ "error": "No Auth"}');

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

          app.post('/winners/ball/', (req, res) => {
            if (req.get('api-key') == apikey ) { 
              createBallWinner(req.body.member_id,res);
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



          app.get('/winner/ball/verify/:member_id', (req,res) => {
            verifyBallWinner(req.params.member_id, res);
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


          app.post('/loyalty/crm',(req,res) => {

            if (req.query.apikey == apikey) {
              if (req.body['contact[fields][member_id]'] && req.query.points != null ) {
                updateLoyalty(req.body['contact[fields][member_id]'], req.query.points, req.query.title, req.query.message,  res );
              }else{
                console.log(req.body);
                console.log("error updating points from CRM");

                res.send('{"error": "Something went wrong updating points"}');
              }
            }else{


              res.send('{"error": "auth"}');
            }

          });


          app.post('/loyalty/opt',(req,res) => {
            setLoyaltyOptIn(req.body.member_id, req.body.opt,res);
          });



          app.get('/log/loyalty/:member_id', (req, res) => {
            findLoyaltyTransactions(req.params.member_id,res);
          });

          app.post('/log', (req, res) => {
            createLog(req.body.type, req.body.sub_type, req.body.description, req.body.additional_info, req.body.fixture_id, req.body.member_id,res);
          });

          app.post('/loyalty/captain', (req, res) => {
            console.log(req.body.member_id);
            console.log(req.body.fixture_id);
            console.log(req.body);
            createCaptainsBonus(req.body.memberId, req.body.fixtureId, req.body.points, res);
          });

        app.get('/loyalty/captain/:member_id/:fixture_id', (req, res) => {
            verifyCaptainsBonus(req.params.member_id, req.params.fixture_id,  res);
          });          

          app.get('/loyalty/:member_id', (req, res) => {
            console.log("here11");
            getLoyalty(req.params.member_id, res);
          });

          app.listen(PORT_NUMBER, () => {
            console.log(`Server Online on Port ${PORT_NUMBER}`);
          });

