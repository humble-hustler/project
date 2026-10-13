/********************************************************/
/***** Asset Management Routes *****/
/********************************************************/
const async = require('async');
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const moment = require('moment');

router.get('/', auth.checkPermission(['brand-admin', 'manager','staff']), (req, res) => {
    
    const models = req.Core.Models;
    models.Users.GetRoles({all: false}, (err, roles) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    res.render('app/users', {
                        title: 'Exlshop | Users',
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


router.post('/view-sefldetails', auth.checkPermission(['brand-admin', 'manager','trainer']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const filter = req.body.filter;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['b.fname','b.email','b.phone','d.verbose','f.designation','g.department'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const userId=req.session.user.id;
    models.Users.GetSelfDetails({ offset, limit, search,userId, filter,orderByColumn, orderByValue}, (err, team) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: team.total, recordsFiltered: team.total, data: team.users})
        }
    })
})


router.post('/view-all', auth.checkPermission(['brand-admin', 'manager','staff']), (req, res) => {
    
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const filter = req.body.filter;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['b.fname','b.email','b.phone','d.verbose','f.designation','g.department'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const user=req.session.user.currentLocation.id;
    models.Users.GetBrandUsers({locationId, offset, limit, search,user, filter,orderByColumn, orderByValue}, (err, team) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: team.total, recordsFiltered: team.total, data: team.users})
        }
    })
})

router.post('/add', auth.checkPermission(['brand-admin', 'manager','staff']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const options = {
        fname: post.user_fname,
        lname: post.user_lname,
        email: post.user_email,
        phone: post.user_phone,
        password: post.user_password,
        roleId: post.role_id,
        locationId,
        gender: post.gender,
        address1: post.address_line_1,
        address2: post.address_line_2,
        cityId: (post.city_id)?(post.city_i):(null),
        stateId: (post.state_id)?(post.state_id):(null),
        zip: post.zip,
        marital_status: (post.marital_status)?(post.marital_status):(null),
        emergency_contact_name: post.emergency_contact_name,
        emergency_contact_number: post.emergency_contact_number,
        blood_group: post.blood_group,
        birth_date: moment(post.birth_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        anniversary_date: moment(post.anniversary_date, 'DD-MM-YYYY').format('YYYY-MM-DD')
    };
    models.Users.Add(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('/app/users')
    })
})

