const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const { response } = require('express');
const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const { callbackify } = require('util');
const { method } = require('lodash');
const params = new url.URLSearchParams();

module.exports = {
    'getCustomerList' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                locationId : req.locationId,
                offset : 0,
                limit : 1000,
                search : req.search,
                filter : ''
            }

            model.custmor.GetCustmorDetail(options,(err,custmor)=>{
                if (err) {
                    cb(true,{success : false})
                } else {
                    cb(false,{success : true,custmor})
                }
            })
        }
    }
}