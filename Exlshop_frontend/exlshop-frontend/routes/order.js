const express = require('express');
const fetch = require('node-fetch')
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const config = require('../config')
const Razorpay = require('razorpay');
var Insta = require('instamojo-nodejs');
Insta.setKeys(config.instamojo.apiKey, config.instamojo.authKey);
Insta.isSandboxMode(true);
// const razorPay = new Razorpay({
//     key_id: config.razorpay.keyId,
//     key_secret: config.razorpay.keySecret,
// });

const currency = 'INR'

router.post('/buy/request-payment', (req, res) => {
   
    const post = req.body;
    const models = req.Core.Models;
    const cartTotal = req.body.amount;
    const type = post.demovalue;
    var paymentOptions = {
        amount: cartTotal * 100,
        currency: currency,
        payment_capture: 1
    };
    if (type == "COD") {
        const orderOptions = {
            userId: req.session.user.id,
            currency,
            amount: cartTotal
        }
        models.Orders.CreatePaymentRequest(orderOptions, (err, orderData) => {
            if (err) {
               
                res.send({ success: false })
            } else {
                res.send({ success: true, key: config.razorpay.keyId, orderDataId: orderData })
            }
        })
    }
    else if (type == "ONLINE") {
        razorPay.orders.create(paymentOptions, function (err, order) {
            if (err) {
             
                res.send({ success: false })
            } else {
               
                const orderOptions = {
                    userId: req.session.user.id,
                    currency,
                    amount: cartTotal,
                    orderId: order.id
                }
                models.Orders.CreatePaymentRequest(orderOptions, (err, orderData) => {
                    if (err) {
                     
                        res.send({ success: false })
                    } else {
                        res.send({ success: true, orderId: order.id, key: config.razorpay.keyId, orderDataId: orderData })
                    }
                })
            }
        })
    }

});

router.post('/request-payment', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    //  const cartTotal = req.session.cart.cartTotal;
    const type = post.demovalue;
   
    var paymentOptions = {
        amount: post.calculateAmt,
        currency: currency,
        payment_capture: 1
    };
    if (type == "COD") {
        const orderOptions = {
            userId: req.session.user.id,
            currency,
            amount: post.calculateAmt,
            delChr: post.delChr,
            type:type
        }
        models.Orders.CreatePaymentRequest(orderOptions, (err, orderData) => {
            if (err) {
                console.log(err)
                res.send({ success: false })
            } else {
                res.send({ success: true, orderDataId: orderData })
            }
        })
    }
    else if (type == "ONLINE") {
        const data = new Insta.PaymentData();
        data.purpose =  req.body.purpose;
        data.amount = req.body.amount;
        // data.buyer_name =  '';
        data.redirect_url =  req.body.redirect_url;
        // data.email =  '';
        // data.phone =  '';
        // data.send_email =  false;
        // data.webhook= '';
        // data.send_sms= false;
        // data.allow_repeated_payments =  false;
        Insta.createPayment(data, function(error, response) {
            if (error) {
                // some error
            } else {
                const responseData = JSON.parse( response );
                const orderOptions = {
                    userId: req.session.user.id,
                    currency,
                    amount: post.calculateAmt,
                    delChr: post.delChr,
                    orderId: responseData.payment_request.id,
                    type:type
                }
                models.Orders.CreatePaymentRequest(orderOptions, (err, orderData) => {
                    if (err) {
                        res.send({ success: false })
                    } else {
                        req.session.user.shippingId = req.body.shippingId
                        req.session.user.shippingadd = req.body.shippingadd
                        req.session.user.delivery_choice = req.body.delivery_choice
                        req.session.user.responseData = req.body.responseData
                        req.session.user.shop_payment_request_id = orderData.insertId
                        req.session.user.delChr = post.delChr
                        req.session.user.productId = post.productId ? post.productId : null
                        req.session.user.quantityval = post.quantityval ? post.quantityval :null
                        // shop_payment_request_id: data.orderData.insertId,
                        res.status( 200 ).json( responseData );
                        // res.send({ success: true, orderId: responseData.payment_request.id, key: config.razorpay.keyId, orderDataId: orderData })
                    }
                })
            }
        })
    }

});

