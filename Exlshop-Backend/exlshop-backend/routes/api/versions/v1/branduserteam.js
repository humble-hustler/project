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
            model.Team.GetTeam({all: true, offset, limit, search, orderByColumn, orderByValue}, (err, team) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { recordsTotal: team.total, recordsFiltered: team.total, data: team.users});
                }
            })
        }
    },
    'add-team-member': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
               fname: req.fname,
                lname: req.lname,
                email: req.email,
                phone: req.phone,
                password: req.password,
                cpassword:req.cpassword,
                roleId: req.role,
                locationId: req.lid  
            }
            model.Users.Add(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success:true});
                }
            })
        }
    },
    'delete-team-member': function (model, req, method, cb) {
        if (method === 'POST') {
        
            const options = {
                teamMemberId: req.team_member_id
            }
            model.Users.Delete(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success:true});
                }
            })
        }
    },

}