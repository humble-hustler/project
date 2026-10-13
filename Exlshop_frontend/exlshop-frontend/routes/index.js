/********************************************************/
/***** Index Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const moment = require('moment');
const { ShopProducts } = require('../models');
const { result } = require('lodash');
const {SphericalUtil, PolyUtil} = require("node-geometry-library");
const { mode } = require('google-distance-matrix');

/* GET Home Page */
router.get('/log_out',(req,res)=>{
    console.log('logout');
    req.session.destroy();
    res.redirect('/');
})

router.get('/buy/:id/:quantity',(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
    const productQuantity = req.params.quantity
 
    async.parallel({
        product: (cb) => {
            models.ShopProducts.GetProduct({productId : req.params.id},(err,product)=>{
                cb(err ? err : null, product)
            })
        },
        states: (cb) => {
            models.Common.GetStates({ country_id: 101 }, (err, states) => {
                cb(err ? err : null, states)
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
        },
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
                res.render('front/buy-now', {
                title: 'Exlshop - Buy Product',
                products: result.product,
                productQuantity: productQuantity,
                states: result.states,
                shippingAddresses: result.shippingAddresses,
                shop_categories:result.category,
                roles : result.roles,
                brandLocations : result.brandLocations,
                styles: ['/plugins/toastr/toastr.min.css'],
                scripts: ['/plugins/toastr/toastr.min.js', 'https://checkout.razorpay.com/v1/checkout.js', '/js/page-level/buy-now.js']
            })
        }
    })
})

router.get('/search_shop_byname',(req,res)=>{
    return res.redirect('/404');
})

router.get('/search_product_byname',(req,res)=>{
    console.log("eeeeeeeeeeeeeeeeeeeeeeeeeee")
    return res.redirect('back');
})

router.get('/search_shop',(req,res)=>{
    return res.redirect('back');
})

router.post('/reset-password-email', function (req, res, next) {
    var email = req.body.email;
    const models = req.Core.Models;
    models.Users.ForgotPasswordEmail({ email }, (err, valid) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, valid })
        }
    })
})

router.get('/Validate-user', function (req, res, next) {
    const models = req.Core.Models;
    console.log(req.query)
    async.parallel({
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
                res.render('../views/partials/change-password', {
                title: 'Reset Password Page',
                shop_categories:result.category,
                token: req.query.token,
                styles: ['/plugins/toastr/toastr.min.css'],
                scripts: ['/plugins/toastr/toastr.min.js']
            })
        }
    })
});

router.post('/update-password', function(req, res) {
    console.log(req.body)
    const models = req.Core.Models;
    models.Users.forgotPassword(req.body, (err, valid) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, valid })
        }
    })
})