router.get('/add', auth.checkPermission(['brand-admin', 'manager','staff']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    models.Users.GetRoles({all: false}, (err, roles) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    models.Locations.GetDepartments({locationId}, (err, departments) => {
                        if (err) {
                            res.redirect('/404')
                        } else {
                            models.Locations.GetDesignation({locationId}, (err, designations) => {
                                if (err) {
                                    res.redirect('/404')
                                } else {
                                    res.render('app/user-add', {
                                        title: 'Exlshop | User Add',
                                        fw: false,
                                        menuActive: 'users',
                                        submenuActive: '',
                                        roles,
                                        states,
                                        departments,
                                        designations,
                                        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/user-add.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                                        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
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

router.get('/userid/:id', auth.checkPermission(['brand-admin', 'manager','staff']), (req, res) => {
    const userId = req.params.id;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    async.auto({
        userData: (cb) => {
            models.Users.GetSingle({userId}, (err, user) => {
                cb(err ? err : null, user)
            })
        },
        states: (cb) => {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        cities: ['userData', (result, cb) => {
                models.Common.GetCities({stateId: result.userData.state_id}, (err, cities) => {
                    cb(err ? err : null, cities)
                })
            }],
        roles: (cb) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                cb(err ? err : null, roles)
            })
        },
        attendanceLogs: ['userData', (result, cb) => {
                models.Members.GetAttendanceByUserId({userId: result.userData.id, locationId}, (err, attendanceLogs) => {
                    cb(err ? err : null, attendanceLogs)
                })
            }],
        designations: (cb) => {
            models.Locations.GetDesignation({locationId}, (err, designations) => {
                cb(err ? err : null, designations)
            })
        },
        departments: (cb) => {
            models.Locations.GetDepartments({locationId}, (err, departments) => {
                cb(err ? err : null, departments)
            })
        },
        userEducations: (cb) => {
            models.Users.GetEducations({userId}, (err, educations) => {
                cb(err ? err : null, educations)
            })
        },
        userExperience: (cb) => {
            models.Users.GetExperience({userId}, (err, experience) => {
                cb(err ? err : null, experience)
            })
        },
        userSalaryLog: (cb) => {
            models.Users.GetUserSalaryLog({userId}, (err, salaryLog) => {
                cb(err ? err : null, salaryLog)
            })
        },
        userPTPayLog: (cb) => {
            models.Users.GetUserPTPayLog({userId}, (err, payLog) => {
                cb(err ? err : null, payLog)
            })
        },
        locations: (cb) => {
            models.Locations.GetById({locationId}, (err, location) => {
                if (err) {
                    cb(err)
                } else {
                    models.Locations.GetLocByBrandId({brandId: location.brands_id}, (err, locations) => {
                        cb(err ? err : null, locations)
                    })
                }
            })
        },
        userLocations: (cb) => {
            models.Users.GetAssignedLocations({userId}, (err, locations) => {
                locations.locations.forEach((l, i) => {
                    locations.locations[i] = l.id
                })
                cb(err ? err : null, locations.locations)
            })
        },
        userStatusLogs: (cb) => {
            models.Users.GetStatusLogs({userId}, (err, statusLogs) => {
                cb(err ? err : null, statusLogs);
            })
        },
        timeSlots: (cb) => {
            models.Team.GetTimeSlots({userId, locationId}, (err, timeSlots) => {
                cb(err ? err : null, timeSlots);
            })
        },
        brandTimeSlots: (cb) => {
            models.Locations.GetTimeSlots({locationId, offset:0, limit: 100}, (err, timeSlots) => {
                cb(err ? err : null, timeSlots.timeSlots);
            })
        },
        shifts: (cb) => {
            models.Team.GetShifts({userId}, (err, shifts) => {
                cb(err ? err : null, shifts);
            })
        },
        brandShifts: (cb) => {
            models.Locations.GetShifts({locationId, offset:0, limit:100}, (err, shifts) => {
                cb(err ? err : null, shifts.shifts);
            })
        },
        feedbacks: (cb) => {
            models.Members.GetFeedback({userId}, (err, feedbacks) => {
                cb(err ? err : null, feedbacks);
            })
        },
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('app/single-user', {
                title: 'Exl_shop | Users',
                fw: true,
                menuActive: 'users',
                submenuActive: '',
                user: result.userData,
                states: result.states,
                cities: result.cities,
                roles: result.roles,
                attendanceLogs: result.attendanceLogs,
                designations: result.designations,
                departments: result.departments,
                userEducations: result.userEducations,
                userExperience: result.userExperience,
                userSalaryLog: result.userSalaryLog,
                userPTPayLog: result.userPTPayLog,
                locations: result.locations,
                userLocations: result.userLocations,
                userStatusLogs: result.userStatusLogs,
                timeSlots: result.timeSlots,
                brandTimeSlots: result.brandTimeSlots,
                shifts: result.shifts,
                brandShifts: result.brandShifts,
                feedbacks: result.feedbacks,
                scripts: ['/global/vendor/toastr/toastr.min.js', '/global/vendor/webcam.js/webcam.min.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/select2/select2.js', '/js/app/single-user.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })
        }
    })
})
router.post('/getEducation', auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;
    models.Users.geteducation(req.body, (err, data) =>{
        if(err){
            res.send({success: false});
        }else{
            res.send({success: true, data});
        }
    })
})

router.post('/getExperience', auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;
    models.Users.getexperience(req.body, (err, data) =>{
        if(err){
            res.send({success: false});
        }else{
            res.send({success: true, data});
        }
    })
})


router.post('/edit-education', auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;
    models.Users.updateEducation(req.body, (err, data) =>{
        if(err){
            req.flash('error', 'Some error occurred. Please try again later!');
        }else{
            res.redirect('back')
        }
    })
})

router.post('/edit-experience', auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;
    models.Users.UpdateExperience(req.body, (err, data) =>{
        if(err){
            req.flash('error', 'Some error occurred. Please try again later!');
        }else{
            res.redirect('back')
        }
    })
})

router.post('/delete-education', auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;
    models.Users.deleteEducation(req.body, (err, data) =>{
        if(err){
            req.flash('error', 'Some error occurred. Please try again later!');
        }else{
            res.redirect('back')
        }
    })
})

router.post('/delete-experience', auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;
    models.Users.deleteExperience(req.body, (err, data) =>{
        if(err){
            req.flash('error', 'Some error occurred. Please try again later!');
        }else{
            res.redirect('back')
        }
    })
})

router.get('/:id', auth.checkPermission(['brand-admin','super-admin', 'manager','staff']), (req, res) => {
    const userId = req.params.id;
    const models = req.Core.Models;
    // const locationId = req.session.user.currentLocation.id;
    models.Users.getUserProfile(userId,(err,profile)=>{
        if (err) {
            res.redirect('/404')
        } else {
            res.render('app/profile', {
                title: 'Exl-shop -Profile',
                profile :profile
                
            })
        }
    })
})
router.post('/update/role', auth.checkPermission(['brand-admin', 'manager','staff']), (req, res) => {
    const post = req.body;
    const userId = req.params.id;
    const models = req.Core.Models;

    models.Users.UpdateRole({userId: post.userId, roleId: post.roleId}, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/update/profile', auth.checkPermission(['brand-admin','super-admin', 'manager']), (req, res) => {
    const post = req.body;
    const userId = req.params.id;
    const models = req.Core.Models;

    models.Users.UpdateProfile({userId: post.userId, col: post.col, val: post.val}, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/add/education', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        educationLevel: post.education_level,
        institute: post.institute,
        description: post.description,
        month: post.month,
        year: post.year,
        userId: post.user_id_education
    }

    models.Users.AddEducation(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back')
    })
})
 
router.post('/add/experience', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        jobPosition: post.job_position,
        employerName: post.employer_name,
        jobDescription: post.job_description,
        fromMonth: post.from_month_exp,
        fromYear: post.from_year_exp,
        toMonth: post.to_month_exp,
        toYear: post.to_year_exp,
        userId: post.user_id_experience
    }

    models.Users.AddExperience(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back')
    })
})

router.post('/add/salary', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    models.Users.AddSalary({userId: post.user_id_salary, salaryType: post.salary_type, salaryAmount: post.salary_amount, department:post.salary_department, designation:post.salary_designation, isPromoted:post.is_promoted, locationId: locationId}, (err) => {
        if (err) {
            res.send({success:false})
        } else {
            res.send({success:true})
        }
    })
})

router.post('/add/pay', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    models.Users.AddPay({userId: post.user_id_pay, payType: post.pay_type, payAmount: post.pay_amount, locationId: locationId}, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back');
    })
})

