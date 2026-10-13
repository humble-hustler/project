/********************************************************/
/***** Index Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const pincodeDirectory = require('india-pincode-lookup');
const models = require('../models');

router.post('/remove_savelater_items',(req,res)=>{
    const models = req.Core.Models; 
    const post = req.body;
    var line = req.session.cart.line;
   
    if (req.session.user) {
        _.remove(line, item => (item.productId == post.productId ));

        models.Cart.UpdateSaveforlater({userId: req.session.user.id, cart: JSON.stringify(req.session.cart)}, (err) => {
            if (err) {
              
                res.send({success: false})
            } else {
            const lineIdx = _.findIndex(line, {productId: post.productId});
         
                line.push({
                    productId: post.productId,
                    quantity: post.quantity,
                    save_for_later:0
                })
        
            models.Cart.SetUserCart({userId: req.session.user.id, cart: JSON.stringify(req.session.cart)}, (err) => {
                if (err) {
                    res.send({success: false})
                } else {
                    res.send({success: true, cartQty: line.length})
                }
   })

}
})
    } else {
        res.send({success: true, cartQty: line.length})
    }

})

router.post('/savelater_items',(req,res)=>{
    const models = req.Core.Models; 
    const post = req.body;
    
    const options = {
        productId: post.productId,
        quantity:post.quantity,
        userId: req.session.user.id
    }
   
    var line = req.session.cart.line;
  
      _.remove(line, item => (item.productId == post.productId ));
    if (req.session.user) {
        if (!_.has(req.session, 'cart')) {
            req.session.cart = {
                line: []
            }
        }

                models.Cart.UpdateUserCart({userId: req.session.user.id, cart: JSON.stringify(req.session.cart)}, (err) => {
                    if (err) {
                     
                        res.send({success: false})
                    } else {
                       
                            const lineIdx = _.findIndex(line, {productId: post.productId});
               
                    line.push({
                        productId: post.productId,
                        quantity: post.quantity,
                         save_for_later:1
                    })  
                    req.session.cart.cartTotal=0
                    req.session.cart.cartTotalDisc=0
                    req.session.cart.deliveryCharge=0
                  
           
                        models.Cart.SetSaveForLater({userId: req.session.user.id, cart: JSON.stringify(req.session.cart)}, (err) => {
                            if (err) {
                                res.send({success: false})
                            } else {
                                res.send({success: true, cartQty: line.length})
                            }
                        })
                        
                    }
                })
       
    } else {
        res.send({success: true, cartQty: line.length})
    }
})

router.post('/get-address-details', (req, res) => {
    models.Users.getAddressDetails(req.body, (err, data) => {
        if(err){
           
            res.send({success:false})
        }else{
           
            res.send( {success: true, data})
        }
    })
})

router.post('/update-address-details', (req, res) => {
    models.Users.updateAddressDetails(req.body, (err, data) => {
        if(err){
            res.send({success:false})
        }else{
            res.send( {success: true, data})
        }
    })
})

router.post('/delete-address-details', (req, res) => {
    models.Users.deleteAddressDetails(req.body, (err, data) => {
        if(err){
            res.send({success:false})
        }else{
            res.send( {success: true, data})
        }
    })
})

router.get('/account', (req, res) => {
    const models = req.Core.Models;
    const options = {userId: req.session.user.id}
    async.parallel({
        orderCount: (cb) => {
            models.Orders.GetCountByUser(options, (err, count) => {
                cb(err ? err : null, count)
            })
        },
        deliveritem: (cb) => {
            models.Orders.deliveritem(options, (err, delivercount) => {
                cb(err ? err : null, delivercount)
            })
        },
        awaitingOrder: (cb) => {
            models.Orders.awaitingOrder(options, (err, awaitingOrder) => {
                cb(err ? err : null, awaitingOrder)
            })
        },
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
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
                    cb(err ? err : null, {orderItems: result, order: order, orderData: order.orderData})
                })
            })

        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('my-account/index', {
                title: 'FitBiz - My Account',
                menuActive: 'my-account',
                orderCount: result.orderCount,
                deliverItem : result.deliveritem,
                awaitingOrder : result.awaitingOrder,
                shop_categories: result.category,
                recentOrderItems: result.recentOrder.orderItems,
                recentOrderData: result.recentOrder.orderData
            })
        }
    })
});

router.post('/zip-valid',(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
   
    models.Users.getCity({cityId :post.cityId}, (err,city) => {
        if(city){
            var data = pincodeDirectory.lookup(post.zip);
            if(data[0].districtName == city[0].name){
                res.send({ success: true })  
            }
            else{
                res.send({ success: false })
            }
        }
        else{
            console.log('state not found');
        }
    })

})

router.post('/add-new-address', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    var userId = req.session.user.id

    models.Users.AddShippingAddress({post, userId}, (err, data) => {
        if (err) {
          res.send({success:false})
        } else {
           res.send({success:true})
        }
    })
})

router.get('/shopwishlist', (req, res) => {
    const models = req.Core.Models;
    async.parallel({
        shippingAddresses: (cb) => {
            if (req.session.user) {
                models.Users.GetShippingAddress({ userId: req.session.user.id }, (err, address) => {
                    cb(err ? err : null, address)
                })
            } else {
                cb()
            }
        },
        states: (cb) => {
            models.Common.GetStates({ countryId: 101 }, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        roles: (cb) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                cb(err ? err : null, roles)
            })
        },
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        brandLocations: (callback) => {
            models.Users.GetAllLocation((err, brandLocations) => {
                if (err) {
                
                    callback(err)
                } else {
                    callback(null, brandLocations)
                }
            })
        }
    }, (err, result) => {
        if (err) {
        
            res.redirect('/404')
        } else {
    res.render('my-account/shopwishlist', {
        title: 'Exl_shop - shopwishlist',
        shippingAddresses: result.shippingAddresses,
        states: result.states,
        shop_categories:result.category,
        roles:result.roles,
        brandLocations : result.brandLocations
    })
}

}) 

})

router.get('/shops', (req, res) => {
    const models = req.Core.Models;

    async.parallel({
        getCategory: (cb) => {
        models.ShopProducts.getSubCategory({ id: 0 }, (err, getCategory) => {
            cb(err ? err : null, getCategory)
        })
       },
       category:(cb)=>{
        models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
            if(err){
                cb(err);
            }else{
                cb(null,shop_categories);
            }
        })
    },
        roles: (cb) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                cb(err ? err : null, roles)
            })
        },
        brandLocations: (callback) => {
            models.Users.GetAllLocation((err, brandLocations) => {
                if (err) {
                  
                    callback(err)
                } else {
                    callback(null, brandLocations)
                }
            })
        }
    }, (err, result) => {
        if (err) {
          
            res.redirect('/404')
        } else {
    res.render('my-account/shops', {
        title: 'Exl_shop - SHOPS',
        getCategory:result.getCategory,
        roles:result.roles,
        shop_categories:result.category,
        brandLocations : result.brandLocations,
        styles: ['/plugins/toastr/toastr.min.css'],})
}
})
})

router.get('/ratereview12/:orderId', (req, res) => {
    const models = req.Core.Models;
    const post = req.body.post;

    async.parallel({
        shippingAddresses: (cb) => {
            if (req.session.user) {
                models.Users.GetShippingAddress({ userId: req.session.user.id }, (err, address) => {
                    cb(err ? err : null, address)
                  
                })
            } else {
                cb()
            }
        },
        states: (cb) => {
            models.Common.GetStates({ countryId: 101 }, (err, states) => {
                cb(err ? err : null, states)

            })
        },
        roles: (cb) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                cb(err ? err : null, roles)
            
            })
        },
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        orderData:(cb) =>{
                models.Orders.getProductByRate({ userId: req.session.user.id, orderId: req.params.orderId}, (err, orders) => {
                  
                    if(err){
                        cb(err);
                    }else{
                        cb(null, orders);
                    }
                    
                })
        },
        brandLocations: (callback) => {
            models.Users.GetAllLocation((err, brandLocations) => {
                if (err) {
                   
                    callback(err)
                } else {
                    callback(null, brandLocations)
                }
            })
        }
    }, (err, result) => {
        if (err) {
          
            res.redirect('/404')
        } else {
    res.render('my-account/ratereview', {
        title: 'Exl_shop - ratereview',
        shippingAddresses: result.shippingAddresses,
        states: result.states,
        orders: result.orderData,
        roles:result.roles,
        shop_categories: result.category,
        brandLocations : result.brandLocations,
        scripts: ['/plugins/toastr/toastr.min.js'],
        styles: ['/plugins/toastr/toastr.min.css']
    
    })
}

})  

})

router.post('/update-rate', (req, res) => {
   
    models.Orders.updateRate(req.body, (err, data) =>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success:true,  data})
        }
    })
})

router.post('/add-review', (req, res) => {
    models.Orders.addReview(req.body, (err, data) =>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success:true,  data})
        }
    })
})

router.post('/add-shop-review', (req, res) => {
    const post = req.body;
    models.Orders.addShopReview({review_text: post.review_text, userId: req.session.user.id, brand_id: post.brand_id, brand_location_id: post.brand_location_id, username: req.session.user.fname + " " + req.session.user.lname}, (err, data) =>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success:true,  data})
        }
    })
})

router.post('/add-rate1', (req, res) => {
   
    models.Orders.addRate(req.body, (err, data) =>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success:true,  data})
        }
    })
})

router.post('/add-shop-rate', (req, res) => {
    const post = req.body
    models.Orders.addShopRate({shop_rate : post.addProductRate,userId :req.session.user.id, username: req.session.user.fname, shopId:post.brand_id}, (err, data) =>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success:true,  data})
        }
    })
})

router.post('/update-shop-rate', (req, res) => {
    const post = req.body
    models.Orders.updateShopRate({shop_rate : post.updateProductRate,userId :req.session.user.id, username: req.session.user.fname, shopId:post.brand_id}, (err, data) =>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success:true,  data})
        }
    })
})

router.get('/paymentmode', (req, res) => {
    const models = req.Core.Models;
    const line = req.session.cart.line;
    async.parallel({
        products: (cb) => {
            async.map(line, (l, callback) => {
                models.ShopProducts.GetForCart({ productId: l.productId, variationId: l.variationId }, (err, product) => {
                    if (err) {
                      
                        callback(err)
                    } else {
                        product.quantity = l.quantity
                        callback(null, _.merge(l, product))
                    }
                })
            }, (err, result) => {
                cb(err ? err : null, result)
            })
        },
        shippingAddresses: (cb) => {
            if (req.session.user) {
                models.Users.GetShippingAddress({ userId: req.session.user.id }, (err, address) => {
                    cb(err ? err : null, address)
                })
            } else {
                cb()
            }
        },
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        states: (cb) => {
            models.Common.GetStates({ country_id: 101 }, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        roles: (cb) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                cb(err ? err : null, roles)
            })
        },
        brandLocations: (callback) => {
            models.Users.GetAllLocation((err, brandLocations) => {
                if (err) {
                  
                    callback(err)
                } else {
                    callback(null, brandLocations)
                }
            })
        }
    }, (err, result) => {
        if (err) {
          
            res.redirect('/404')
        } else 
        {
            
             result.products.forEach((r, i) => {
                r.lineId = i + 1
                r.lineTotal = r.product_type == 2 ? (r.variation_regular_price * parseInt(r.quantity)) : (r.product_regular_price * parseInt(r.quantity))
                r.lineTotalDisc = r.product_discount_price * parseInt(r.quantity)
               
            })
            var cartTotal = _.sumBy(result.products, 'lineTotal');
            var cartTotalDisc = _.sumBy(result.products, 'lineTotalDisc');
            var deliveryCharge = parseInt(200);
            req.session.cart.cartTotal = cartTotal;
            req.session.cart.cartTotalDisc = cartTotalDisc;
            req.session.cart.deliveryCharge = deliveryCharge;
        res.render('my-account/payment-mode', {
        title: 'Exl_shop - payment-mode',
        
        shippingAddresses: result.shippingAddresses,
        states: result.states,
        roles:result.roles,
        products:result.products,
        brandLocations : result.brandLocations,
        shop_categories:result.category,
        cartTotal,
        cartTotalDisc,
        deliveryCharge,
        styles: ['/plugins/toastr/toastr.min.css'],
        scripts: ['/js/page-level/payment_mode.js','/plugins/toastr/toastr.min.js'],
        scripts: ['/plugins/toastr/toastr.min.js', 'https://checkout.razorpay.com/v1/checkout.js','/js/page-level/payment_mode.js']
    
    })
    }
    })
    })

router.get('/about', (req, res) => {
    const models = req.Core.Models;
    async.parallel({
        shippingAddresses: (cb) => {
            if (req.session.user) {
                models.Users.GetShippingAddress({ userId: req.session.user.id }, (err, address) => {
                    cb(err ? err : null, address)
                })
            } else {
                cb()
            }
        },
        states: (cb) => {
            models.Common.GetStates({ countryId: 101 }, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        roles: (cb) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                cb(err ? err : null, roles)
            })
        },
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        brandLocations: (callback) => {
            models.Users.GetAllLocation((err, brandLocations) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, brandLocations)
                }
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
    res.render('my-account/aboutus', {
        title: 'Exl_shop - about',
        shippingAddresses: result.shippingAddresses,
        states: result.states,
        roles:result.roles,
        shop_categories: result.category,
        brandLocations : result.brandLocations
    })
}
})
})
//////////////////////////////START//////////////////
router.get('/shopgrid', (req, res) => {
    const models = req.Core.Models;
    async.parallel({
        shippingAddresses: (cb) => {
            if (req.session.user) {
                models.Users.GetShippingAddress({ userId: req.session.user.id }, (err, address) => {
                    cb(err ? err : null, address)
                })
            } else {
                cb()
            }
        },
        states: (cb) => {
            models.Common.GetStates({ countryId: 101 }, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        roles: (cb) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                cb(err ? err : null, roles)
            })
        },
        brandLocations: (callback) => {
            models.Users.GetAllLocation((err, brandLocations) => {
                if (err) {
                  
                    callback(err)
                } else {
                    callback(null, brandLocations)
                }
            })
        }
    }, (err, result) => {
        if (err) {
           
            res.redirect('/404')
        } else {
    res.render('my-account/shopgrid', {
        title: 'Exl_shop - shopgrid',
        shippingAddresses: result.shippingAddresses,
        states: result.states,
        roles:result.roles,
        brandLocations : result.brandLocations
    })
}

})

})

////////////////////////////////END/////////////////////////
router.get('/orderconfirm/:order_id/:delChr', (req, res) => {
    const models = req.Core.Models;
    const delChr = req.params.delChr;
    models.Orders.getordereditem({order_id: req.params.order_id}, (err, orderdata) => {
        if (err) {
        
            res.redirect('/404')
        } else {
          
            models.Users.GetRoles({all: false}, (err, roles) => {
                // cb(err ? err : null, roles)
                models.Users.GetAllLocation((err, brandLocations) => {
                    if (err) {
                      
                        callback(err)
                    } else {

                        models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                            if(err){
                              
                                cb(err);
                            }else{
                              
                              models.Orders.getordereditem1({order_id: req.params.order_id}, (err, orderTotalData) =>{
                                if(err){
                                 
                                    cb(err)
                                }else{
                                  
                                    res.render('my-account/orderconfirm', {
                                        title: 'Exl_shop - confirmorder',
                                        roles:roles,
                                        brandLocations:brandLocations,
                                        shop_categories:shop_categories,
                                        delChr,
                                        orderTotalData,
                                        orderdata:orderdata
                                    })
                                }
                              })
                             
                            }
                        })
          
          
        }
    })
        })
        }
    
})

})

router.get('/policies', (req, res) => {
    const models = req.Core.Models;
    async.parallel({
        shippingAddresses: (cb) => {
            if (req.session.user) {
                models.Users.GetShippingAddress({ userId: req.session.user.id }, (err, address) => {
                    cb(err ? err : null, address)
                })
            } else {
                cb()
            }
        },
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        states: (cb) => {
            models.Common.GetStates({ countryId: 101 }, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        roles: (cb) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                cb(err ? err : null, roles)
            })
        },
        brandLocations: (callback) => {
            models.Users.GetAllLocation((err, brandLocations) => {
                if (err) {
                  
                    callback(err)
                } else {
                    callback(null, brandLocations)
                }
            })
        }
    }, (err, result) => {
        if (err) {
           
            res.redirect('/404')
        } else {
    res.render('my-account/policy', {
        title: 'Exl_shop - policy',
        shippingAddresses: result.shippingAddresses,
        states: result.states,
        roles:result.roles,
        shop_categories: result.category,
        brandLocations : result.brandLocations
    })
}
})
})

router.post('/orders/get-search-orders', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session
  
    models.Orders.GetSearchedOrders({userId: req.session.user.id,searchValue: post.searchValue,statusvalarray:post.statusvalarray,timestatusval:post.timestatusval, offset: 0, limit: 20}, (err, orders) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Orders.GetByUserId({userId: req.session.user.id}, (err, myOrders) => {
                if(err){
                    res.redirect('/404')
                }else{
                    res.render('my-account/myorders', {
                        title: 'Exlshop-Orders' ,
                       orders,
                        myOrders
                    })
                }
            })
        }
    })
})

router.get('/orders', (req, res) => {
    // const post = req.body;
    const models = req.Core.Models;
    models.Orders.GetByUserId({userId: req.session.user.id}, (err, myOrders) => {
        if (err) {
           
            res.redirect('/404')
        } else {

            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{ 
                    var year1 = new Date().getFullYear()
                    var year2 = year1-1
                    var year3 = year2-1
                    var year4 = year3-1
                    var year5 = year4-1

                    res.render('my-account/orders', {
                    title: 'Exl_shop - My Orders',
                    menuActive: 'orders',
                    shop_categories:shop_categories,
                   myOrders:myOrders,
                   year1, year2, year3, year4, year5,
                    scripts: ['/js/page-level/my-account-orders.js'],
                })}
            })
        }
    })
})

router.get('/deliver_order',(req,res)=>{
    const models = req.Core.Models;
    async.parallel({
        deliver_orders : (cb)=>{
            models.Orders.GetDeliverOrder({userId: req.session.user.id},(err,deliver_orders)=>{
                if (err) {
                    return cb(err);
                }
                else{
                    cb(null, deliver_orders);
                }
            })
        },
        rate: (cb) => {
            models.Orders.ViewRate({userId: req.session.user.id},(err,review)=>{
                if(err){
                    cb(err);
                }
                else{
                    cb(null,review);
                }
            })
        },
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        review: (cb) => {
            models.Orders.ViewReview({userId: req.session.user.id},(err,review)=>{
                if(err){
                    cb(err);
                }
                else{
                    cb(null,review);
                }
            })
        },
    },function(err, result){
       if(err){
           return false;
       }
       else{
           res.render('my-account/deliver-order', {
                title: 'Exl_shop - My Orders',
                menuActive: 'deliver_order',
                deliver_orders : result.deliver_orders,
                review : result.review,
                rate : result.rate,
                shop_categories:result.category,
                styles: ['/plugins/toastr/toastr.min.css'],
                scripts: ['/js/page-level/my-account-orders.js','/plugins/toastr/toastr.min.js']
            })
       }
    })
})

router.post('/add_review',(req,res)=>{
   
    const models = req.Core.Models;
    const post = req.body;
    models.Orders.AddReview({userId :post.u_id,orderId :post.o_id,productId : post.p_id,review:post.review},(err,review)=>{
        if (err) {
            
            res.redirect('/404')
        }
        else{
            return res.redirect('back');
        }
    })
})

router.get('/cancel_order/:id',(req,res)=>{
    const models = req.Core.Models;
    models.Orders.cancel_order({userId: req.session.user.id, orderId:req.params.id, productId:req.params.p_id}, (err,product) => {
        if (err) {
            res.redirect('/404')
        }
        return res.redirect('back');
    })
})

router.post('/return_order',(req,res)=>{
const post = req.body
    const models = req.Core.Models;
    models.Orders.return_order({userId: req.session.user.id, orderId: post.orderId, productId: post.productId}, (err,product) => {
        if (err) {
         
            res.redirect('/404')
        }else{
            res.send({success: true, product})
        }
    })
})

router.post('/orders/get-single', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const orderOpts = {orderId: post.orderId, userId: req.session.user.id};

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
            res.render('partials/order-single', {
                orderData: result.orderData,
                orderItems: result.orderProductItems
            })
        }
    })
})

router.get('/shipping-address', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
   
    async.parallel({
        states: (cb) => {
            models.Common.GetStates({ country_id: 101 }, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        shippingAddresses: (cb) => {
            if (req.session.user) {
                models.Users.GetShippingAddress({userId: req.session.user.id}, (err, address) => {
                    cb(err ? err : null, address)
                })
            } else {
                cb(null)
            }
        }
    }, (err, result) => {
        res.render('my-account/shipping-address', {
            title: 'FitBiz - Manage Shipping Address',
            menuActive: 'shipping-address',
            states: result.states,
            shop_categories:result.category,
            shippingAddresses: result.shippingAddresses,
            styles: ['/plugins/toastr/toastr.min.css'],
            scripts: ['/plugins/toastr/toastr.min.js']
        })
    })
})

router.get('/virtual-marathons', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    async.auto({
        purchasedMarathons : (cb)=>{
            models.Event.GetPurchasedMarathons({userId: req.session.user.id}, (err, marathons) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,marathons);
                }
            })
        },
        marathons: (cb) => {
            models.Event.GetUserMarathons({userId: req.session.user.id}, (err, marathons) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,marathons);
                }
            })
        },
        bestPerformance: (cb) => {
            models.Event.GetUserBestPerformance({userId: req.session.user.id}, (err, marathons) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,marathons);
                }
            })  
        }
    },function(err, result){
        if(err){
            res.redirect('/404'); 
        }else{
            res.render('my-account/marathons', {
                title: 'FitBiz - Marathons',
                menuActive: 'virtual-marathons',
                marathons: result.marathons,
                bestPerformance: result.bestPerformance,
                purchasedMarathons: result.purchasedMarathons
            })
        }
    })
})

router.get('/my-wishlist',(req,res)=>{
  
    const models = req.Core.Models;

    async.auto({
        userProductWishlist: (callback) => {
            models.Users.getUserProductWishlist({userId : req.session.user.id},(err,userProductWishlist) => {
                if (err) {
                  
                    callback(err)
                } else {
                    callback(null, userProductWishlist)
                  
                }
            })
        },
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        shopOrderLocation: (callback) =>{
            models.Users.shopOrderLocation({userId : req.session.user.id}, (err, shopOrderLocation) =>{
                if(err){
                    callback(err)
                }else{
                    callback(null, shopOrderLocation)
                }
            })
        },

        userShopWishlist: (callback) => {
            models.Users.getUserShopWishlist({userId : req.session.user.id},(err,userShopWishlist) => {
                if (err) {
                 
                    callback(err)
                } else {
                    callback(null, userShopWishlist)
                   
                }
            })
        },
    },(err,result)=>{
        if(err){
            res.send({success:false})
        }
        else{
          
            res.render('my-account/my-wishlist',{
                title : 'my-wishlist',
                menuActive: 'my-wishlist',
                userProductWishlist : result.userProductWishlist,
                userShopWishlist :result.userShopWishlist,
                shopOrderLocation : result.shopOrderLocation,
                shop_categories:result.category,
                styles: ['/plugins/toastr/toastr.min.css'],
                scripts: ['/js/page-level/my-wishlist.js','/plugins/toastr/toastr.min.js']
                
        })
    }
})
})

router.post('/remove-shop-wishlist',(req,res)=>{
    const models = req.Core.Models;
    models.Users.RemoveShopWishlist({userId : req.session.user.id,brandId :req.body.brand_id,brandLocationId:req.body.brand_location_id},
        (err,usershopWislist)=>{
        if(err){
          
            res.send({success: false})
        }
        else{
            res.send({success: true, usershopWislist})
           
        }
    })
})

router.post('/remove-wishlist-product',(req,res)=>{
    const models = req.Core.Models;
    models.Users.RemoveWishlistProduct({userId : req.session.user.id, productId :req.body.productId},(err,userWislist)=>{
        if(err){
            res.send({success: false})
        }
        else{
            res.send({success: true, userWislist})
        }
    })
})

router.post('/add-shop-wishlist',(req,res)=>{
    
    const models = req.Core.Models;
    const post = req.body;
 
    if(req.session.user){
        models.Users.AddShopWishlist({userId:req.session.user.id,brand_location_id:post.brand_location_id,
            brand_name:post.brand_name,brand_id : post.brand_id},
            (err,shopWishlist)=>{
                if(err){
                    res.send({success: false})
                }
                else{
                    res.send({success: true})
                }
            })
    }
    else{
        res.send({success: false})
    }
})


router.post('/order-return',(req,res)=>{
    const models = req.Core.Models;
    const post=req.body;
    models.Orders.order_return({orderId:post.orderId,productId:post.productId}, (err,data) => {
        if (err) {
          
            res.send({success: false})
        }
        else{
            res.send({success: true})
        }
    })

})

router.post('/add-rate',(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
    models.Orders.addProductRate({rate : post.rate,userId :req.session.user.id,orderId:post.orderId,productId:post.productId}, (err,data) => {
        if (err) {
          
            res.send({success: false})
        }
        else{
            res.send({success: true})
        }
    })

})

router.get('/view-order/:order_ID', (req, res) => {
    const models = req.Core.Models;
   
    models.Orders.viewOrders(req.params, (err, orders)=>{
        if (err) {
            res.send({success: false})
        }
        else{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                  
                    cb(err);
                }else{
                    models.Orders.getordereditem2(req.params, (err, myOrders) =>{
                       if(err){
                        cb(err)
                       }else{
                        res.render('my-account/view-orders', {
                            title: 'Exl_shop - My Orders',
                           orders:orders,
                           shop_categories: shop_categories,
                           myOrders: myOrders
                        })
                       }
                    })
                  
                }
            })
        }
    })
})

module.exports = router;