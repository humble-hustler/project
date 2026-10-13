const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const { response } = require('express');
const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
module.exports = {
    'login': function (model, req, method, cb) {
        if (method === 'POST') {
            const { email, password } = req;
            model.Users.Login({ email, password }, (err, user) => {
                if (err) {
                    cb(true, { success: false });
                }
                else {
                     if (user.role_name === 'super-admin') {
                        cb(false, { success: true, data: user });
                    }
                    else if(user.role_name === 'trainer')
                    {
                        cb(false, { success: true, data: user });
                    }
                    else {
                        model.Users.GetAssignedLocations({ userId: user.id }, (err, locations) => {
                            if (err) {
                                cb(true, { success: false });
                            } else {
                                const device_token = req.device_token
                                model.Users.FcmToken({user_id: user.id, device_token}, (err, data) =>{
                                    if(err){
                                        cb(true, { success: false });
                                    }else{
                                        cb(false, { success: true, user: user, locations: locations});
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    },
    'verification-email-send': function (model, req, method, cb) {
        if (method === 'POST') {
            email = req.email
            model.Users.SendVerificationEmail({ email }, (err, valid) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true });
                }
            })

        }

    },
    'update-password': function (model, req, method, cb) {
        if (method === 'POST') {
            var token = req.token;
            var password = req.password;
            model.Users.forgotPassword({ token, password }, (err, valid) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true });
                }
            })

        }

    },
    'splashScreen': function (model, req, method, cb) {
        if (method === 'POST') {
            model.Users.userDetails({ userId: req.user_id }, (err, userDetails) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, userDetails });
                }

            })

        }

    },

    'profile' : function (model, req, method, cb) {
    
        if (method === 'POST') {
            const userId = req.userId;
            model.Users.getUserProfile({userId},(err, profile)=>{
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, profile: profile });
                }
            })
        }

    },

    'registerAdmin': function(model, req, method, cb){
        if(method === "POST"){
            const registerOpts = {
                name: req.name,
                shop_name: req.shop_name,
                shop_service:req.shop_service,
                mobile:req.mobile,
                shop_adress:req.shop_adress
            }
            model.Users.registerAdmin(registerOpts, (err, admin)=>{
                if(err){
                    cb(true, {success: false})
                }else{
                    cb(false, { success: true, admin:admin })
                }
            })
        }
    },

    'registerShop': function(model, req, method, cb){
        if(method === "POST"){
            const registerOpts = {
                fname: req.fname,
                lname: req.lname,
                email: req.email,
                phone: req.phone,
                password: req.password,
                panno : req.panno,
                shopactno : req.shopactno,
                shopname : req.shopname,
                roles_id : req.roles_id,
                shop_service:req.shop_service,
            }
            model.Users.registerShop(registerOpts, (err, admin)=>{
                if(err){
                    cb(true, {success: false})
                }else{
                    cb(false, { success: true, admin:admin })
                }
            })
        }
    }
}