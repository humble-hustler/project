const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const moment = require('moment');

router.post('/view-all-orders', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['a.created_date', 'a.id', 'member_name', 'packages', 'a.total_amount'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir; 
    models.Orders.GetAllShopOrders({ userId, locationId, offset, limit, search, orderByColumn, orderByValue, filter }, (err, orders) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, draw: req.query.draw, recordsTotal: orders.total, recordsFiltered: orders.total, data: orders.orders })
        }
    })
})
router.get('/view/order/:id', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const orderId = req.params.id;
    async.auto({
        order: (cb) => {
            models.Orders.GetSingle({ orderId }, (err, order) => {
                cb(err ? err : null, order)
            })
        },
        orderProducts: (cb) => {
            models.Orders.GetProducts({ orderId }, (err, orderProducts) => {
                cb(err ? err : null, orderProducts)
            })
        },
        user: ['order', (result, cb) => {
            var userId = result.order.users_id;
            models.Users.GetSingle({ userId }, (err, user) => {
                cb(err ? err : null, user)
            })
        }]
    }, function (err, result) {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/single-order', {
                title: 'Exlshop - Order',
                order: result.order,
                orderProducts: result.orderProducts,
                user: result.user,
                scripts: ['/global/vendor/select2/select2.js', '/js/page-level/single-order.js'],
                styles: ['/global/vendor/select2/select2.css']
            });
        }
    })
})

router.get('/view/user-orders/:id', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const userId = req.params.id;
    async.auto({
        orders: (cb) => {
            models.Orders.GetAll({ userId, limit: 100, offset: 0, orderByColumn: 'a.created_date', orderByValue: 'desc' }, (err, orders) => {
                cb(err ? err : null, orders.orders)
            })
        },
        orderProducts: ['orders', (result, cb) => {
            var orderIdsArr = [];
            result.orders.forEach(function (o) {
                orderIdsArr.push(o.id);
            })
            var orderId = orderIdsArr.join(',');
            models.Orders.GetProducts({ orderId }, (err, orderProducts) => {
                cb(err ? err : null, orderProducts)
            })
        }],
        user: (cb) => {
            models.Users.GetSingle({ userId }, (err, user) => {
                cb(err ? err : null, user)
            })
        }
    }, function (err, result) {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/single-user-orders', {
                title: 'Exlshop - Order',
                orders: result.orders,
                orderProducts: result.orderProducts,
                user: result.user,
                scripts: ['/js/page-level/single-user-orders.js']
            });
        }
    })
})

router.get('/orders', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    models.Orders.getorderstatus((err, order_status) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.render('app/orders', {
                menuActive: 'orders-list',
                submenuActive: '',
                order_status:order_status,
                title: 'Exlshop | Orders',
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/accounting-sales.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })
        }
    })
})

router.post('/setOrderAmountDistance', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    var col = req.body.col
    var val = req.body.val
    models.Orders.setOrderAmountDistance({user_id, col, val, locationId}, (err, data)=>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true})
        }
    })
})

router.post('/setDeliveryOption', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    var choice = req.body.choice
    models.Orders.setDeliveryOption({user_id,choice,locationId}, (err, record)=>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true})
        }
    })
})

router.get('/addShippingCharges', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res)=>{
    const models = req.Core.Models;
    var user_id = req.session.user_id;
    var locationId = req.session.user.currentLocation.id;
    async.auto({
        states : (cb) => {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        getDeliveryOption: (cb) => {
            models.Orders.getDeliveryOption({locationId}, (err, record)=>{
                cb(err ? err : null, record)
            })
        },
        brandDetails : (cb) => {
            models.Locations.GetById({locationId }, (err, brand) => {
                cb(err ? err : null, brand)
            })
        },
    }, (err, result) => {
        if (err) {
            cb(err)
        } else {
            res.render('app/addShippingCharges', {
                fw:false,
                menuActive: 'charges',
                submenuActive:'',
                states:result.states,
                getDeliveryOption:result.getDeliveryOption,
                brandDetails:result.brandDetails,
                title: 'Exlshop | shipping-charges',
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/shipping-charges.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']     
            })
        }
    })
})

router.post('/getShippingCharges', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    const offset = 0;
    const limit = 10;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    models.Orders.getShippingCharges({offset, limit, locationId}, (err, record)=>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, draw: req.query.draw, recordsTotal: record.total, recordsFiltered: record.total, data: record.record})
        }
    })
})

router.post('/deleteShippingCharges', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    var record_id = req.body.record_id
    models.Orders.deleteShippingCharges({record_id}, (err, record)=>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true})
        }
    })
})

router.post("/addShippingCharges", auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res)=>{
    const models = req.Core.Models;
    var post = req.body
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    models.Orders.addShippingCharges({post, user_id, locationId}, (err, record)=>{
        if(err){
            console.log(err)
            res.send({success:false})
        }else{
            res.send({success:true, record:record})
        }
    })
})

router.post('/updatePickupStatus', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    models.Orders.updatePickupStatus({locationId}, (err, record)=>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, record:record})
        }
    })
})

