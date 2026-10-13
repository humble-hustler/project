const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
const moment = require('moment');
const async=require('async');
const config = require('../../../../config')
const Razorpay = require('razorpay');
const razorPay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});
module.exports = {

    'getSubscription':function (model, req, method, cb) {
        if (method === 'POST') {
            razorPay.subscriptions.create({
                plan_id: req.planId,
                customer_notify: 0,
                quantity: 1,
                total_count: 1,
                addons: [
                  {
                    item: {
                      name: req.planName,
                      amount: (req.amount)*100,
                      currency: "INR"
                    }
                  }
                ],
                notes: {}
              }, (err, data1) => {
                if (err) cb(true, { success:false});
                else {
                  const orderOptions = {
                      userId: req.user_id,
                      locationId:req.location_id,
                      currency: "INR",
                      amount:  req.amount,
                      subscriptioId: data1.id
                  }
                  
                  model.Orders.RegistrationCheckout(orderOptions, (err, orderData) => {
                      if (err) {
                        cb(true, { success:false});
                      } else {
                        cb(false, { success: true,subscriptionId: data1.id,amount:req.amount, key: config.razorpay.keyId, orderDataId: orderData })
                      }
                  })
                 }
              })
        }
    },
   
   'updateSubscription':function (model, req, method, cb) {
    if (method === 'POST') {
       var subscriptionId = req.subscriptionId
       var updateoptions = {
           plan_id:req.planId,
           quantity: 3,
           remaining_count: 6,
           schedule_change_at: "now",
           customer_notify: 1,
           offer_id:""
       }
       razorPay.subscriptions.update(subscriptionId,updateoptions, (err, data1) => {
           if (err) {
            console.log("error is",err)
           }
           else {
               console.log("successfully updated")
           }
       })
    }
},

   'cancelSubscription':function (model, req, method, cb) {
    if (method === 'POST') {
       var canceloptions = {
            razorpay_order_id: req.razorpay_order_id,
            razorpay_payment_id: req.razorpay_payment_id
       }
       model.Subscription.Cancel_Subscription(canceloptions, (err, subscription_details) => {
            if (err) {
                cb(true, { success:false});
            } else {
                var currentLocation = {
                    plan_id:'',
                    razorpay_order_id:'',
                    razorpay_signature:'',
                    razorpay_payment_id:'',
                    amount:'',
                    start_date:'',
                    end_date:'',
                    status:0,
                    plan_name:'',
                    period:'',
                    plan_interval:'',
                    allowed_products:'',
                    add_product_req:'',
                    no_of_req:'',
                    allowed_features:''
                }
                cb(false, { success: true, currentLocation :currentLocation})
            }
        })
    }
},

    'confirm':function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                paymentId: req.paymentResponse.razorpay_payment_id,
                userId: req.user_id,
                subscriptionId: req.subscriptionId,
                planId: req.planId,
                amount: req.amount,
                planPeriod: req.planPeriod,
                interval: req.interval,
                locationId: req.currentLocation_id
            }
           
            model.Orders.Create(options, (err, orderId) => {
                if (err) {
                    cb(true, { success:false});
                } else {
                    if(req.old_subscriptionId) {
                        model.Orders.cancelCurrentPlan({subscriptionId:req.old_subscriptionId,userId:req.user_id,locationId:req.currentLocation_id}, (err, oldOrder) => {
                            if (err) {
                                cb(true, { success:false});
                            } else {
                                model.Users.GetAssignedLocations({ userId:req.user_id }, (err, locations) => {
                                    if (err) {
                                        cb(true, { success:false});
                                    } else {
                                        if (locations.locations) {
                                            model.Subscription.getsubscribed_details({userId:req.user_id,locationId:req.currentLocation_id}, (err,planDetails) => {
                                                if(err) {
                                                    cb(true, { success:false});
                                                } else {
                                                    cb(false, { success: true,orderId : orderId, assignedLocations : locations.locations, currentLocation :planDetails[0]})
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    } else {
                        model.Users.GetAssignedLocations({ userId:req.user_id }, (err, locations) => {
                            if (err) {
                                cb(true, { success:false});
                            } else {
                                if (locations.locations) {
                                    model.Subscription.getsubscribed_details({userId:req.user_id,locationId:req.currentLocation_id}, (err,planDetails) => {
                                        if(err) {
                                            cb(true, { success:false});
                                        } else {
                                            cb(false, { success: true,orderId : orderId, assignedLocations : locations.locations, currentLocation :planDetails[0]})
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    },
    'subscription-details':function (model, req, method, cb) {
        if (method === 'POST') {
           
            const userId =req.user_id   
            const locationId = req.currentLocation_id
            model.Subscription.subscription_details({userId,locationId, offset: 0, limit : 1000000}, (err, subscription_details) => {
                if (err) {
                    cb(true, { success:false});
                } else {
                    cb(false, { success: true,subscription_details })
                }
            })
        }
    },
    
    'planList':function (model, req, method, cb) {
        if (method === 'GET') {
            model.Subscription.getSubscriptionPlans( (err, subscription_plans) => {
                if (err) {
                    cb(true, { success:false});
                } else {
                    cb(false, { success: true,subscription_plans })
                }
            })
        }
    }
}