router.post('/set-locations', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    models.Users.SetLocations({userId: post.userId, locations: post.locations}, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/add-new', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const options = {
        fname: post.user_fname,
        lname: post.user_lname,
        email: post.user_email,
        phone: post.user_phone,
        department: post.user_department,
        designation: post.user_designation,
        password: post.user_password,
        roleId: post.role_id,
        locationId,
        gender: post.gender,
        address1: post.address_line_1,
        address2: post.address_line_2,
        cityId: (post.city_id)?(post.city_id):(null),
        stateId: (post.state_id)?(post.state_id):(null),
        zip: post.zip,
        marital_status: (post.marital_status)?(post.marital_status):(null),
        emergency_contact_name: post.emergency_contact_name,
        emergency_contact_number: post.emergency_contact_number,
        blood_group: post.blood_group,
        birth_date: (post.birth_date)?(moment(post.birth_date, 'DD-MM-YYYY').format('YYYY-MM-DD')):(null),
        anniversary_date: (post.anniversary_date)?(moment(post.anniversary_date, 'DD-MM-YYYY').format('YYYY-MM-DD')):(null)
    };
    async.auto({
        addUser : (cb) => {
            models.Users.Add(options, (err,id) => {
                if (err) {
                    cb(err);
                }else{
                    cb(null, id);
                }
            })
        },
        AddProfile : ['addUser', (result, cb) => {
            models.Users.AddProfile({userId: result.addUser, department: post.user_department, designation: post.user_designation}, (err) => {
                cb(err ? err : null)
            })
        }],
        AddEducation : ['addUser', (result, cb) => {
            async.map(post.education, (edu, cb1) => {
                models.Users.AddEducation({userId: result.addUser, educationLevel: edu.educationLevel, institute:edu.institute, description:edu.description, month:edu.month, year:edu.year}, (err) => {
                    cb1(err ? err : null)
                })
            }, (err, result) => {
                cb(err ? err : null)
            })
        }],
        AddExperience : ['addUser', (result, cb) => {
            async.map(post.experience, (exp, cb1) => {
                models.Users.AddExperience({userId: result.addUser, jobPosition: exp.jobPosition, employerName:exp.employerName, jobDescription: exp.jobDescription, fromMonth: exp.fromMonth, toMonth: exp.toMonth, fromYear: exp.fromYear, toYear: exp.toYear}, (err) => {
                    cb1(err ? err : null)
                })
            }, (err, result) => {
                cb(err ? err : null)
            })
        }],
        AddSalary : ['addUser', (result, cb) => {
            async.map(post.compensation_salary, (com, cb1) => {
                models.Users.AddSalary({userId: result.addUser, locationId: options.locationId, salaryType:com.salaryType, salaryAmount: com.salaryAmount, department:com.department, designation:com.designation, isPromoted:1}, (err) => {
                    cb1(err ? err : null)
                })
            }, (err, result) => {
                cb(err ? err : null)
            })
        }],
        AddPay : ['addUser', (result, cb) => {
            async.map(post.compensation_pt_salary, (com, cb1) => {
                models.Users.AddPay({userId: result.addUser, locationId: options.locationId, payType:com.salaryType, payAmount: com.salaryAmount}, (err) => {
                    cb1(err ? err : null)
                })
            }, (err, result) => {
                cb(err ? err : null)
            })
        }],
    }, function(err, result){
        if(err){
            res.send({success: false});
        }else{
            res.send({success: true, id:result.addUser});
        }
    })
})

