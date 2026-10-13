/********************************************************/
/***** App dashboard Routes *****/
/********************************************************/
const moment = require('moment');
const async = require('async');
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const http = require('http');
const AWS = require('aws-sdk');
const _ = require('lodash');

router.get('/', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    models.Common.GetStates({countryId: 101}, (err, states) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('app/members', {
                title: 'FitBiz | Members',
                fw: false,
                menuActive: 'members',
                submenuActive: 'viewMembers',
                states,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/view-members.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })
        }
    })
})

router.post('/view-all', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['member_name','b.phone','b.email','b.gender','b.birth_date','b.created_date','expiry_date'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;

    models.Users.GetMembers({locationId: req.session.user.currentLocation.id, offset, limit, search, filter, orderByColumn, orderByValue}, (err, members) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: members.total, recordsFiltered: members.total, data: members.members})
        }
    })
})

router.post('/add', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;
    const smsLoginId=req.smsConfig.loginId;
    const smsPassword=req.smsConfig.password;
    const SESConfig = {
                    apiVersion:req.awsSESConfig.apiVersion,
                    accessKeyId:req.awsSESConfig.accessKeyId,
                    secretAccessKey:req.awsSESConfig.secretAccessKey,
                    region:req.awsSESConfig.region
                };

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
        locationId,
        marital_status: post.marital_status,
        emergency_contact_name: post.emergency_contact_name,
        emergency_contact_number: post.emergency_contact_number,
        blood_group: post.blood_group,
        birth_date: ((post.birth_date)?(moment(post.birth_date, 'DD-MM-YYYY').format('YYYY-MM-DD')):(null)),
        anniversary_date: ((post.anniversary_date)?(moment(post.anniversary_date, 'DD-MM-YYYY').format('YYYY-MM-DD')):(null))
    }
    async.auto({
        user: (cb) => {
            models.Users.Add(options, (err, user) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, user)
                }
            })
        },
        sendSMS : ['user', (result, cb) => {
            models.SmsEmail.GetSMSSingleTemplate({templateName:'member-register', locationId}, (err, template) => {
                if (err) {
                    cb(err)
                } else {
                    models.Locations.GetById({locationId}, (err, brandLocation) => {
                        if (err) {
                            cb(err)
                        } else {
                            var message = template.message;
                            var formatted_message = message.replace('{title}', 'Hii')
                                                            .replace('{first_name}', options.fname)
                                                            .replace('{last_name}', options.lname)
                                                            .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                            .replace('{phone_no}', brandLocation.phone)
                                                            .replace('{phone_no1}', brandLocation.phone)
                                                            .replace(/{(.*?)}/g, '').replace(/(^[,\s]+)|([,\s]+$)/g, '');
                         
                            var url = 'http://198.15.103.106/API/pushsms.aspx?loginID='+smsLoginId+'&password='+smsPassword+'&mobile='+options.phone+'&text='+formatted_message+'&senderid=SHRIND&route_id=1&Unicode=0';
                            http.get(url, (resp) => {
                                models.SmsEmail.StoreSMS({locationId, sendToMember: 1, sendToLeads: 0, message: formatted_message, phoneNo: options.phone, memberId: result.user }, (err) => {
                                    cb(err ? err : null)
                                })
                            }).on("error", (err) => {
                                cb(err);
                            });
                        }
                    })
                }
            })
        }],
        sendEmail : ['user', (result, cb) => {
            models.SmsEmail.GetEmailSingleTemplate({templateName:'member-register', locationId}, (err, template) => {
                if (err) {
                    cb(err)
                } else {
                    models.Locations.GetById({locationId}, (err, brandLocation) => {
                        if (err) {
                            cb(err)
                        } else {
                            var message = template.message;
                            var formatted_message = message.replace('{title}', 'Hi')
                                                        .replace('{first_name}', options.fname)
                                                        .replace('{last_name}', options.lname)
                                                        .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                        .replace('{phone_no}', brandLocation.phone)
                                                        .replace('{phone_no1}', brandLocation.phone)
                                                        .replace(/{(.*?)}/g, '').replace(/(^[,\s]+)|([,\s]+$)/g, '');;
                            
                            var params = {
                                Source:'sidhi.volvoiker@tapsoft.in',
                                Destination:{
                                    ToAddresses:[
                                        options.email
                                    ]
                                },
                                ReplyToAddresses:[
                                    'sidhi.volvoiker@tapsoft.in'
                                ],
                                Message:{
                                    Body:{
                                        Html:{
                                        Charset:"UTF-8",
                                        Data:formatted_message
                                      }
                                    },
                                    Subject:{
                                        Charset:'UTF-8',
                                        Data:'Welcome to FitBiz!'
                                    }
                                }
                            };
                            new AWS.SES(SESConfig).sendEmail(params,function(err, data) {
                                if (err) {
                                    cb1(err);
                                }else{
                                    models.SmsEmail.StoreEmail({locationId, sendToMember: 1, sendToLeads: 0, message: formatted_message, email: options.email, memberId: result.user }, (err) => {
                                        cb(err ? err : null)
                                    })
                                }          
                            })
                        }
                    })
                }
            })
        }]
    }, function(err, result){
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true, userId: result.user})
        }
    })
})

