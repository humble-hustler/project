const async = require('async');
const _ = require('lodash');
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const config = require('../../config')
const Razorpay = require('razorpay');
var Insta = require('instamojo-nodejs');
const { success } = require('toastr');
Insta.setKeys(config.instamojo.apiKey, config.instamojo.authKey);
Insta.isSandboxMode(true);
const razorPay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});


router.get('/subscription', auth.checkPermission(['brand-admin', 'manager', 'operator', 'trainer']), (req, res) => {
    const models = req.Core.Models;
    models.Subscription.getSubscriptionPlans((err, subscription_plans) => {
        if (err) {
            res.send({ success: false })
        } else {
            var options={
                offset : req.body.start ? req.body.start : 0,
                limit : req.body.length ? req.body.length : 10,
                search : req.body.search ? req.body.search.value : false,
                userId:req.session.user.id,
                locationId:req.session.user.currentLocation.id
            } 
            models.Subscription.subscription_details(options,(err, subscription_details) => {
                if (err) { res.send({ success: false }) }
                else {
                models.Subscription.getsubscribed_details(options,(err,getsubscribed_details)=>{
                    if (err) { res.send({ success: false }) }
                    else {
                    res.render('app/subscription', {
                        subscription_plans: subscription_plans,
                        subscription_details: subscription_details,
                        getsubscribed_details:getsubscribed_details[0],
                        menuActive:'subscription',
                        submenuActive: '',
                        fw: false,
                        title: 'Exlshop | SubscriptionManagement',
                        scripts: ['https://checkout.razorpay.com/v1/checkout.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/subscriptionrequest.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
                    })
                    }
                })
                }
            })
        }
    })
})

router.post('/subscription-details', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    var options={
        offset : req.body.start,
        limit : req.body.length,
        search : req.body.search.value ? req.body.search.value : false,
        userId:req.session.user.id, 
        locationId:req.session.user.currentLocation.id,
    } 
    models.Subscription.subscription_details(options, (err, subscription_details) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: subscription_details[1][0].total, recordsFiltered:subscription_details[1][0].total, data: subscription_details[0]})
              
        }
    })
})

router.post('/cancel_subscription',(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
    const options={
        razorpay_order_id: post.razorpay_order_id,
        razorpay_payment_id:post.razorpay_payment_id
    }
        models.Subscription.Cancel_Subscription(options, (err, subscription_details) => {
        if (err) {
            res.send({ success: false })
        } else {
            req.session.user.currentLocation.plan_id=''
            req.session.user.currentLocation.instamojo_payment_request_id= '';
            req.session.user.currentLocation.razorpay_signature= '';
            req.session.user.currentLocation.instamojo_payment_id= '';
            req.session.user.currentLocation.amount=''
            req.session.user.currentLocation.start_date=''
            req.session.user.currentLocation.end_date=''
            req.session.user.currentLocation.status=0
            req.session.user.currentLocation.plan_name=''
            req.session.user.currentLocation.period=''
            req.session.user.currentLocation.plan_interval=''
            req.session.user.currentLocation.allowed_products=''
            req.session.user.currentLocation.add_product_req=''
            req.session.user.currentLocation.no_of_req=''
            req.session.user.currentLocation.allowed_features=''
            res.send({success: true})
              
        }
    })  
})


router.get('/', auth.checkPermission(['brand-admin', 'manager', 'operator', 'trainer']), (req, res) => {
    const models = req.Core.Models;
    models.Subscription.getSubscriptionPlans( (err, subscription_plans) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.render('app/subscriptionrequest', {
                    menuActive: 'subscribe',
                    fw: false,
                    subscription_plans:subscription_plans,
                    title: 'Exlshop | Subscriptionrequest',
                    styles : ['/global/vendor/toastr/toastr.min.css'],
                    scripts: ['/global/vendor/toastr/toastr.min.js','/js/app/subscription.js','https://checkout.razorpay.com/v1/checkout.js']
                }) 
            }
        })
})


