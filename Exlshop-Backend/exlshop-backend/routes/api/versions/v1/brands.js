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
    
    'getbrands': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 100;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            model.Brands.GetAll({ all: true, offset, limit, search, orderByColumn, orderByValue }, (err, brands) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { recordsTotal: brands.total, recordsFiltered: brands.total, data: brands.brands });
                }
            })
        }
    },
    'getbyid': function (model, req, method, cb) {
        if (method === 'POST') {
            const id = req.id;
            model.Brands.GetById({ id: id }, (err, idbrands) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { recordsTotal: idbrands.total, recordsFiltered: idbrands.total, data: idbrands });
                }
            })
        }
    },
    'getmemberid': function (model, req, method, cb) {
        if (method === 'POST') {
            var userId = req.userid;
            model.Brands.GetByMemberId({ userId: userId }, (err, midbrands) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { data: midbrands });
                }
            })
        }
    },
    'getsearch': function (model, req, method, cb) {
        if (method === 'POST') {
            var text = req.text;
            model.Brands.Search({ text: text }, (err, search) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { data: search });
                }
            })
        }
    },
    'search-location': function (model, req, method, cb) {
        if (method === 'POST') {
            var text = req.text;
            model.Locations.SearchLocation({text:text}, (err, locations) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { data: locations });
                }
            })
        }
    },
    'UpdateBrand': function (model, req, method, cb) {
        if (method === 'POST') {
           var name= req.name;
           var id= req.id;
           var stat = req.active;
            model.Brands.UpdateBrand({name:name, id :id,stat:stat}, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success:true});
                }
            })
        }
    },
    'addBrand': function (model, req, method, cb) {
        if (method === 'POST') {
          var name= req.name;
          var active = req.active;
            model.Brands.Add({name:name, active:active}, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success:true});
                }
            })
        }
    },

    'getLocations' : function(model, req, method, cb){
        if(method === "GET"){
            model.Brands.getLocations((err, locations) =>{
                if(err){
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                }else{
                    cb(false, {success:true, locations})
                }
            })
        }
    },

    'toupdateeducation' : function(model, req, method, cb){
        if(method === "POST"){
            console.log(req)
            model.Users.updateEducation({id:req.id, education_level : req.education_level, institute : req.institute, description : req.description, month : req.month, year : req.year, user_id : req.userId}, (err, data) =>{
                if(err){
                    console.log(err)
                    cb(true, {success:false})
                }else{
                    cb(false, {success:true})
                }
            })
        }
    },

    'updateBrandLogo' : function(model, req, method, cb){
        if(method === "POST"){
            const files = req.files
            const location_id = req.location_id
            const filename = files.file.name;
            const brand_logo = files.file;
            var imgDir = `${require('path').resolve()}/public/images/${filename}`;
            
            brand_logo.mv(imgDir, (err,callback) => {
                if (err) {
                    console.log(err)
                    callback(err)
                } else {
                    model.Brands.UpdateBrandLogo({location_id, filename}, (err) => {
                        if (err) {
                            console.log(err)
                            cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                        } else {
                            cb(false, {success:true})
                        }
                    })
                }
            })
        }
    },

    'deleteLogo' : function(model, req, method, cb){
        if(method === "POST"){
            const location_id = req.location_id
            model.Brands.DeleteBrandLogo({location_id}, (err) => {
                if (err) {
                    console.log(err)
                    cb(true,{success: false})
                } else {
                    cb(false,{success: true});
                }
            })
        }
    },


}

