const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const { response } = require('express');
const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
module.exports = {
    'view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            model.Users.GetSuperAdmins({ offset, limit, search, orderByColumn, orderByValue }, (err, users) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true, draw: req.query, recordsTotal: users.total, recordsFiltered: users.total, data: users.users });
                }
            })
        }
    },
    'user-add': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                fname: req.user_fname,
                lname: req.user_lname,
                email: req.user_email,
                phone: req.user_phone,
                password: req.user_password,
                roleId: 1
            }
            model.Users.AddSuperAdmin(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true })
                }

            })
        }
    },
    'user-get-single': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.userId;
            model.Users.GetSingle({ userId }, (err, user) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true, user: user });
                }
            })
        }
    },
    'user-update': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                id: req.update_user_id,
                fname: req.user_fname,
                lname: req.user_lname,
                email: req.user_email,
                phone: req.user_phone,
                roleId: 1
            }
            model.Users.Update(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true });
                }
            })
        }
    },
    'update-member':function(model,req,method,cb){
        if(method=="POST"){
            const options = {
                id : req.userId,
                fname: req.fname,
                lname: req.lname,
                email: req.email,
                phone: req.phone,
                roleId: req.roleId,
                location:req.location
            }
        
            model.Users.Update({options}, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success:true,data:options});
                }
            })
        }
    },
    'user-delete': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                teamMemberId: req.user_id
            }
            model.Users.Delete(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true });
                }
            })
        }
    },
    'user-search': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                userName: req.userName,
                roleId: 1
            }
            model.Users.SearchUser(options, (err, users) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true, users: users });
                }
            })
        }
    },
    'add-education': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                educationLevel: req.education_level,
                institute: req.institute,
                description: req.description,
                month: req.month,
                year: req.year,
                userId: req.user_id_education
            }
            model.Users.AddEducation(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true });
                }
            })
        }
    },
    'add-experience': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                jobPosition: req.job_position,
                employerName: req.employer_name,
                jobDescription: req.job_description,
                fromMonth: req.from_month_exp,
                fromYear: req.from_year_exp,
                toMonth: req.to_month_exp,
                toYear: req.to_year_exp,
                userId: req.user_id_experience
            }
            model.Users.AddExperience(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true });
                }
            })
        }
    },
    'update-experience' :function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                id: req.experience_id,
                jobPosition: req.job_position,
                employerName: req.employer_name,
                jobDescription: req.job_description,
                fromMonth: req.from_month_exp,
                fromYear: req.from_year_exp,
                toMonth: req.to_month_exp,
                toYear: req.to_year_exp
            }
            model.Users.UpdateExperience(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true });
                }
            })
        }
    },
    
    'update-education' :function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                id: req.education_id,
                educationLevel: req.education_level,
                institute: req.institute,
                description: req.description,
                month: req.month,
                year: req.year
            }
            model.Users.UpdateEducation(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true });
                }
            })
        }
    }
}