router.get('/confirm', (req, res) => {
   
    const models = req.Core.Models;
    const delChr = req.session.user.delChr
    const options = {
        paymentId: req.query.payment_id,
        // signature: post.paymentResponse.razorpay_signature,
        orderId: req.query.payment_request_id,
        userId: req.session.user.id,
        shippingId: req.session.user.shippingId,
        delivery_choice : req.session.user.delivery_choice
    }
    
    models.Orders.Create(options, (err, orderId) => {
        if (err) {
            res.send({ success: false })
        } else {
            const orderOptions = {
                orderId: orderId,
                cart: req.session.cart.line
            }
            models.Orders.UpdateShopPaymentRequest({orderId:orderId,  shop_payment_request_id :req.session.user.shop_payment_request_id}, (err, RequestOrder) =>{
                if(err){
                  
                    res.send({ success: false })
                }else{
                    models.Orders.InsertProducts(orderOptions, (err,order_id) => {
                        var cart = req.session.cart.line

                        cart.forEach(function (c){
                            var a = c.productId
                            var b = c.quantity
                            models.Orders.UpdateStockQuantity({productId:a, quantity:b}, (err) =>{
                                console.log(err)
                            })
                        })
                        models.Cart.DeleteUserCart({ userId: req.session.user.id }, (err) => {
                            console.log(err)
                        })
                        delete req.session.cart;

                        if (err) {
                            res.redirect('back')
                        } else {
                            console.log("all process done")
                            res.redirect(`/my-account/orderconfirm/${orderId}/${delChr}`)
                            // res.send({ order_id:order_id  })
                        }
                    })
                }
            })
        }
    })
})

router.post('/buyconfirm', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const deliveryOption=post.deliveryOption;
    const options = {
        paymentId: post.paymentResponse.razorpay_payment_id,
        signature: post.paymentResponse.razorpay_signature,
        orderId: post.paymentResponse.razorpay_order_id,
        userId: req.session.user.id,
        shippingId: post.shippingId,
        pid:post.pid,
        quantityval:post.quantityval,
        delivery_choice : req.body.delivery_choice
    }

    models.Orders.Create(options, (err, orderId) => {
        if (err) {
           
            res.send({ success: false })
        } else {
          
            const orderOptions = {
                orderId: orderId,
                pid:post.pid,
                quantityval:post.quantityval
            }
            models.Orders.BuyInsertProducts(orderOptions, (err,order_id) => {
                models.Cart.DeleteUserCart({ userId: req.session.user.id }, (err) => {
                    console.log("err2",err)
                })
                delete req.session.cart;
                if (err) {
                  
                    res.send({ success: false })
                } else {
                 
                     if(deliveryOption.includes('delhivery')){
                    fetch('https://staging-express.delhivery.com/api/cmu/create.json',  {
                        method: 'POST',
                        headers: {
                          Authorization: 'Token a6d7133ef161c086688868cfb1120000cda1bab0'
                        },
                        body: `format=json&data={
                          "shipments": [
                              {
                                  "add": "M25,NelsonMarg",
                                  "address_type": "home",
                                  "phone": "8310418179",
                                  "payment_mode": "COD",
                                  "name": "Shruti",
                                  "pin": "411021",
                                  "order": "255",
                                  "country": "India",
                                  "cod_amount": 1293.89,
                                  "waybill": "",
                                  "shipping_mode" : "Surface"
                              }
                          ],
                          "pickup_location": {
                              "name": "TS Surface 2",
                              "city": "Pune",
                              "pin": "411021",
                              "country": "India",
                              "phone": "8310418179",
                              "add": "SAMSUKHA COMPLEX H. NO. 204 2ND FLOOR 2ND FLOOR BELAGAVI KHADE BAZAR , Belgaun, Karnataka ,India 590001"
                          }
                        }`
                      })
                        .then(res => res.json())
                        .then(json => {
                       
                        AddDeliveryDetails(json)
                        
                        })
                        .catch(err =>{console.error('error:', err)
                     
                      });
                    }else{
                       
                        res.send({ order_id:order_id})
                    }
                      function AddDeliveryDetails(details_delivery){
                        var opt1={
                            details_delivery:details_delivery,
                            order_id:order_id
                        }
                        models.Orders.Add_Delivery_Details(opt1,(err,delivery_details)=>{
                        
                            res.send({ order_id:order_id  ,delivery_details})
                        })
                      }
                   
                }
            })
        }
    })
})

