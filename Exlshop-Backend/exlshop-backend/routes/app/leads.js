/********************************************************/
/***** Leads dashboard Routes *****/
/********************************************************/
const async = require('async');
const auth = require('../auth');
const express = require('express');
const moment = require('moment');
const router = express.Router();
const http = require('http');
const AWS = require('aws-sdk');

router.get('/', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const userId=req.session.user.id;
    async.auto({
        location:(cb)=>{
            models.Users.GetAssignedLocations({userId}, (err, location) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, location);
                }
            })
        },
        status: (cb) => {
            models.Leads.GetStatuses({locationId}, (err, status) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, status);
                }
            })
        },
        sources: (cb) => {
            models.Leads.GetSources({locationId}, (err, sources) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, sources);
                }
            })
        },
        team: (cb) => {
            models.Team.GetTeam({locationId, offset: 0, limit: 100}, (err, team) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, team);
                }
            })
        },
        leadCount: (cb) => {
            models.Leads.GetCountByStatus({locationId}, (err, leadCount) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, leadCount);
                }
            })
        },
        locationInfo: (cb) => {
            models.Locations.GetById({locationId}, (err, location) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, location)
                }
            })
        },
        states: (cb) => {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, states)
                }
            })
        },
        cities: ['locationInfo', (result, cb) => {
            models.Common.GetCities({stateId: result.locationInfo.state_id}, (err, states) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, states)
                }
            })
        }]
    }, function(err, result){
        if(err){
            res.render('/404');
        }else{
            res.render('app/leads', {
                title: 'Exlshop | Branches',
                fw: false,
                menuActive: 'leads',
                submenuActive: '',
                locationInfo:result.locationInfo,
                location:result.location,
                brand_id:result.location.locations[0].brands_id,
                status: result.status,
                sources: result.sources,
                team: result.team.users,
                leadCount: result.leadCount,
                states:result.states,
                cities:result.cities,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/view-leads.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })
        }
    })
})

router.post('/view-all', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const userId = req.session.user.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['id','name','phone','operating_hour_start','operating_hour_end'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    models.Leads.GetLocations({userId,offset, limit, search, filter, orderByColumn, orderByValue}, (err, leads) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: leads.total, recordsFiltered: leads.total, data: leads.locations})
        }
    })
})

router.post('/add', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const userId=req.session.user.id;
    const brandId=req.body.brandid;
    const smsLoginId=req.smsConfig.Id;
    const smsPassword=req.smsConfig.password;
    const SESConfig = {
                        apiVersion:req.awsSESConfig.apiVersion,
                        accessKeyId:req.awsSESConfig.accessKeyId,
                        secretAccessKey:req.awsSESConfig.secretAccessKey,
                        region:req.awsSESConfig.region
                    };

    const options = {
        locationId,
        userId,
        brandId,
        locationname: post.locationname,
        addressline1:post.addressline11,
        addressline2:post.addressline22,
        state:post.state,
        city:post.city,
        pincode:post.pincode,
        phone:post.phone,
        email:post.email,
        lat:post.lat ? post.lat : null,
        lng:post.lng ? post.lng : null,
        lat:post.lat ? post.lat : null,
        lng:post.lng ? post.lng : null,
        operatinghrfrom:post.operatinghrfrom,
        operatinghrto:post.operatinghrto,
        udyogcard_no:post.udyogcard_no,
        pancard_no:post.pancard_no,
        gst_number:post.gst_number
    }

    console.log(req.files, "kkkkkkkkkk")
    var files = req.files;
    var imgArr = []

    imgArr.push(files.pan_file, files.gst_file)

    async.map(imgArr, (i, callback) => {
        var filename = `${moment().unix()}`;
        var imgDir = `${require('path').resolve()}/public/documents/${filename}`;
        i.mv(imgDir, (err) => {
            if(err) {
                callback(err)
            } else {
                callback(null, { filename : filename})
            }
        })
    }, (err, result) => {
        if(err) {
            res.send({ success: false })
        } else {
            models.Leads.Add(options, (err,location) => {
                if (err) {
                    console.log(err)
                    res.redirect('/404')
                }else{
                    var locationId = location
                    models.Leads.AddLocationDocuments({locationId, userId, images:result}, (err, data) => {
                        if(err){
                            req.flash('error', 'Some error occurred. Please try again later!');
                        }else{
                            req.flash('success','Branch Added Successfully!')
                            res.redirect('/app/marketing/leads')
                        }
                    })
                }
            })
        }
    })
})