router.get('/:uid/:lid', auth.checkPermission(['brand-admin', 'manager', 'operator', 'trainer']), (req, res) => {
    const userId = parseInt(req.params.uid);
    const locationId = parseInt(req.params.lid);
    req.session.user.currentLocation = _.find(req.session.user.assignedLocations, {id: locationId});
    res.redirect('back');
})
router.post('/registrationCheckout', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    var paymentOptions = {
        amount: post.amount,
        currency: "INR",
        payment_capture: 1
    };
    const data = new Insta.PaymentData();
    data.purpose =  req.body.purpose;
    data.amount = req.body.amount;
    data.redirect_url =  req.body.redirect_url;
    const locationId = req.session.user.currentLocation.id;

        Insta.createPayment(data, function(error, response) {
            if (error) {
                console.log(error)
            }else{
                const responseData = JSON.parse( response );
                console.log(response)
                const orderOptions = {
                    userId: req.session.user.id,
                    locationId: req.session.user.currentLocation.id,
                    currency: "INR",
                    amount:  post.amount,
                    subscriptioId: responseData.payment_request.id
                }

                models.Orders.RegistrationCheckout(orderOptions, (err, orderData) => {
                    if (err) {
                        console.log(err)
                        res.send({ success: false })
                    } else {
                        req.session.user.subscriptionId = responseData.payment_request.id,
                        req.session.user.planId= req.body.planId
                        req.session.user.amount = req.body.amount
                        req.session.user.planPeriod = req.body.planPeriod
                        req.session.user.interval = req.body.interval
                        res.status( 200 ).json( responseData )
                    }
                })
            }
        })
    })

    router.post('/registrationCheckoutForFree', (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        var paymentOptions = {
            amount: post.amount,
            currency: "INR",
            payment_capture: 1
        };
        req.session.user.subscriptionId = null,
        req.session.user.planId= req.body.planId
        req.session.user.amount = req.body.amount
        req.session.user.planPeriod = req.body.planPeriod
        req.session.user.interval = req.body.interval
        res.send({success :true});
    
    })

router.post('/updateSubscription', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    var subscriptionId = post.subscriptionId
    var updateoptions = {
        plan_id: post.plan_id,
        quantity: 1,
        remaining_count: 6,
        schedule_change_at: 'now',
        customer_notify: 1
    }
    razorPay.subscriptions.update({subscriptionId,updateoptions}, (err, data1) => {
        if (err) {
            res.send({ success: false })
        } else {
            console.log("successfully updated")
        }
    })
    })

