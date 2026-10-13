/********************************************************/
/***** Events Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const models = require('../../models');
const moment = require('moment');
const http = require('http');
const AWS = require('aws-sdk');
const config = require('../../config')
const Razorpay = require('razorpay');
const razorPay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});
const currency = 'INR'

router.post('/', (req, res) => {
    models.Event.GetAll({offset:0, limit:15}, (err, events) => {
        if (err) {
       
            res.send({success: false})
        } else {
            res.send({
                success: true,
		        events: events.events
		    })
        }
    })  
});

router.post('/single', (req, res) => {
    const eventId = req.body.eventId; 

    models.Event.GetSingle({eventId}, (err, event) => {
        if (err) {
        
            res.send({success: false})
        } else {
            res.send({
                success: true,
                event: event
            })
        }
    })  
});

router.post('/start-marathon', (req, res) => {
    const options = {
        eventId: req.body.eventId,
        userId: req.body.userId,
        startDateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        marathonRegistrationId: req.body.marathonRegistrationId,
        startPoint : req.body.startPoint,
        path: req.body.path
    }

    models.Event.StartMarathon(options, (err, id) => {
        if (err) {
         
            res.send({success:false})
        } else {
            res.send({success:true, id:id})
        }
    })  
});

router.post('/update-marathon', (req, res) => {
    const options = {
        id: req.body.id,
        steps: req.body.steps,
        distance: req.body.distance,
        calories: req.body.calories,
        endPoint: req.body.endPoint,
        path: req.body.path,
        endDateTime: req.body.endPoint ? moment().format('YYYY-MM-DD HH:mm:ss') : null
    }

    models.Event.UpdateUserMarathonDetails(options, (err) => {
        if (err) {
          
            res.send({success:false})
        } else {
            res.send({success:true})
        }
    })  
});

router.post('/purchased', (req, res) => {
    var post = req.body;
    const options = {
        userId: post.userId
    }

    models.Event.GetPurchased(options, (err, events) => {
        if (err) {
          
            res.send({success:false})
        } else {
            res.send({success:true, events: events})
        }
    })  
});

router.post('/variants', (req, res) => {
    const post = req.body;

    var options = {
        eventId: post.eventId
    };
    models.Event.GetVariants(options, function (err, variants) {
        if (err) {
          
            res.send({success: false})
        } else {
            res.send({success: true, variants})
        }
    })
});

router.post('/register', (req, res) => {
    const post = req.body;
    const options = {
        name: post.name,
        email: post.email,
        gender: post.gender,
        city: post.city,
        country: post.country ? post.country : null,
        contactNo: post.contact_no,
        pincode: post.pincode,
        state: post.state ? post.state : null,
        address: post.address,
        tshirtSize: post.tshirt_size ? post.tshirt_size : null,
        eventId: post.eventId ? post.eventId : 1,
        userId: post.userId ? post.userId : null,
        isPayed: 1,
        paymentAmount: post.amount,
        paymentId: post.paymentResponse.razorpay_order_id,
        eventVariant: post.eventVariant
    }
    
    const smsLoginId=config.smsConfig.loginId;
    const smsPassword=config.smsConfig.password;
    const SESConfig = {
                    apiVersion:config.awsSESConfig.apiVersion,
                    accessKeyId:config.awsSESConfig.accessKeyId,
                    secretAccessKey:config.awsSESConfig.secretAccessKey,
                    region:config.awsSESConfig.region
                };
    
    async.auto({
        register: function(cb){
            models.Event.Register(options, (err, event) => {
                if (err) {
                 
                    cb(err)
                } else {
                    cb(null)
                }
            })
        },
        eventDetails: function(cb){
            models.Event.GetSingle(options, (err, event) => {
                if (err) {
                   
                    cb(err)
                } else {
                    cb(null, event)
                }
            })
        },
        userDetails: function(cb){
            models.Users.GetSingle(options, (err, user) => {
                if (err) {
                   
                    cb(err)
                } else {
                    cb(null, user)
                }
            })
        },
        sendSMS: ['register','eventDetails','userDetails', function(result, cb){
            var user = result.userDetails;
            var eventName = result.eventDetails ? result.eventDetails.name : '';
            var message = `Hello ${user.fname} ${user.lname}, You have been successfully registered for ${eventName}`;
            var url = 'http://198.15.103.106/API/pushsms.aspx?loginID='+smsLoginId+'&password='+smsPassword+'&mobile='+user.phone+'&text='+message+'&senderid=SHRIND&route_id=1&Unicode=0';
            http.get(url, (resp) => {
                cb(null)
            }).on("error", (err) => {
               
                cb(err);
            });
        }],
        sendEmail: ['register','eventDetails','userDetails', function(result, cb){
            var user = result.userDetails;
            var eventName = result.eventDetails ? result.eventDetails.name : '';
            var message = `Hello ${user.fname} ${user.lname}, You have been successfully registered for ${eventName}`;
            var params = {
                            Source:'sidhi.volvoiker@tapsoft.in',
                            Destination:{
                                ToAddresses:[
                                    user.email
                                ]
                            },
                            ReplyToAddresses:[
                                'sidhi.volvoiker@tapsoft.in'
                            ],
                            Message:{
                                Body:{
                                    Html:{
                                    Charset:"UTF-8",
                                    Data:message
                                  }
                                },
                                Subject:{
                                    Charset:'UTF-8',
                                    Data:'FitBiz - Event Registration!'
                                }
                            }
                        };
            new AWS.SES(SESConfig).sendEmail(params,function(err, data) {
                if (err) {
                  
                    cb(err);
                }else{
                    cb(null)
                }          
            })
        }]
    }, function(err, result){
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true})
        }
    })
});

router.post('/my-marathon-data', (req, res) => {
    const options = {
        userId: req.body.userId
    }

    models.Event.GetUserMarathons(options, (err, marathons) => {
        if (err) {
         
            res.send({success:false})
        } else {
            res.send({success:true, marathons})
        }
    })  
});

//check if the virtual marathon is purchased
router.post('/is-purchased', (req, res) => {
    var post = req.body;
    const options = {
        userId: post.userId,
        eventId: 1// currently only one virtual marathon is present and its 1
    }

    models.Event.IsPurchased(options, (err, isPurchased) => {
        if (err) {
         
            res.send({success:false})
        } else {
            res.send({success:true, isPurchased})
        }
    })  
});

router.post('/marathon-held', (req, res) => {
    const options = {
        userId: req.body.userId
    }

    models.Event.MarathonHeld(options, (err, marathonHeld) => {
        if (err) {
          
            res.send({success:false})
        } else {
            res.send({success:true, marathonHeld})
        }
    })  
});
module.exports = router;