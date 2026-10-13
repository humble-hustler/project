const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const { Route53 } = require('aws-sdk');
const { padStart } = require('lodash');

router.get('/:categorySlug/:productId', (req, res) => {
    const models = req.Core.Models;
    const params = req.params;
    if(!req.session.user){
        async.parallel({
            productData: (cb) => {
                models.ShopProducts.GetSingle({productId: params.productId}, (err, product) => {
                    cb(err ? err : null, product)
                })
            },
            variationData: (cb) => {
                models.ShopProducts.GetVariation({productId: params.productId}, (err, variations) => {
                    cb(err ? err : null, variations)
                })
            },
            media: (cb) => {
                models.ShopProducts.GetMedia({productId: params.productId}, (err, media) => {
                    cb(err ? err : null, media)
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
            },
            Wishlist: (cb) => {
                models.Users.ViewWishlist({userId : 'null', productId : params.productId},(err,Wishlist)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,Wishlist);
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
                models.Orders.ViewReview({productId : params.productId},(err,review)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,review);
                    }
                })
            },
            rate: (cb) => {
                models.Orders.ViewRateByProduct({productId : params.productId},(err,rate)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        
                        cb(null,rate);
                    }
                })
            }
        }, (err, result) => {
            if (err) {
                res.redirect('/404')
            } else {
                const votes = {
                    'five': result.rate[0].five_star_count,
                    'four': result.rate[0].four_star_count,
                    'three': result.rate[0].three_star_count,
                    'two': result.rate[0].two_star_count,
                    'one': result.rate[0].one_star_count,
                  };
                  
                  const highestCount = Math.max(votes['five'], votes['four'], votes['three'], votes['two'], votes['one']);
                  
                  const ratings1 = {};
                  
                  for (const [key, value] of Object.entries(votes)) {
                    ratings1[key] = ((value / highestCount) * 100).toFixed(2);
                  }
                  console.log(ratings1, "ttttttttttttttt")
                res.render('front/single-product', {
                    
                    title: 'Exl_shop - Home',
                    productData: result.productData,
                    variationData: result.variationData,
                    media: result.media,
                    roles : result.roles,
                    review : result.review,
                    shop_categories:result.category,
                    rate :result.rate,
                    ratings1,
                    brandLocations : result.brandLocations,
                    Wishlist : result.Wishlist,
                    file_name: result.file_name,
                    styles: ['/plugins/toastr/toastr.min.css'],
                    scripts: ['/plugins/toastr/toastr.min.js', '/js/lodash.min.js', '/js/page-level/single-product.js']
                })
            }
        })
    }
    else{
        async.parallel({
            productData: (cb) => {
                models.ShopProducts.GetSingle({productId: params.productId}, (err, product) => {
                    cb(err ? err : null, product)
                })
            },
            variationData: (cb) => {
                models.ShopProducts.GetVariation({productId: params.productId}, (err, variations) => {
                    cb(err ? err : null, variations)
                })
            },
            media: (cb) => {
                models.ShopProducts.GetMedia({productId: params.productId}, (err, media) => {
                    cb(err ? err : null, media)
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
            },
            Wishlist: (cb) => {
                models.Users.ViewWishlist({userId : req.session.user.id,productId : params.productId},(err,Wishlist)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,Wishlist);
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
            rate: (cb) => {
                models.Orders.ViewRateByProduct({productId : params.productId},(err,rate)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,rate);
                    }
                })
            },
            review: (cb) => {
                models.Orders.ViewReview({productId : params.productId},(err,review)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,review);
                    }
                })
            }
        }, (err, result) => {
            if (err) {
                res.redirect('/404')
            } else {
                const votes = {
                    'five': result.rate[0].five_star_count,
                    'four': result.rate[0].four_star_count,
                    'three': result.rate[0].three_star_count,
                    'two': result.rate[0].two_star_count,
                    'one': result.rate[0].one_star_count,
                  };
                  
                  const highestCount = Math.max(votes['five'], votes['four'], votes['three'], votes['two'], votes['one']);
                  
                  const ratings1 = {};
                  
                  for (const [key, value] of Object.entries(votes)) {
                    ratings1[key] = ((value / highestCount) * 100).toFixed(2);
                  }
                    res.render('front/single-product', {
                    title: 'Exl_shop - Home',
                    productData: result.productData,
                    variationData: result.variationData,
                    media: result.media,
                    roles : result.roles,
                    rate :result.rate,
                    ratings1,
                    shop_categories:result.category,
                    review : result.review,
                    brandLocations : result.brandLocations,
                    Wishlist : result.Wishlist,
                    styles: ['/plugins/toastr/toastr.min.css'],
                    scripts: ['/plugins/toastr/toastr.min.js', '/js/lodash.min.js', '/js/page-level/single-product.js']
                })
            }
        })
    }
});

router.post('/getSubCategory', (req, res) => {
    const models = req.Core.Models;
    const post = req.body
    models.ShopProducts.getSubCategory({id: post.id}, (err, getSubCategory) => {
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, getSubCategory})
        }
    })
})

