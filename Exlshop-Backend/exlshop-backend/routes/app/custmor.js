/********************************************************/
/***** App Accounts Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const moment = require('moment');
// const models = require('models/custmor');
router.get('/', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    res.render('app/custmor', {
        menuActive: 'cust',
        title: 'Exlshop | Customer',
        
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/custmor-detail.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
    })
})

router.post('/view-custmor-detail', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const userId=req.session.user.id;
    const locationId=req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;


    models.custmor.GetCustmorDetail({userId,locationId,search,filter,limit,offset},(err,customer)=>{
        if (err) {
            res.send({success: false})
        } else {
           res.send({success: true, draw: req.query, recordsTotal: customer.total, recordsFiltered: customer.total, data : customer.customer})
        }
    })
});
module.exports = router;


