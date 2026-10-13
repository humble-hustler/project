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
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
module.exports = {
    'orders-view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const post = req.body;
            const offset =0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = '';
            model.Orders.GetAll({offset, limit, search, orderByColumn, orderByValue}, (err, orders) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, {success: true, draw: req.query, recordsTotal: orders.total, recordsFiltered: orders.total, data: orders.orders});
                }
            })
        }
    },

    'dailyOrder' : function(model, req, method, cb){
        if(method === "GET"){
            model.Orders.dailyOrder((err, order)=>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, order:order});
                }
            })
        }
    },

    'weeklyOrder' : function(model, req, method, cb){
        if(method === "GET"){
            model.Orders.weeklyOrder((err, order)=>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, order:order});
                }
            })
        }
    },

    'monthlyOrder' : function(model, req, method, cb){
        if(method === "GET"){
            model.Orders.monthlyOrder((err, order)=>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, order:order});
                }
            })
        }
    },

    'shipping-deatils' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                locationId : req.locationId
            }
            async.auto({
                getDeliveryOption: (cb) => {
                    model.Orders.getDeliveryOption(options, (err, record)=>{
                        cb(err ? err : null, record)
                    })
                },
                brandDetails : (cb) => {
                    model.Locations.GetById(options, (err, brand) => {
                        cb(err ? err : null, brand)
                    })
                },
            }, (err, result) => {
                if (err) {
                    cb(err)
                } else {
                    cb(false, { success: true, getDeliveryOption: result.getDeliveryOption, brandDetails: result.brandDetails, })
                }
            })
        }
    },

    'edit-shopDetails' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                address1 : req.address1,
                address2 : req.address2,
                zip : req.zip,
                cityId : req.cityId,
                stateId : req.stateId,
                countryId : req.countryId,
                phoneno : req.phoneno,
                emailId : req.emailId,
                gstin : req.gstin,
                lat : req.lat,
                lng : req.lng,
                locationId : req.locationId
            }
            model.Brands.updateShopDetails(options, (err, shop) =>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, shop});
                }
            })
        }
    },

    'getShippingCharges' : function(model, req, method, cb) {
        if(method === "POST"){
            const options = {
                offset : 0,
                limit : 1000,
                locationId : req.locationId
            }
            model.Orders.getShippingCharges(options, (err, shippingCharges) =>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, shippingCharges});
                }
            })
        }
    },

    'addShippingCharges' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                range0_5 : req.range0_5,
                range5_10 : req.range5_10,
                range10_20 : req.range10_20,
                range20_40 : req.range20_40,
                range40_60 : req.range40_60,
                range60_100 : req.range60_100,
                rangeMorethan_100 : req.rangeMorethan_100
            }
            model.Orders.addShippingCharges({post : options, user_id: req.user_id, locationId:req.locationId}, (err, record)=>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, record});
                }
            })
        }
    },

    'deleteShippingCharges' : function(model, req, method, cb){
        if(method === "POST"){
        const options = {
            record_id : req.record_id
        }
        model.Orders.deleteShippingCharges(options, (err, data) =>{
            if(err){
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            }else{
                cb(false, {success: true, data});
            }
        })
    }
    },

    'GetStaffList' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                locationId : req.locationId
            }
            model.Orders.GetStaffList(options, (err, staffList) =>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, staffList});
                }
            })
        }
    },

    'setPickupLocation' : function(model, req, method, cb) {
        if(method === "POST"){
            const options ={
                locationId : req.locationId
            }
          
            const url = 'https://apiv2.shiprocket.in/v1/external/auth/login'
                    const loginOpts = {
                        "email": 'info@tapsoft.in',
                        "password": 'Harvey!@3',
                    };
                    const customHeaders = {
                        "Content-Type": "application/json",
                    }
                    fetch(url, {
                        method: "POST",
                        headers: customHeaders,
                        body: JSON.stringify(loginOpts)
                    })
                    .then((response) => response.json())
                    .then((dataOne) => {
                        const pickupData = {
                            "pickup_location": req.pickup_location,
                            "name": req.name,
                            "email": req.email,
                            "phone": req.phone,
                            "address": req.address,
                            "address_2": req.address2,
                            "city": req.city,
                            "state": req.state,
                            "country": req.country,
                            "pin_code": req.pin_code,
                            "lat": req.lat,
                            "long": req.long
                        }
                        const token = {
                        "Content-Type": "application/json",
                            "Authorization": "Bearer" + " " + dataOne.token
                        }
                        fetch("https://apiv2.shiprocket.in/v1/external/settings/company/addpickup", {
                            method: "POST",                                 
                            headers: token,
                            body: JSON.stringify(pickupData)
                        })
                        .then((response) => response.json())
                        .then((addpickup) => {
                            if(addpickup.success == true){
                               
                                model.Orders.updatePickupStatus(options, (err, data) =>{
                                    if(err){
                                        cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                                    }else{
                                        cb(false, {success: true, data});
                                    }
                                })
                            }else{
                                cb(true, { success: false, addpickup});

                            }
                        })
                    })
        }
    },

    'getExlShopDelDetails' : function(model, req, method, cb){
        if(method === 'POST'){
            const options = {
                orderId : req.orderId
            }

            model.Orders.getExlShopDelDetails(options, (err, getExlShopDelDetails) =>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, getExlShopDelDetails});
                }
            })
        }
    },

    'AddbrandExlshopDelDetails' : function(model, req, method, cb){
        if(method === 'POST'){
            const options = {
                order_id: req.order_id,
                user_id : req.user_id,
                locationId : req.locationId,
                weight : req.weight,
                height : req.height,
                length : req.length,
                breadth : req.breadth
            }
            model.Orders.brandExlshopDelDetails(options, (err, data) =>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, data});
                }
            })
        }
    },

    'updatebrandExlshopDelDetails' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                user_id : req.user_id, 
                locationId : req. locationId,
                weight : req.weight,
                height : req.height,
                length : req.length,
                breadth : req.breadth,
                order_id : req.order_id
            }

            model.Orders.updatebrandExlshopDelDetails(options, (err, data) =>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, data});
                }
            })
        }
    },

    'order-status' : function (model, req, method, cb){
        if(method === "GET"){
           model.Orders.getOrderStatus((err, data) =>{
            if(err){
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            }else{
                cb(false, {success: true, data});
            }
           })
        }
    },

    'updateOrderStatus' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                statusId : req.statusId,
                orderId : req.orderId
            }

            model.Orders.updatestatus(options, (err, data)=>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    model.Orders.updateOrderStatusHistory(options, (err, data) =>{
                        if(err){
                            cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                        }else{
                            model.Orders.up_status(options, (err, data)=>{
                                if(err){
                                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                                }else{
                                    cb(false, {success: true, data});
                                }
                            })
                        }
                    })
                }
            })
        }
    },

    'updateOrderDelStatus' : function(model, req, method, cb){
        if(method === "POST"){
            var id = req.id;
            var order_date = req.order_date;
            var pickupLocation = '';
            var custFname = req.custFname;
            var custLname = req.custLname;
            var order_address_1 = req.order_address_1;
            var order_address_2 = req.order_address_2;
            var order_city = req.order_city;
            var order_zip = req.order_zip;
            var order_state = req.order_state;
            var order_country = req.order_country;
            var order_email = req.order_email;
            var order_mo = req.order_mo;
            var products = '';
            var order_total_discount = req.order_total_discount;
            var total_minus_discount = req.total_minus_discount;
            var shipBody = '';
            var status_id = 7;
            var locationName = req.locationName

            model.Orders.getOrderDetails({id},(err, data) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });    
                } else {
                    products = JSON.stringify(data)

                    const url = 'https://apiv2.shiprocket.in/v1/external/auth/login'
                    const loginOpts = {
                        "email": 'info@tapsoft.in',
                        "password": 'Harvey!@3',
                    };
                    const customHeaders = {
                        "Content-Type": "application/json",
                    }                        
                    fetch(url,
                        {
                            method: "POST",
                            headers: customHeaders,
                            body: JSON.stringify(loginOpts)
                        })
                        .then((response) => response.json())
                        .then((dataOne) => {
                            token = {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer" + " " + dataOne.token
                            }
                            fetch("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", {
                                method: "GET",                                 
                                headers: token
                            })
                            .then((response) => response.json())
                            .then((pickup) => {
                                var shipAdd = pickup.data.shipping_address
                                shipAdd.forEach((s) => {
                                    if(locationName == s.pickup_location){
                                        pickupLocation = s.pickup_location
                                    }
                                })
                                fetch("https://apiv2.shiprocket.in/v1/external/channels", {
                                method: "GET",                                 
                                headers: token
                                })
                                .then((response) => response.json())
                                .then((channel) => {
                                    courier_length = req.courier_length
                                    courier_breadth = req.courier_breadth
                                    courier_height = req.courier_height
                                    courier_weight = req.courier_weight
                                    shipBody = {
                                        "order_id": `${id}`,
                                        "order_date": `${order_date}`,
                                        "pickup_location": `${pickupLocation}`,
                                        "channel_id": `${channel.data[0].id}`,
                                        "comment": "fast and furious",
                                        "billing_customer_name": `${custFname}`,
                                        "billing_last_name": `${custLname}`, 
                                        "billing_address": `${order_address_1}`,
                                        "billing_address_2": `${order_address_2}`,
                                        "billing_city": `${order_city}`,
                                        "billing_pincode": `${order_zip}`,
                                        "billing_state": `${order_state}`,
                                        "billing_country": `${order_country}`,
                                        "billing_email": `${order_email}`,
                                        "billing_phone": `${order_mo}`,
                                        "shipping_is_billing": true,
                                        "shipping_customer_name": "",
                                        "shipping_last_name": "",
                                        "shipping_address": "",
                                        "shipping_address_2": "",
                                        "shipping_city": "",
                                        "shipping_pincode": "",
                                        "shipping_country": "",
                                        "shipping_state": "",
                                        "shipping_email": "",
                                        "shipping_phone": "",
                                        "order_items": `${products}`,
                                        "payment_method": "Prepaid",
                                        "shipping_charges": 0,
                                        "giftwrap_charges": 0,
                                        "transaction_charges": 0,
                                        "total_discount": `${order_total_discount}`,
                                        "sub_total": `${total_minus_discount}`,
                                        "length": `${courier_length}`,
                                        "breadth": `${courier_breadth}`,
                                        "height": `${courier_height}`,
                                        "weight": `${courier_weight}`
                                    }
                                    shipBody = JSON.stringify(shipBody)
                                    shipBody = shipBody.replace(/\\/g, '');
                                    shipBody = shipBody.replace(`"[`, "[");
                                    shipBody = shipBody.replace(`]"`, "]")
                                        if(status_id == 7) {
                                            const header = {
                                                "Content-Type": "application/json",
                                                "Authorization": "Bearer" + " " + dataOne.token
                                            }
                                            fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
                                                method: "POST",
                                                headers:header,
                                                body:shipBody                                                        
                                            })
                                            .then((response) => response.json())
                                            .then((order) => {
                                               
                                                const options = {
                                                    statusId: 7,
                                                    orderId: `${id}`,
                                                }
                                                model.Orders.updatestatus(options, (err, data)=>{
                                                    if(err){
                                                        cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                                                    }else{
                                                        model.Orders.updateOrderStatusHistory(options, (err, data) =>{
                                                            if(err){
                                                                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                                                            }else{
                                                                model.Orders.up_status(options, (err, data)=>{
                                                                    if(err){
                                                                        cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                                                                    }else{
                                                                        const options1 = {
                                                                            order_id:id,
                                                                            del_order_id: order.order_id,
                                                                            del_shipment_id: order.shipment_id,
                                                                            del_status: order.status,
                                                                            del_status_code: order.status_code,
                                                                            del_awb_code: order.awb_code,
                                                                            orderId: id,
                                                                            user_id:req.user_id,
                                                                            locationId : req.locationId
                                                                        }
                                                                        model.Orders.updateOrderDelStatus(options1, (err, data) =>{
                                                                            if(err){
                                                                                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                                                                            }else{
                                                                                cb(false, {success: true, data});
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                                
                                                // $.ajax({
                                                //     url : '/app/accounts/updateOrderDelStatus',
                                                //     data :{
                                                //         _csrf: _csrf,
                                                //         order_id:id,
                                                //         del_order_id: order.order_id,
                                                //         del_shipment_id: order.shipment_id,
                                                //         del_status: order.status,
                                                //         del_status_code: order.status_code,
                                                //         del_awb_code: order.awb_code
                                                //     },
                                                //     method: 'POST',
                                                //     success: function (data) {
                                                //         window.location.reload()
                                                //     },
                                                //     error: function (data, status, error) {
                                                //         toastr.error("not successfull")
                                                //     }
                                                // })
                                            })
                                        }
                                             
                                })
                            })
                        }
                    )
                }
            })
               
            }
        },
    
    'setDeliveryOption' : function(model, req, method, cb){
        if(method === "POST"){
            model.Orders.setDeliveryOption({user_id:req.user_id, choice:req.choice, locationId : req.locationId}, (err, data)=>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success: true, data});
                }
            })
        }
    },

   
}