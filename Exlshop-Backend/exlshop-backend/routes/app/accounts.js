/********************************************************/
/***** App Accounts Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const moment = require('moment');

router.post('/view-all-orders', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const userId=req.session.user.id;
    const locationId=req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['a.created_date','a.id','member_name','packages','a.total_amount'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const roleId = req.session.user.role_id;
    if(roleId == 9) {
        models.Orders.GetAllShopOrdersForStaff({userId,locationId,offset, limit, search,filter, orderByColumn, orderByValue}, (err, orders) => {
            if (err) {
                res.send({success: false})
            } else {
               res.send({success: true, draw: req.query.draw, recordsTotal: orders.total, recordsFiltered: orders.total, data: orders.orders})
            }
        })
    } else {
        models.Orders.GetAllShopOrders({userId,locationId,offset, limit, search,filter, orderByColumn, orderByValue}, (err, orders) => {
            if (err) {
                res.send({success: false})
            } else {
               res.send({success: true, draw: req.query.draw, recordsTotal: orders.total, recordsFiltered: orders.total, data: orders.orders})
            }
        })
    }
})

router.get('/view/order/:id', auth.checkPermission(['brand-admin', 'manager', 'staff']), (req, res) => {
    const models = req.Core.Models;
    const locationId=req.session.user.currentLocation.id;
    const orderId = req.params.id;
    async.auto({
        order: (cb) => {
            models.Orders.GetSingle({orderId}, (err, order) => {
                cb(err ? err : null, order)
            })
        },
        brandDetails : (cb) => {
            models.Locations.GetById({locationId }, (err, brand) => {
                cb(err ? err : null, brand)
            })
        },
        orderProducts: (cb) => {
            models.Orders.GetProducts({orderId}, (err, orderProducts) => {
                cb(err ? err : null, orderProducts)
            })
        },
        user: ['order',(result,cb) => {
            var userId = result.order.users_id;
            models.Users.GetSingle({userId}, (err, user) => {
                cb(err ? err : null, user)
            })
        }],
        getShippingCharges: (cb) => {
            models.Orders.getShippingCharges({offset:0, limit:10, locationId}, (err, record)=>{
                cb(err ? err : null, record.record)
            })
        },
        getExlShopDelDetails: (cb) => {
            models.Orders.getExlShopDelDetails({orderId}, (err, delDetails) => {
                cb(err ? err : null, delDetails)
            })
        },
        order_status: (cb) => {
            models.Orders.getorderstatus((err, order_status) => {
                cb(err ? err : null, order_status)
            })
        },
        order_status_history: (cb) => {
            models.Orders.getorderstatushistory({orderId}, (err, order_status_history) => {
                cb(err ? err : null, order_status_history)
            })
        },
    },function(err,result){
        if(err){
            res.redirect('/404')
        }else{
            res.render('app/single-order', {
                title: 'Exlshop - Order',
                brandDetails: result.brandDetails,
                order: result.order,
                orderProducts: result.orderProducts,
                user: result.user,
                order_status:result.order_status,
                order_status_history:result.order_status_history,
                getShippingCharges:result.getShippingCharges,
                getExlShopDelDetails:result.getExlShopDelDetails,
                scripts: ['/global/vendor/select2/select2.js','/js/page-level/single-order.js'],
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
            models.Orders.GetAll({userId,limit:100,offset:0,orderByColumn:'a.created_date',orderByValue:'desc'}, (err, orders) => {
               
                cb(err ? err : null, orders.orders)
            })
        },
        orderProducts: ['orders',(result,cb) => {
            var orderIdsArr=[];
            result.orders.forEach(function(o){
                orderIdsArr.push(o.id);
            })
            var orderId = orderIdsArr.join(',');
            models.Orders.GetProducts({orderId}, (err, orderProducts) => {
                cb(err ? err : null, orderProducts)
            })
        }],
        user: (cb) => {
            models.Users.GetSingle({userId}, (err, user) => {
                cb(err ? err : null, user)
            })
        }
    },function(err,result){
        if(err){
            console.log(err)
            res.redirect('/404')
        }else{
            res.render('app/single-user-orders', {
                title: 'Exlshop - Order',
                orders: result.orders,
                orderProducts: result.orderProducts,
                user: result.user,
                scripts: ['/js/page-level/single-user-orders.js']        
            });
        }
    })
})

router.post('/updatestatus', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const statusId=req.body.status_id;
    const orderId=req.body.order_id;
    models.Orders.updatestatus({orderId,statusId}, (err, orders) => {
        if (err) {
            res.send({success: false})
        } else {
            models.Orders.updateOrderStatusHistory({orderId,statusId}, (err, orders) => {
                if (err) {
                    res.send({success: false})
                } else {
                    models.Orders.up_status({orderId,statusId}, (err, orders) => {
                        if (err) {
                            res.send({success: false})
                        } else {
                            res.send({success: true, draw: req.query.draw, recordsTotal: orders.total, recordsFiltered: orders.total, data: orders.orders})
                        }
                    })    
                }
            })        
        }
    })
})

router.post('/updateOrderDelStatus', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const user_id = req.session.user.id
    const locationId=req.session.user.currentLocation.id;
    const orderId=req.body.order_id;
    const del_order_id = req.body.del_order_id;
    const del_shipment_id= req.body.del_shipment_id;
    const del_status=req.body.del_status;
    const del_status_code = req.body.del_status_code;
    const del_awb_code = req.body.del_awb_code;
    models.Orders.updateOrderDelStatus({user_id,locationId,orderId,del_order_id,del_shipment_id,del_status,del_status_code,del_awb_code}, (err, orders) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, orders:orders})         
        }
    })
})

router.post('/getorderproducts/:orderId', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id
    var locationId = req.session.user.currentLocation.id
    var orderId = req.params.orderId
    models.Orders.GetProducts({ orderId }, (err, orderProducts) => {
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, orderProducts:orderProducts})
        }
    })
})

router.post('/updateShopDetails', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    var user_id = req.session.user.id;
    var locationId = req.session.user.currentLocation.id;
    var address1 = req.body.address1;
    var address2 = req.body.address2;
    var zip = req.body.zip;
    var cityId = parseInt(req.body.cityId);
    var stateId = parseInt(req.body.stateId);
    var countryId = parseInt(req.body.countryId);
    var phoneno = req.body.phoneno;
    var emailId = req.body.emailId;
    var gstin = req.body.gstin;
    var lat = req.body.lat;
    var lng = req.body.lng;
    models.Brands.updateShopDetails({address1, address2, zip, cityId, stateId, countryId, phoneno, emailId, gstin, lat, lng, locationId}, (err, shop) => {
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true})
        }
    })
})



router.get('/sales', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    models.Team.GetTeam({locationId, offset: 0, limit: 100}, (err, team) => {
        if (err) {
            callback(err)
        } else {
            models.Locations.GetPaymentMethods({locationId}, (err, paymentMethods) => {
                if (err) {
                    callback(err)
                } else {
                    res.render('app/accounting-sales', {
                        menuActive: 'accounting-sales',
                        submenuActive: '',
                        users: team.users,
                        paymentMethods,
                        title: 'Exlshop | Orders',
                        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/accounting-sales.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
                    })
                }
            })
        }
    })
})


router.get('/invoices', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    res.render('app/accounting-invoices', {
        menuActive: 'accounting-invoices',
        submenuActive: '',
        title: 'Exlshop | Sales Invoices',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/app/accounting-invoices.js'],
        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
    })
})

router.post('/stafflist', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    models.Orders.GetStaffList({locationId}, (err, staff) => {
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, data:staff})
        }
    })
})

router.post('/assignStaff', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const orderId = req.body.orderId;
    const assignedId = req.body.assignedId;
    models.Orders.assignStaff({orderId,assignedId}, (err, staff) => {
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true})
        }
    })
})

router.post('/invoices', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['a.created_date','a.id','member_name','packages','a.total_amount'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;

    models.Sales.GetInvoices({locationId, offset, limit, search, filter, orderByColumn, orderByValue}, (err, invoices) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: invoices.total, recordsFiltered: invoices.total, data: invoices.invoices})
        }
    })
})

router.get('/invoice-edit/:id', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const saleId = req.params.id;
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    async.auto({
        saleData: (cb) => {
            models.Sales.GetSaleData({saleId}, (err, sale) => {
                cb(err ? err : null, sale)
            })
        },
        memberDetails: ['saleData', (result, cb) => {
                var sale = result.saleData;
                models.Members.GetById({userId: sale.member_id}, (err, locationInfo) => {
                    cb(err ? err : null, locationInfo)
                })
            }],
        saleLine: (cb) => {
            models.Sales.GetSaleLine({saleId}, (err, cart) => {
                cb(err ? err : null, cart)
            })
        },
        saleTaxes: (cb) => {
            models.Sales.GetSaleTaxes({saleId}, (err, taxes) => {
                cb(err ? err : null, taxes)
            })
        },
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            var saleLine = result.saleLine;
            var saleTaxes = result.saleTaxes;
            var subTotal = 0;
            var taxTotalArr = [];

            saleLine.forEach((s) => {
                var price = s.selling_price;
                subTotal += price;
                if (s.tax_included) {
                    var taxSum = _.sumBy(taxes, 'rate');
                    price = price / ((100 + taxSum) / 100);
                }
                var taxArr = [];
                var taxAmount = 0;
                var totalTax = 0;
                var taxes = _.filter(saleTaxes, {package_id: s.id});
                taxes.forEach((t, i) => {
                    taxAmount = price * (t.rate / 100);
                    totalTax += parseFloat(taxAmount);
                    taxObj = {
                        label: `${t.label}`,
                        rate: t.rate,
                        amount: parseFloat(taxAmount)
                    }
                    taxArr.push(taxObj)
                    taxTotalArr.push(taxObj)
                })
                s.total_amount = s.selling_price + totalTax;
                s.taxes = taxArr;
            })
            res.render('app/invoice-edit', {
                title: 'Exlshop - Invoice Update',
                fw: false,
                saleData: result.saleData,
                memberDetails: {
                    fname: result.memberDetails.fname,
                    lname: result.memberDetails.lname,
                    phone: result.memberDetails.phone,
                },
                saleLine,
                saleTaxes,
                scripts: ['/js/app/invoice-edit.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js','/global/vendor/toastr/toastr.min.js'],
                styles: ['/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css','/global/vendor/toastr/toastr.min.css']
            })
        }
    })
})

router.post('/invoice-edit', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;

    async.auto({
        updateSaleItems: (cb) => {
            async.map(post.saleLine, (line, cb1) => {
                models.Sales.updateSaleItems({invoiceId: post.saleId, line: line}, (err) => {
                    cb1(err ? err : null)
                })
            }, (err, result) => {
                cb(err ? err : null)
            })
        },
        saleTaxes: (cb) => {
            models.Sales.GetSaleTaxes({saleId: post.saleId}, (err, taxes) => {
                cb(err ? err : null, taxes)
            })
        },
        saleLine: ['updateSaleItems', (result, cb) => {
            models.Sales.GetSaleLine({saleId: post.saleId}, (err, cart) => {
                cb(err ? err : null, cart)
            })
        }],
        updateSaleAmount: ['updateSaleItems','saleLine',(result, cb) => {
            var saleLine = result.saleLine;
            var saleTaxes = result.saleTaxes;
            var subTotal = 0;
            var totalAmount = 0;

            saleLine.forEach((s) => {
                var price = s.selling_price;
                subTotal += price;
                if (s.tax_included) {
                    var taxSum = _.sumBy(taxes, 'rate');
                    price = price / ((100 + taxSum) / 100);
                }
                var taxArr = [];
                var taxAmount = 0;
                var totalTax = 0;
                var taxes = _.filter(saleTaxes, {package_id: s.id});
                taxes.forEach((t, i) => {
                    taxAmount = price * (t.rate / 100);
                    totalTax += parseFloat(taxAmount);
                })
                totalAmount += s.selling_price + totalTax;
                s.taxes = taxArr;
            })
            models.Sales.UpdateInvoice({invoiceId: post.saleId, notes: post.notes, invoiceDate: moment(post.invoiceDate, 'DD-MM-YYYY').format('YYYY-MM-DD'), totalAmount}, (err, sale) => {
                cb(err ? err : null, sale)
            })
        }]
    }, (err, result) => {
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true})
        }
    })
})

module.exports = router;