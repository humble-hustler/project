const logger = require('../logger');
const cron = require('node-schedule');
const async = require('async');
const models = require('../models');
const AWS = require('aws-sdk');
const config = require('../config');
const rule = new cron.RecurrenceRule();
const lib = require('../lib');
rule.hour = 8;
rule.minute = 00;
rule.second = 00;
rule.tz = 'Asia/Calcutta';

cron.scheduleJob(rule, (req, res) => {
    async.auto({
        sendBirthdayEmail: function(cb){
            models.Users.GetBirthdays((err, users) => {
                if (err) {
                    console.log(err)
                    cb(err)
                } else {
                    async.eachSeries(users, function(u, cb2){
                        models.Locations.GetById({locationId:u.brand_locations_id}, (err, brandLocation) => {
                            if (err) {
                                console.log(err)
                                cb2(err)
                            } else {
                                models.SmsEmail.GetEmailSingleTemplate({templateName:'birthdays', locationId:u.brand_locations_id}, (err, template) => {
                                    if (err) {  
                                        console.log(err)
                                        cb2(err)
                                    } else {
                                        var message = template.message;
                                        var formatted_message = message.replace('{title}', 'Hi')
                                                                    .replace('{first_name}', u.fname)
                                                                    .replace('{last_name}', u.lname)
                                                                    .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                                    .replace('{phone_no}', brandLocation.phone)
                                                                    .replace('{phone_no1}', brandLocation.phone)
                                                                    .replace(/{(.*?)}/g, '')
                                                                    .replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                        lib.sendEmail({to:u.email, subject:'Happy Birthday!' , message:formatted_message}, function(err){
                                            if(err){
                                                cb2(err)
                                            }else{
                                                models.SmsEmail.StoreEmail({locationId:u.brand_locations_id, sendToMember: 1, sendToLeads: 0, message: formatted_message, email: u.email, memberId: u.id }, (err) => {
                                                    if(err){
                                                        cb2(err)
                                                    }else{
                                                        models.SmsEmail.GetSMSSingleTemplate({templateName:'birthdays', locationId:u.brand_locations_id}, (err, template) => {
                                                            if (err) {  
                                                                console.log(err)
                                                                cb2(err)
                                                            }else{
                                                                var message = template.message;
                                                                var formatted_message = message.replace('{title}', 'Hii')
                                                                                                .replace('{first_name}', u.fname)
                                                                                                .replace('{last_name}', u.lname)
                                                                                                .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                                                                .replace('{phone_no}', brandLocation.phone)
                                                                                                .replace('{phone_no1}', brandLocation.phone)
                                                                                                .replace(/{(.*?)}/g, '').replace(/(^[,\s]+)|([,\s]+$)/g, '');;
                                                             
                                                                models.SmsEmail.StoreSMS({locationId:u.brand_locations_id, sendToMember: 1, sendToLeads: 0, message: formatted_message, phoneNo: u.phone, memberId: u.id }, (err) => {
                                                                    cb2(err ? err : null)
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        });
                                    }
                                })
                            }
                        })
                    }, function(err, res1){
                        if(err){
                            cb(err)
                        }else{
                            cb(null)
                        }
                    })
                }
            })
        },
        sendAnniversaryEmail: function(cb){
            models.Users.GetAnniversaries((err, users) => {
                if (err) {
                    console.log(err)
                    cb(err)
                } else {
                    async.eachSeries(users, function(u, cb2){
                        models.Locations.GetById({locationId:u.brand_locations_id}, (err, brandLocation) => {
                            if (err) {
                                console.log(err)
                                cb2(err)
                            } else {
                                models.SmsEmail.GetEmailSingleTemplate({templateName:'anniversary', locationId:u.brand_locations_id}, (err, template) => {
                                    if (err) {
                                        console.log(err)
                                        cb2(err)
                                    } else {
                                        var message = template.message;
                                        var formatted_message = message.replace('{title}', 'Hi')
                                                                    .replace('{first_name}', u.fname)
                                                                    .replace('{last_name}', u.lname)
                                                                    .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                                    .replace('{phone_no}', brandLocation.phone)
                                                                    .replace('{phone_no1}', brandLocation.phone)
                                                                    .replace(/{(.*?)}/g, '')
                                                                    .replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                        lib.sendEmail({to:u.email, subject:'Happy Anniversary!' , message:formatted_message}, function(err){
                                            if(err){
                                                cb2(err)
                                            }else{
                                                models.SmsEmail.StoreEmail({locationId:u.brand_locations_id, sendToMember: 1, sendToLeads: 0, message: formatted_message, email: u.email, memberId: u.id }, (err) => {
                                                    if(err){
                                                        cb2(err)
                                                    }else{
                                                        models.SmsEmail.GetSMSSingleTemplate({templateName:'anniversary', locationId:u.brand_locations_id}, (err, template) => {
                                                            if (err) {  
                                                                console.log(err)
                                                                cb2(err)
                                                            }else{
                                                                var message = template.message;
                                                                var formatted_message = message.replace('{title}', 'Hii')
                                                                                                .replace('{first_name}', u.fname)
                                                                                                .replace('{last_name}', u.lname)
                                                                                                .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                                                                .replace('{phone_no}', brandLocation.phone)
                                                                                                .replace('{phone_no1}', brandLocation.phone)
                                                                                                .replace(/{(.*?)}/g, '').replace(/(^[,\s]+)|([,\s]+$)/g, '');;
                                                             
                                                                models.SmsEmail.StoreSMS({locationId:u.brand_locations_id, sendToMember: 1, sendToLeads: 0, message: formatted_message, phoneNo: u.phone, memberId: u.id }, (err) => {
                                                                    cb2(err ? err : null)
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        });
                                    }
                                })
                            }
                        })
                    }, function(err, res1){
                        if(err){
                            cb(err)
                        }else{
                            cb(null)
                        }
                    })
                }
            })
        },
        sendRenewalEmail: function(cb){
            models.Users.GetExpiredRenewals((err, users) => {
                if (err) {
                    console.log(err)
                    cb(err)
                } else {
                    async.eachSeries(users, function(u, cb2){
                        models.SmsEmail.GetEmailSingleTemplate({templateName:'memeber-renewal-alert', locationId:u.brand_locations_id}, (err, template) => {
                            if (err) {
                                console.log(err)
                                cb2(err)
                            } else {
                                models.Locations.GetById({locationId:u.brand_locations_id}, (err, brandLocation) => {
                                    if (err) {
                                        console.log(err)
                                        cb2(err)
                                    } else {
                                        var message = template.message;
                                        var formatted_message = message.replace('{title}', 'Hi')
                                                                    .replace('{first_name}', u.fname)
                                                                    .replace('{last_name}', u.lname)
                                                                    .replace('{plan_code}', u.package_name)
                                                                    .replace('{expire_date}', u.expiry_date)
                                                                    .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                                    .replace('{phone_no}', brandLocation.phone)
                                                                    .replace('{phone_no1}', brandLocation.phone)
                                                                    .replace(/{(.*?)}/g, '')
                                                                    .replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                        lib.sendEmail({to:u.email, subject:'Your Membership has Expired!' , message:formatted_message}, function(err){
                                            if(err){
                                                cb2(err)
                                            }else{
                                                models.SmsEmail.StoreEmail({locationId:u.brand_locations_id, sendToMember: 1, sendToLeads: 0, message: formatted_message, email: u.email, memberId: u.id }, (err) => {
                                                    if(err){
                                                        cb2(err)
                                                    }else{
                                                        models.SmsEmail.GetSMSSingleTemplate({templateName:'memeber-renewal-alert', locationId:u.brand_locations_id}, (err, template) => {
                                                            if (err) {  
                                                                console.log(err)
                                                                cb2(err)
                                                            }else{
                                                                var message = template.message;
                                                                var formatted_message = message.replace('{title}', 'Hii')
                                                                                                .replace('{first_name}', u.fname)
                                                                                                .replace('{last_name}', u.lname)
                                                                                                .replace('{plan_code}', u.package_name)
                                                                                                .replace('{expire_date}', u.expiry_date)
                                                                                                .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                                                                .replace('{phone_no}', brandLocation.phone)
                                                                                                .replace('{phone_no1}', brandLocation.phone)
                                                                                                .replace(/{(.*?)}/g, '')
                                                                                                .replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                                             
                                                                models.SmsEmail.StoreSMS({locationId:u.brand_locations_id, sendToMember: 1, sendToLeads: 0, message: formatted_message, phoneNo: u.phone, memberId: u.id }, (err) => {
                                                                    cb2(err ? err : null)
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        });
                                    }
                                })
                            }
                        })
                    }, function(err, res1){
                        if(err){
                            cb(err)
                        }else{
                            cb(null)
                        }
                    })
                }
            })
        },
    }, function(err, result){
        if(!err){
            console.log(result)
            console.log('successfully completed the cron')
        }else{
            console.log(err)
        }
    })
});