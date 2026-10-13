/********************************************************/
/***** Index Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const config = require('../config')
const Razorpay = require('razorpay');
const razorPay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});
const _ = require('lodash');


/* GET Home Page */
router.get('/', (req, res) => {
    res.redirect('/login')
});

router.get('/forgot-password', (req, res) => {
    res.render('/front/fortgot-password')
})

router.post('/verification-email-send', function (req, res, next) {
    var email = req.body.email;
    const models = req.Core.Models;

    models.Users.SendVerificationEmail({ email }, (err, valid) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, valid })
        }
    })

})

router.get('/Validate-user', function (req, res, next) {
    res.render('../views/front/forgot-password.html', {
        title: 'Reset Password Page',
        token: req.query.token
    });
});

router.post('/update-password', function (req, res, next) {
    var token = req.body.token;
    var password = req.body.password;
    const models = req.Core.Models;
    models.Users.forgotPassword({ token, password }, (err, valid) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, valid })
        }
    })
})

router.get('/login', (req, res) => {
    var session = req.session.user;
    if (session && session.role_name === 'super-admin') {
        res.redirect('/super-admin/dashboard');
    } 
    else if(session && session.role_name !== 'super-admin') {
    
       
     if(req.session.user.status==0 && session.role_name=='staff')
       {
       
        res.redirect('/app/dashboard');
        
       }
       else if(req.session.user.status !=1 && session.role_name=='brand-admin'){
        res.redirect('/app/subscriptionrequest');
       }
       else{
        res.redirect('/app/dashboard');
       }
        
    } else {
        res.render('front/login', {
            title: 'Exlshop | Login',
            styles: ['/global/vendor/toastr/toastr.min.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css','/global/vendor/select2/select2.css'],
            scripts: ['/global/vendor/toastr/toastr.min.js', '/global/vendor/webcam.js/webcam.min.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js','/global/vendor/select2/select2.js']
        })
    }
})
/* Login form POST */

router.post('/login', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const { email, password } = post;
    models.Users.Login({ email, password }, (err, user) => {
        if (err) {
            // req.flash('error', email, password, 'Username or Password does not match!');
            // res.redirect('back');
            res.send({ success: false, err})
        } else {
            req.session.user = user;
            // if (user.role_name !== 'super-admin' && user.role_name !== 'brand-admin') {
            //     res.redirect('/app/staffdashboard');
            // }
            // else
             if (user.role_name === 'super-admin') {
                res.redirect('/super-admin/dashboard');
            }
            else {
                models.Users.GetAssignedLocations({ userId: user.id }, (err, locations) => {
                    if (err) {
                        req.flash('error', 'Some error occurred. Please try again later');
                        res.redirect('back');
                    } else {
                        req.session.user.status=locations.locations[0].status
                            if (locations.locations[0].status !== 1) {
                                req.session.user.assignedLocations = locations.locations;
                                if (req.session.user.status == 0 && req.session.user.role_name == 'staff') {
                                    res.redirect('/app/dashboard/' + locations.locations[0].id);
                                }else
                                {res.redirect('/app/subscriptionrequest/' + user.id+'/'+locations.locations[0].id);}
                            } else {
                                req.session.user.assignedLocations = locations.locations;
                                req.session.user.status =locations.locations[0].status;
                                res.redirect('/app/dashboard/' + locations.locations[0].id);
                        } 
                    }
                })
            }
        }
    })
})



router.post('/confirm', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        paymentId: post.paymentResponse.razorpay_payment_id,
        signature: post.paymentResponse.razorpay_signature,
        orderId: post.paymentResponse.razorpay_order_id,
        userId: req.session.user.id,
        shippingId: post.shippingId
    }

    models.Orders.Create(options, (err, orderId) => {
        if (err) {
            res.send({ success: false })
        } else {
            const orderOptions = {
                orderId: orderId,
                cart: req.session.cart.line
            }
            models.Orders.InsertProducts(orderOptions, (err) => {
                if (err) {
                    res.send({ success: false })
                } else {
                    res.send({ success: true })
                }
            })
        }
    })
})

router.post('/email-valid', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const { email } = post;

    models.Users.IsEmailValid({ email }, (err, valid) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, valid })
        }
    })
})

router.post('/phone-valid', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const { phone } = post;

    models.Users.IsPhoneValid({ phone }, (err, valid) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, valid })
        }
    })
})

module.exports = router;