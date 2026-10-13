const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const { response } = require('express');
const { options } = require('../..');

module.exports = {
    'myproduct': function (model, request, method, cb) {
        if (method === 'GET') {
        model.ShopProducts.GetProducts1({all:true},(err,products1) =>{
            if (err) {
                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
            } else {
                cb(false, {success:true, products1:products1});
            }
        })
    } else {
        cb(true, {error: ErrorCodes[002], code: '002'})
    }
   },
    'add': function (model, request, method, cb) {
        if (method === 'POST') {
            // const post = request.body;
            const message = request.message;
            const options = {
                message: request.message,
                fromUser: request.fromUser,
                toUser: request.toUser
            }
            model.Chat.Add(options, (err) => {
                if (err) {
                    console.log(err)
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
                } else {
                    cb(false, {success: true});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },

    'read': function (model, request, method, cb) {
        if (method === 'POST') {
            const options = {
                receiver: request.toUser,
                sender: request.fromUser
            }
            model.Chat.MessageRead(options, (err) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
                } else {
                    cb(false, {success: true});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'read': function (model, request, method, cb) {
        if (method === 'GET') {
            model.Chat.MessageRead1(options, (err, chatresult) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
                } else {
                    cb(false, {success: true, chatresult: chatresult});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    
    'unread-count': function (model, request, method, cb) {
        if (method === 'POST') {
            const options = {
                userId: request.userId,
                locationId: request.locationId
            }
            model.Chat.GetUnreadMessagesCount(options, (err, messageCount) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
                } else {
                    cb(false, {success: true, messageCount:messageCount});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },

    'list': function (model, request, method, cb) {
        if (method === 'POST') {
            const options = {
                fromUser: request.fromUser,
                toUser: request.toUser
            }
            model.Chat.GetUserChats(options, (err, chats) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
                } else {
                    cb(false, {success: true, chats: chats});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },

    'GetLocationUsers' : function(model, request, method, cb){
        if(method === "POST"){
           const options = {
              locationId:request.locationId
           }
           model.Users.GetLocationUsers(options, (err, getLocations) =>{
            if (err) {
                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
            } else {
                cb(false, {success: true, getLocations});
            }
           })
        }
    },

    'GetLocationCustomers' : function(model, request, method, cb){
        if(method === "POST"){
            const options = {
               locationId:request.locationId
            }
            model.custmor.GetLocationCustomer(options, (err, getCustomerLocations) =>{
             if (err) {
                 cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
             } else {
                 cb(false, {success: true, getCustomerLocations});
             }
            })
         }
    },

    'single-user-chat' : function(model, request, method, cb){
        if(method === "POST"){
            const options = {
                fromUser: request.fromUser,
		        toUser: request.toUser
            }
            model.Chat.GetUserChats(options, (err, messages) =>{
                if(err){
                 cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
                }else{
                 cb(false, {success: true, messages});
                }
            })
        }
    },

    'add-message' : function(model, request, method, cb){
        const options = {
            fromUser: request.fromUser,
            toUser: request.toUser,
            message:request.message
        }
        model.Chat.Add(options, (err, data) =>{
            if(err){
                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
               }else{
                cb(false, {success: true, data});
               }
        })
    }
}