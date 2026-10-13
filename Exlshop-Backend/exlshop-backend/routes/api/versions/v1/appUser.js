const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
const moment = require('moment');
const async=require('async')
module.exports = {
    'view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const locationId = req.locationId;
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
            model.Users.GetBrandUsers({locationId, offset, limit, search, orderByColumn, orderByValue}, (err, team) => {
                if (err) {
                    cb(true, { success:false});
                } else {
                    cb(false, { success:true ,recordsTotal: team.total, recordsFiltered: team.total, data: team.users})
                }
            })

        }
    },
    'getAddStaff': function (model, req, method, cb) {
        if (method === 'POST') {
            const locationId = req.locationId;

            model.Users.GetRoles({all: false}, (err, roles) => {
                if (err) {
                    cb(true, { success:false});
                } else {
                    model.Common.GetStates({countryId: 101}, (err, states) => {
                        if (err) {
                            cb(true, { success:false});
                        } else {
                            model.Locations.GetDepartments({locationId}, (err, departments) => {
                                if (err) {
                                    cb(true, { success:false});
                                } else {
                                    model.Locations.GetDesignation({locationId}, (err, designations) => {
                                        if (err) {
                                            cb(true, { success:false});
                                        } else {
                                            cb(false, { success:true,fw:false,menuActive:'users',submenuActive:'',roles:roles,states:states,departments:departments,designations:designations}); 
                                        }
                                    })
                                }
                            })       
                        }
                    })
                }
            })
    
        }
    },
    'staffDetails': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.userId;
            const locationId = req.locationId;
        
            async.auto({
                userData: (cb) => {
                    model.Users.GetSingle({userId}, (err, user) => {
                        cb(err ? err : null, user)
                    })
                },
                states: (cb) => {
                    model.Common.GetStates({countryId: 101}, (err, states) => {
                        cb(err ? err : null, states)
                    })
                },
                cities: ['userData', (result, cb) => {
                        model.Common.GetCities({stateId: result.userData.state_id}, (err, cities) => {
                            cb(err ? err : null, cities)
                        })
                    }],
                roles: (cb) => {
                    model.Users.GetRoles({all: false}, (err, roles) => {
                        cb(err ? err : null, roles)
                    })
                },
                attendanceLogs: ['userData', (result, cb) => {
                        model.Members.GetAttendanceByUserId({userId: result.userData.id, locationId}, (err, attendanceLogs) => {
                            cb(err ? err : null, attendanceLogs)
                        })
                    }],
                designations: (cb) => {
                    model.Locations.GetDesignation({locationId}, (err, designations) => {
                        cb(err ? err : null, designations)
                    })
                },
                departments: (cb) => {
                    model.Locations.GetDepartments({locationId}, (err, departments) => {
                        cb(err ? err : null, departments)
                    })
                },
                userEducations: (cb) => {
                    model.Users.GetEducations({userId}, (err, educations) => {
                        cb(err ? err : null, educations)
                    })
                },
                userExperience: (cb) => {
                    model.Users.GetExperience({userId}, (err, experience) => {
                        cb(err ? err : null, experience)
                    })
                },
                userSalaryLog: (cb) => {
                    model.Users.GetUserSalaryLog({userId}, (err, salaryLog) => {
                        cb(err ? err : null, salaryLog)
                    })
                },
                userPTPayLog: (cb) => {
                    model.Users.GetUserPTPayLog({userId}, (err, payLog) => {
                        cb(err ? err : null, payLog)
                    })
                },
                locations: (cb) => {
                    model.Locations.GetById({locationId}, (err, location) => {
                        if (err) {
                            cb(err)
                        } else {
                            model.Locations.GetByBrandId({brandId: location.brands_id}, (err, locations) => {
                                cb(err ? err : null, locations)
                            })
                        }
                    })
                },
                userLocations: (cb) => {
                    model.Users.GetAssignedLocations({userId}, (err, locations) => {
                        locations.locations.forEach((l, i) => {
                            locations.locations[i] = l.id
                        })
                        cb(err ? err : null, locations.locations)
                    })
                },
                userStatusLogs: (cb) => {
                    model.Users.GetStatusLogs({userId}, (err, statusLogs) => {
                        cb(err ? err : null, statusLogs);
                    })
                },
                timeSlots: (cb) => {
                    model.Team.GetTimeSlots({userId, locationId}, (err, timeSlots) => {
                        cb(err ? err : null, timeSlots);
                    })
                },
                brandTimeSlots: (cb) => {
                    model.Locations.GetTimeSlots({locationId, offset:0, limit: 100}, (err, timeSlots) => {
                        cb(err ? err : null, timeSlots.timeSlots);
                    })
                },
                shifts: (cb) => {
                    model.Team.GetShifts({userId}, (err, shifts) => {
                        cb(err ? err : null, shifts);
                    })
                },
                brandShifts: (cb) => {
                    model.Locations.GetShifts({locationId, offset:0, limit:100}, (err, shifts) => {
                        cb(err ? err : null, shifts.shifts);
                    })
                },
                feedbacks: (cb) => {
                    model.Members.GetFeedback({userId}, (err, feedbacks) => {
                        cb(err ? err : null, feedbacks);
                    })
                },
            }, (err, result) => {
                if (err) {
                    cb(err,{success:false})
                } else {
                cb(false,{success:true,
                result
                
                })
                }
            })
    
        }
    },
    'addStaff':function (model, req, method, cb) {
        if (method === 'POST') {
           
            const options = {
                locationId : req.locationId,
                fname: req.user_fname,
                lname: req.user_lname,
                email: req.user_email,
                phone: req.user_phone,
                password: req.user_password,
                roleId: req.role_id,
                // locationId,
                gender: req.gender, 
                address1: req.address_line_1,
                address2: req.address_line_2,
                cityId: (req.city_id)?(req.city_id):(null),
                stateId: (req.state_id)?(req.state_id):(null),
                zip: req.zip,
                marital_status: (req.marital_status)?(req.marital_status):(null),
                emergency_contact_name: req.emergency_contact_name,
                emergency_contact_number: req.emergency_contact_number,
                blood_group: req.blood_group,
                birth_date: moment(req.birth_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                anniversary_date: moment(req.anniversary_date, 'DD-MM-YYYY').format('YYYY-MM-DD')
            };
            async.auto({
                addUser : (cb) => {
                    model.Users.Add(options, (err,id) => {
                        if (err) {
                            cb(err);
                        }else{
                            cb(null, id);
                        }
                    })
                },
                AddProfile : ['addUser', (result, cb) => {
                    model.Users.AddProfile({userId: result.addUser, department: req.user_department, designation: req.user_designation}, (err) => {
                        cb(err ? err : null)
                    })
                }],
                AddEducation : ['addUser', (result, cb) => {
                        model.Users.AddEducation({userId: result.addUser, educationLevel: req.education.educationLevel, institute:req.education.institute, description:req.education.description, month:req.education.month, year:req.education.year}, (err) => {
                          
                        cb(err ? err : null)
                    })
                }],
                AddExperience : ['addUser', (result, cb) => {
                        model.Users.AddExperience({userId: result.addUser, jobPosition: req.experience.jobPosition, employerName:req.experience.employerName, jobDescription: req.experience.jobDescription, fromMonth: req.experience.fromMonth, toMonth: req.experience.toMonth, fromYear: req.experience.fromYear, toYear: req.experience.toYear}, (err) => {
                          
                        cb(err ? err : null)
                    })
                }],
                AddSalary : ['addUser', (result, cb) => {
                        model.Users.AddSalary({userId: result.addUser, locationId: options.locationId, salaryType:req.compensation_salary.salaryType, salaryAmount: req.compensation_salary.salaryAmount, department:req.compensation_salary.department, designation:req.compensation_salary.designation, isPromoted:1}, (err) => {
                           
                        cb(err ? err : null)
                    })
                }],
            }, function(err, result){
                if(err){
                    cb(true,{success: false});
                }else{
                    cb(false,{success: true, id:result.addUser});
                }
            })
    
        }
    },

    'addStaff1':function (model, req, method, cb) {
        if (method === 'POST') {
           
            const options = {
                locationId : req.locationId,
                fname: req.user_fname,
                lname: req.user_lname,
                email: req.user_email,
                phone: req.user_phone,
                password: req.user_password,
                roleId: req.role_id,
                // locationId,
                gender: req.gender, 
                address1: req.address_line_1,
                address2: req.address_line_2,
                cityId: (req.city_id)?(req.city_id):(null),
                stateId: (req.state_id)?(req.state_id):(null),
                zip: req.zip,
                marital_status: (req.marital_status)?(req.marital_status):(null),
                emergency_contact_name: req.emergency_contact_name,
                emergency_contact_number: req.emergency_contact_number,
                blood_group: req.blood_group,
                birth_date: moment(req.birth_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                anniversary_date: moment(req.anniversary_date, 'DD-MM-YYYY').format('YYYY-MM-DD')
            };
            async.auto({
                addUser : (cb) => {
                    model.Users.Add(options, (err,id) => {
                        if (err) {
                            cb(err);
                        }else{
                            cb(null, id);
                        }
                    })
                },
                AddProfile : ['addUser', (result, cb) => {
                    model.Users.AddProfile({userId: result.addUser, department: req.user_department, designation: req.user_designation}, (err) => {
                        cb(err ? err : null)
                    })
                }],
            }, function(err, result){
                if(err){
                    cb(true,{success: false});
                }else{
                    cb(false,{success: true, id:result.addUser});
                }
            })
    
        }
    },
    'addExperience':function (model, req, method, cb) {
        if (method === 'POST') {
            model.Users.AddExperience({userId: req.userId, jobPosition: req.jobPosition, employerName:req.employerName, jobDescription: req.jobDescription, fromMonth: req.fromMonth, toMonth: req.toMonth, fromYear: req.fromYear, toYear: req.toYear}, (err) => {          
                if(err){
                    console.log(err)
                    cb(err,{success:false})
                }else{
                    cb(false,{success:true})
                }
    
        })
    }
    },

    'updateExperience':function (model, req, method, cb) {
        if (method === 'POST') {
            model.Users.UpdateExperience({user_id: req.userId, job_position: req.jobPosition, employer_name:req.employerName, job_description: req.jobDescription, from_month: req.fromMonth, to_month: req.toMonth, from_year: req.fromYear, to_year: req.toYear, id:req.id}, (err) => {          
                if(err){
                    console.log(err)
                    cb(err,{success:false})
                }else{
                    cb(false,{success:true})
                }
    
        })
    }
    },    
    'addEducation':function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                educationLevel: req.educationLevel,
                institute: req.institute,
                description: req.description,
                month: req.month,
                year: req.year,
                userId: req.userId
            }
            model.Users.AddEducation(options, (err) => {
                if(err){
                    console.log(err)
                    cb(err,{success:false})
                }else{
                    cb(false,{success:true})
                }
            })
    }
    },
    'getEducation': function(model, req, method,cb){
        if(method === "POST"){
            console.log(req)
            model.Users.GetEducations({userId: req.userId},(err, education)=>{
                if(err){
                    console.log(err)
                    cb(true,{success:false})
                }else{
                    cb(false, {success:true, education})
                }
            })
        }
    },

    'getExperience': function(model, req, method,cb){
        if(method === "POST"){
            model.Users.GetExperience({userId: req.userId},(err, experience)=>{
                if(err){
                    console.log(err)
                    cb(true,{success:false})
                }else{
                    cb(false, {success:true, experience})
                }
            })
        }
    },

    'getSalary': function(model, req, method,cb){
        if(method === "POST"){
            model.Users.GetUserSalaryLog({userId: req.userId},(err, salary)=>{
                if(err){
                    console.log(err)
                    cb(true,{success:false})
                }else{
                    cb(false, {success:true, salary})
                }
            })
        }
    },
   
    'addSalary':function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                userId: req.userId,
                salaryType: req.salaryType,
                salaryAmount: req.salaryAmount,
                department: req.department,
                designation: req.designation,
                isPromoted: req.isPromoted,
                locationId: req.locationId
            }
           
            model.Users.AddSalary(options, (err) => {     
                if(err){
                    console.log(err)
                    cb(err,{success:false})
                }else{
                    cb(false,{success:true})
                }
            })
    }
    },

    'updateStaff':function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                userId:req.user_id,
                locationId : req.locationId,
                fname: req.user_fname,
                lname: req.user_lname,
                email: req.user_email,
                phone: req.user_phone,
                password: req.user_password,
                roleId: req.role_id,
                gender: req.gender, 
                address1: req.address_line_1,
                address2: req.address_line_2,
                cityId: (req.city_id)?(req.city_id):(null),
                stateId: (req.state_id)?(req.state_id):(null),
                zip: req.zip,
                marital_status: (req.marital_status)?(req.marital_status):(null),
                emergency_contact_name: req.emergency_contact_name,
                emergency_contact_number: req.emergency_contact_number,
                blood_group: req.blood_group,
                birth_date: moment(req.birth_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                anniversary_date: moment(req.anniversary_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                departments_id:req.user_department,
                designation_id:req.user_designation
            };
                    model.Users.Update(options, (err,id) => {
                        if (err) {
                            cb(err);
                        }else{
                            cb(null, id);
                        }
                    })
    
        }
    },
    'delete':function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                teamMemberId: req.user_id
            }
            model.Users.Delete(options, (err) => {
                if (err) {
                    cb(true, { success:false});
                }
                cb(false, { success:true});
            })
    
        }
    },
    'change-password':function (model, req, method, cb) {
        if (method === 'POST') {
           
            const options={
                userId: req.user_id,
                oldPassword: req.oldPassword,
                newPassword: req.newPassword
            }
            model.Users.ChangePassword(options, (err, data) => {
                if (err) {
                    cb(true, { success:false});
                } else {
                    cb(false, { success:true});
                }
            })
    
        }
    }
}