router.get('/buyconfirm0', (req, res) => {
    const post = req.body;
    const delChr = req.session.user.delChr
    const models = req.Core.Models;
   
    const options = {
        paymentId: req.query.payment_id,
        // signature: post.paymentResponse.razorpay_signature,
        orderId: req.query.payment_request_id,
        userId: req.session.user.id,
        shippingId: req.session.user.shippingId,
        delivery_choice : req.session.user.delivery_choice
    }

    models.Orders.Create(options, (err, orderId) => {
        if (err) {
           
            res.send({ success: false })
        } else {
           
            const orderOptions = {
                orderId: orderId,
                productId : req.session.user.productId,
                quantityval : req.session.user.quantityval
            }

            models.Orders.UpdateShopPaymentRequest({orderId:orderId,  shop_payment_request_id :req.session.user.shop_payment_request_id}, (err, RequestOrder) =>{
                if(err){
                  
                    res.send({ success: false })
                }else{
                    models.Orders.BuyInsertProducts(orderOptions, (err,order_id) => {

                        models.Cart.DeleteUserCart({ userId: req.session.user.id }, (err) => {
                            console.log(err)
                        })
                        delete req.session.cart;
                        if (err) {
                          
                            res.send({ success: false })
                        } else {
                            res.redirect(`/my-account/orderconfirm/${orderId}/${delChr}`)
                            // res.send({ order_id:order_id  })
                        }
                    })
                }
            })
        }
    })
})

router.post('/buyconfirm1', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
  
    const options = {
        userId: req.session.user.id,
        shippingId: post.shippingId,
        order_id:post.order_id,
        shop_payment_request_id:post.shop_payment_request_id,
        delivery_choice : post.delivery_choice

    }

    
    models.Orders.Create(options, (err, orderId) => {
        if (err) {
         
            res.send({ success: false })
        } else {
            const orderOptions = {
                orderId: orderId,
                productId : post.productId,
                quantityval : post.quantityval
                // cart: req.session.cart.line
            }
            models.Orders.UpdateShopPaymentRequest({orderId:orderId,   shop_payment_request_id:post.shop_payment_request_id}, (err, RequestOrder) =>{
                if(err){
                 
                    res.send({ success: false })
                }else{
                   
                    models.Orders.BuyInsertProducts(orderOptions, (err,order_id) => {

                        models.Cart.DeleteUserCart({ userId: req.session.user.id }, (err) => {
                            console.log(err)
                        })
                        delete req.session.cart;
                        if (err) {
                          
                            res.send({ success: false })
                        } else {
                            // res.send({ success: true })
                          
                            res.send({ order_id:order_id  })
                        }
                    })
                }
            })
           
        }
    })


})

router.post('/confirm1', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        userId: req.session.user.id,
        shippingId: post.shippingId,
        order_id:post.order_id,
        shop_payment_request_id:post.shop_payment_request_id,
        delivery_choice : post.delivery_choice
    }

    const orderOptions = {
        cart: req.session.cart.line
    }
    models.Orders.Create(options, (err, orderId) => {
        if (err) {
         
            res.send({ success: false })
        } else {
            const orderOptions = {
                orderId: orderId,
                productId : post.productId,
                quantityval : post.quantityval,
                cart: req.session.cart.line
            }
            models.Orders.UpdateShopPaymentRequest({orderId:orderId,  shop_payment_request_id:post.shop_payment_request_id}, (err, RequestOrder) =>{
                if(err){
                   
                    res.send({ success: false })
                }else{
                    models.Orders.InsertProducts(orderOptions, (err,order_id) => {

                        var cart = req.session.cart.line
                        cart.forEach(function (c){
                            var a = c.productId
                            var b = c.quantity
                            models.Orders.UpdateStockQuantity({productId:a, quantity:b}, (err) =>{
                                console.log(err)
                            })
                        })

                        models.Cart.DeleteUserCart({ userId: req.session.user.id }, (err) => {
                            console.log(err)
                        })
                        delete req.session.cart;
                        if (err) {
                          
                            res.send({ success: false })
                        } else {
                            res.send({ order_id:order_id  })
                        }
                    })
                }
            })
           
        }
    })


})
module.exports = router;