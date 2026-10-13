const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const { options } = require('toastr');

module.exports = {
    'details': function (model, request, method, cb) {
        if (method === 'POST') {
            const userId = request.userId;
            const locationId = request.locationId;
            const roleId = request.role_id;
            var startDate = request.startDate;
            var endDate = request.endDate;
            async.parallel({
                orderOptions : (cb) => {
                    model.Locations.GetOrderOptions({locationId}, (err,orderOptions) => {
                        cb(err ? err : null, orderOptions[0])
                    })
                },
                subscribedPlan : (cb) => {
                    model.Subscription.getsubscribed_details({userId,locationId}, (err,planDetails) => {
                        cb(err ? err : null, planDetails[0])
                    })
                },
                bankDetails : (cb) => {
                    model.Locations.GetBankDetails({locationId}, (err, bankDetails) => {
                        cb(err ? err : null, bankDetails)
                    })
                },
                shopProducts: (cb) => {
                    model.ShopProducts.GetProductsByLocationId1({locationId}, (err, products) => {
                        cb(err ? err : null, products[0].count)
                    })
                },
                getDeliveryOption: (cb) => {
                    model.Orders.getDeliveryOption({locationId}, (err, record)=>{
                        cb(err ? err : null, record)
                    })
                },
                totalOrder: (cb) => {
                    if(roleId == 9){
                        model.Users.GetTotalOrdersForStaff({userId,locationId, offset: 0, limit:100, startDate, endDate, currentMonthOnly: 1}, (err, totalOrder) => {
                            cb(err ? err : null, totalOrder)
                        })
                    } else {
                        model.Users.GetTotalOrders({userId,locationId, offset: 0, limit:100, startDate, endDate, currentMonthOnly: 1}, (err, totalOrder) => {
                            cb(err ? err : null, totalOrder)
                        })
                    }
                },
                ordersCount: (cb) => {
                    model.Users.GetPendingOrdersForStaff({userId,locationId, offset: 0, limit:100, startDate, endDate, currentMonthOnly: 1}, (err, totalOrder) => {
                        cb(err ? err : null, totalOrder)
                    })
                },
                staffTotal: (cb) => {
                    model.Users.GetBrandUsers({locationId, offset: 0, limit:100}, (err, staffDetails) => {
                        cb(err ? err : null, staffDetails.userdetails[1][0].total)
                    })
                },
                saleTotal: (cb) => {
                    model.Users.LocationSaleTillDate({locationId, startDate, endDate}, (err, saleTotal) => {
                        cb(err ? err : null, saleTotal)
                    })
                },
                paymentReceived: (cb) => {
                    model.Payments.TotalReceivedByLocation({locationId, startDate, endDate}, (err, paymentReceived) => {
                        cb(err ? err : null, paymentReceived)
                    })
                },
                mostorderProducts: (cb) => {
                    model.Users.MostOrderProduct({locationId, offset: 0, limit: 1, startDate, endDate, currentMonthOnly: 1}, (err, members) => {
                        cb(err ? err : null, members)
                    })
                },  
                recentorders: (cb) => {
                    model.Users.Recent_Orders({locationId}, (err, members) => {
                        cb(err ? err : null, members.recentorders)
                    })
                },
                recentordersproducts: (cb) => {
                    model.Users.Recent_Orders_Products({locationId}, (err, members) => {
                        cb(err ? err : null, members.recentorders)
                    })
                },
                eventLogs: (cb) => {
                    model.Members.GetTodayEventByLocation({locationId, startDate, endDate}, (err, eventLogs) => {
                        cb(err ? err : null, eventLogs)
                    })
                },
            }, (err, result) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                } else { 
                    cb(false, {
                        success: true,
                        fw: false,
                        menuActive: 'dashboard',
                        submenuActive: '',
                        orderOptions:result.orderOptions,
                        subscribedPlan:result.subscribedPlan,
                        bankDetails:result.bankDetails,
                        shopProducts:result.shopProducts,
                        getDeliveryOption:result.getDeliveryOption,
                        totalOrder:result.totalOrder,
                        ordersCount:result.ordersCount,
                        recentorders:result.recentorders,
                        recentordersproducts:result.recentordersproducts,
                        mostorderProducts:result.mostorderProducts,
                        staffTotal:result.staffTotal,
                        saleTotal: result.saleTotal,
                        paymentReceived : result.paymentReceived,
                        eventLogs: result.eventLogs,
                        startDate,
                        endDate,
                    })
                }      
            })
        }  else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    
    'updateOrderDetails' : function(model, request, method, cb){
        if(method === 'POST'){
            const options ={
                brandLocationId : request.brandLocationId,
                minimum_order_amount : request.minimum_order_amount,
                maximum_order_distance : request.maximum_order_distance
            }
            model.Brands.updateOrderDetails(options, (err, data) =>{
                if(err){
                    cb(true, {success: false});
                }else{
                    cb(false, {success : true, data:data})
                }
            })
        }
    },

    'notification' : function(model, req, method, cb){
        if(method === 'POST'){
            const options = {
                user_id : req.user_id,
                locationId : req.locationId
            }
            model.Orders.getStatus(options, (err, notification) =>{
                if(err){
                    cb(true, {success: false});
                }else{
                    cb(false, {success : true, notification:notification})
                }
            })
        }
    }
}