router.get('/confirm', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    const options = {
        paymentId: req.query.payment_id,
        userId: req.session.user.id,
        subscriptionId: req.query.payment_request_id,
        planId: req.session.user.planId,
        amount:req.session.user.amount,
        planPeriod:req.session.user.planPeriod,
        interval:req.session.user.interval,
        locationId: req.session.user.currentLocation.id
    }
    models.Orders.Create(options, (err, orderId) => {
        if (err) {
            console.log(err)
        } else {
            if(post.old_subscriptionId) {
                models.Orders.cancelCurrentPlan({subscriptionId:post.old_subscriptionId,userId:req.session.user.id,locationId:req.session.user.currentLocation.id}, (err, oldOrder) => {
                    if (err) {
                        console.log(err)
                        // res.send({ success: false })
                    } else {
                        models.Users.GetAssignedLocations({ userId }, (err, locations) => {
                            if (err) {
                                console.log(err)
                            } else {
                                if (locations.locations) {
                                    req.session.user.assignedLocations = locations.locations;
                                    models.Subscription.getsubscribed_details({userId,locationId}, (err,planDetails) => {
                                        if(err) {
                                            console.log(err)
                                        } else {
                                            req.session.user.currentLocation.plan_id=planDetails[0].plan_id;
                                            req.session.user.currentLocation.instamojo_payment_request_id=planDetails[0].instamojo_payment_request_id;
                                            req.session.user.currentLocation.razorpay_signature=planDetails[0].razorpay_signature;
                                            req.session.user.currentLocation.instamojo_payment_id=planDetails[0].instamojo_payment_id;
                                            req.session.user.currentLocation.amount=planDetails[0].amount;
                                            req.session.user.currentLocation.start_date=planDetails[0].start_date;
                                            req.session.user.currentLocation.end_date=planDetails[0].end_date;
                                            req.session.user.currentLocation.status=planDetails[0].status;
                                            req.session.user.currentLocation.plan_name=planDetails[0].plan_name;
                                            req.session.user.currentLocation.period=planDetails[0].period;
                                            req.session.user.currentLocation.plan_interval=planDetails[0].plan_interval;
                                            req.session.user.currentLocation.allowed_products=planDetails[0].allowed_products;
                                            req.session.user.currentLocation.add_product_req=planDetails[0].add_product_req;
                                            req.session.user.currentLocation.no_of_req=planDetails[0].no_of_req;
                                            req.session.user.currentLocation.allowed_features=planDetails[0].allowed_features;
                                            res.redirect('/app/subscriptionrequest/subscription')
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            } else {
                models.Users.GetAssignedLocations({ userId }, (err, locations) => {
                    if (err) {
                        console.log(err)
                    } else {
                        if (locations.locations) {
                            req.session.user.assignedLocations = locations.locations;
                            models.Subscription.getsubscribed_details({userId,locationId}, (err,planDetails) => {
                                if(err) {
                                    console.log(err)
                                } else {
                                    req.session.user.currentLocation.plan_id=planDetails[0].plan_id;
                                    req.session.user.currentLocation.instamojo_payment_request_id=planDetails[0].instamojo_payment_request_id;
                                    req.session.user.currentLocation.razorpay_signature=planDetails[0].razorpay_signature;
                                    req.session.user.currentLocation.instamojo_payment_id=planDetails[0].instamojo_payment_id;
                                    req.session.user.currentLocation.amount=planDetails[0].amount;
                                    req.session.user.currentLocation.start_date=planDetails[0].start_date;
                                    req.session.user.currentLocation.end_date=planDetails[0].end_date;
                                    req.session.user.currentLocation.status=planDetails[0].status;
                                    req.session.user.currentLocation.plan_name=planDetails[0].plan_name;
                                    req.session.user.currentLocation.period=planDetails[0].period;
                                    req.session.user.currentLocation.plan_interval=planDetails[0].plan_interval;
                                    req.session.user.currentLocation.allowed_products=planDetails[0].allowed_products;
                                    req.session.user.currentLocation.add_product_req=planDetails[0].add_product_req;
                                    req.session.user.currentLocation.no_of_req=planDetails[0].no_of_req;
                                    req.session.user.currentLocation.allowed_features=planDetails[0].allowed_features;
                                    res.redirect('/app/dashboard')
                                }
                            })
                        }
                    }
                })
            }
        }
    })
})


router.get('/confirmFree', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    const options = {
        paymentId: null,
        userId: req.session.user.id,
        subscriptionId: null,
        planId: req.session.user.planId,
        amount:req.session.user.amount,
        planPeriod:req.session.user.planPeriod,
        interval:req.session.user.interval,
        locationId: req.session.user.currentLocation.id
    }
    models.Orders.Create(options, (err, orderId) => {
        if (err) {
            console.log(err)
        } else {
                models.Users.GetAssignedLocations({userId }, (err, locations) => {
                    if (err) {
                        console.log(err)
                    } else {
                        if (locations.locations) {
                            req.session.user.assignedLocations = locations.locations;
                            models.Subscription.getsubscribed_details({userId,locationId}, (err,planDetails) => {
                                if(err) {
                                    console.log(err)
                                } else {
                                    req.session.user.currentLocation.plan_id=planDetails[0].plan_id;
                                    req.session.user.currentLocation.instamojo_payment_request_id=planDetails[0].instamojo_payment_request_id;
                                    // req.session.user.currentLocation.razorpay_signature=planDetails[0].razorpay_signature;
                                    req.session.user.currentLocation.instamojo_payment_id=planDetails[0].instamojo_payment_id;
                                    req.session.user.currentLocation.amount=planDetails[0].amount;
                                    req.session.user.currentLocation.start_date=planDetails[0].start_date;
                                    req.session.user.currentLocation.end_date=planDetails[0].end_date;
                                    req.session.user.currentLocation.status=planDetails[0].status;
                                    req.session.user.currentLocation.plan_name=planDetails[0].plan_name;
                                    req.session.user.currentLocation.period=planDetails[0].period;
                                    req.session.user.currentLocation.plan_interval=planDetails[0].plan_interval;
                                    req.session.user.currentLocation.allowed_products=planDetails[0].allowed_products;
                                    req.session.user.currentLocation.add_product_req=planDetails[0].add_product_req;
                                    req.session.user.currentLocation.no_of_req=planDetails[0].no_of_req;
                                    req.session.user.currentLocation.allowed_features=planDetails[0].allowed_features;
                                    res.redirect('/app/dashboard')
                                }
                            })
                        }
                    }
                })
            
        }
    })
})

router.post('/getExpiredPlan', (req, res) =>{
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locantionId = req.body.locantionId;
    
    models.Users.getExpiredPlan({userId, locantionId}, (err, data) =>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success : true, data})
        }
    })
})

router.post("/getActivePlan", (req, res) =>{
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locantionId = req.body.locantionId;

    models.Users.getActivePlan({userId, locantionId}, (err, data) =>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success : true, data})
        }
    })
})

module.exports = router;