router.get('/category/:id', (req, res) => {
    const models = req.Core.Models;
    const id = req.params.id;
    models.ShopProducts.getSubCategory({ id: id }, (err, shop_subcategories) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                if (err) {
                    res.redirect('/404')
                }
                else {
                    models.Users.GetRoles({all: false}, (err, roles) => {
                        if(err){
                            res.redirect('/404')
                        }
                        else{
                            models.Users.GetAllLocation((err, brandLocations) => {
                                if (err) {
                                    callback(err)
                                } else {
                                    res.render('front/index1', {
                                        title: 'ExlShop - Home',
                                        products: products,
                                        roles : roles,
                                        brandLocations : brandLocations,
                                        shop_subcategories: shop_subcategories,
                                        // scripts: ['/js/page-level/index.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.get('/subcategory/:id', (req, res) => {
    const models = req.Core.Models;
    const id = req.params.id;
    models.ShopProducts.getSubSubCategory({ id: id }, (err, shop_subsubcategories) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                if (err) {
                    res.redirect('/404')
                }
                else{
                    models.Users.GetRoles({all: false}, (err, roles) => {
                        if(err){
                            res.redirect('/404')
                        }
                        else{
                            models.Users.GetAllLocation((err, brandLocations) => {
                                if (err) {
                                    callback(err)
                                } else {
                                    res.render('front/index2', {
                                        title: 'FitBiz Shop - Home',
                                        products: products,
                                        roles : roles,
                                        brandLocations :brandLocations,
                                        shop_subsubcategories: shop_subsubcategories,
                                        // scripts: ['/js/page-level/index.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.post('/addShopWishlist', (req, res) =>{
    const post = req.body;
    const userId = req.session.user.id;
    const models = req.Core.Models;
   
    models.Users.addShopWishlist({post, userId}, (err, addShopWishlist) => {
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true, addShopWishlist})    
        }
    })
})

router.post('/search_shop_byname', (req, res) => {
    var s_data =req.body.s_data;
    var search_data =req.body.search_data;
    const models = req.Core.Models;
    var myLocation = req.body.currentLocation
    console.log(s_data, "search_dataaaaaaaaaa", search_data)
   
    if(!req.session.user){
        async.auto({
            category:(cb)=>{
                models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,shop_categories);
                    }
                })
            },
            subcategory:['category',(result,cb)=>{
                models.ShopProducts.getSubCategory({ id: result.category.id }, (err, shop_categories) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,shop_categories);
                    }
                })   
            }],
            subsubcategory:['subcategory',(result,cb)=>{
                models.ShopProducts.getSubSubCategory({ id: result.subcategory.id }, (err, shop_subcategories) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,shop_subcategories);
                    }
                })
            }],
            roles: (cb) => {
                models.Users.GetRoles({all: false}, (err, roles) => {
                    cb(err ? err : null, roles)
                })
            },
            brandLocations: (cb) => {
                models.Users.GetAllLocation((err, brandLocations) => {
                    if (err) {
                        cb(err)
                    } else {
                        cb(null, brandLocations)
                    }
                })
            },
            shops: (cb) => {
                models.Users.Getshops1({offset: 0, limit: 8, s_data, search_data, myLocation},(err, shops) => {
                    if (err) {
                        cb(err)
                    } else {
                        cb(null, shops)
                    }
                })
            }
    },(err,result)=>{
        if(err){
            res.send({success:false})
        }else{
            var shopsList = result.shops;
            var shopdistances = [];
            var shopid = [];
            for (let j=0;j<result.shops.length;j++){
                var shopdestination = []
                shopdestination.push((shopsList[j].latlong).split(',')[0])
                shopdestination.push((shopsList[j].latlong).split(',')[1])
                var distance =SphericalUtil.computeLength([{'lat': myLocation[0], 'lng': myLocation[1]}, {'lat': shopdestination[0], 'lng': shopdestination[1]}]);
                shopdistances[j]= ((distance/1000).toFixed(1))
                 shopid.push(result.shops[j].location_id)
                }
        res.render('front/search_shop_byname', {
            title: 'Exlshop - Home',
            products:result.products,
           shops:result.shops,
            roles : result.roles,
            brands : result.brands,
            brandLocations : result.brandLocations,
            shop_categories:result.category,
            shop_subcategories:result.subcategory,
            shop_subsubcategories:result.subsubcategory,
            myLocation,
                shopdistances,
                search_data,
                shopid,
            csrfToken:req.session.csrfSecret,
             scripts: ['/js/page-level/searchShopbyName.js']
        })
        }
    })
    } else{
    async.auto({
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        subcategory:['category',(result,cb)=>{
            models.ShopProducts.getSubCategory({ id: result.category.id }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })   
        }],
        subsubcategory:['subcategory',(result,cb)=>{
            models.ShopProducts.getSubSubCategory({ id: result.subcategory.id }, (err, shop_subcategories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_subcategories);
                }
            })
        }],
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
        shops: (callback) => {
            models.Users.Getshops({offset: 0, limit: 8, s_data, search_data, userId: req.session.user.id, myLocation},(err, shops) => {
                if (err) {
                    callback(err)
                } else {
                    console.log("lllllllllllllllllll", shops)
                    callback(null, shops)
                }
            })
        },
        wishlistShop: (callback) =>{
            models.Users.wishlistShop({userId: req.session.user.id},(err, wishlistShop) => {
                if(err){
                    callback(err)
                }else{
                    callback(null, wishlistShop)
                }
            })
        }
},(err,result)=>{
    if(err){
        res.send({success:false})
    }else{
        var shopsList = result.shops;
        var shopdistances = [];
        var shopid = [];
        for (let j=0;j<result.shops.length;j++){
            var shopdestination = []
            shopdestination.push((shopsList[j].latlong).split(',')[0])
            shopdestination.push((shopsList[j].latlong).split(',')[1])
            var distance =SphericalUtil.computeLength([{'lat': myLocation[0], 'lng': myLocation[1]}, {'lat': shopdestination[0], 'lng': shopdestination[1]}]);
            shopdistances[j]= ((distance/1000).toFixed(1))
             shopid.push(result.shops[j].location_id)
            }
        res.render('front/search_shop_byname', {
        title: 'Exlshop - Home',
        products:result.products,
        shops:result.shops,
        roles : result.roles,
        brands : result.brands,
        search_data,
        wishlistShop : result.wishlistShop,
        brandLocations : result.brandLocations,
        shop_categories:result.category,
        shop_subcategories:result.subcategory,
        shop_subsubcategories:result.subsubcategory,
        myLocation,
            shopdistances,
            shopid,
        csrfToken:req.session.csrfSecret,
         scripts: ['/js/page-level/searchShopbyName.js']
    })
    }
})
}
 });

router.post('/search_product_byname', (req, res) => {
    var s_data =req.body.s_data;
    var search_data =req.body.search_data;
    var cid ;
    const models = req.Core.Models;
    console.log(s_data, "kkkkkkkkkkkkkkkkkkkkkk")
    async.auto({
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        subcategory:['category',(result,cb)=>{
            models.ShopProducts.getSubCategory({ id: result.category.id }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })   
        }],
        subsubcategory:['subcategory',(result,cb)=>{
            models.ShopProducts.getSubSubCategory({ id: result.subcategory.id }, (err, shop_subcategories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_subcategories);
                }
            })
        }],
        media: (cb) => {
            models.ShopProducts.GetMedia ({},(err, media) => {
                cb(err ? err : null, media)
              
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
        products:(cb)=>{
            models.ShopProducts.get_filter_product({ offset: 0, limit: 8,s_data,search_data }, (err, products) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,products);
                }
        })
    }
},(err,result)=>{
    if(err){
        res.send({success:false})
    }else{
        res.render('front/search_product_byname', {
            title: 'Exlshop - Home' ,
            products:result.products,
            search_data,
            roles : result.roles,
            media : result.media,
            shops:result.shops,
            shop_categories:result.category,
            shop_subcategories:result.subcategory,
            shop_subsubcategories:result.subsubcategory,
            brandLocations : result.brandLocations,
            scripts: ['/js/page-level/searchProductbyName.js']
        } )
    }
    })
});

router.post('/search_shop', (req, res) => {
    var s_loc = req.body.autocomplete;
    var s_catId = req.body.category_id
    s_loc = s_loc.split(',')[0];
    var myLocation = req.body.currentLocation;
    const models = req.Core.Models;
   console.log('s_loc,s_catId,myLocation', s_loc,s_catId,myLocation)
    async.auto({
        shops: (callback) => {
            models.Users.Getshops2({offset: 0, limit: 8,s_loc,s_catId,myLocation},(err, shops) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, shops)
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
},(err,result)=>{
    if(err){
        res.send({success:false})
    }else{
        for(let i=0; i<result.category.length; i++){
            if(result.category[i].id == s_catId) {
                var catName = result.category[i].name
            }
        }
        var shopsList = result.shops;
        var shopdistances = [];
        var shopid = [];
        for (let j=0;j<result.shops.length;j++){
            var shopdestination = []
            shopdestination.push((shopsList[j].latlong).split(',')[0])
            shopdestination.push((shopsList[j].latlong).split(',')[1])
            var distance =SphericalUtil.computeLength([{'lat': myLocation[0], 'lng': myLocation[1]}, {'lat': shopdestination[0], 'lng': shopdestination[1]}]);
            shopdistances.push((distance/1000).toFixed(1))
            shopid.push(result.shops[j].location_id)
            }
        res.render('front/shop-list', {
            title: 'Exlshop - Shop List',
            roles : result.roles,
            shop_categories:result.category,
            shops:result.shops,
            s_catId,
            catName,
            s_loc,
            myLocation,
            shopdistances,
            shopid,
            brandLocations : result.brandLocations,
            scripts: ['/js/page-level/index.js','/js/page-level/shop-list.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
        })
    }
})
});

router.post('/shop_rate_review', (req, res) => {
    const models = req.Core.Models;
    const post = req.body
        async.parallel({
            shopData: (cb) => {
                models.ShopProducts.GetShopSingle({brandId : post.brand_id, brandLocationId : post.brand_location_id}, (err, product) => {
                    cb(err ? err : null, product)
                })
            },
            media: (cb) => {
                models.ShopProducts.GetShopMedia({brandId : post.brand_id, brandLocationId : post.brand_location_id}, (err, media) => {
                    cb(err ? err : null, media)
                })
             },
            Wishlist: (cb) => {
                models.Users.ViewShopWishlist1({userId : req.session.user.id, brandId : post.brand_id, brandLocationId : post.brand_location_id}, (err,Wishlist)=>{
                    cb(err ? err : null,  Wishlist)
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
            AverageRate: (cb) => {
                models.Orders.AverageRate({userId : req.session.user.id, brandId : post.brand_id, brandLocationId : post.brand_location_id},(err,rate)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,rate);
                    }
                })
            },
            rate: (cb) => {
                models.Orders.ViewRateByShop({userId : req.session.user.id, brandId : post.brand_id, brandLocationId : post.brand_location_id},(err,rate)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,rate);
                    }
                })
            },
            review: (cb) => {
                models.Orders.ViewShopReview({userId : req.session.user.id, brandId : post.brand_id, brandLocationId : post.brand_location_id},(err,review)=>{
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
                res.render('front/single-shop', {
                    title: 'Exl_shop - Home',
                    shopData: result.shopData,
                     media: result.media,
                     rate :result.rate,
                    shop_categories:result.category,
                    AverageRate : result.AverageRate,
                     Wishlist : result.Wishlist,
                     review : result.review,
                    styles: ['/plugins/toastr/toastr.min.css'],
                    scripts: ['/plugins/toastr/toastr.min.js', '/js/lodash.min.js', '/js/page-level/single-shop.js']
                })
            }
        })
    }
);

router.get('/shop_product/:bId/:lId',(req,res)=>{
    const models = req.Core.Models;
    const post = req.params;
    const options = {
        bId: post.bId,
        lId: post.lId
    }
   
    if(!req.session.user){
        async.auto({
            brand: (callback) => {
                models.Users.Getbrand({brand_id: options.bId},(err, brand) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, brand);
                    }
                })
            },
            brandLocations: (callback) => {
                models.Users.GetLocation({brand_id: options.bId,location_id:options.lId},(err, brandLocations) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, brandLocations);
                    }
                })
            },
            roles: (cb) => {
                models.Users.GetRoles({all: false}, (err, roles) => {
                    cb(err ? err : null, roles)
                })
            },
            shopWishlist : (cb)=>{
                models.Users.ViewShopWishlist({userId : 'null',brand_id : options.bId},(err,shopWishlist)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,shopWishlist);
                    }
                })
            },
            products:(cb)=>{
                models.ShopProducts.getProductByShop({brand_id:options.bId,location_id:options.lId}, (err, products) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,products);
                    }
            })
        },
        bestSeller_product:(cb)=>{
            models.ShopProducts.BestSeller_Products({ offset: 0, limit: 8 }, (err, bestSeller_products) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, bestSeller_products);
                }
            })
        },
        shop_categories: (cb) => {
            models.ShopProducts.getCategory({id:0}, (err,shop_categories) => {
                cb(err ? err : null, shop_categories)
            })
        },
        AverageRate: (cb) => {
            models.Orders.AverageRate({ brandId : options.bId, brandLocationId : options.lId},(err,rate)=>{
                if(err){
                    cb(err);
                }
                else{
                    cb(null,rate);
                }
            })
        },
        review: (cb) => {
            models.ShopProducts.getShopReview({brand_id: options.bId,location_id:options.lId}, (err,review) => {
                cb(err ? err : null, review)
            })
        },
        products:(cb)=>{
            models.ShopProducts.getProductByShop({brand_id:options.bId,location_id:options.lId}, (err, products) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,products);
                }
        })
    },
        popular_products: (cb) => {
            models.ShopProducts.Popular_Products({ offset: 0, limit: 8 }, (err, popular_products) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, popular_products);
                }
            })
        },
    },(err,result)=>{
        if(err){
            console.log(err)
            res.send({success:false})
        }else{
         res.render('front/shop_products', {
            title: 'Exlshop Shop - ',
            shop_categories: result.shop_categories,
            products:result.products,
            name:result.shop_categories.name,
            review: result.review,
            brand : result.brand,
            bId: post.bId,
                lId: post.lId,
                AverageRate : result.AverageRate,
            brandLocations : result.brandLocations,
            scripts: ['/js/page-level/product-list.js']
            })
        }
        })
    }
    else{
        async.auto({
            brand: (callback) => {
                models.Users.Getbrand({brand_id: options.bId},(err, brand) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, brand);
                    }
                })
            },
            brandLocations: (callback) => {
                models.Users.GetLocation({brand_id: options.bId,location_id:options.lId},(err, brandLocations) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, brandLocations);
                    }
                })
            },
            roles: (cb) => {
                models.Users.GetRoles({all: false}, (err, roles) => {
                    cb(err ? err : null, roles)
                })
            },
            shopWishlist : (cb)=>{
                models.Users.ViewShopWishlist({userId : req.session.user.id,brand_id : options.bId},(err,shopWishlist)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,shopWishlist);
                    }
                })
            },
            AverageRate: (cb) => {
                models.Orders.AverageRate({ brandId : options.bId, brandLocationId : options.lId},(err,rate)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,rate);
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
            ratings: (cb) => {
                models.Orders.ViewRateByShop({userId : req.session.user.id, brandId : options.bId, brandLocationId : options.lId},(err,rate)=>{
                    if(err){
                        cb(err);
                    }
                    else{
                        cb(null,rate);
                    }
                })
            },
            products:(cb)=>{
                models.ShopProducts.getProductByShop({brand_id:options.bId,location_id:options.lId}, (err, products) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,products);
                    }
            })
        },
        bestSeller_product:(cb)=>{
            models.ShopProducts.BestSeller_Products({ offset: 0, limit: 8 }, (err, bestSeller_products) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, bestSeller_products);
                }
            })
        },
        popular_products: (cb) => {
            models.ShopProducts.Popular_Products({ offset: 0, limit: 8 }, (err, popular_products) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, popular_products);
                }
            })
        },
        shop_categories: (cb) => {
            models.ShopProducts.getCategory({id:0}, (err,shop_categories) => {
                cb(err ? err : null, shop_categories)
            })
        },
        getSubCategory: (cb) => {
            models.ShopProducts.getSubCategory({ id: 0 }, (err, getSubCategory) => {
                cb(err ? err : null, getSubCategory)
            })
           },
           rate: (cb) => {
            models.ShopProducts.getRating({brand_id: options.bId,location_id:options.lId, userId: req.session.user.id}, (err,rating) => {
                cb(err ? err : null, rating)
            })
        },
        review: (cb) => {
            models.ShopProducts.getShopReview({brand_id: options.bId,location_id:options.lId}, (err,review) => {
                cb(err ? err : null, review)
            })
        },
        
    },(err,result)=>{
        if(err){
            console.log(err)
            res.send({success:false})
        }else{
        res.render('front/shop_products', {
                title: 'Exlshop - Products',
                products:result.products,
                roles : result.roles,
                shopWishlist : result.shopWishlist,
                brandLocations : result.brandLocations,
                brand : result.brand,
                shopOrderLocation : result.shopOrderLocation,
                ratings: result.ratings,
                rate: result.rate,
                bestSeller_product:result.bestSeller_product,
                popular_products:result.popular_products,
                shop_categories: result.shop_categories,
                AverageRate : result.AverageRate,
                bId: post.bId,
                lId: post.lId,
                review: result.review,
                styles: ['/plugins/toastr/toastr.min.css'],
                scripts: ['/js/page-level/my-wishlist.js','/plugins/toastr/toastr.min.js']
            })
        }
        })
    }
});

