/********************************************************/
/***** Events Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const http = require('http');
const AWS = require('aws-sdk');
const config = require('../config')
const Razorpay = require('razorpay');
const razorPay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});
const currency = 'INR'

router.get('/', (req, res) => {
	const models = req.Core.Models;
    // const filter = req.body.is
    models.Event.GetAll({offset:0, limit:15}, (err, events) => {
        if (err) {
           
            res.redirect('/404')
        } else {
            res.render('front/event-list', {
		        title: 'FitBiz - Events',
		        events: events.events,
		        scripts: ['/js/page-level/event-list.js']
		    })
        }
    })  
});

router.get('/:id', (req, res) => {
    const models = req.Core.Models;
    const eventId = req.params.id; 

    models.Event.GetSingle({eventId}, (err, event) => {
        if (err) {
          
            res.redirect('/404')
        } else {
            models.Common.GetCountries({},(err, countries) => {
                if (err) {
                  
                    res.redirect('/404')
                } else {
                    models.Common.GetStates({countryId: 101},(err, states) => {
                        if (err) {
                          
                            res.redirect('/404')
                        } else {
                            res.render('front/single-event', {
                                title: 'FitBiz - Events',
                                event: event,
                                countries,
                                states,
                                styles: ['/plugins/toastr/toastr.min.css'],
                                scripts: ['/js/page-level/single-event.js','/plugins/toastr/toastr.min.js','https://checkout.razorpay.com/v1/checkout.js']
                            })
                        }
                    })
                }
            })
        }
    })  
});

router.post('/register', (req, res) => {
    const models = req.Core.Models;
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
        userId: req.session.user ? req.session.user.id : null,
        isPayed: 1,
        paymentAmount: post.amount,
        paymentId: post.paymentResponse.razorpay_order_id,
        eventVariant: post.eventVariant
    }
    
    const smsLoginId=req.smsConfig.loginId;
    const smsPassword=req.smsConfig.password;
    const SESConfig = {
                    apiVersion:req.awsSESConfig.apiVersion,
                    accessKeyId:req.awsSESConfig.accessKeyId,
                    secretAccessKey:req.awsSESConfig.secretAccessKey,
                    region:req.awsSESConfig.region
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

router.post('/request-payment', (req, res) => {
    const post = req.body;
    const total = post.amount;

    var paymentOptions = {
        amount: total * 100,
        currency: currency,
        payment_capture: 1
    };
    razorPay.orders.create(paymentOptions, function (err, order) {
        if (err) {
        
            res.send({success: false})
        } else {
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
                isPayed: 1,
                paymentId: order.id ? order.id : null,
                paymentAmount: post.amount,
                userId: post.userId ? post.userId : null
            }
            res.send({success: true, orderId: order.id, key: config.razorpay.keyId})
        }
    })
});

router.post('/variants', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

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
module.exports = router;