router.post('/search', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;

    models.Members.SearchByLocation({locationId, phone: post.phone}, (err, members) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, members})
        }
    })
})

router.get('/attendance', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    res.render('app/member-attendance', {
        title: 'FitBiz | Attendance',
        fw: true,
        menuActive: 'members',
        submenuActive: 'attendance',
        styles: ['/global/vendor/select2/select2.css', '/global/vendor/toastr/toastr.min.css'],
        scripts: ['/global/vendor/select2/select2.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/webcam.js/webcam.min.js', '/global/vendor/face-api/face-api.min.js', '/js/app/dashboard.js', '/js/app/face-recognition.js', '/js/app/attendance.js']
    })
})

router.post('/get', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;

    models.Members.GetById({userId: post.userId}, (err, user) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, user})
        }
    })

})

router.get('/:id', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const userId = req.params.id;
    const locationId = req.session.user.currentLocation.id;
    const active = (typeof req.query.active !== 'undefined' && req.query.active !== null)?(req.query.active):(0);

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
        },
        team: (cb) => {
            models.Team.GetTeam({locationId, offset: 0, limit: 100}, (err, team) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, team.users)
                }
            })
        },
        taxes: (cb) => {
            models.Locations.GetLocationTax({locationId}, (err, taxes) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, taxes)
                }
            })
        },
        enrollmentDetails: (cb) => {
            models.Members.GetEnrollmentDetails({userId}, (err, enrollment) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, enrollment)
                }
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('app/single-member', {
                title: 'FitBiz | Members',
                fw: true,
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
                team: result.team,
                taxes: result.taxes,
                enrollment: result.enrollmentDetails,
                styles: ['/global/vendor/toastr/toastr.min.css','/global/vendor/select2/select2.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css','/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css'],
                scripts: ['/global/vendor/toastr/toastr.min.js', '/global/vendor/webcam.js/webcam.min.js', '/js/app/dashboard.js', '/js/app/single-member.js','/global/vendor/select2/select2.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js','/global/vendor/datatables.net/jquery.dataTables.js','/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js']
            })
        }
    })
});

router.post('/update/profile-image', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const fs = require('fs');
    const userId = post.userId;
    const filename = `${userId}-${moment().unix()}.jpeg`;
    const locationId = req.session.user.currentLocation.id;
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

router.post('/get/membership', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;

    models.Members.GetMemberships({locationId, memberId: post.memberId, active: post.active}, (err, memberships) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, memberships})
        }
    })
});

router.post('/update', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;

    models.Members.Update({col: post.col, val: post.val, userId: post.userId}, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/add/bmi', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const options = [
        (post.bmi_date)?(post.is_web == 1 ? moment(post.bmi_date, 'DD-MM-YYYY').format('YYYY-MM-DD') : post.bmi_date):(null),
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
        res.redirect('/app/members/'+post.member_id)
    })
});

router.post('/change-location', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const option = {
        memberId: post.memberId,
        locationId: post.locationId,
        currentLocationId: req.session.user.currentLocation.id
    };

    models.Locations.UpdateMemberLocation(option, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/search-brands', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
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

router.post('/get-brand-locations', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
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

router.post('/transfer-membership', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const option = {
        memberId: post.transfer_member_id,
        id: post.membership_id,
        relationship : post.relationship,
        transferReason: post.transfer_reason,
        transferFees: (post.transfer_fees)?(post.transfer_fees):(null),
        transferTax: (post.transfer_tax)?(post.transfer_tax):(null)
    };

    models.Members.TransferMembership(option, (err) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect('back');
        }
    })
});