router.get('/', (req, res) => {
    const models = req.Core.Models;
    if(!req.session.user){
        async.auto(
            {
            category:(cb)=>{
                models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,shop_categories);
                    }
                })
            },
            subcategory:['category',(result,cb)=>{
                models.ShopProducts.getSubCategory({ id: result.category.id }, (err, shop_categories) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,shop_categories);
                    }
                })   
            }],
            subsubcategory:['subcategory',(result,cb)=>{
                models.ShopProducts.getSubSubCategory({ id: result.subcategory.id }, (err, shop_subcategories) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,shop_subcategories);
                    }
                })
            }],
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
            products:(cb)=>{
                models.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,products);
                    }
                })
            },
            deals_of_the_day:(cb)=>{
                models.ShopProducts.GetDealsProducts({ offset: 0, limit: 8 }, (err, deals_of_the_day) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,deals_of_the_day);
                    }
                })
            },
            popular_products: (cb) => {
                models.ShopProducts.Popular_Products({ offset: 0, limit: 8 }, (err, popular_products) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, popular_products);
                    }
                })
            },
           
            bestSeller_product:(cb)=>{
                models.ShopProducts.BestSeller_Products({ offset: 0, limit: 8 }, (err, bestSeller_products) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, bestSeller_products);
                    }
                })
            }
    },(err,result)=>{
        if(err){
            res.send({success:false})
        }else{
        res.render('front/index', {
            title: 'Exlshop - Home',
            user: req.fbuser ,
            products:result.products,
            popular_products:result.popular_products,
            bestSeller_product:result.bestSeller_product,
            roles : result.roles,
            brandLocations : result.brandLocations,
            shop_categories:result.category,
            shop_subcategories:result.subcategory,
            shop_subsubcategories:result.subsubcategory,
            csrfToken:req.session.csrfSecret,
            deals_of_the_day : result.deals_of_the_day,
            styles: ['/plugins/toastr/toastr.min.css'],
            scripts: ['/plugins/toastr/toastr.min.js']
        })
        }
    
    })

    }else{
        async.auto(
            {
            category:(cb)=>{
                models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,shop_categories);
                    }
                })
            },
            subcategory:['category',(result,cb)=>{
                models.ShopProducts.getSubCategory({ id: result.category.id }, (err, shop_categories) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,shop_categories);
                    }
                })   
            }],
            subsubcategory:['subcategory',(result,cb)=>{
                models.ShopProducts.getSubSubCategory({ id: result.subcategory.id }, (err, shop_subcategories) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,shop_subcategories);
                    }
                })
            }],
            roles: (cb) => {
                models.Users.GetRoles({all: false}, (err, roles) => {
                    cb(err ? err : null, roles)
                })
            },
            brandLocations: (cb) => {
                models.Users.GetAllLocation((err, brandLocations) => {
                    if (err) {
                        cb(err)
                    } else {
                        cb(null, brandLocations)
                    }
                })
            },
            products:(cb)=>{
                models.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,products);
                    }
            })
        },
          popular_products: (cb) => {
                models.ShopProducts.Popular_Products({ offset: 0, limit: 8 }, (err, popular_products) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, popular_products);
                    }
                })
            },
            bestSeller_product:(cb)=>{
                models.ShopProducts.BestSeller_Products({ offset: 0, limit: 8 }, (err, bestSeller_products) => {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, bestSeller_products);
                    }
                })
            },
            deals_of_the_day:(cb)=>{
                models.ShopProducts.GetDealsProducts({ offset: 0, limit: 8 }, (err, deals_of_the_day) => {
                    if(err){
                        cb(err);
                    }else{
                        cb(null,deals_of_the_day);
                    }
                })
            },
    },(err,result)=>{
        if(err){
            res.send({success:false})
        }else{
        res.render('front/index', {
            title: 'Exlshop - Home',
            user: req.fbuser ,
            products:result.products,
            popular_products:result.popular_products,
            bestSeller_product:result.bestSeller_product,
            roles : result.roles,
            brandLocations : result.brandLocations,
            shop_categories:result.category,
            shop_subcategories:result.subcategory,
            shop_subsubcategories:result.subsubcategory,
            csrfToken:req.session.csrfSecret,
            deals_of_the_day : result.deals_of_the_day,
             styles: ['/plugins/toastr/toastr.min.css'],
            scripts: ['/plugins/toastr/toastr.min.js']
        })
        }
    
    })
    }

});