router.post('/getSubSubCategory', (req, res) => {
    const models = req.Core.Models;
    const post = req.body
    models.ShopProducts.getSubSubCategory({id: post.id1}, (err, getSubSubCategory) => {
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, getSubSubCategory})
        }
    })
})

router.post('/add-to-cart', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const params = req.params;
  
    if (req.session.user) {
        if (!_.has(req.session, 'cart')) {
            req.session.cart = {
                line: []
            }
        }
        var line = req.session.cart.line;
        const lineIdx = _.findIndex(line, {productId: post.productId});
    
        if (lineIdx !== -1) {
            line[lineIdx] = {
                productId: post.productId,
                quantity: post.quantity,
                locationId: post.locationId,
                save_for_later:0,
            }
        } else {
            line.push({
                productId: post.productId,
                quantity: post.quantity,
                locationId:post.locationId,
                save_for_later:0,
            })
        }
  
        models.Cart.SetUserCart({userId: req.session.user.id, cart: JSON.stringify(req.session.cart)}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true, cartQty: line.length,})
            }
        })
    } else {
        res.send({success: true, cartQty: 0})
    }
})

router.post('/buy-now', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    var line = req.session.buy.line;
    const lineIdx = _.findIndex(line, {productId: post.productId});
  
    line[lineIdx] = {
        productId: post.productId,
        quantity: post.quantity,
    }
    if (req.session.user) {
        models.Buy.SetUserBuy({userId: req.session.user.id, buy: JSON.stringify(req.session.buy)}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true})
            }
        })
    } else {
        res.send({success: true})
    }
})

router.post('/shop_product', (req, res) => {
    if (req.session.user) {
        models.product.getProducts({userId: req.session.user.id, buy: JSON.stringify(req.session.buy)}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true})
            }
        })
    } else {
        res.send({success: true})
    }
})

// router.post('/search_items',(req,res)=>{
//     const post = req.body;
//     const models = req.Core.Models;
//     // s_data: s_data,
//     // search_data: search_data 
//     models.Users.SearchItems({selected_opt : post.s_data,search_data: post.search_data},(err,data)=>{
//         if(err){
//         
//             res.send({success: false})
//         } else{
//             res.send({success: true})
//         }
//     })
// })

router.get('/search',(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
    models.Users.AutoComplete({search_data : post.search_data},(err,data)=>{
        if(data == ''){
            res.send({success: false})
        } else{
            res.send({success: true})
        }
    }) 
})

router.get('/clear-cart', (req, res) => {
    delete req.session.cart
    res.send()
})

router.post('/update-cart-quantity', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    var line = req.session.cart.line;
    const lineIdx = _.findIndex(line, {productId: post.productId});
    const locationId = line[lineIdx].locationId
    line[lineIdx] = {
        productId: post.productId,
        // variationId: post.variationId,
        quantity: post.quantity,
        locationId : locationId,
        save_for_later:0
    }
    if (req.session.user) {
        models.Cart.UpdateUserCart({userId: req.session.user.id, cart: JSON.stringify(req.session.cart)}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true})
            }
        })
    } else {
        res.send({success: true})
    }
})

router.post('/remove-cart-item', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    var line = req.session.cart.line;
    _.remove(line, item => (item.productId == post.productId ));

    if (req.session.user) {
        models.Cart.SetUserCart({userId: req.session.user.id, cart: JSON.stringify(req.session.cart)}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true})
            }
        })
    } else {
        res.send({success: true})
    }
})

router.post('/sign-in', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const loginOpts = {
        email: post.email,
        password: post.password
    }
    models.Users.SignIn(loginOpts, (err, user) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Cart.GetUserCart({ userId: user.id }, (err, cart) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    if (cart) {
                        req.session.cart = JSON.parse(cart.cart)
                    }
                    req.session.user = user;
                    res.redirect('back')
                }
            })
        }
    })
})

router.post('/add-to-wishlist',(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
    const params = req.params;
  
    if(req.session.user){
        models.Users.AddWishlistProduct({productId : post.productId,userId:req.session.user.id,productName : post.productName,locationId : post.locationId , regular_price: post.regular_price, discount_price : post.discount_price},(err,data)=>{
            if (err) {
                res.send({success: false})
            } else{
                res.send({success: true})
            }
        })
    }
    else{
        res.send({success: false})
    }
   
})

router.post('/remove-wishlist-product', (req, res) => {
    const models= req.Core.models;
    const params = req.params;
    models.Users.RemoveWishlistProduct({userId : req.session.user.id,productId :req.body.product_id},(err,userWishlist)=>{
        if(err){
            res.send({success: false})
        }
        else{
            res.send({success: true})
        }
    })
})

router.post('/valid-zip',(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
    models.Users.CheckZipCode({productId : post.productId,zip: post.zip},(err,data)=>{
        if(data == ''){
            res.send({success: false})
        } else{
            res.send({success: true})
        }
    })
})
module.exports = router;    