router.post('/brandExlshopDelDetails', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    var order_id = req.body.order_id
    var length = req.body.length
    var weight = req.body.weight
    var height = req.body.height
    var breadth = req.body.breadth
    models.Orders.brandExlshopDelDetails({order_id, user_id, locationId, length, weight, height, breadth}, (err, record)=>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, record})
        }
    })
})

router.post('/updatebrandExlshopDelDetails', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    var order_id = req.body.order_id
    var length = req.body.length
    var weight = req.body.weight
    var height = req.body.height
    var breadth = req.body.breadth
    models.Orders.updatebrandExlshopDelDetails({order_id, user_id, locationId, length, weight, height, breadth}, (err, record)=>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, record})
        }
    })
})

router.post('/getOrderStatusHistory', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    var orderId = req.body.order_id
    models.Orders.getorderstatushistory({orderId}, (err, record)=>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, data:record})
        }
    })
})

router.post('/getstatus', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    models.Orders.getStatus({user_id, locationId}, (err, record)=>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, record:record})
        }
    })
})

router.get('/location', auth.checkPermission(['brand-admin']), (req, res) => {
    const models = req.Core.Models;
    res.render('app/location', {
        title: 'Location - settlement',
        fw: false,
        menuActive: 'settelment',
        submenuActive: '',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/app/location.js'],
        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
    });
})

router.post('/location/location-list', auth.checkPermission(['brand-admin']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr =  ['k.name', 'sub_total'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    // const brandId = req.session.user.currentLocation.brands_id;
    const brandId = req.session.user.currentLocation.id;
 
    models.ShopProducts.getLocationrecordfirst({ offset, limit, search, orderByColumn, orderByValue, brandId},(err, record)=>{
        if(err){
            res.send({success: false})
        }else{
        res.send({success:true, draw: req.query.draw, recordsTotal:record.total, recordsFiltered: record.total, data:record.record})
        }
    })
})

router.get('/view/location/:period', auth.checkPermission(['brand-admin']), (req, res) =>{
    const models = req.Core.Models;
        var a = req.params
        res.render('app/locationlist', {
            title: 'locationlist',
            a,
            fw: false,
            menuActive: 'settelment',
            submenuActive: '',
            scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/app/locationlist.js'],
            styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
        })        
        
})

router.post('/view/locationlist/:period', auth.checkPermission(['brand-admin']), (req, res) => {
    var date = req.params.period
    var day = date.split("-")[2]
    var month = date.split("-")[1]
    var year = date.split("-")[0]
    var param = req.params
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['k.name', 'sub_total'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const brandId = req.session.user.currentLocation.brands_id;

models.ShopProducts.getLocationrecord({offset, limit, search, orderByColumn, orderByValue, param, day,month, year}, (err, record) =>{
    if(err){
        res.send({success:false})
    }else{
        res.send({success:true, draw: req.query.draw, recordsTotal:record.total, recordsFiltered: record.total, data:record.record})
    }
})
})

router.get('/view/location/:locationId/:period', auth.checkPermission(['brand-admin']), (req, res) =>{
    const models = req.Core.Models;
    var a = req.params
    res.render('app/orderlist', {
        title: 'orderlist',
        a,
        fw: false,
        menuActive: 'settelment',
        submenuActive: '',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/app/orderlist.js'],
        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
    })        
})

router.post('/view/location/:locationId/:period', auth.checkPermission(['brand-admin']), (req, res) =>{
    var date = req.params.period
    var day = date.split("-")[2]
    var month = date.split("-")[1]
    var year = date.split("-")[0]
    var param = req.params
    
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['k.name', 'sub_total'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
models.ShopProducts.getLocationOrderRecord({offset, limit, search, orderByColumn, orderByValue, param, day,month, year}, (err, record) =>{
    if(err){
        console.log(err)
        res.send({success:false})
    }else{
        console.log
        res.send({success:true, draw: req.query.draw, recordsTotal:record.total, recordsFiltered: record.total, data:record.record1})
    }
})       
})

router.get('/view/single-user-orders/:id', auth.checkPermission(['brand-admin']), (req, res) => {
    const models = req.Core.Models;
    const userId = req.params.id;
    async.auto({
        orders: (cb) => {
            models.Orders.GetAll({ userId, limit: 100, offset: 0, orderByColumn: 'a.created_date', orderByValue: 'desc' }, (err, orders) => {
                cb(err ? err : null, orders.orders)
            })
        },
        orderProducts: ['orders', (result, cb) => {
            var orderIdsArr = [];
            result.orders.forEach(function (o) {
                orderIdsArr.push(o.id);
            })
            var orderId = orderIdsArr.join(',');
            models.Orders.GetProducts({ orderId }, (err, orderProducts) => {
                cb(err ? err : null, orderProducts)
            })
        }],
        user: (cb) => {
            models.Users.GetSingle({ userId }, (err, user) => {
                cb(err ? err : null, user)
            })
        }
    }, function (err, result) {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('app/single-userorders', {
                title: 'FitBiz - Order',
                orders: result.orders,
                orderProducts: result.orderProducts,
                user: result.user,
                // scripts: ['/js/app/single-user-orders.js']
            });
        }
    })
})

module.exports = router;