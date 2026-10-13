const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
const moment = require('moment');
const async = require('async');
module.exports = {
    'ViewStock': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
            const userId = req.user_id;
            const locationId = req.location_id;
        
            model.ShopProducts.GetProductAll({ userId, locationId, offset, limit, search, orderByColumn, orderByValue, filter }, (err, products) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, recordsTotal: products.total, recordsFiltered: products.total, data: products.products  })
                }
        
            })

        }
    },
    'OutOfStock': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
            const userId = req.user_id;
            const locationId = req.location_id;
        
            model.ShopProducts.GetOutOfStockProduct({ userId, locationId, offset, limit, search, orderByColumn, orderByValue, filter }, (err, products) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, recordsTotal: products.total, recordsFiltered: products.total, data: products.outofstockproducts  })
                }
            })
        }
    },
    'LowStock': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
            const userId = req.user_id;
            const locationId = req.location_id;
        
            model.ShopProducts.GetLowStockProduct({ userId, locationId, offset, limit, search, orderByColumn, orderByValue, filter }, (err, products) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, recordsTotal: products.total, recordsFiltered: products.total, data: products.lowstockproducts  })
                }
            })
        }
    },
   'UpdateStock': function (model, req, method, cb) {
    if (method === 'POST') {
        const userId = req.user_id;
        const locationId = req.location_id;
        const productId = req.product_id;
    
        model.ShopProducts.UpdateStockProduct({productId, userId, locationId }, (err, updateproducts) => {
            if (err) {
                cb(true, { success: false });
            } else {
                cb(false, { success: true, updateproducts })
            }
    
        })

    }
},
} 