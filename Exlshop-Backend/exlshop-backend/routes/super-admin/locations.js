const auth = require('../auth');
const async = require('async');
const express = require('express');
const router = express.Router();

router.get('/view/:id', auth.checkPermission(['super-admin']), (req, res) => {
    const locationId = req.params.id;
    const models = req.Core.Models;
    async.auto({
        locationInfo: (callback) => {
            models.Locations.GetById({locationId}, (err, location) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, location)
                }
            })
        },
        states: (callback) => {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, states)
                }
            })
        },
        cities: ['locationInfo', (result, callback) => {
                models.Common.GetCities({stateId: result.locationInfo.state_id}, (err, states) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, states)
                    }
                })
            }],
        roles: (callback) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, roles)
                }
            })
        },
        users: (callback) => {
            models.Users.GetUsers({locationId}, (err, users) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, users)
                }
            })
        },
        uploadedDocuments: (callback) => {
            models.Locations.getDocuments({locationId}, (err, documents) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, documents)
                }
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/single-location', {
                title: 'FitBiz - Add Location',
                menuActive: 'shops',
        		submenuActive: '',
                locationInfo: result.locationInfo,
                states: result.states,
                cities: result.cities,
                roles: result.roles,
                users: result.users,
                documents: result.uploadedDocuments,
                scripts: ['/js/page-level/single-location.js','/global/vendor/toastr/toastr.min.js','/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js'],
                styles: ['/global/vendor/toastr/toastr.min.css','/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
            });
        }
    })
})

router.post('/add-new', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const brandId = post.brandId;
    const name = post.name;
    const models = req.Core.Models;
    models.Locations.Add({brandId, name}, (err,locationId) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.send({ success: true })}
    })
})

router.post('/update', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    models.Locations.Update({col: post.col, value: post.value, locationId: post.locationId}, (err) => {
        if (err) {
            res.status(503).send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/updateActiveStatus', auth.checkPermission(['super-admin']), (req, res) =>{
    const models = req.Core.Models;
    models.Locations.updateActiveStatus(req.body, (err) =>{
        if(err){
            res.status(503).send({success: false})
        }else{
            res.send({success: true})
        }
    })
})
module.exports = router;