router.post('/freeeze-membership', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const date1 = new Date(post.membership_freeze_start_date);
    const date2 = new Date(post.membership_freeze_end_date);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const option = {
        startDate: moment(post.membership_freeze_start_date,'DD-MM-YYYY').format('YYYY-MM-DD'),
        endDate: moment(post.membership_freeze_end_date,'DD-MM-YYYY').format('YYYY-MM-DD'),
        id: post.freeze_membership_id,
        expDate: moment(post.mem_exp_date, "YYYY-MM-DD").add('days', diffDays).format('YYYY-MM-DD'),
        frozenBy: post.frozen_by,
        freezePrice: (post.freeze_price)?(post.freeze_price):(null),
        freezeReason: post.freeze_reason,
        freezeTaxId: (post.tax)?(post.tax):(null)
    };

    models.Members.FreezeMembership(option, (err) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect('back');
        }
    })
});

router.get('/upgrade/:id', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const membershipId = req.params.id;

    async.auto({
        team: (cb) => {
            models.Team.GetTeam({locationId, offset: 0, limit: 100}, (err, team) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, team.users)
                }
            })
        },
        membership: (cb) =>{
            models.Members.GetMembershipLogById({membershipId}, (err, membership) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, membership)
                }
            })
        },
        upgradePackages : ['membership', (result, cb) => {
            models.Packages.GetUpgradePackages({packageId: result.membership.package_id, locationId}, (err, packages) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, packages)
                }
            })
        }],
        taxes: (cb) => {
            models.Locations.GetLocationTax({locationId}, (err, taxes) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, taxes[0])
                }
            })
        },
        paymentMethods: (cb) => {
            models.Locations.GetPaymentMethods({locationId}, (err, paymentMethods) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, paymentMethods)
                }
            })
        },
        isUpgradable: function(cb){
            models.Members.CheckIfUpgradable({membershipId}, (err, isUpgradable) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, isUpgradable)
                }
            })
        },
        trainers: (callback) => {
            models.Team.GetTrainers({locationId}, (err, trainers) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, trainers)
                }
            })
        },
        timeSlots: (callback) => {
            models.Locations.GetTimeSlots({locationId, offset:0, limit:100}, (err, timeSlots) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, timeSlots.timeSlots)
                }
            })
        }
    }, function(err, result){
        if(err){
            res.redirect('/404');
        }else{
            res.render('app/membership-upgrade', {
                title: 'FitBiz | Upgrade Membership',
                fw: true,
                team: result.team,
                membership: result.membership,
                packages: result.upgradePackages,
                taxes: result.taxes,
                menuActive: 'members',
                submenuActive: '',
                paymentMethods: result.paymentMethods,
                isUpgradable: result.isUpgradable,
                trainers: result.trainers,
                timeSlots: result.timeSlots,
                scripts: ['/js/app/membership-upgrade.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js','/global/vendor/toastr/toastr.min.js'],
                styles: ['/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css','/global/vendor/toastr/toastr.min.css']
            })
        }
    })
})

router.post('/upgrade', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const userId = req.session.user.id;
    const post = req.body;

    const options = {
        locationId,
        memberId: post.memberId,
        userId,
        packages: post.package,
        payments: post.paymentLines ? post.paymentLines : [],
        isComplete: (post.dueAmount - _.sumBy(post.paymentLines, 'amount')) > 0 ? 0 : 1,
        totalAmount: post.totalAmount,
        receivedBy: userId,
        changeSale: moment().format('YYYY-MM-DD HH:mm:ss'),
    }

    async.auto({
        sale: (cb) => {
            models.Sales.Add(options, (err, saleId) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, saleId)
                }
            })
        },
        updateMembershipLog: ['sale', (result, cb) =>{
            models.Members.UpgradeMembership({saleId: result.sale, id: post.membershipLogId}, (err) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null)
                }
            })
        }]
    },function(err, result){
        if(err){
            res.send({success: false})
        }else{

            res.send({success: true})
        }
    })
})

