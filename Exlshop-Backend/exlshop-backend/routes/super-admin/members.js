/********************************************************/
/***** Team Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');
const moment = require('moment');

router.post('/view-all', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['member_name','b.phone','b.email','b.gender','brand_location_name','b.birth_date','b.created_date','expiry_date','b.is_active'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter;

    models.Users.GetMembers({all: true, offset, limit, search, orderByColumn, orderByValue, filter}, (err, members) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: members.total, recordsFiltered: members.total, data: members.members})
        }
    })
})

router.post('/add', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;

    const options = {
        fname: post.user_fname,
        lname: post.user_lname,
        email: post.user_email,
        phone: post.user_phone,
        password: post.user_password,
        roleId: post.role_id,
        gender: post.gender,
        address1: post.address_1,
        address2: post.address_2,
        stateId: post.stateId,
        cityId: post.cityId,
        zip: post.zip,
        locationId:post.location_id,
        marital_status: post.marital_status,
        emergency_contact_name: post.emergency_contact_name,
        emergency_contact_number: post.emergency_contact_number,
        blood_group: post.blood_group
    }

    models.Users.Add(options, (err, user) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, userId: user})
        }
    })
})

router.get('/:id', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const userId = req.params.id;
    const locationId = 1;
    const active=0;

    async.auto({
        workoutPrograms: (cb) => {
            models.Schedule.GetAllWorkoutPrograms({locationId, offset: 0, limit: 100}, (err, programs) => {
                cb(err ? err : null, programs.programs)
            })
        },
        memberData: (cb) => {
            models.Members.GetById({userId}, (err, user) => {
                cb(err ? err : null, user)
            })
        },
        states: (cb) => {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        cities: ['memberData', (result, cb) => {
                models.Common.GetCities({stateId: result.memberData.state_id}, (err, cities) => {
                    cb(err ? err : null, cities)
                })
            }],
        membershipLogs: ['memberData', (result, cb) => {
                models.Members.GetMembershipLogByUserId({locationId, userId: result.memberData.id}, (err, membershipLogs) => {
                    cb(err ? err : null, membershipLogs)
                })
            }],
        paymentLogs: ['memberData', (result, cb) => {
                models.Payments.GetByUserId({userId: result.memberData.id, locationId}, (err, paymentLogs) => {
                    cb(err ? err : null, paymentLogs)
                })
            }],
        attendanceLogs: ['memberData', (result, cb) => {
                models.Members.GetAttendanceByUserId({userId: result.memberData.id, locationId}, (err, attendanceLogs) => {
                    cb(err ? err : null, attendanceLogs)
                })
            }],
        activePlan: ['memberData', (result, cb) => {
                models.Members.GetActivePlanByUserId({userId: result.memberData.id, locationId}, (err, plan) => {
                    cb(err ? err : null, plan)
                })
            }],
        bmi: (cb)=> {
            models.Members.GetBMI({userId, offset: 0, limit: 100}, (err, bmi) => {
                cb(err,bmi)
            })
        },
        brand: (cb)=> {
            models.Brands.GetByMemberId({userId}, (err, brand) => {
                if(err){
                    cb(err)
                }else{
                    cb(null,brand)
                }
            })
        },
        memberlocation: (cb)=> {
            models.Locations.GetByMemberId({userId}, (err, location) => {
                if(err){
                    cb(err)
                }else{
                    cb(null,location)
                }
            })
        },
        locations: (cb)=> {
            models.Locations.GetLocationsByMemberId({userId}, (err, locations) => {
                if(err){
                    cb(err)
                }else{
                    cb(null,locations)
                }
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/single-member', {
                title: 'FitBiz | Members',
                fw: false,
                menuActive: 'members',
                submenuActive: 'viewMembers',
                pageClass: 'page-profile',
                workoutPrograms: result.workoutPrograms,
                user: result.memberData,
                states: result.states,
                cities: result.cities,
                membershipLogs: result.membershipLogs,
                paymentLogs: result.paymentLogs,
                attendanceLogs: result.attendanceLogs,
                activePlan: result.activePlan,
                bmi: result.bmi,
                activeTab:active,
                brand: result.brand,
                memberlocation: result.memberlocation,
                locations: result.locations,
                styles: ['/global/vendor/toastr/toastr.min.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css','/global/vendor/select2/select2.css'],
                scripts: ['/global/vendor/toastr/toastr.min.js', '/global/vendor/webcam.js/webcam.min.js','/js/page-level/single-member.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js','/global/vendor/select2/select2.js']
            })
        }
    })
});

router.post('/update', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    var val = post.val;
    models.Members.Update({col: post.col, val: val, userId: post.userId}, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/add/bmi', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const options = [
        (post.bmi_date)?(post.bmi_date):(null),
        (post.height)?(post.height):(null),
        (post.weight)?(post.weight):(null),
        (post.chest)?(post.chest):(null),
        (post.hips)?(post.hips):(null),
        (post.waist)?(post.waist):(null),
        (post.thigh_left)?(post.thigh_left):(null),
        (post.thigh_right)?(post.thigh_right):(null),
        (post.calf_left)?(post.calf_left):(null),
        (post.calf_right)?(post.calf_right):(null),
        (post.wrist_left)?(post.wrist_left):(null),
        (post.wrist_right)?(post.wrist_right):(null),
        (post.forearm_left)?(post.forearm_left):(null),
        (post.forearm_right)?(post.forearm_right):(null),
        (post.shoulder)?(post.shoulder):(null),
        (post.neck_girth)?(post.neck_girth):(null),
        (post.knee_left)?(post.knee_left):(null),
        (post.knee_right)?(post.knee_right):(null),
        (post.triceps_left)?(post.triceps_left):(null),
        (post.triceps_right)?(post.triceps_right):(null),
        (post.biceps_left)?(post.biceps_left):(null),
        (post.biceps_right)?(post.biceps_right):(null),
        (post.suprailac)?(post.suprailac):(null),
        (post.subscapular)?(post.subscapular):(null),
        (post.thigh)?(post.thigh):(null),
        (post.pectoral)?(post.pectoral):(null),
        (post.abdomen)?(post.abdomen):(null),
        (post.midaxillary)?(post.midaxillary):(null),
        (post.calf)?(post.calf):(null),
        (post.upper_body_left)?(post.upper_body_left):(null),
        (post.upper_body_right)?(post.upper_body_right):(null),
        (post.lower_body_left)?(post.lower_body_left):(null),
        (post.lower_body_right)?(post.lower_body_right):(null),
        (post.VO2max)?(post.VO2max):(null),
        (post.duration)?(post.duration):(null),
        (post.self_appraisal)?(post.self_appraisal):(null),
        (post.bench_press)?(post.bench_press):(null),
        (post.squat)?(post.squat):(null),
        (post.notes)?(post.notes):(null),
        (post.member_id)?(post.member_id):(null)
    ]

    models.Members.AddBMI(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back');
    })
});

router.post('/update/profile-image', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const fs = require('fs');
    const userId = post.userId;
    const filename = `${userId}-${moment().unix()}.jpeg`;
    const locationId = post.locationId;
    const imgDir = `${require('path').resolve()}/public/profile-img/${locationId}`;
    const imageData = post.imageData.replace(/^data:image\/jpeg;base64,/, "");

    if (fs.existsSync(imgDir) === false) {
        fs.mkdirSync(imgDir)
    }

    fs.writeFile(`${imgDir}/${filename}`, imageData, 'base64', (err) => {
        if (err) {
            res.send({success: false})
        } else {
            models.Members.UpdateProfileImage({userId, filename}, (err) => {
                if (err) {
                    res.send({success: false})
                } else {
                    res.send({success: true, filename: `/profile-img/${locationId}/${filename}`})
                }
            })
        }
    })
})

router.post('/change-location', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const option = {
        memberId: post.memberId,
        locationId: post.locationId
    };

    models.Locations.UpdateMemberLocation(option, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/search-brands', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;

    models.Brands.Search({text: post.text}, (err, brands) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, brands})
        }
    })
})

router.post('/get-brand-locations', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const option = {
        brandId: post.brandId
    };

    models.Locations.GetByBrandId(option, (err,locations) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, locations})
        }
    })
});
module.exports = router;