router.get('/:id', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const leadId = req.params.id;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    models.Leads.GetSingle({leadId}, (err, leadData) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Leads.GetStatuses({locationId}, (err, status) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    models.Leads.GetSources({locationId}, (err, sources) => {
                        if (err) {
                            res.redirect('/404')
                        } else {
                            models.Team.GetTeam({locationId, offset: 0, limit: 100}, (err, team) => {
                                if (err) {
                                    res.redirect('/404')
                                } else {
                                    models.Team.GetTrainers({locationId}, (err, trainers) => {
                                        if (err) {
                                            res.redirect('/404')
                                        } else {
                                            models.Packages.GetLocationPackages({locationId, offset: 0, limit: 100}, (err, packages) => {
                                                if (err) {
                                                    res.redirect('/404')
                                                } else {
                                                    models.Locations.GetFitnessGoals({locationId}, (err, fitnessGoals) => {
                                                        if (err) {
                                                            res.redirect('/404')
                                                        } else {
                                                            models.Leads.GetFollowup({leadId}, (err, followup) => {
                                                                if (err) {
                                                                    res.redirect('/404')
                                                                } else {
                                                                    models.Common.GetStates({countryId: 101}, (err, states) => {
                                                                        if (err) {
                                                                            res.redirect('/404')
                                                                        } else {
                                                                            res.render('app/single-lead', {
                                                                                title: 'FitBiz | Leads',
                                                                                fw: false,
                                                                                menuActive: 'leads',
                                                                                submenuActive: '',
                                                                                status,
                                                                                sources,
                                                                                team: team.users,
                                                                                leadData,
                                                                                trainers,
                                                                                fitnessGoals,
                                                                                packages: packages.packages,
                                                                                followup,
                                                                                states,
                                                                                scripts: ['/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/single-lead.js', '/global/vendor/select2/select2.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                                                                                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
                                                                            })
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.post('/update', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        col: post.col,
        val: post.val,
        leadId: post.leadId
    }
    models.Leads.Update(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            // res.send({success: true})
            return res.redirect('back');
        }
    })
})

router.post('/updateStatus', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        locationId: post.location_id,
        status:post.status
    }
    models.Leads.UpdateStatus(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/update/followup', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        id: post.followup_id,
        text: post.text,
        followupDateTime: moment(post.followup_date_time, 'DD-MM-YYYY hh:mm:ss a').format('YYYY-MM-DD HH:mm:ss'),
        leadId: post.leadId,
        authorId: req.session.user.id
    }
    
    models.Leads.UpdateFollowup(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.redirect('back');
        }
    })
})

router.post('/add/followup', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        text: post.text,
        followupDateTime: post.followup_date_time,
        leadId: post.leadId,
        authorId: post.followup_user
    }
    models.Leads.AddFollowup(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.redirect('back');
        }
    })
})

router.post('/search', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;

    models.Leads.SearchByLocation({locationId, text: post.text}, (err, leads) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, leads})
        }
    })
})

router.post('/delete-location', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = post.location_id;

    models.Leads.DeleteLocation({locationId}, (err) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect('/app/marketing/leads')
        }
    })
})
router.post('/update_location', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const location_name = post.location_name;
    const locationId = post.location_id;
    const address_line11 = post.address_line11;
    const address_line22 = post.address_line22;
    const pincode_id1 = post.pincode_id1;
    const phone1 = post.phone1;
    const email1 = post.email1;
    const state_id1 = post.state_id1 ? post.state_id1 : null;
    const city_id1 = post.city_id1 ? post.city_id1 : null;
    const operatinghr_from1= post.operatinghr_from1;
    const operatinghr_to1 = post.operatinghr_to1;
    const udyog_card_no =post.udyog_card_no;
    const pan_card_no =post.pan_card_no;
    const gst_no=post.gst_no;

    models.Leads.Update_Location({locationId,location_name,address_line11,address_line22,pincode_id1,state_id1,city_id1,phone1,email1,operatinghr_from1,operatinghr_to1,udyog_card_no,pan_card_no,gst_no}, (err) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect('back')
        }
    })
})
router.post('/delete', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const leadId = post.lead_id;

    models.Leads.Delete({leadId}, (err) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect('/app/marketing/leads')
        }
    })
})

router.post('/convert-to-member', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const leadId = post.id;

    models.Leads.ConvertToMember({leadId}, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

module.exports = router;