/********************************************************/
/***** Index Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');

router.get('/', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    async.parallel(
        {
        totalOrder: (cb) => {
            models.Brands.GetTotalOrders({}, (err, totalOrder) => {
                cb(err ? err : null, totalOrder)
            })
        },
        totalShops:(cb)=>{
            models.Brands.GetTotalShops((err,totalShops)=>{
                cb(err ? err : null, totalShops) 
            })
        },
        totalCustomers:(cb)=>{
            models.Brands.GetTotalCustomers((err,totalCustomers)=>{
                cb(err ? err : null, totalCustomers) 
            })
        },
        totalSales:(cb)=>{
            models.Brands.GetTotalSales((err,totalCustomers)=>{
                cb(err ? err : null, totalCustomers) 
            })
        },
        totalSubscription:(cb)=>{
            models.Brands.totalSubscription((err,totalSubscription)=>{
                cb(err ? err : null, totalSubscription) 
            })  
        }
    
       },(err,result)=>{
        if (err) {
            res.send({success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
        }else{
            res.render('super-admin/dashboard.html', {
                title: 'Exlshop - Admin Dashboard',
                menuActive: 'dashboard',
                submenuActive: '',
                totalOrder:result.totalOrder,
                totalShops:result.totalShops,
                totalCustomers:result.totalCustomers,
                totalSales:result.totalSales,
                totalSubscription:result.totalSubscription,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/select2/select2.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css', '/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css']
        
            })

        }
     
})
})

module.exports = router;