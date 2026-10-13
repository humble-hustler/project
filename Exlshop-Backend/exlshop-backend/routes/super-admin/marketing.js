/********************************************************/
/***** Index Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');

router.get('/', auth.checkPermission(['super-admin']), (req, res) => {
    res.render('super-admin/dashboard', {
        title: 'FitBiz - Admin Dashboard',
        menuActive: '',
        submenuActive: '',
        scripts: ['/js/page-level/dashboard.js']
    });
})

router.get('/leads',auth.checkPermission(['super-admin']), (req,res) => {
	const models = req.Core.Models;
	async.parallel({
        statuses: (callback) => {
            models.SuLeads.Getstatuses( (err, statuses) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null,statuses);
                }
            })
        },
        sources: (callback) => {
            models.SuLeads.GetSources( (err, sources) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, sources)
                }
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/leads', {
		        title: 'FitBiz - Leads',
                menuActive: '',
        		submenuActive: '',
		        statuses: result.statuses,
		        sources: result.sources,
		        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/leads.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js','/global/vendor/select2/select2.js'],
		        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css','/global/vendor/select2/select2.css']
		    });
        }
    })
})
module.exports = router;