router.post('/getBrandLocations', (req, res) =>{
    const models = req.Core.Models;
    models.Users.shopOrderLocation2((err, shopOrderLocation) =>{
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true, shopOrderLocation})
        }
    })
})

/////////////////////////////////////route for seasonal products////////////////
router.get('/my-account/seasonal', (req, res) => {
    const models = req.Core.Models;
    async.auto({
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        subcategory:['category',(result,cb)=>{
            models.ShopProducts.getSubCategory({ id: result.category.id }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })   
        }],
        subsubcategory:['subcategory',(result,cb)=>{
            models.ShopProducts.getSubSubCategory({ id: result.subcategory.id }, (err, shop_subcategories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_subcategories);
                }
            })
        }],
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
        products:(cb)=>{
            models.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,products);
                }
        })
    },
    deals_of_the_day:(cb)=>{
        models.ShopProducts.GetDealsProducts({ offset: 0, limit: 8 }, (err, deals_of_the_day) => {
            if(err){
                cb(err);
            }else{
                cb(null,deals_of_the_day);
            }
    })
    },
},(err,result)=>{
    if(err){
        res.send({success:false})
    }else{
    res.render('my-account/seasonal', {
        title: 'Exlshop - Home',
        products:result.products,
        roles : result.roles,
        deals_of_the_day : result.deals_of_the_day,
        brandLocations : result.brandLocations,
        shop_categories:result.category,
        shop_subcategories:result.subcategory,
        shop_subsubcategories:result.subsubcategory,
        csrfToken:req.session.csrfSecret,
        styles: ['/plugins/toastr/toastr.min.css'],
        scripts: ['/plugins/toastr/toastr.min.js']
        // scripts: ['/js/page-level/index.js','/plugins/toastr/toastr.min.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
    })
    }
})
});
///////END///////
router.get('/popular_products', (req, res) => {
    const models = req.Core.Models;
    async.auto(
        {
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        subcategory:['category',(result,cb)=>{
            models.ShopProducts.getSubCategory({ id: result.category.id }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })   
        }],
        subsubcategory:['subcategory',(result,cb)=>{
            models.ShopProducts.getSubSubCategory({ id: result.subcategory.id }, (err, shop_subcategories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_subcategories);
                }
            })
        }],
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
        products:(cb)=>{
            models.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,products);
                }
        })
    },
      popular_products: (cb) => {
            models.ShopProducts.Popular_Products({ offset: 0, limit: 8 }, (err, popular_products) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, popular_products);
                }
            })
        },
        bestSeller_product:(cb)=>{
            models.ShopProducts.BestSeller_Products({ offset: 0, limit: 8 }, (err, bestSeller_products) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, bestSeller_products);
                }
            })
        }
},(err,result)=>{
    if(err){
        res.send({success:false})
    }else{
    res.render('my-account/popular_products', {
        title: 'Exlshop - Home',
        products:result.products,
        popular_products:result.popular_products,
        bestSeller_product:result.bestSeller_product,
        roles : result.roles,
        brandLocations : result.brandLocations,
        shop_categories:result.category,
        shop_subcategories:result.subcategory,
        shop_subsubcategories:result.subsubcategory,
        csrfToken:req.session.csrfSecret,
        styles: ['/plugins/toastr/toastr.min.css'],
        scripts: ['/plugins/toastr/toastr.min.js']
        // scripts: ['/js/page-level/index.js','/plugins/toastr/toastr.min.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
    })
    }
})
})
/////////////////////////////////////route for popular products////////////////
router.get('/bestseller_products', (req, res) => {
    const models = req.Core.Models;
    async.auto(
        {
        category:(cb)=>{
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })
        },
        subcategory:['category',(result,cb)=>{
            models.ShopProducts.getSubCategory({ id: result.category.id }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_categories);
                }
            })   
        }],
        subsubcategory:['subcategory',(result,cb)=>{
            models.ShopProducts.getSubSubCategory({ id: result.subcategory.id }, (err, shop_subcategories) => {
                if(err){
                    cb(err);
                }else{
                    cb(null,shop_subcategories);
                }
            })
        }],
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
    bestSeller_product:(cb)=>{
        models.ShopProducts.BestSeller_Products({ offset: 0, limit: 8 }, (err, bestSeller_products) => {
            if (err) {
                cb(err);
            } else {
                cb(null, bestSeller_products);
            }
        })
    }
},(err,result)=>{
    if(err){
        res.send({success:false})
    }else{
    res.render('my-account/bestseller_products', {
        title: 'Exlshop - Home',
        bestSeller_product:result.bestSeller_product,
        products:result.products,
        roles : result.roles,
        brandLocations : result.brandLocations,
        shop_categories:result.category,
        shop_subcategories:result.subcategory,
        shop_subsubcategories:result.subsubcategory,
        csrfToken:req.session.csrfSecret,
        styles: ['/plugins/toastr/toastr.min.css'],
        scripts: ['/plugins/toastr/toastr.min.js']
        // scripts: ['/js/page-level/index.js','/plugins/toastr/toastr.min.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
    })
    }
})
});
///////END///////
router.post('/sign-in', (req, res) => {
    const post = req.body;
    req.session.csrfSecret=post._csrf;
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

router.post('/sign-up', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const registerOpts = {
        fname: post.fname,
        lname: post.lname,
        email: post.email,
        phone: post.phone,
        password: post.password
    }
    models.Users.SignUp(registerOpts, (err) => {
        if (err) {
            res.redirect('/404')
        } else {
            const loginOpts = {
                email: post.email,
                password: post.password
            }
            models.Users.SignIn(loginOpts, (err, user) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    req.session.user = user;
                    res.redirect('back')
                }
            })
        }
    })
});

