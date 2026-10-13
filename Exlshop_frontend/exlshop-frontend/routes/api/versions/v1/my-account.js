const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
// const session = require("session")
const { response } = require('express');
const { options } = require('../..');
const url = require('url');
const params = new url.URLSearchParams();
module.exports = {
    'order': function (model, req, method, cb) {
        if (method === 'POST') {
            model.Orders.GetByUserId({userId: req.userId, offset: 0, limit: 20}, (err, orders) => {
                if (err) {
                    cb(true,{success: false})
                } else {
                    cb(false,{success: true,orders})
                }
            })
        }
    },

    'deliver_order': function (model, req, method, cb) {
        if (method === 'POST') {
            model.Orders.GetDeliverOrder({userId: req.userId}, (err, deliver_orders) => {
                if (err) {
                    cb(true,{success: false})
                } else {
                    cb(false,{success: true,deliver_orders})
                }
            })
        }
    },

    'cancel_order' : function(model, req, method, cb){
        if(method === 'POST'){
            const options = {
                orderId : req.orderId
            }
            model.Orders.cancel_order(options, (err,product) => {
                if (err) {
                    cb(true,{success : false})
                }
                else{
                   cb(false,{success : true,product});
                }
            })
        }
    },

    'add_review' : function(model,req,method,cb){
        if(method === 'POST'){
            model.Orders.AddReview({userId :req.userId,orderId :req.orderId,productId : req.productId,review:req.review},(err,review)=>{
                if (err) {
                    cb(true,{success : false})
                }
                else{
                    cb(false,{sucess:true,review})
                }
            })
        }
    },

    'view_review' : function(model,req,method,cb){
        if(method === 'POST'){
            model.Orders.ViewReview({userId: req.userId},(err,review)=>{
                if(err){
                    cb(true,{success : false})
                }
                else{
                    cb(false,{sucess : true,review});
                }
            })
        }
    },

    'orders-get-single':function(model,req,method,cb){
        const orderOpts = {orderId: req.orderId, userId: req.userId};

        async.parallel({
            orderData: (cb) => {
                model.Orders.GetSingleData(orderOpts, (err, orderData) => {
                    cb(err, orderData)
                })
            },
            orderProductItems: (cb) => {
                model.Orders.GetProductLine(orderOpts, (err, orderProducts) => {
                    if (err) {
                        return cb(err)
                    }
                    async.map(orderProducts, (l, callback) => {
                        model.ShopProducts.GetForCart({productId: l.product_id, variationId: l.variation_id}, (err, products) => {
                            if (err) {
                                callback(err)
                            } else {
                                callback(null, _.merge(l, products))
                            }
                        })
                    }, (err, result) => {
                        cb(err ? err : null, result)
                    })
                })
            }
        }, (err, result) => {
            if (err) {
                cb(true,{success: false})
            } else {
                cb(false,{ success:true,orderData: result.orderData,orderItems: result.orderProductItems})
            }
        })
    },

    'shipping-address':function(model,req,method,cb){
        async.parallel({
            states: (cb) => {
                model.Common.GetStates({countryId: 101}, (err, states) => {
                    cb(err ? err : null, states)
                })
            },
            shippingAddresses: (cb) => {
                model.Users.GetShippingAddress({userId: req.userId}, (err, address) => {
                    cb(err ? err : null, address)
                })
            }
        }, (err, result) => {
            if (err) {
                cb(true,{success: false})
            } else {
                cb(false,{success:true, states: result.states,shippingAddresses: result.shippingAddresses})
            }
        })
    },
    
    'add-new-address':function(model,req,method,cb){
        if(method === 'POST'){
        const options = {
            label: req.label,
            name: req.name,
            userId: req.userId,
            addressLine1: req.addressLine1,
            addressLine2: req.addressLine2,
            stateId: req.stateId,
            cityId: req.cityId,
            phone: req.phone,
            zip: req.zip,
            lat : req.lat,
            long : req.long
        }  
        model.Users.AddShippingAddress1(options, (err) => {
            if (err) {
                cb(true,{success: false})
            } else {
                cb(false,{success:true})
            }
        })
    }
    },

    'update-address':function(model,req,method,cb){
        if(method === 'POST'){
        const options = {
            shipping_Id: req.shipping_Id,
            label: req.label,
            name: req.name,
            addressLine1: req.addressLine1,
            addressLine2: req.addressLine2,
            state: req.state,
            city: req.city,
            phone: req.phone,
            zip: req.zip,
            lat : req.lat,
            lng : req.lng
        }
        model.Users.updateAddressDetails(options, (err) => {
            if (err) {
                cb(true,{success: false})
            } else {
                cb(false,{success:true})
            }
        })
    }
    },

    'delete-address' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                shipping_Id : req.shipping_Id
            }
            model.Users.deleteAddressDetails(options, (err) =>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'wishlist-product' : function(model, req, method, cb){
        if (method === 'POST') {
        const options = {
            userId : req.userId
        }
        model.ShopProducts.WishlistProducts(options, (err, wishlist) => {
            if(err){
                cb(true,{success: false})
            }else{
                cb(false,{success:true, wishlist})
            }
        })
    }
    },

    'favourite-shops' : function(model, req, method, cb){
        if (method === 'POST') {
            const options = {
                userId : req.userId
            }
            model.ShopProducts.FavouriteShops(options, (err, shopList) =>{
                if(err){
                    console.log(err)
                    cb(true,{success: false})
                }else{
                    cb(false,{success: true, shopList})
                }
            })
        }
    },

    'chat-with-us' : function(model, req, method, cb){
        if(method === 'POST'){
            const options = {
                userId : req.userId,
                question : req.question
            }
            model.Users.chatWithUs(options, (err, questions) =>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success: true, questions})
                }
            })
        }
    },

    'addProductReview' : function(model, req, method, cb){
        if(method == "POST"){
            const options = {
                review : req.review,
                userId : req.userId,
                orderId : req.orderId,
                productId : req.productId
            }
            model.Orders.AddReview(options, (err, review)=>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'addProductRate' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                rate : req.rate,
                userId : req.userId, 
                productId: req.productId
            }
            model.ShopProducts.productRate(options, (err, rate) =>{
                if(err){
                    cb(true,{success:false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'addChat' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                fromUser : req.fromUser, 
                toUser : req.toUser, 
                message : req.message, 
                LocId : req.LocId
            }
            model.Chat.Add(options, (err, msg) =>{
                if(err){
                    cb(true,{success:false})
                }else{
                    cb(false,{success:true, msg:msg})
                }
            })
        }
    },

    'getmessage' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                userId : req.userId, 
                loc_user_id : req.loc_user_id, 
                LocId : req.LocId
            }
            model.Chat.getmessage(options, (err, message) =>{
                if(err){
                    cb(true,{success:false})
                }else{
                    cb(false,{success:true, message:message})
                }
            })
        }
    }


}