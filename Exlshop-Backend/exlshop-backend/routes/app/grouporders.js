const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const moment = require('moment');
router.get('/', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    options = {
        userId : req.session.user.id
    }
    models.GroupOrders.GetPincodes(options, (err, orderaddress) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.render('app/grouporders', {
                title: 'Exlshop | GroupOrders',
                fw: false,
                menuActive: 'grouporders',
                submenuActive: '',
                orderaddress: orderaddress,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/view-grouporders.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })
        }
    })
})
router.post('/add', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const options = {
        locationId:post.location_id,
        userId,
        groupname: post.group_name,
    }  
    models.GroupOrders.Add(options, (err) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.redirect('back');
        }
    })

})

router.post('/update', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const options = {
        locationId:post.location_id,
        group_id:post.group_id,
        groupname: post.group_name,
    }
    models.GroupOrders.Update(options, (err) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true })
        }
    })

})

router.post('/delete', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const options = {
        group_id:post.group_id
    }
    models.GroupOrders.deleteGroup(options, (err) => {
        if (req.xhr) {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true})
            }
        } else {
            if (err) {
                req.flash('error', 'Not Successful, Please Try Again!');
            } else {
                req.flash('success', 'Group Deleted Successfully!');
            }
            res.redirect('back')
        }
    })

})
router.post('/view-all', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['created_date','created_date','lead_name','package_interested','c.source','b.status','owner_name','followup_date_time','followup_date_time'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;

    models.GroupOrders.GetGroupOrders({locationId:post.location_id, groupname: post.group_name,userId,offset, limit, search, filter, orderByColumn, orderByValue},(err,gorders) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({success: true,draw: req.query, recordsTotal: gorders.total, recordsFiltered: gorders.total,  data: gorders.gorders})

        }
    })

})
router.get('/:id', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const groupId = req.params.id;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    models.GroupOrders.GetGroupLocations({locationId:locationId,groupId},(err,gorders) => {
        if (err) {
            res.send({ success: false })
        }else{
            res.render('app/single-group', {
                title: 'Exlshop | GroupOrders',
                fw: false,
                menuActive: 'grouporders',
                submenuActive: '',
                gorders:gorders.gorders,
                script: ["http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"],
               script :["/js/jquery.dataTables.js"],
                scripts: ['/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/single-group.js', '/global/vendor/select2/select2.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })
        }
    })
})
router.get('/zipcode/:zip', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const zipId = req.params.zip;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const userId = req.session.user.id;
    res.render('app/single-grouporder', {
        title: 'Exlshop | GroupOrders',
        fw: false,
        menuActive: 'grouporders',
        zipId :zipId,
        submenuActive: '',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js','/js/app/single-grouporder.js', '/global/vendor/select2/select2.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/select2/select2.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
    })
})

router.post('/zipcode', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const zipId = req.body.zipId;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const userId = req.session.user.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    models.GroupOrders.GetOrdersByLocation({zipId,userId,locationId,offset,limit,search},(err,gorders) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({success: true,draw: req.query.draw, recordsTotal: gorders.total, recordsFiltered: gorders.total,  data: gorders.gorders})
        }
    })
            
})

router.post('/grouplocation-view-all', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['created_date','created_date','lead_name','package_interested','c.source','b.status','owner_name','followup_date_time','followup_date_time'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    models.GroupOrders.GetGroupLocations({locationId:post.location_id, groupname: post.group_name,userId,offset, limit, search, filter, orderByColumn, orderByValue},(err,gorders) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({success: true,draw: req.query.draw, recordsTotal: gorders.total, recordsFiltered: gorders.total,  data: gorders.gorders})

        }
    })

})

router.get('/grouporders', auth.checkPermission(['super-admin']), (req, res) => {
    res.render('app/single-grouporder', {
        title: 'Exlshop - GroupOrders',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/grouporders.js'],
        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
    });
})
router.post('view-orders', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['created_date','created_date','lead_name','package_interested','c.source','b.status','owner_name','followup_date_time','followup_date_time'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const locationId=req.session.user.assignedLocations;
    const cityId=req.city_id;
    models.GroupOrders.GetOrdersByLocation({cityId,userId,locationId,offset, limit, search, filter, orderByColumn, orderByValue},(err,gorders) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({success: true,draw: req.query.draw, recordsTotal: gorders.total, recordsFiltered: gorders.total,  data: gorders.gorders})

        }
    })

})
module.exports = router;