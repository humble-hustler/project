const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
const moment = require('moment');
const async = require('async');
module.exports = {

    'orders-view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const post = req.body;
            const offset =0;
            const limit = 1000;
            const search = req.search ? req.search : false;
            const filter = req.filter ? req.filter : false;
            const orderByArr = ['a.created_date','a.id','member_name','packages','a.total_amount'];;
            const orderByColumn = '';
            const orderByValue = '';
            // const userId=req.session.user.id;
            // const locationId=req.session.user.currentLocation.id;
            const userId=req.user_id;
            const locationId=req.location_id;
            model.Orders.GetAllShopOrders({userId,locationId,offset, limit, search, orderByColumn, orderByValue, filter}, (err, orders) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, {success: true, draw: req.query, recordsTotal: orders.total, recordsFiltered: orders.total, data: orders.orders});
                }
            })
        }
    },

    'view-single-order': function (model, req, method, cb) {
        if (method === 'POST') {
            const orderId = req.orderId;
            const locationId = req.locationId
            async.auto({
                order: (cb) => {
                    model.Orders.GetSingle({orderId}, (err, order) => {
                        cb(err ? err : null, order)
                    })
                },
                brandDetails : (cb) => {
                    model.Locations.GetById({locationId}, (err, brand) => {
                        cb(err ? err : null, brand)
                    })
                },
                orderProducts: (cb) => {
                    model.Orders.GetProducts({orderId}, (err, orderProducts) => {
                        cb(err ? err : null, orderProducts)
                    })
                },
                user: ['order',(result,cb) => {
                    var userId = result.order.users_id;
                    model.Users.GetSingle({userId}, (err, user) => {
                        cb(err ? err : null, user)
                    })
                }],
                getShippingCharges: (cb) => {
                    model.Orders.getShippingCharges({offset:0, limit:10, locationId}, (err, record)=>{
                        cb(err ? err : null, record.record)
                    })
                },
                getExlShopDelDetails: (cb) => {
                    model.Orders.getExlShopDelDetails({orderId}, (err, delDetails) => {
                        cb(err ? err : null, delDetails)
                    })
                },
                order_status: (cb) => {
                    model.Orders.getorderstatus((err, order_status) => {
                        cb(err ? err : null, order_status)
                    })
                },
                order_status_history: (cb) => {
                    model.Orders.getorderstatushistory({orderId}, (err, order_status_history) => {
                        cb(err ? err : null, order_status_history)
                    })
                },
            },function(err,result){
                if(err){
                    cb(err)
                }else{
                    cb(false,{success:true,order: result.order,orderProducts: result.orderProducts,user: result.user})
                    
                }
            })
        }
    },

    'view-user-orders': function (model, req, method, cb) {
        if (method === 'GET') {
            const orderId = req.id;
            const post = req.body;
            const offset =0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = '';
            const userId=req.user_id;
            const locationId=req.location_id;
            async.auto({
                orders: (cb) => {
                    model.Orders.GetAll({userId,limit:100,offset:0,orderByColumn:'a.created_date',orderByValue:'desc'}, (err, orders) => {
                        cb(err ? err : null, orders.orders)
                    })
                },
                orderProducts: ['orders',(result,cb) => {
                    var orderIdsArr=[];
                    result.orders.forEach(function(o){
                        orderIdsArr.push(o.id);
                    })
                    var orderId = orderIdsArr.join(',');
                    model.Orders.GetProducts({orderId}, (err, orderProducts) => {
                        cb(err ? err : null, orderProducts)
                    })
                }],
                user: (cb) => {
                    model.Users.GetSingle({userId}, (err, user) => {
                        cb(err ? err : null, user)
                    })
                }
            },function(err,result){
                if(err){
                    cb(err)
                }else{
                    cb(false,{success:true,orders: result.orders,orderProducts: result.orderProducts,user: result.user})
            
                }
            })
        }
    },
    'order-statusupdate': function (model, req, method, cb) {
        if (method === 'POST') {
            const statusId=req.status_id;
            const orderId=req.order_id;
            model.Orders.updatestatus({orderId,statusId}, (err, orders) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });    
                } else {
                    cb(false, { success: true }) }
            })
        }
    },
    'getorderstatus': function (model, req, method, cb) {
        if (method === 'GET') {
            model.Orders.getorderstatus((err, order_status) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });    
                } else {
                    cb(false, { success: true,order_status }) }
            })
        }
    },

    'getexlshopproducts' : function(model, req, method, cb) {
        if (method === 'GET') {
            const id=req.id
            model.Orders.getOrderDetails({id},(err, data) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });    
                } else {
                    cb(false, { success: true,data })
                }
            })
        }
    },
   
    'assignedTo': function(model, req, method, cb){
        if(method === 'POST'){
            const options ={
                assignedId: req.assignedId,
                orderId: req.orderId
            }
            model.Orders.assignStaff(options, (err, data)=>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });    
                }else{
                    cb(false,{success:true, data})
                }
            })
        }
    },

    'settlement-list': function(model, req, method, cb){
        if(method === "POST"){
            const options= {
                brandId : req.brandId,
                offset : 0,
                 limit : 1000,
                 search : req.search ? req.search : false,
                 filter : req.filter ? req.filter : false,
                 orderByArr : '',
                 orderByColumn : '',
                 orderByValue : ''
            }
            model.ShopProducts.getLocationrecordfirst(options, (err, settlement)=>{
                if(err){
                    console.log(err)
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });    
                }else{
                    cb(false,{success:true, settlement})
                }
            })
        }
    },

    'location-list': function(model, req, method, cb){
        if(method === "POST"){
            const date = req.period
            var day = date.split("-")[2]
            var month = date.split("-")[1]
            var year = date.split("-")[0]
            var  offset = 0;
            var limit = 1000;
            const param = {
                period : date
            }

            model.ShopProducts.getLocationrecord({day, month, year, param, limit, offset}, (err, locationList)=>{
                if(err){
                    console.log(err)
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });    
                }else{
                    cb(false,{success:true, locationList})
                }
            })
        }
    },

    'order-list': function(model, req, method, cb){
        if(method === "POST"){
            const date = req.period
            var day = date.split("-")[2]
            var month = date.split("-")[1]
            var year = date.split("-")[0]
            var  offset = 0;
            var limit = 1000;
            const param = {
                period : date,
                name : req.name
            }

            model.ShopProducts.getLocationOrderRecord({day, month, year, param, limit, offset}, (err, orderList)=>{
                if(err){
                    console.log(err)
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });    
                }else{
                    cb(false,{success:true, orderList})
                }
            })
        }
    }
} 