const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
const moment = require('moment');
const async = require('async');
module.exports = {
    'Grouporders-view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const post = req.body;
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = '';
            const userId = req.user_id;
            const locationId = req.location_id;
            model.GroupOrders.GetGroupOrders({ userId, locationId, offset, limit, search, orderByColumn, orderByValue }, (err, gorders) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true, draw: req.query, recordsTotal: gorders.total, recordsFiltered: gorders.total, data: gorders.gorders });
                }
            })
        }
    },
    'add-group': function (model, req, method, cb) {
        if (method === 'POST') {
            var options = {
                locationId: req.location_id,
                userId: req.user_id,
                groupname: req.group_name,
            }
            model.GroupOrders.Add(options, (err, productId) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, productId: productId })
                }
            })

        }
    },
    'GetPincodes': function (model, req, method, cb) {
        if (method === 'POST') {
            var userId = req.user_id
            model.GroupOrders.GetPincodes({userId:userId}, (err, orderaddress) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true,  data: orderaddress});
                }
            })
        }
    },
    'GetGroupOrdersByLocation': function (model, req, method, cb) {
        if (method === 'POST') {
            var userId = req.user_id;
            const locationId = req.location_id;
            const zipId=req.zip_id;
            const offset = 0;
            const limit = 1000;
            model.GroupOrders.GetOrdersByLocation({userId:userId,locationId:locationId,zipId:zipId, limit, offset}, (err, orderaddress) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true,  data: orderaddress});
                }
            })
        }
    },
    'GetGroupZipcode': function (model, req, method, cb) {
        if (method === 'GET') {
            var userId = req.user_id;
            const locationId = req.location_id;
            const groupId=req.group_id;
            model.GroupOrders.GetGroupLocations({userId:userId,locationId:locationId,groupId:groupId}, (err, orderaddress) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true,  data: orderaddress});
                }
            })
        }
    }
} 