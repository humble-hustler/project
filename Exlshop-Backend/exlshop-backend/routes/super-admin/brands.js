const auth = require('../auth');
const async = require('async');
const express = require('express');
const router = express.Router();

router.get('/team', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    async.parallel({
        roles: (callback) => {
            models.Users.GetRoles({ all: false }, (err, roles) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, roles);
                }
            })
        },
        brandLocations: (callback) => {
            models.Locations.GetAll((err, brandLocations) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, brandLocations)
                }
            })
        },
        users: (callback) => {
            models.Users.GetUsers({all :false}, (err, users) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, users)
                }
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/team', {
                title: 'Exlshop - Team Members',
                menuActive: 'shopusers',
                submenuActive: '',
                roles: result.roles,
                brandLocations: result.brandLocations,
                users: result.users,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js','/global/vendor/toastr/toastr.min.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/teams.js', '/global/vendor/select2/select2.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/select2/select2.css']
            });
        }
    })
})

router.get('/', auth.checkPermission(['super-admin']), (req, res) => {
    res.render('super-admin/brands', {
        title: 'Exlshop - Brands',
        menuActive: 'shops',
        submenuActive: '',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js','/global/vendor/toastr/toastr.min.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/brands.js'],
        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
    });
})

router.post('/view-all', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['a.id', 'a.name', 'location_count', 'a.is_active'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    models.Brands.GetAll({ all: true, offset, limit, search, orderByColumn, orderByValue }, (err, brands) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ draw: req.query.draw, recordsTotal: brands.total, recordsFiltered: brands.total, data: brands.brands })
        }
    })
})

router.get('/add', auth.checkPermission(['super-admin']), (req, res) => {
    res.render('super-admin/add-brand', {
        title: 'Exlshop - Add Brand',
        menuActive: 'shopusers',
        submenuActive: '',
        scripts: ['/global/vendor/switchery/switchery.js','/global/vendor/toastr/toastr.min.js', '/js/page-level/add-brand.js'],
        styles: ['/global/vendor/switchery/switchery.css']
    });
})

router.post('/add', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const active = post.active 
    const name = post.name;
    const models = req.Core.Models;
    models.Brands.Add({ name, active }, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later')
            res.redirect('back')
        } else {
            req.flash('success', 'New Brand added successfully!')
            res.redirect('/super-admin/brands')
        }
    })
})

router.get('/members', auth.checkPermission(['super-admin']), (req, res) => {
    var models = req.Core.Models;
    models.Common.GetStates({ countryId: 101 }, (err, states) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/members', {
                title: 'Exlshop - Members',
                menuActive: 'users',
                submenuActive: '',
                states: states,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/members.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/select2/select2.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css', '/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css']
            });
        }
    })
})

router.get('/:id', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const brandId = req.params.id;
    const models = req.Core.Models;
    async.parallel({
        brandData: (callback) => {
            models.Brands.GetById({ id: brandId }, (err, brand) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, brand)
                }
            })
        },
        locationData: (callback) => {
            models.Locations.GetByBrandId({ brandId }, (err, locations) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, locations)
                }
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/403')
        } else {
            res.render('super-admin/single-brand', {
                title: 'FitBiz - Brand',
                brand: result.brandData,
                menuActive: 'shops',
                submenuActive: '',
                brandId,
                locations: result.locationData,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/single.brand.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/select2/select2.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css', '/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css']
            });
        }
    })
})

router.post('/single-shop-details/:brandId',  (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const brandId = req.params.brandId
    console.log(req.params, "paramssssss")

    models.Locations.GetByBrandId1({ brandId: parseInt(brandId), offset, limit, search }, (err, locations) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ draw: req.query.draw, recordsTotal: locations.total, recordsFiltered: locations.total, data: locations.locations })
        }
    })
})

router.post('/search/location', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        text: post.text
    }
    models.Locations.SearchLocation(options, (err, locations) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, locations })
        }
    })
});

router.post('/edit', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    models.Brands.UpdateBrand({ name: post.name, id: post.id, stat: post.active }, (err) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true })
        }
    })
});
module.exports = router;