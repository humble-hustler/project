const async = require('async');
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const moment = require('moment');

router.get('/', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = 0;
    const limit = 100;
    const orderByArr = ' ';
    const orderByColumn = '';
    const orderByValue ='';
    const filter = '';
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    async.parallel({
    categories: (cb) => {
        models.ShopProducts.GetCategories((err, categories) => {
       
            cb(err ? err : null, categories)
        })
    },
    products:(cb)=>{
    models.ShopProducts.GetProductAll({ userId, locationId, offset, limit, search:'', orderByColumn, orderByValue, filter }, (err, products) => {
        cb(err ? err : null, products.products)
    })
    }
}, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
          res.render('app/view-stock', {
            title: 'Exlshop | Stock',
            fw: false,
            menuActive: 'Stock',
            submenuActive: '',
            products:result.products,
            categories:result.categories,
            scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/view-stock.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
            styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
        })
        }
    })
})
router.post('/ViewStock', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['d.file_name', 'a.name', 'product_type', 'a.is_service', 'categories', 'f.status'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    const globalproduct_id = req.body.globalproduct_id;

    models.ShopProducts.GetProductAll({ userId, locationId, offset, limit, search,filter, orderByColumn, orderByValue, filter }, (err, products) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, draw: req.query.draw, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })
        }

    })
})
router.post('/OutOfStock', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['d.file_name', 'a.name', 'product_type', 'a.is_service', 'categories', 'f.status'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;

    models.ShopProducts.GetOutOfStockProduct({ userId, locationId, offset, limit, search, orderByColumn, orderByValue, filter }, (err, outofstockproducts) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, draw: req.query.draw, recordsTotal: outofstockproducts.total, recordsFiltered: outofstockproducts.total, data: outofstockproducts.outofstockproducts })
        }

    })
})
router.post('/UpdateStock', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    const productId = post.productId;
    const stock_status =post.stock_status;

    models.ShopProducts.UpdateStockProduct({ productId,userId, locationId,stock_status }, (err, updateproducts) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true , status:stock_status})
        }

    })
})

router.post('/UpdateQuantity', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    const id = post.productId;
    const quantity =post.quantity;

    models.ShopProducts.UpdateQuantity({ quantity, id}, (err, updatequantity) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true , updatequantity:updatequantity})
        }

    })
})

router.get('/dealsoftheday', auth.checkPermission(['brand-admin', 'manager','staff']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    
    models.ShopProducts.GetProductAll1({ userId: userId,locationId}, (err, products) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.render('app/dealsoftheday', {
                title: 'Exlshop | dealsoftheday',
                fw: false,
                menuActive: 'Deals',
                submenuActive: '',
                products:products.products,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/dealsoftheday.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            }) 
        }
    })
    
    
})
module.exports = router;