router.post('/sign-up-shop', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const registerOpts = {
        fname: post.fname,
        lname: post.lname,
        email: post.email,
        phone: post.phone,
        password: post.password,
        panno : post.panno,
        gstno : post.gstin,
        shopactno : post.shopactno,
        shopname : post.shopname,
        locationname : post.locationname,
        brand_locations_id : post.brand_locations_id,
        roles_id : post.roleid,
        panDocument : post.panDocument,
        gstDocument : post.gstDocument
    }
        var files = req.files;
        var imgArr = []
        imgArr.push(files.pan_file, files.gst_file)
    console.log(registerOpts)
    async.map(imgArr, (i, callback) => {
        var filename = `${moment().unix()}-${i.name}`;
        var imgDir = `${require('path').resolve()}/public/documents/${filename}`;
        i.mv(imgDir, (err) => {
            if (err) {
                console.log(err)
                callback(err)
            } else {
                callback(null, { fileName: filename })
            }
        })
    }, (err, result) => {
        if (err) {
            console.log(err)
            res.send({ success: false })
        } else {
            models.Users.SignUpShop(registerOpts, (err, data) => {
                if (err) {
                    console.log(err)      
                    res.redirect('/404')
                } else {
                    var userId = data.result.insertId
                    var locationId = data.locationId
                    models.Users.AddUserDocuments({userId, locationId, images:result}, (err, data) => {
                        if(err){
                            console.log(err)
                            res.redirect('/404')
                        }else{
                            res.redirect("https://admin.exlshop.com/login")
                        }
                    })
                }
            })
        }
    })    
});

