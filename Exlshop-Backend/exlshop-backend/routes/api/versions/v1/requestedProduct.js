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
    'requestedproducts-view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const post = req.body;
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
        
            model.ShopProducts.getRequestedProduct({offset, limit, search, orderByColumn, orderByValue, filter}, (err, products) => {
                if (err) {
                    cb(true,{success: false})
                } else {
                    cb(false, { draw: req.query, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })
               
                }
            }) 
        }
    },
    'add-reqproduct': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                name: req.product_name,
                id:req.id
            }
            model.ShopProducts.AddReqProducts(options, (err) => {
                if (err) {
                    cb(true,{ success: false })
                } else {
                    cb(false,{ success: true })
                }
            })
        }
    },
    'requestedcategories-view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const post = req.body;
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
        
            model.ShopProducts.getRequestedCategory({ offset, limit, search, orderByColumn, orderByValue, filter }, (err, products) => {
                if (err) {
                    cb(true,{ success: false })
                } else {
                    cb(false,{ success: true, draw: req.query, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })
                }
            })
        }
    },
    'add-reqcategory': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                c_name: req.c_name,
                sub_name:req.sub_name,
                sub_sub_name:req.sub_sub_name,
                id:req.id,
                c_id:req.c_id,
                s_id:req.s_id
            }
            model.ShopProducts.AddReqcategory(options, (err) => {
                if (err) {
                    cb(true,{ success: false })
                } else {
                    cb(false,{ success: true })
                }
            })
        }
    },
}