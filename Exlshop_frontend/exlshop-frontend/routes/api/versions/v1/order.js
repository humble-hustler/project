const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const session = require("session")
const { response } = require('express');
const { options } = require('../..');
const url = require('url');
const params = new url.URLSearchParams();
const config = require('../../../../config')
const Razorpay = require('razorpay');
// const { order } = require('.');
const razorPay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});
const currency = 'INR'

module.exports = {
    'Cartconfirm': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                paymentId: req.paymentId,
                signature: req.signature,
                orderId: req.orderId,
                amount:req.amount,
                userId: req.userId,
                shippingId: req.shippingId,
                delivery_choice: req.delivery_choice,
                locationId: req.locationId
            }
                    model.Cart.GetUserCart(options, (err, cart) => {
                        if(err){
                            cb(true,{success : false})
                        }else{
                            console.log(cart)
                        var cart1 = (cart.cart)?(JSON.parse(cart.cart)):({});
                        model.Orders.Create(options, (err, orderId) => {
                            if (err) {
                                cb(true,{success : false})
                            } else {
                                const post = {
                                    shop_payment_request_id : req.shop_payment_request_id
                                }
                                model.Orders.UpdateShopPaymentRequest({orderId:orderId,  post}, (err, RequestOrder) =>{
                                    if(err){
                                        cb(true,{success : false})
                                    }else{
                                        var line = (cart1.line)?(cart1.line):([]);
                                        const orderOptions = {
                                            orderId: orderId,
                                            cart: line
                                        }
                                        model.Orders.InsertProducts(orderOptions, (err,order_id) => {
                                            line.forEach(function (c){
                                                var a = c.productId
                                                var b = c.quantity
                                                model.Orders.UpdateStockQuantity({productId:a, quantity:b}, (err) =>{
                                                    console.log(err)
                                                })
                                            })
                                            model.Cart.DeleteUserCart(options, (err) => {
                                                console.log(err)
                                            })
                                            if (err) {
                                                cb(true,{success : false})
                                            } else {
                                                // cb(false,{success : true, order_id:order_id});
                                                model.Orders.getLocationAdmin(options, (err, adminId) =>{
                                                    if(err){
                                                        console.log(err)
                                                        cb(true,{success : false})
                                                    }else{
                                                        const Receiver = {
                                                            adminId: adminId,
                                                            userId: req.userId,
                                                            orderId: orderId
                                                        }
                                                        model.Orders.sendNotification(Receiver, (err, data)=>{
                                                            if(err){
                                                                console.log(err)
                                                                cb(true,{success : false})
                                                            }else{
                                                                cb(false,{success : true, order_id:order_id })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                        }
                    })
        }
    },

    'buyconfirm' : function(model, req, method,cb){
        const options = {
            paymentId: req.paymentId,
            signature: req.signature,
            orderId: req.orderId,
            amount: req.amount,
            userId: req.userId,
            shippingId: req.shippingId,
            delivery_choice : req.delivery_choice,
            locationId: req.locationId
        }
        model.Orders.Create(options, (err, orderId) =>{
            if(err){
                cb(true,{success : false})
            }else{
                const orderOptions = {
                    orderId: orderId,
                    productId : req.productId,
                    quantityval : req.quantityval
                }
                    const post = {
                        shop_payment_request_id : req.shop_payment_request_id
                    }
                model.Orders.UpdateShopPaymentRequest({orderId:orderId,  post}, (err, RequestOrder) =>{
                    if(err){
                        cb(true,{success : false})
                    }else{
                        model.Orders.BuyInsertProducts(orderOptions, (err, order_id) =>{
                            if(err){
                                console.log(err)
                                cb(true,{success : false})
                            }else{
                                // cb(false,{success : true, order_id:order_id });
                                model.Orders.getLocationAdmin(options, (err, adminId) =>{
                                    if(err){
                                        console.log(err)
                                        cb(true,{success : false})
                                    }else{
                                        const Receiver = {
                                            adminId: adminId,
                                            userId: req.userId,
                                            orderId: orderId
                                        }
                                        model.Orders.sendNotification(Receiver, (err, data)=>{
                                            if(err){
                                                console.log(err)
                                                cb(true,{success : false})
                                            }else{
                                                cb(false,{success : true, order_id:order_id })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    'getdata': function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                locationId: req.locationId
            }
            model.Orders.getLocationAdmin(options, (err, adminId) =>{
                if(err){
                    cb(true,{success : false})
                }else{
                    cb(false, {success : true, adminId})
                }
            })
        }
    },

    'order_summary' : function (model, req, method, cb) {
        if(method === 'POST'){
            const options = {
                order_ID : req.order_ID
            }
            model.Orders.viewOrders(options, (err, order) =>{
                if (err) {
                    cb(true,{success : false})
                }
                else{
                   cb(false,{success : true, order});
                }
            })
        }
    },

    'removeProduct-from-wishlist' : function(model, req, method, cb){
        if (method === 'POST') { 
            model.Users.RemoveWishlistProduct({userId:req.userId, productId:req.productId}, (err, product) =>{
                if(err){
                    cb(err)
                }else{
                    cb(false, product)
                }
            })
        }
    },
  
    'request-payment':function (model, req, method, cb) {
        if (method === 'POST') {
            const cartTotal = req.cartTotal;
            const type = req.type
            var paymentOptions = {
                amount: cartTotal * 100,
                currency: 'INR',
                payment_capture: 1
            };
          
            if(type == "COD"){
                const orderOptions = {
                    userId: req.userId,
                    currency : 'INR',
                    amount: cartTotal,
                    delChr: req.delChr,
                    type:type
                }
                model.Orders.CreatePaymentRequest(orderOptions, (err, orderData) => {
                    if (err) {
                        cb(true,{success:false})
                    } else {
                        cb(false,{ success: true, paymentMehod:"COD", key: config.razorpay.keyId, orderDataId: orderData })
                    }
                })

            } else if (type == "ONLINE") {
            razorPay.orders.create(paymentOptions, function (err, order) {
                if (err) {
                    cb(err)
                } else {
                    const orderOptions = {
                        userId: req.userId,
                        currency,
                        amount: cartTotal,
                        orderId: order.id,
                        delChr: req.delChr,
                        type:type
                    }
                    model.Orders.CreatePaymentRequest(orderOptions, (err, orderData) => {
                        if (err) {
                            cb(true,{success:false})
                        } else {
                            cb(false,{success:true,paymentMehod:"ONLINE", razorPay:order, orderId: order.id, key: config.razorpay.keyId, orderDataId: orderData})
                        }
                    })
                }
            })
        }
        }
    },

    'myorders': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.userId;
            model.Orders.GetSearchedOrders({userId}, (err, orders) => {
                if (err) {
                    cb(true, { success: false })
                } else {
                    cb(false, { success: true, orders: orders })
                }
            })
        }
    },

    'payment_method' : function(model, req, method, cb) {
        if(method === "GET"){
           model.Orders.getPaymentMethods((err, paymentMehod) =>{
            if(err){
                cb(err)
            }else{
                cb(false, paymentMehod)
            }
           })
        }
    },

    'pending-shipments' : function(model, req, method, cb){
        if(method == 'POST'){
            const options = {
                userId : req.userId,
            }
            model.Orders.pendingShipments(options, (err, pendingShipments) =>{
                if(err){
                    cb(err)
                }else{
                    cb(false, pendingShipments)
                }
            })
        }
    },
    
    'buy-product' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                productId : req.productId,
            }
            model.ShopProducts.GetProduct(options, (err, data) =>{
                if(err){
                    cb(err)
                }else{
                    cb(false, data)
                }
            })
        }
    },

    'getPromotionImages': function(model, req, method, cb){
        if(method === "GET"){
            model.Users.getPromotionImages((err, images)=>{
                if(err){
                    console.log(err)
                    cb(err)
                }else{
                    cb(false, {success:true, images})
                }
            })
        }
    }
}