router.post('/sign-up-shop-admin', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const registerOpts = {
        fname: post.fname,
        lname: post.lname,
        email: post.email,
        phone: post.phone,
        password: post.password,
        role_id : post.role_id,
        location_id : post.location_id,
        selected_delhiveryOption:post.selected_delhiveryOption
    }
    models.Users.SignUpAdmin(registerOpts, (err) => {
        if (err) {
            res.redirect('/404')
        } else {
            const loginOpts = {
                email: post.email,
                password: post.password
            }
            models.Users.SignIn(loginOpts, (err, user) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    req.session.user = user;
                    res.redirect('back')
                }
            })
        }
    })
});

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
});

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
});

router.get('/cart', (req, res) => {
    const models = req.Core.Models;
    if (!req.session.cart) {
        models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
            if(err){
                cb(err);
            }else{
        return res.render('front/cart', {
            title: 'Exlshop - My Cart',
            shop_categories : shop_categories,
            cart: false
        })
    }})
    }else{
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
            shippingAddresses: (cb) => {
                if (req.session.user) {
                    models.Users.GetShippingAddress({ userId: req.session.user.id }, (err, address) => {
                        cb(err ? err : null, address)
                    })
                } else {
                    cb()
                }
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
        }, (err, result) => {
            if (err) {
                res.redirect('/404')
            } else {
                result.products.forEach((r, i) => {
                    r.lineId = i + 1
                    r.lineTotal = (r.product_type == 2 ? (r.variation_regular_price * parseInt(r.quantity)) : (r.product_regular_price * parseInt(r.quantity)))
                    r.lineTotalDisc = r.product_discount_price * parseInt(r.quantity)
                })
                var cartTotal = _.sumBy(result.products, 'lineTotal');
                var cartTotalDisc = _.sumBy(result.products, 'lineTotalDisc');
                var deliveryCharge = parseInt(200);
                req.session.cart.cartTotal = cartTotal;
                req.session.cart.cartTotalDisc = cartTotalDisc;
                req.session.cart.deliveryCharge = deliveryCharge;
                res.render('front/cart', {
                    title: 'Exl-shop - My Cart',
                    cart: (req.session.cart.line.length) ? (true) : (false),
                    cartitems:req.session.cart.line,
                    products: result.products,
                    cartTotal,
                    cartTotalDisc,
                    deliveryCharge,
                    states: result.states,
                    shippingAddresses: result.shippingAddresses,
                    shop_categories: result.category,
                    roles : result.roles,
                    brandLocations : result.brandLocations,
                    styles: ['/plugins/toastr/toastr.min.css'],
                    scripts: ['/plugins/toastr/toastr.min.js', 'https://checkout.razorpay.com/v1/checkout.js', '/js/page-level/cart.js']
                })
            }
        })
    }
});

router.post('/get-cities', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    models.Common.GetCities1({ stateId: post.stateId }, (err, cities) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, cities })
        }
    })
})

router.post('/getShippingDetails', (req, res) =>{
    const models = req.Core.Models;
    models.ShopProducts.getShippingDetails(req.body, (err, data) => {
        if(err){
            res.send({success: false})
        }else{
            res.send({success:true, a:data.record})
        }
    })
})

router.get('/categoryslug/:slug/:CId', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const slug = req.params.slug;
    const CId = req.params.CId;
    
    models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
        if(err){
            cb(err);
        }
        else {
            models.Users.GetRoles({all: false}, (err, roles) => {
                if(err){
                    res.redirect('/404')
                }
                else{
                    models.Users.GetAllLocation((err, brandLocations) => {
                        if (err) {
                            callback(err)
                        } else {
                            res.render('front/product-list', {
                                title: 'Exlshop Shop - ' + slug,
                                shop_categories:shop_categories,
                                name:shop_categories.name,
                                slug,
                                CId,
                                roles : roles,
                                brandLocations : brandLocations,
                                scripts: ['/js/page-level/product-list.js']
                            })
                        }
                    })
                }
            })
        }
    })
})

    router.post('/get-product-byname', (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        const header_search=req.body.header_search;
        const search = req.body.searchValue;
        const slug = req.body.slug;
        const minPrice = req.body.minPrice;
        const maxPrice = req.body.maxPrice;
        const valueforsort=req.body.valueforsort;
       const catvalarray= req.body.catvalarray;
       const ratingvalarray=  req.body.ratingvalarray;
       const percentagevalarray= req.body.percentagevalarray;
       const offervalarray= req.body.offervalarray;
            models.ShopProducts.product_category({catvalarray}, (err, category) => {
                if(err){
                    res.redirect('/404')
                }else{
                    var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id)
                    }
                    models.ShopProducts.GetProducts1({ offset: 0, limit: 20, search, minPrice ,header_search, cat_id,  maxPrice, catvalarray, ratingvalarray,percentagevalarray,valueforsort,offervalarray},(err, products) => {
                        if(err){
                            res.redirect('/404')
                        }else{
                            res.render('partials/productsbyname', {
                                title: 'Exlshop - ' ,
                                products:products,
                            })
                        }
                    })
             }
         })
    })

