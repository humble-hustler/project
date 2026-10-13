const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
const moment = require('moment');
const async = require('async');
const { result } = require('lodash');
module.exports = {
    'category-view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = "";
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
            const userId = req.user_id;
            const locationId = req.location_id;

            model.ShopProducts.GetRequestedCategory({ userId: userId,locationId, offset, limit, search, orderByColumn, orderByValue, filter } ,(err, categories) => {
                if (err) {
                    cb(true, { success: false })
                } else {
                    cb(false, { success: true, data: categories })
                }

            })
        }
    },
    'add-category': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = '';

            model.ShopProducts.AddRequestedCategory({name: req.category_name}, (err, result) => {
                if (err) {
                    cb(err)
                } else {
                    cb(false,{success:true,result})
                }
            })
        }
    },
    'add-subcategory': function (model, req, method, cb) {
        if (method === 'POST') {
            const post = req.body;
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = '';
            const subcategory_name= req.subcategory_name;
            const category_id=req.category_id;
            model.ShopProducts.AddRequestedSubCategory({ category_id:category_id,name: subcategory_name}, (err, result) => {
                if (err) {
                    cb(err)
                } else {
                    cb(false,{success:true,data:result})
                }
            })
        }
    },
    'add-subsubcategory': function (model, req, method, cb) {
        if (method === 'POST') {
            const post = req.body;
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = '';
            const category_id=req.category_id;
            const subcategory_id=req.subcategory_id;
            const name= req.subsubcategory_name 
            model.ShopProducts.AddRequestedSubSubCategory({ category_id,subcategory_id,name}, (err, result) => {
                if (err) {
                    cb(err)
                } else {
                   cb(false,{success:true,data:result})
                }
            })
        }
    },

    'getParentCategory': function (model, req, method, cb){
        if(method === 'GET'){
            model.ShopProducts.getParentCategory((err, getParentCategory) =>{
                if(err){
                    cb(err)
                }else{
                    cb(false, {success: true, getParentCategory:getParentCategory})
                }
            })
        }
    },

    'getSubCategory': function (model, req, method, cb){
        if(method === 'POST'){
            const subcategory_id = req.subcategory_id
            model.ShopProducts.getSubCategory({subcategory_id},(err, getSubCategory) =>{
                if(err){
                    cb(err)
                }else{
                    cb(false, {success: true, getSubCategory:getSubCategory})
                }
            })
        }
    },

    'getSub-Sub-Category': function (model, req, method, cb){
        if(method === 'POST'){
            const id = req.id
           
            model.ShopProducts.getSubSubCategory({id}, (err, getSubSubCategory) =>{
                if(err){
                    cb(err)
                }else{
                    cb(false, {success: true, getSubSubCategory:getSubSubCategory})
                }
            })
        }
    },
} 