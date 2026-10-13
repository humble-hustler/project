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
    'location-add-new': function (model, req, method, cb) {
        if (method === 'POST') {
            const brandId = req.brandId;
            const name = req.name;
            model.Locations.Add({brandId, name}, (err,locationId) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false,{ success: true} );
                }
            })
        }
    },
    'add-team-member':function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                fname: req.fname,
                lname: req.lname,
                email: req.email,
                phone: req.phone,
                password: req.password,
                roleId: req.role,
                locationId: req.lid  
            }
            model.Users.Add(options, (err) => {               
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false,{ success: true} );
                }
            })
        }
    },
    'get-all-locations' : function(model,req,method,cb){
        if(method === 'POST'){
            var userId = req.userId;
            model.Users.GetAssignedLocations({userId}, (err, location) => {
                if (err) {
                    cb(true, { success: false})
                } else {
                    cb(false, { success: true,location});
                }
            })
        }
    },
    'update-location' : function(model,req,method,cb){
        const location_name = req.location_name;
        const locationId = req.location_id;

        if(method === 'POST'){
            model.Leads.Update_Location({locationId,location_name}, (err) => {
                if (err) {
                    cb(true, { success: false})
                } else {
                    cb(false, { success: true,message : 'Location Updated'});
                }
            })
        }
    },
    'delete-location' : function(model,req,method,cb){
        if(method === 'POST'){
            const locationId = post.location_id;
            model.Leads.DeleteLocation({locationId}, (err) => {
                if (err) {
                    cb(true, { success: false})
                } else {
                    cb(false, { success: true,message : 'Location Deleted'});
                }
            })
        }
    }
}