router.post('/get-product-list', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const slug = req.body.slug;
    const CId = req.body.CId;
    // const CId=37;
    const search = req.body.searchValue;
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;
    const valueforsort=req.body.valueforsort;
    const catvalarray= req.body.catvalarray;
   const ratingvalarray=  req.body.ratingvalarray;
   const percentagevalarray= req.body.percentagevalarray;
   const offervalarray= req.body.offervalarray;
 
            models.ShopProducts.product_category({catvalarray}, (err, category) => {
                if(err){
                    res.redirect('/404')
                }else{
                    var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id) 
                    }
                    models.ShopProducts.GetProducts({ offset: 0, limit: 20, slug, search, catvalarray, minPrice, CId , maxPrice,cat_id,ratingvalarray,percentagevalarray,valueforsort,offervalarray},(err, products) => {
                        if(err){
                            res.redirect('/404')
                        }else{
                            res.render('partials/products', {
                                title: 'Exlshop - '+ slug,
                                products:products
                            })
                        }
                    })
                }
            })
})

router.post('/get-shop-product', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const slug = req.body.slug;
    const CId = req.body.CId;
    // const CId=37;
    const search = req.body.searchValue;
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;
    const valueforsort=req.body.valueforsort;
   const catvalarray= req.body.catvalarray;
   const ratingvalarray=  req.body.ratingvalarray;
   const percentagevalarray= req.body.percentagevalarray;
   const offervalarray= req.body.offervalarray;
   const brandId = req.body.brand_id;
   const brand_location_id = req.body.brand_location_id;
 
            models.ShopProducts.product_category({catvalarray}, (err, category) => {
                if(err){
                    res.redirect('/404')
                }else{
                    var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id)
                    }
                    models.ShopProducts.GetShopProducts({ offset: 0, limit: 20, slug, search,catvalarray, minPrice, maxPrice, brandId, brand_location_id, CId ,cat_id,ratingvalarray,percentagevalarray,valueforsort,offervalarray},(err, products) => {
                        if(err){
                            res.redirect('/404')
                        }else{
                            res.render('partials/products', {
                                title: 'Exlshop - ' + slug,
                                products:products
                            })
                        }
                    })
                }
            })
})

router.post('/get-product', (req, res) => {
    const post = req.body;
   
    const models = req.Core.Models;
    const slug = req.body.slug;
    const CId = req.body.CId;
    // const CId=37;
    const search = req.body.searchValue;
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;
    const valueforsort=req.body.valueforsort;
   const catvalarray= req.body.catvalarray;
   const ratingvalarray=  req.body.ratingvalarray;
   const percentagevalarray= req.body.percentagevalarray;
   const offervalarray= req.body.offervalarray;
   const shop_categories= req.body.shop_categories;
   
            models.ShopProducts.product_category({catvalarray}, (err, category) => {
                if(err){
                   
                    res.redirect('/404')
                }else{
                   
                    var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id)
                    }
                    models.ShopProducts.GetProducts({ offset: 0, limit: 20, slug, search, minPrice, maxPrice, CId ,cat_id,ratingvalarray,percentagevalarray,valueforsort,offervalarray},(err, products) => {
                        if(err){
                         
                            res.redirect('/404')
                        }else{
                            res.render('front/shop_products', {
                                title: 'Exlshop - ' + slug,
                                products:products,
                                shop_categories:shop_categories
                            })
                           
                        }
                    })
                }
            })
})
// ADDED by PK 
router.post('/get-shop-list', (req, res) => {
    const post = req.body;
    const shops = req.body.shops;
    const models = req.Core.Models;
    const s_catId = req.body.s_catId;
    const s_loc = req.body.s_loc;
    const catName = req.body.catName;
    const search = req.body.searchValue;
    const myLocation = req.body.myLocation;
    const temp1 = req.body.shopdistances;
    const valueforsort=req.body.valueforsort;
    const catvalarray= req.body.catvalarray;
    const ratingvalarray=  req.body.ratingvalarray;
    const distancevalarray= req.body.distancevalarray;
    const timingvalarray= req.body.timingvalarray;
    const temp = req.body.shopid;
    let shopid = ''
    let shopdistances = ''
    shopid = temp.split(',')
    shopdistances = temp1.split(',')

            models.ShopProducts.product_category({catvalarray}, (err, category) => {
                if(err){
                    res.redirect('/404')
                }else{
                    var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id)
                    }
                    models.ShopProducts.GetShops({ offset: 0, limit: 20, s_loc, cat_id, search, s_catId, catvalarray, temp, shopid, myLocation, shopdistances, ratingvalarray, distancevalarray, valueforsort, timingvalarray},(err, newshops) => {
                        if(err){
                            res.redirect('/404')
                        }else{
                            res.render('partials/shops', {
                                title: 'Exlshop - Shop List',
                                shop_categories:category,
                                shops:newshops,
                                s_catId,
                                catName,
                                s_loc,
                                // scripts: ['/js/page-level/index.js','/js/page-level/shop-list.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
                            })
                        }
                    })
                }
            })
})

