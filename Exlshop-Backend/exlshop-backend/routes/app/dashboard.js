/********************************************************/
/***** App dashboard Routes *****/
/********************************************************/
const async = require('async');
const _ = require('lodash');
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const moment  = require('moment');
const axios = require('axios');
const config = require("../../config")

router.get('/', auth.checkPermission(['brand-admin', 'manager', 'operator', 'staff']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const userId = req.session.user.id;
    const user = req.session.user;
    const role_id = req.session.user.role_id;
    var startDate =null, endDate=null;
    if(req.query.from_date || req.query.to_date) {
        startDate = req.query.from_date;
        endDate = req.query.to_date;
    }
    axios.post(config.app.hostname + '/api/v1/dashboard/details', {
        locationId,
        userId,
        startDate,
        endDate,
        user,
        role_id
    })
    .then((response) => {
        if(response.data.success)
        {
            res.render('app/dashboard', {
                fw: false,
                menuActive: 'dashboard',
                submenuActive: '',
                orderOptions:response.data.orderOptions,
                subscribedPlan:response.data.subscribedPlan,
                bankDetails:response.data.bankDetails,
                shopProducts:response.data.shopProducts,
                getDeliveryOption:response.data.getDeliveryOption,
                totalOrder:response.data.totalOrder,
                ordersCount:response.data.ordersCount,
                recentorders:response.data.recentorders,
                recentordersproducts:response.data.recentordersproducts,
                mostorderProducts:response.data.mostorderProducts,
                staffTotal:response.data.staffTotal,
                saleTotal: response.data.saleTotal,
                paymentReceived: response.data.paymentReceived,
                // memberTotal: result.memberTotal,
                // leadTotal: result.leadTotal.total,
                // totalReceived: result.totalReceived,
                // expiringPlans: result.expiringPlans,
                // outstandingPayments: result.outstandingPayments,
                // trialBookedTotal: _.filter(result.leadTotal.leads, function (l) {
                //     if (l.trial_booked == 1)
                //         return l
                // }).length,
                eventLogs: response.data.eventLogs,
                startDate,
                endDate,
                // mySchedules: result.mySchedules,
                // myWorkoutPlans: result.myWorkoutPlans,
                title: 'Exlshop | Dashboard',
                scripts: ['/js/app/dashboard.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js'],
                styles: ['/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
            })
        }
    });
})

router.get('/:id', auth.checkPermission(['brand-admin', 'manager', 'operator', 'staff']), (req, res) => {
    const models = req.Core.Models;
    var userId = req.session.user.id
    var locationId = parseInt(req.params.id);
    req.session.user.currentLocation = _.find(req.session.user.assignedLocations, {id: locationId});
    models.Subscription.getsubscribed_details({userId,locationId}, (err,planDetails) => {
        if(err) {
            callback(err)
        } else {
            if (planDetails[0] && planDetails[0].remaining_days <= 0) {
                models.Subscription.deactivatePlan({userId,locationId,razorpay_order_id:planDetails[0].razorpay_order_id, razorpay_payment_id:planDetails[0].razorpay_payment_id}, (err,planDetails) => {
                    if(err) {
                        res.send(err)
                    } else {
                        res.redirect('back');
                    }
                })
            } else {
                res.redirect('back');
            }
        }
    })
})

module.exports = router;