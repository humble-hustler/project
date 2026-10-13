const async = require('async');
const _ = require('lodash');
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const config = require('../../config')
const Razorpay = require('razorpay');
const razorPay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});

router.get('/', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    models.ShopProducts.getPromotionsImage((err, images) =>{
        if(err){
            res.send({ success: false })
        }else{
            res.render('super-admin/promotions', {
                images:images,
                menuActive: 'promotions',
                submenuActive: '',
                title: 'Exlshop | Promotions Management',
                scripts: [ '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/page-level/promotions.js', , '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })
        }
    })
})

router.post('/', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    var fileArr = [];

    if (!files.files.length) {
        fileArr.push(files.files)
    } else {
        fileArr = files.files;
    }
    async.map(fileArr, (i, callback) => {
        var filename = `${moment().unix()}-${i.name}`;
        var imgDir = `${require('path').resolve()}/public/promotions/${filename}`;
        i.mv(imgDir, (err) => {
            if (err) {
                callback(err)
            } else {
                callback(null, { fileName: filename})
            }
        })
    }, (err, result) => {
        if (err) {
            res.send({ success: false })
        } else {
            models.ShopProducts.promtionsImage({images: result }, (err) => {
                if (err) {
                    res.send({ success: false })
                } else {
                    res.redirect('back')
                }
            })
        }
    })
})

router.post("/delete-image", auth.checkPermission(['super-admin']), (req, res) =>{
    const models = req.Core.Models;
    models.ShopProducts.deletePromotionImage(req.body, (err, data)=>{
        if(err){
            res.send({ success: false })
        }else{
            res.send({ success: true, data})
        }
    })
})
module.exports = router;