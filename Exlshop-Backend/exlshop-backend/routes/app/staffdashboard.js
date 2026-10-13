const auth = require('../auth');
const express = require('express');
const router = express.Router();

router.get('/', auth.checkPermission([ 'manager', 'operator', 'trainer','member']), (req, res) => {
    const models = req.Core.Models;

    models.Users.GetRoles({all: false}, (err, roles) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    res.render('app/staffdashboard.html', {
                        title: 'Exlshop | Staff Dashboard',
                        fw: false,
                        menuActive: 'users',
                        submenuActive: '',
                        roles,
                        states,
                        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/view-users.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
                    })            
                }
            })
        }
    })
})

module.exports = router;