router.post('/update/status',auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const options = {
        userId: post.userId,
        locationId: locationId, 
        reasonId: post.reasonId, 
        reasonText: post.reasonText, 
        isActive: post.isActive, 
        resignationType: post.resignationType ? post.resignationType : null,
        resignationReason: post.resignationReason ? post.resignationReason : null,
        resignationNoticePeriod: post.resignationNoticePeriod ? post.resignationNoticePeriod : null,
        resignationNoticeServed: post.resignationNoticeServed ? post.resignationNoticeServed : null
    }
    
    models.Users.UpdateStatus(options, (err) => {
        if (err) {
            res.send({success: false});
        }
        res.send({success: true});
    }) 
})

router.post('/add/time-slot',auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    models.Team.AddTimeSlot({userId: post.user_id_time_slot, timeSlotId: post.time_slot}, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back');
    }) 
})

router.post('/delete/time-slot',auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    models.Team.DeleteTimeSlot({timeSlotId: post.time_slot_id}, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back');
    }) 
})

router.post('/add/shift',auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    models.Team.AddShift({shiftId: post.shift, userId: post.user_id_shift}, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back');
    }) 
})

router.post('/delete', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const teamMemberId = post.user_id;
    models.Users.Delete({teamMemberId}, (err) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect('/app/users')
        }
    })
})

router.post('/change-password', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const options={
        userId: req.session.user.id,
        oldPassword: post.oldPassword,
        newPassword: post.newPassword
    }
    models.Users.ChangePassword(options, (err, data) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, isMatch: data.isMatch})
        }
    })
})





module.exports = router;