router.post('/get-shop-list1', (req, res) => {
    const post = req.body;
    const shops = req.body.shops;
    const models = req.Core.Models;
    const s_catId = req.body.s_catId;
    const s_loc = req.body.s_loc;
    const catName = req.body.catName;
    const search = req.body.searchValue;
    const myLocation = req.body.myLocation;
    const temp1 = req.body.shopdistances;
    const valueforsort=req.body.valueforsort;
    const catvalarray= req.body.catvalarray;
    const ratingvalarray=  req.body.ratingvalarray;
    const distancevalarray= req.body.distancevalarray;
    const timingvalarray= req.body.timingvalarray;
    const temp = req.body.shopid;
    let shopid = ''
    let shopdistances = ''
    shopid = temp.split(',')
    shopdistances = temp1.split(',')

            models.ShopProducts.product_category({catvalarray}, (err, category) => {
                if(err){
                    res.redirect('/404')
                }else{
                    var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id)
                    }
                    models.ShopProducts.GetShops({ offset: 0, limit: 20, s_loc, cat_id, search, s_catId, temp, shopid, myLocation, shopdistances, ratingvalarray, distancevalarray, valueforsort, timingvalarray},(err, newshops) => {
                        if(err){
                            res.redirect('/404')
                        }else{
                            res.render('partials/shops', {
                                title: 'Exlshop - Shop List',
                                shop_categories:category,
                                shops:newshops,
                                s_catId,
                                catName,
                                s_loc,
                                // scripts: ['/js/page-level/index.js','/js/page-level/shop-list.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
                            })
                        }
                    })
                }
            })
})


router.post('/get-shop-list2', (req, res) => {
    const post = req.body;
    const shops = req.body.shops;
    const models = req.Core.Models;
    const s_catId = req.body.s_catId;
    const s_loc = req.body.s_loc;
    const catName = req.body.catName;
    const search = req.body.searchValue;
    const myLocation = req.body.myLocation;
    const temp1 = req.body.shopdistances;
    const valueforsort=req.body.valueforsort;
    const catvalarray= req.body.catvalarray;
    const ratingvalarray=  req.body.ratingvalarray;
    const distancevalarray= req.body.distancevalarray;
    const timingvalarray= req.body.timingvalarray;
    const temp = req.body.shopid;
    const search_data = req.body.search_data;
    let shopid = ''
    let shopdistances = req.body.shopdistances;
    shopid = temp.split(',')
    shopdistances = temp1.split(',')
   
            models.ShopProducts.product_category({catvalarray}, (err, category) => {
                if(err){
                    res.redirect('/404')
                }else{
                    var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id)
                    }
                    models.ShopProducts.GetShops2({ offset: 0, myLocation, shopdistances, limit: 20, s_loc, cat_id, search_data, s_catId, temp, shopid, myLocation, shopdistances, ratingvalarray, distancevalarray, valueforsort, timingvalarray},(err, newshops) => {
                        if(err){
                            res.redirect('/404')
                        }else{
                            res.render('partials/shopsList', {
                                title: 'Exlshop - Shop',
                                shop_categories:category,
                                shops:newshops,
                                s_catId,
                                catName,
                                s_loc,
                                // scripts: ['/js/page-level/index.js','/js/page-level/searchShopbyName.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
                            })
                        }
                    })
                }
            })
})

router.get('/marathons', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user ? req.session.user.id : null;

    models.Common.GetCountries(null, (err, countries) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Common.GetStates({ countryId: 101 }, (err, states) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    models.Users.GetSingle({ userId }, (err, user) => {
                        if (err) {
                            res.redirect('/404')
                        } else {
                            res.render('front/marathon', {
                                title: 'FitBiz Shop - Marathons',
                                countries,
                                states,
                                user,
                                scripts: ['/js/page-level/marathon.js']
                            })
                        }
                    })
                }
            })
        }
    })
})

router.get('/automate-my-gym', (req, res) => {
    const models = req.Core.Models;
    const userId = req.session.user ? req.session.user.id : null;

    models.Common.GetCountries(null, (err, countries) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Common.GetStates({ countryId: 101 }, (err, states) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    models.Users.GetSingle({ userId }, (err, user) => {
                        if (err) {
                            res.redirect('/404')
                        } else {
                            res.render('front/automate-my-gym', {
                                title: 'Automate My Gym - FitBiz',
                                countries,
                                states,
                                user,
                                scripts: ['/js/page-level/marathon.js']
                            })
                        }
                    })
                }
            })
        }
    })
})

router.post('/get-search-product', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
   
    models.ShopProducts.GetSearchProducts({ offset: 0, limit: 20,search: post.searchValue, brand_location_id :post.brand_location_id }, (err, products) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('partials/shop-search-products', {
                products
            })
        }
    })
})

router.get('/privacy&policy', (req, res) =>{
    const models = req.Core.Models;
    res.render('front/privacy&policy', {
        title: 'privacy policy'
    })
})

router.get('/getCategoryProducts/:CId', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const slug = req.params.slug;
    const CId = req.params.CId;
    
    models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
        if(err){
            cb(err);
        }
        else {
            models.Users.GetRoles({all: false}, (err, roles) => {
                if(err){
                    res.redirect('/404')
                }
                else{
                    models.Users.GetAllLocation((err, brandLocations) => {
                        if (err) {
                            callback(err)
                        } else {
                            res.render('front/parent-product-list', {
                                title: 'Exlshop Shop - ' + slug,
                                shop_categories:shop_categories,
                                name:shop_categories.name,
                                CId,
                                roles : roles,
                                brandLocations : brandLocations,
                                scripts: ['/js/page-level/parent-product-list.js']
                            })
                        }
                    })
                }
            })
        }
    })
})

router.post('/get-product-list1', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const slug = req.body.slug;
    const CId = req.body.CId;
    // const CId=37;
    const search = req.body.searchValue;
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;
    const valueforsort=req.body.valueforsort;
    const catvalarray= req.body.catvalarray ? req.body.catvalarray : [CId];
   const ratingvalarray=  req.body.ratingvalarray;
   const percentagevalarray= req.body.percentagevalarray;
   const offervalarray= req.body.offervalarray;
            models.ShopProducts.product_category({catvalarray}, (err, category) => {
                if(err){
                    res.redirect('/404')
                }else{
                    var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id) 
                    }
                    models.ShopProducts.GetProducts({ offset: 0, limit: 20, slug, search, catvalarray, minPrice, CId , maxPrice,cat_id,ratingvalarray,percentagevalarray,valueforsort,offervalarray},(err, products) => {
                        if(err){
                            res.redirect('/404')
                        }else{
                            res.render('partials/products', {
                                title: 'Exlshop - '+ slug,
                                products:products
                            })
                        }
                    })
                }
            })
})

module.exports = router; 