router.get('/downgrade/:id', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const membershipId = req.params.id;

    async.auto({
        team: (cb) => {
            models.Team.GetTeam({locationId, offset: 0, limit: 100}, (err, team) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, team.users)
                }
            })
        },
        membership: (cb) =>{
            models.Members.GetMembershipLogById({membershipId}, (err, membership) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, membership)
                }
            })
        },
        downgradePackages : ['membership', (result, cb) => {
            models.Packages.GetDowngradePackages({packageId: result.membership.package_id, locationId}, (err, packages) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, packages)
                }
            })
        }],
        taxes: (cb) => {
            models.Locations.GetLocationTax({locationId}, (err, taxes) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, taxes[0])
                }
            })
        },
        isDowngradable: function(cb){
            models.Members.CheckIfDowngradable({membershipId}, (err, isDowngradable) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, isDowngradable)
                }
            })
        },
        trainers: (callback) => {
            models.Team.GetTrainers({locationId}, (err, trainers) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, trainers)
                }
            })
        },
        timeSlots: (callback) => {
            models.Locations.GetTimeSlots({locationId, offset:0, limit:100}, (err, timeSlots) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, timeSlots.timeSlots)
                }
            })
        }
    }, function(err, result){
        if(err){
            res.redirect('/404');
        }else{
            res.render('app/membership-downgrade', {
                title: 'FitBiz | Downgrade Membership',
                fw: true,
                team: result.team,
                membership: result.membership,
                packages: result.downgradePackages,
                taxes: result.taxes,
                menuActive: 'members',
                submenuActive: '',
                isDowngradable: result.isDowngradable,
                trainers: result.trainers,
                timeSlots: result.timeSlots,
                scripts: ['/js/app/membership-downgrade.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js','/global/vendor/toastr/toastr.min.js'],
                styles: ['/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css', '/global/vendor/toastr/toastr.min.css']
            })
        }
    })
})

router.post('/downgrade', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const userId = req.session.user.id;
    const post = req.body;
    post.package.forEach(function(p){
        p.tax =  []
    });
    const options = {
        locationId,
        memberId: post.memberId,
        userId,
        packages: post.package,
        payments: [],
        isComplete: 1,
        totalAmount: 0,
        changeSale: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    async.auto({
        sale: (cb) => {
            models.Sales.Add(options, (err, saleId) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, saleId)
                }
            })
        },
        updateMembershipLog: ['sale', (result, cb) =>{
            models.Members.DowngradeMembership({saleId: result.sale, id: post.membershipLogId}, (err) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null)
                }
            })
        }]
    },function(err, result){
        if(err){
            res.send({success: false})
        }else{

            res.send({success: true})
        }
    })
})

router.post('/add/enrollment-details', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const fs = require('fs');
    const memberId = post.enrollment_member_id;
    const files = req.files;
    const filename =  files.enrollment_file.name;
    const locationId = req.session.user.currentLocation.id;
    const fileDir = `${require('path').resolve()}/public/member-details/${locationId}`;
    const file = files.enrollment_file;

    if (fs.existsSync(fileDir) === false) {
        fs.mkdirSync(fileDir)
    }

    if(file){
        file.mv(fileDir+`/${filename}`, (err) => {
            if (err) {
                res.redirect('/404');
            } else {
                models.Members.AddEnrollmentDetails({name: post.enrollment_file_name, filename, memberId}, (err) => {
                    if (err) {
                        res.redirect('/404');
                    } else {
                        res.redirect('back');
                    }
                })
            }
        })
    }else{
        res.redirect('back');
    }
})

router.post('/get-sms', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['a.message','a.created_date'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const post = req.body;
    models.Members.GetSMS({userId: post.user_id, offset, limit, search, filter, orderByColumn, orderByValue}, (err, sms) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: sms.total, recordsFiltered: sms.total, data: sms.sms})
        }
    })
})

router.post('/get-email', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['a.message','a.created_date'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const post = req.body;
    models.Members.GetEmail({userId: post.user_id, offset, limit, search, filter, orderByColumn, orderByValue}, (err, email) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: email.total, recordsFiltered: email.total, data: email.email})
        }
    })
})

router.post('/validate-pt-upgrade', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;

    models.Members.ValidatePT({memberId: post.memberId, startDate: post.startDate, endDate: post.endDate}, (err,isValid) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, isValid})
        }
    })
})

router.post('/get-trainer-time-slots', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;

    models.Team.GetTimeSlots({userId: post.trainer_id, locationId}, (err, timeSlots) => {
        if(err){
            res.send({success: false});
        }else{
            res.send({success: true, timeSlots});
        }
    })
})

router.post('/delete', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const memberId = post.delete_member_id;

    models.Members.Delete({memberId}, (err) => {
        if(err){
            res.redirect('/404');
        }else{
            res.redirect('/app/members');
        }
    })
})
module.exports = router;