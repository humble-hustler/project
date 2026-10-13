const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const { response } = require('express');
const { options } = require('../..');
const url = require('url');
const { products } = require('./shop');
const console = require('console');
const params = new url.URLSearchParams();
module.exports = {
   'popular_product': function (model, req, method, cb) {
        if (method === 'POST') {
        model.ShopProducts.Popular_Products({ offset: 0, limit: 8 }, (err, popular_products) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(null, popular_products);
                }
            })
        }
    },

    'bestSeller_product': function (model, req, method, cb) {
        if (method === 'POST') {
            model.ShopProducts.BestSeller_Products({ offset: 0, limit: 8 }, (err, bestSeller_products) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, bestSeller_products);
                }
            })
        }
    },

    'deals-of-the-day' : function(model, req, method, cb){
        if(method === 'POST'){
            model.ShopProducts.GetAll({offset: 0, limit: 8}, (err, products) =>{
                if(err){
                    cb(err)
                }else{
                    cb(null, {products:products})
                }
            })
        }
    },

    'login': function (model, req, method, cb) {
        console.log(req, "jjjjjjjjjjjjjjj")
        if (method === 'POST') {
            const loginOpts = {
                email: req.email,
                password: req.password,
                method: 1,
                flag:req.flag,
                phone:req.phone,
                name:req.name
            }
            model.Users.SignIn(loginOpts, (err, user) => {
                if (err) {
                    cb(true, { success: false, message: "Email or password inccorect"});
                } else {
                    model.Cart.GetUserCart({ userId: user.id }, (err, cart) => {
                        if (err) {
                            cb(true, { success: false });
                        } else {
                            if (cart) {
                                req.session.cart = JSON.parse(cart.cart)
                            }
                            req.session.user = user;
                            // cb(false, { success: true, user: user });
                            const device_token = req.device_token
                            model.Users.FcmToken({user_id: user.id, device_token}, (err, data) =>{
                                if(err){
                                    console.log(err)
                                    cb(true, { success: false });
                                }else{
                                    cb(false, { success: true, user: user });
                                }
                            })
                        }
                    })
                }
            })
        }
    },

    'sign-up': function (model, req, method, cb) {
        if (method === 'POST') {
            const registerOpts = {
                fname: req.fname,
                lname: req.lname,
                email: req.email,
                phone: req.phone,
                password: req.password
            }
            model.Users.SignUp(registerOpts, (err) => {
                if (err) {
                    console.log(err)
                    if(err.errno == 1062){
                    cb(true, { success: false, message : "Email or password is already exist" });
                }else{
                    cb(true, {success: false})
                }
                } else {
                    const loginOpts = {
                        email: req.email,
                        password: req.password
                    }
                    model.Users.SignIn(loginOpts, (err, user) => {
                        if (err) {
                            cb(true, { success: false });
                        } else {
                            cb(false, { success: true, user: user });
                        }
                    })
                }
            })
        }
    },

    'reset-password-email': function (model, req, method, cb) {
        if (method === 'POST') {
            const loginOpts = {
                email: req.email,
            }
            model.Users.ForgotPasswordEmail(loginOpts, (err, result) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, result });
                }
            })
        }
    },

    'update-password' : function(model, req, method, cb){
        if(method === 'POST'){
            const options = {
                token : req.token,
                confirm_password : req.confirm_password
            }
            model.Users.forgotPassword(options, (err, data) =>{
                if(err){
                    cb(true, { success: false });
                }else{
                    cb(false, { success: true, data});
                }
            })
        }
    },

    'Validate-user':function (model, req, method, cb) {
        if (method === 'GET') {
            const loginOpts = {
                token: req.token
            }
            model.Users.ValidateUser(loginOpts, (err, result) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true,result:result });
                }
            })
        }
    },

    'edit-profile':function (model, req, method, cb) {
        if (method === 'POST') {
            const loginOpts = {
                fname:req.fname,
                lname:req.lname,
                phone:req.phone,
                email: req.email,
                gender:req.gender,
                dob:req.dob,
                id:req.id
            }
            model.Users.editProfile(loginOpts, (err, result) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true });
                }
            })
        }
    },

    'update-user': function (model, req, method, cb) {
        if (method == "POST") {
            const options = {
                id: req.id,
                fname: req.fname,
                lname: req.lname,
                email: req.email,
                phone: req.phone,
            }
            model.Users.Update({ options }, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true, data: options });
                }
            })
        }
    },

    'reset-password': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                oldPassword: req.oldPassword,
                newPassword: req.newPassword,
                userId: req.userId
            }
            model.Users.ResetPassword(options, (err, message) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, message: message });
                }
            })
        }
    },

    'all': function (model, req, method, cb) {
        if (method === 'POST') {
            model.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    model.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                        if (err) {
                            cb(true, { success: false });
                        } else {
                            cb(false, { success: true, products: products, shop_categories: shop_categories });
                        }
                    })
                }
            })
        }
    },

    'email-valid': function (model, req, method, cb) {
        if (method === 'POST') {
            const email = req.email;
            model.Users.IsEmailValid({ email: email }, (err, valid) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    if (valid == true) {
                        cb(false, { success: true, valid });
                    }
                    else {
                        cb(false, { success: false })
                    }
                }
            })
        }
    },

    'phone-valid': function (model, req, method, cb) {
        if (method === 'POST') {
            const phone = req.phone;
            model.Users.IsPhoneValid({ phone: phone }, (err, valid) => {
                if (err) {
                    cb(false, { success: false })
                } else {
                    if (valid == true) {
                        cb(false, { success: true, valid });
                    }
                    else {
                        cb(false, { success: false })
                    }
                }
            })
        }
    },

    'get-cities': function (model, req, method, cb) {
        if (method === 'POST') {
            model.Common.GetCities({ state_id: req.state_id }, (err, cities) => {
                if (err) {
                    cb(false, { success: false })
                } else {
                    cb(false, { success: true, cities });
                }
            })
        }
    },

    'get-states': function (model, req, method, cb) {
        if (method === 'POST') {
            model.Common.GetStates({ country_id: req.country_id }, (err, states) => {
                if (err) {
                    cb(false, { success: false })
                } else {
                    cb(false, { success: true, states });
                }
            })
        }
    },

    'get-country': function (model, req, method, cb) {
        if (method === 'POST') {
            model.Common.GetCountries((err, countries) => {
                if (err) {
                    cb(false, { success: false })
                } else {
                    cb(false, { success: true, countries });
                }
            })
        }
    },

    'profile' : function(model, req,method,cb){
        if(method === 'POST'){
            var userId = req.userId;
            model.Users.getUserProfile(userId,(err,profile)=>{
                if (err) {
                   cb(true,{success : false})
                } else {
                    cb(false , {success:true,profile})
                }
            })
        }
    },

    'update-profile':function(model,req,method,cb){
        if(method === 'POST'){
            const options = {
                id: req.id,
                fname: req.fname,
                lname: req.lname,
                email: req.email,
                phone: req.phone,
                gender : req.gender,
                address_line_1 : req.address_line_1,
                address_line_1 : req.address_line_2,
                zip: req.zip
            }
            model.Users.UpdateUserProfile(options,(err,profile)=>{
                if (err) {
                   cb(true,{success : false})
                } else {
                    cb(false , {success:true,profile})
                }
            })
        }
    }

}
