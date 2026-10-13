/********************************************************/
/***** API Shop Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const moment = require('moment');
const models = require('../../models')
const async = require('async');
const _ = require('lodash');

router.post('/',(req,res) => {
    const options = {userId: req.body.userId};

    async.parallel({
        user: (cb) => {
            models.Users.GetSingle(options, (err, user) => {
                delete user.password;
                cb(err ? err : null, user)
            })
        },
        orderCount: (cb) => {
            models.Orders.GetCountByUser(options, (err, count) => {
                cb(err ? err : null, count)
            })
        },
        recentOrder: (cb) => {
            options.offset = 0;
            options.limit = 1;
            models.Orders.RecentOrdersByUser(options, (err, order) => {
                if (err) {
                    return cb(err)
                }
                async.map(order.orderItems, (l, callback) => {
                    models.ShopProducts.GetForCart({productId: l.product_id, variationId: l.variation_id}, (err, products) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, _.merge(l, products))
                        }
                    })
                }, (err, result) => {
                    cb(err ? err : null, {orderItems: result, orderData: order.orderData})
                })
            })

        }
    }, (err, result) => {
        if (err) {
          
            res.send({success:false})
        } else {
            res.send({
                success:true,
                user: result.user,
                orderCount: result.orderCount,
                recentOrderItems: result.recentOrder.orderItems,
                recentOrderData: result.recentOrder.orderData
            })
        }
    })
})

router.post('/orders', (req, res) => {
    const post = req.body;
    
    models.Orders.GetByUserId({userId: post.userId, offset: 0, limit: 20}, (err, orders) => {
        if (err) {
         
            res.send({success:false})
        } else {
            res.send({
                success: true,
                orders
            })
        }
    })
})
router.post('/deliver_order',(req,res)=>{
    const post = req.body;
    models.Orders.GetDeliverOrder({userId: post.userId}, (err, deliver_orders) => {
        if (err) {
          
            res.send({success:false})
        } else {
            res.send({
                success: true,
                deliver_orders
            })
        }
    })
})


router.post('/cancel_order',(req,res)=>{
    const post = req.body;
    models.Orders.cancel_order({userId: post.userId,orderId:post.orderId,productId:post.productId}, (err,product) => {
        if (err) {
            res.send({success:false})
        }
        else{
            res.send({
                success: true,
                message : 'Order Canceled'
            })
        }
    })
})


router.post('/add_review',(req,res)=>{
    const post = req.body;
    models.Orders.AddReview({userId :post.userId,orderId :post.orderId,productId : post.productId,review:post.review},(err,review)=>{
        if (err) {
       
            res.send({success:false})
        }
        else{
            res.send({
                success: true,
                message : 'Review Submitted'
            })
        }
    })
})
router.post('/view_review',(req,res)=>{
    const post = req.body;
    models.Orders.ViewReview({userId: post.userId},(err,review)=>{
        if(err){
          
            res.send({success:false})
        }
        else{
            res.send({
                success: true,
                message : review
            })
        }
    })
})
router.post('/orders/get-single', (req, res) => {
    const post = req.body;
    const orderOpts = {orderId: post.orderId, userId: post.userId};

    async.parallel({
        orderData: (cb) => {
            models.Orders.GetSingleData(orderOpts, (err, orderData) => {
                cb(err, orderData)
            })
        },
        orderProductItems: (cb) => {
            models.Orders.GetProductLine(orderOpts, (err, orderProducts) => {
                if (err) {
                    return cb(err)
                }
                async.map(orderProducts, (l, callback) => {
                    models.ShopProducts.GetForCart({productId: l.product_id, variationId: l.variation_id}, (err, products) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, _.merge(l, products))
                        }
                    })
                }, (err, result) => {
                    cb(err ? err : null, result)
                })
            })
        }
    }, (err, result) => {
        if (err) {
         
            res.send({success: false})
        } else {
            res.send({
                success:true,
                orderData: result.orderData,
                orderItems: result.orderProductItems
            })
        }
    })
})

router.post('/shipping-address', (req, res) => {
    const post = req.body;

    async.parallel({
        states: (cb) => {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                cb(err ? err : null, states)
            })
        },

        shippingAddresses: (cb) => {
            models.Users.GetShippingAddress({userId: post.userId}, (err, address) => {
                cb(err ? err : null, address)
            })
        }
    }, (err, result) => {
        if(err){
            res.send({success: false});
        }else{
            res.send({
                success:true,
                states: result.states,
                shippingAddresses: result.shippingAddresses
            });
        }
    })
})

router.post('/add-new-address', (req, res) => {
    const post = req.body;

    const options = {
        label: post.label,
        name: post.name,
        userId: post.userId,
        addressLine1: post.addressLine1,
        addressLine2: post.addressLine2,
        stateId: post.stateId,
        cityId: post.cityId,
        phone: post.phone,
        zip: post.zip 
    }

    models.Users.AddShippingAddress(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/update-address', (req, res) => {
    const post = req.body;
    const options = {
        id: post.id,
        label: post.label,
        name: post.name,
        addressLine1: post.addressLine1,
        addressLine2: post.addressLine2,
        stateId: post.stateId,
        cityId: post.cityId,
        phone: post.phone,
        zip: post.zip
    }
  
    models.Users.UpdateShippingAddress(options, (err) => {
        if (err) {
      
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

module.exports = router;