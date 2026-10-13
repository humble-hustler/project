/********************************************************/
/***** API Shop Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const moment = require('moment');
const models = require('../../models')
const async = require('async');
const _ = require('lodash');

router.post('/confirm', (req, res) => {
    const post = req.body;

    const options = {
        paymentId: post.paymentResponse.razorpay_payment_id,
        signature: post.paymentResponse.razorpay_signature,
        orderId: post.paymentResponse.razorpay_order_id,
        userId: post.userId,
        shippingId: post.shippingId
    }

    async.auto({
        cart: (callback) => {
            models.Cart.GetUserCart({userId:post.userId}, (err, cart) => {
                callback(err ? err : null, cart.cart)
            })
        },
        createOrder: (callback) => {
            models.Orders.Create(options, (err, orderId) => {
                if (err) {
                 
                    callback(err)
                } else {
                    callback(null,orderId)
                }
            })
        },
        insertProducts : ['cart','createOrder',(result,callback) => {
            var cart = (result.cart)?(JSON.parse(result.cart)):({});
            var line = (cart.line)?(cart.line):([]);
            options.cart = line;
            models.Orders.InsertProducts(options, (err) => {
                if (err) {
                  
                    callback(err)
                } else {
                    callback(null)
                }
            })
        }],
        deleteCart: ['insertProducts',(result,callback) => {
            models.Cart.DeleteUserCart({userId: post.userId}, (err) => {
                if (err) {
                  
                    callback(err)
                } else {
                    callback(null)
                }
            })
        }]
    },function(err,result){
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true})
        }
    })
})



module.exports = router;