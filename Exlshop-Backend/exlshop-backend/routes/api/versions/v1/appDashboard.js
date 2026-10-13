const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
const moment = require('moment');
const async = require('async');
module.exports = {
    'Dashboard-view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.user_id;
            const locationId = req.location_id; 
            startDate=0;
            endDate=0;
            async.parallel({
                totalOrder: (cb) => {
                    model.Users.GetTotalOrders({userId,locationId, offset: 0, limit:100, startDate, endDate, currentMonthOnly: 1}, (err, totalOrder) => {
                        cb(err ? err : null, totalOrder)
                    })
                },
                staffTotal: (cb) => {
                    model.Users.GetBrandUsers({locationId, offset: 0, limit:100, startDate, endDate, currentMonthOnly: 1}, (err, staffDetails) => {
                        cb(err ? err : null, staffDetails.userdetails[1][0].total)
                    })
                },
                saleTotal: (cb) => {
                    model.Users.LocationSaleTillDate({locationId, startDate, endDate}, (err, saleTotal) => {
                        cb(err ? err : null, saleTotal)
                    })
                },
                mostorderProducts: (cb) => {
                    model.Users.MostOrderProduct({locationId, offset: 0, limit: 1, startDate, endDate, currentMonthOnly: 1}, (err, members) => {
                        cb(err ? err : null, members)
                    })
                },  
                eventLogs: (cb) => {
                    model.Members.GetTodayEventByLocation({locationId, startDate, endDate}, (err, eventLogs) => {
                        cb(err ? err : null, eventLogs)
                    })
                },
            }, (err, result) => {
                if (err) {
                   cb(true,{success:false})
                } else {
                  cb(false,{success:true,
                        totalOrder:result.totalOrder,
                        mostorderProducts:result.mostorderProducts,
                        staffTotal:result.staffTotal,
                        saleTotal: result.saleTotal,
                        eventLogs: result.eventLogs,
                        startDate,
                        endDate})
                }
            
            })
        
        }
    },

    'totalOrder': function(model, req, method, cb){
        if (method === 'POST') {
            const userId = req.user_id;
            const locationId = req.location_id;

            
            model.Users.getTotalOrders({userId,locationId}, (err, totalOrder)=>{
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    
                    cb(false, {success: true, totalOrder});
                }
            })
        }
    }
} 