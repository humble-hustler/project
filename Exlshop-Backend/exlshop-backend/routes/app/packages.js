/********************************************************/
/***** App dashboard Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();

router.get('/', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    res.render('app/packages', {
        title: 'FitBiz | Packages',
        fw: false,
        menuActive: 'packages',
        submenuActive: '',
        scripts: ['/global/vendor/toastr/toastr.min.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/app/dashboard.js', '/js/app/view-packages.js'],
        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
    })
})

router.post('/view-all', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['name','validity_days','price','is_pt','tax_included','is_active'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;

    models.Packages.GetLocationPackages({locationId, offset, limit, search, orderByColumn, orderByValue}, (err, packages) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: packages.total, recordsFiltered: packages.total, data: packages.packages})
        }
    })
})

router.post('/add', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const options = {
        locationId,
        name: post.name,
        validity: post.validity,
        price: post.price,
        isPt: post.is_pt ? 1 : 0
    }

    models.Packages.Add(options, (err) => {
        if (req.xhr) {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true})
            }
        } else {
            if (err) {
                req.flash('error', 'Some error occurred. Please try again later');
            } else {
                req.flash('success', 'Package added successfully!');
            }
            res.redirect('back')
        }
    })
})

router.post('/search', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const options = {
        locationId,
        keywords: post.keywords
    }
    models.Packages.SearchLocationPackage(options, (err, packages) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, packages})
        }
    })
})

router.post('/update', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;

    models.Packages.UpdateData({col: post.col, val: post.val, packageId: post.packageId}, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/delete', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const packageId = post.package_id;
    const models = req.Core.Models;

    models.Packages.Delete({packageId}, (err) => {
        if (err) {
            res.redirect('/404');
        } else {
            res.redirect('back');
        }
    })
})

module.exports = router;