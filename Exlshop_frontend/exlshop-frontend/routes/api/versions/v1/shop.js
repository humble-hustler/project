const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const session = require("session")
const { response } = require('express');
const { options } = require('../..');
const url = require('url');
const models = require('../../../../models');
const { findIndex } = require('lodash');
const params = new url.URLSearchParams();
const {SphericalUtil, PolyUtil} = require("node-geometry-library");
module.exports = {
  'get-product-list': function (model, req, method, cb) {
    if (method === 'POST') {
        const slug = req.slug?req.slug:0;
        const search=req.search?req.search:0;
        const minPrice=req.minPrice?req.minPrice:0;
        const maxPrice=req.maxPrice?req.maxPrice:0;
        const CId=req.CId?req.CId: null;
        const cat_id=req.cat_id?req.cat_id:0;
        model.ShopProducts.GetProducts({ offset: 0, limit: 20, slug, search, minPrice, maxPrice, CId ,cat_id},(err, products) => {
            if (err) {
                cb(true, { success: false });
            } else {
                cb(false, { success: true, products: products });
            }
        })
    }
},
    'userDetails': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.userId;
            model.ShopProducts.User_Details({ userId }, (err, user_details) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, user_details: user_details });
                }
            })
        }
    },

    'shopSearch': function (model, req, method, cb) {
        if (method === 'POST') {
            model.ShopProducts.ShopSearchforApp({userId:req.userId, search:req.search, lat:req.lat, lng:req.lng}, (err, shopDetails) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true ,shopDetails:shopDetails});
                }
            })
        }
    },

    'shop-products' : function (model, req, method, cb){
        if(method === 'POST'){
            const options = {
                brandId : req.brandId, brand_location_id: req.brand_location_id, userId:req.userId
            }
            async.parallel({
                product: (cb) => {
                    model.ShopProducts.GetShopProducts(options,  (err, product) => {
                        cb(err ? err : null, product)
                    })
                },
                shopOrders: (cb) =>{
                    model.Users.shopOrderLocation(options, (err, shopOrders) => {
                        cb(err ? err : null, shopOrders)
                    })
                }
            },(err, result) => {
                if (err) {
                    cb(true, { success: false })
                } else {
                    cb(false, 
                    { success: true, product: result.product, shopOrders: result.shopOrders})
                }
            })
           
        }
    },

    "productSearch": function (model, req, method, cb) {
        if (method === 'POST') {
         var catvalarray = req.catvalarray
         if(catvalarray.length){
            model.ShopProducts.product_category({catvalarray}, (err, category) =>{
                if(err){
                    cb(true, { success: false });
                }else{
                    var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id)
                    }
                    model.ShopProducts.GetProducts1({header_search:req.header_search, cat_id, catvalarray:[req.catvalarray]}, (err, productDetails) => {
                        if (err) {
                            cb(true, { success: false });
                        } else {
                            cb(false, { success: true, productDetails:productDetails});
                        }
                    })
                }
            })
          
        }else{
            model.ShopProducts.GetProducts1({header_search:req.header_search}, (err, productDetails) => {
                if (err) {
                    console.log(err)
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true ,productDetails:productDetails});
                }
            })
        }
    }
    },

    'editProfile': function (model, req, method, cb) {
        if (method === 'GET') {
              const id = req.users_id;
            model.ShopProducts.editProfile({ all: true }, (err, user) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true ,user:user});
                }
            })
        }
    },

    'getAll': function (model, req, method, cb) {
        if (method === 'GET') {
            model.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    model.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                        if (err) {
                            cb(true, { success: false });
                        } else {
                            cb(false, { success: true, products, shop_categories });
                        }
                    })
                }
            })
        }
    },

    'category': function (model, req, method, cb) {
        if (method === 'GET') {
            const id = req.cid;
            model.ShopProducts.getSubCategory({ id: id }, (err, shop_subcategories) => {
                if (err) {
                    console.log(err)
                    cb(true, { success: false });
                } else {
                    model.ShopProducts.GetAll({ offset: 0, limit: 8}, (err, products) => {
                        if (err) {
                            console.log(err)
                            cb(true, { success: false });
                        }
                        else {
                            cb(false, { success: true, products: products, shop_subcategories: shop_subcategories });
                        }
                    })
                }
            })
        }
    },

    'subcategory': function (model, req, method, cb) {
        if (method === 'GET') {
            const id = req.cid;
            model.ShopProducts.getSubSubCategory({ id: id }, (err, shop_subsubcategories) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    model.ShopProducts.GetAll({ offset: 0, limit: 8 ,cid : req.cid}, (err, products) => {
                        if (err) {
                            cb(true, { success: false });
                        }
                        else {
                            cb(false, { success: true, products: products, shop_subsubcategories: shop_subsubcategories });
                        }
                    })
                }
            })
        }
    },

    'category1': function (model, req, method, cb) {
        if (method === 'POST') {
            const id = req.cid;
            model.ShopProducts.getSubCategory1({ id: id }, (err, shop_subcategories) => {
                if (err) {
                    console.log(err)
                    cb(true, { success: false });
                } else {
                    model.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                        if (err) {
                            console.log(err)
                            cb(true, { success: false });
                        }
                        else {
                            cb(false, { success: true, products: products, shop_subcategories: shop_subcategories });
                        }
                    })
                }
            })
        }
    },

    'subcategory1': function (model, req, method, cb) {
        if (method === 'POST') {
            const id = req.cid;
            model.ShopProducts.getSubSubCategory1({ id: id }, (err, shop_subsubcategories) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    model.ShopProducts.GetAll({ offset: 0, limit: 8 }, (err, products) => {
                        if (err) {
                            cb(true, { success: false });
                        }
                        else {
                            cb(false, { success: true, products: products, shop_subsubcategories: shop_subsubcategories });
                        }
                    })
                }
            })
        }
    },

    'add-to-cart': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.userId;
            async.auto({
                cart: (cb) => {
                    model.Cart.GetUserCart({userId}, (err, cart) => {
                        cb(err ? err : null, cart.cart)
                    })
                },
                updateCart: ['cart',(result,cb) => {
                    var cart = (result.cart)?(JSON.parse(result.cart)):({});
                    var line = (cart)?(cart.line):([]);
                    const lineIdx = _.findIndex(line, {productId: req.productId});
                    if (lineIdx !== -1) {
                        line[lineIdx] = {
                            productId: req.productId,
                            quantity: req.quantity,
                            locationId : req.locationId,
                            save_for_later : 0
                        }
                    } else {
                        line.push({
                            productId: req.productId,
                            quantity: req.quantity,
                            locationId : req.locationId,
                            save_for_later : 0
                        })
                    }
                    cart = {
                        line: line
                    }
                    model.Cart.SetUserCart({userId: userId, cart: JSON.stringify(cart)}, (err) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null)
                        }
                    })
                }]
            },(err,result) => {
                if(err){
                    cb(true,{success:false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'add-save-later-item' : function(model, req, method, cb){
        if(method === 'POST'){
            const userId = req.userId;
            
            async.auto({
                cart: (cb) => {
                    model.Cart.GetUserCart({userId}, (err, cart) => {
                        cb(err ? err : null, cart.cart)
                    })
                },
                updateCart: ['cart',(result,cb) => {
                    var cart = (result.cart)?(JSON.parse(result.cart)):({});
                    var line = (cart)?(cart.line):([]);
                    const lineIdx = _.findIndex(line, {productId: req.productId});
                     var removeItem = line[lineIdx]
                   
                     model.Cart.GetUserSaveForLater({userId}, (err, Cart) =>{
                        if(err){
                            cb(err)
                        }else{
                            var cart1 = (Cart.cart)?(JSON.parse(Cart.cart)):({});
                            var line1 = (cart1)?(cart1.line):([])
                            var lineIdx1 = _.findIndex(line1, {productId: req.productId})

                            if (lineIdx1 !== -1) {
                                line1[lineIdx1] = {
                                    productId: req.productId,
                                    quantity: removeItem.quantity,
                                    locationId : removeItem.locationId,
                                    save_for_later : 1
                                }
                            }else {
                                line1.push({
                                    productId: req.productId,
                                    quantity: removeItem.quantity,
                                    locationId : removeItem.locationId,
                                    save_for_later : 1
                                })
                            }

                            var cart1 = {
                                line: line1
                            }
                                model.Cart.SetSaveForLater({userId: userId, cart: JSON.stringify(cart1)}, (err) => {
                                if (err) {
                                    cb(err)
                                } else {
                                        _.remove(line, item => (item.productId == req.productId ));

                                         cart = {
                                            line: line
                                        }
                                    model.Cart.SetUserCart({userId: userId, cart: JSON.stringify(cart)}, (err) =>{
                                        if(err){
                                            cb(err)
                                        }else{
                                            cb(null)
                                        }
                                    })
                                }
                            })
                        }
                     })
                }]
            },(err,result) => {
                if(err){
                    cb(true,{success:false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'remove-save-later-item' : function(model, req, method, cb){
        if(method === 'POST'){
            const userId = req.userId;
            async.auto({
                cart: (cb) => {
                    model.Cart.GetUserSaveForLater({userId}, (err, cart) => {
                        cb(err ? err : null, cart.cart)
                    })
                },
                updateCart: ['cart',(result,cb) => {
                    var cart = (result.cart)?(JSON.parse(result.cart)):({});
                    const lineIdx1 = _.findIndex(cart.line, {productId: req.productId});
                    const removeItem = cart.line[lineIdx1]
                    const removeItemQuantity = removeItem.quantity;
                    const removeItemLocationId = removeItem.locationId;
                    _.remove(cart.line, item => (item.productId == req.productId ));

                    model.Cart.SetSaveForLater({userId: userId, cart: JSON.stringify(cart)}, (err)=>{
                        if(err){
                            cb(err)
                        }else{
                            model.Cart.GetUserCart({userId}, (err, cart1) =>{
                                if(err){
                                    cb(err)
                                }else{
                                    var cart2 = (cart1.cart)?(JSON.parse(cart1.cart)):({});
                                    var line = (cart2)?(cart2.line):([]);
                                    const lineIdx2 = _.findIndex(line, {productId: req.productId});
        
                                    if (lineIdx2 !== -1) {
                                        line[lineIdx2] = {
                                            productId: req.productId,
                                            quantity: req.quantity,
                                            locationId : req.locationId,
                                            save_for_later : 0
                                        }
                                    } else {
                                        line.push({
                                            productId: req.productId,
                                            quantity: removeItemQuantity,
                                            locationId : removeItemLocationId,
                                            save_for_later : 0
                                        })
                                    }
        
                                    cart2 = {
                                        line: line
                                    }
                                    model.Cart.SetUserCart({userId: userId, cart: JSON.stringify(cart2)}, (err) =>{
                                        if(err){
                                            cb(err)
                                        }else{
                                            cb(null)
                                        }
                                    })
                                }
                            })
                        }
                    })
                }]
            },(err,result) => {
                if(err){
                    cb(true,{success:false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'my-cart': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.userId;
            async.auto({
                cart: (cb) => {
                    model.Cart.GetUserCart({ userId }, (err, cart) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null, cart ? cart.cart : null)
                        }
                    })
                },
                products: ['cart', (result, cb) => {
                    var cart = (result.cart) ? (JSON.parse(result.cart)) : ({});
                    var line = (cart.line) ? (cart.line) : ([]);
                    
                    async.map(line, (l, callback) => {
                        model.ShopProducts.GetForCart({ productId: l.productId, quantity:l.quantity, variationId: l.variationId }, (err, product) => {
                            if (err) {
                                callback(err)
                            } else {
                               if(product){
                                product.quantity = l.quantity
                               }
                                callback(null, _.merge(l, product))
                            }
                        })
                    }, (err, result) => {
                        cb(err ? err : null, result)
                    })
                }],
                updateCart: ['products', 'cart', (result, cb) => {
                    var cart = (result.cart) ? (JSON.parse(result.cart)) : ({});
                    var line = (cart.line) ? (cart.line) : ([]);
                    result.products.forEach((r, i) => {
                        line[i].lineId = i + 1;
                        r.lineTotal = r.product_type == 2 ? r.variation_regular_price * parseInt(r.quantity) : r.product_regular_price * parseInt(r.quantity)
                        r.discountTotal = r.product_discount_price * parseInt(r.quantity)
                    })
                    var cartTotal = _.sumBy(result.products, 'lineTotal');
                    var discountTotal = _.sumBy(result.products, 'discountTotal');
                    cart = {
                        line: line,
                        cartTotal: cartTotal
                    }
                    model.Cart.SetUserCart({ userId: userId, cart: JSON.stringify(cart) }, (err) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null)
                        }
                    })
                }]
            }, (err, result) => {
                if (err) {
                    res.send({ success: false })
                } else {
                    result.products.forEach((r, i) => {
                        r.lineId = i + 1
                        r.lineTotal = r.product_type == 2 ? r.variation_regular_price * parseInt(r.quantity) : r.product_regular_price * parseInt(r.quantity)
                        r.discountTotal = r.product_discount_price * parseInt(r.quantity)
                    })
                    var cartTotal = _.sumBy(result.products, 'lineTotal');
                    var discountTotal = _.sumBy(result.products, 'discountTotal');
                    cb(false, { success: true, cartItems: result.products, cartTotal, discountTotal, shippingAddresses: result.shippingAddresses });
                }
            })
        }
    },

    'my-saved-item': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.userId;
            async.auto({
                cart: (cb) => {
                    model.Cart.GetUserSaveForLater({ userId }, (err, cart) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null, cart ? cart.cart : null)
                        }
                    })
                },
                products: ['cart', (result, cb) => {
                    var cart = (result.cart) ? (JSON.parse(result.cart)) : ({});
                    var line = (cart.line) ? (cart.line) : ([]);
                    
                    async.map(line, (l, callback) => {
                        model.ShopProducts.GetForCart({ productId: l.productId, quantity:l.quantity, variationId: l.variationId }, (err, product) => {
                            if (err) {
                                callback(err)
                            } else {
                               if(product){
                                product.quantity = l.quantity
                               }
                                callback(null, _.merge(l, product))
                            }
                        })
                    }, (err, result) => {
                        cb(err ? err : null, result)
                    })
                }],
                updateCart: ['products', 'cart', (result, cb) => {
                    var cart = (result.cart) ? (JSON.parse(result.cart)) : ({});
                    var line = (cart.line) ? (cart.line) : ([]);
                    result.products.forEach((r, i) => {
                        line[i].lineId = i + 1;
                        r.lineTotal = r.product_type == 2 ? r.variation_regular_price * parseInt(r.quantity) : r.product_regular_price * parseInt(r.quantity)
                        r.discountTotal = r.product_discount_price * parseInt(r.quantity)
                    })
                    var cartTotal = _.sumBy(result.products, 'lineTotal');
                    var discountTotal = _.sumBy(result.products, 'discountTotal');
                    cart = {
                        line: line,
                        // cartTotal: cartTotal
                    }
                    model.Cart.SetSaveForLater ({ userId: userId, cart: JSON.stringify(cart) }, (err) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null)
                        }
                    })
                }]
            }, (err, result) => {
                if (err) {
                    res.send({ success: false })
                } else {
                    result.products.forEach((r, i) => {
                        r.lineId = i + 1
                        r.lineTotal = r.product_type == 2 ? r.variation_regular_price * parseInt(r.quantity) : r.product_regular_price * parseInt(r.quantity)
                        r.discountTotal = r.product_discount_price * parseInt(r.quantity)
                    })
                    var cartTotal = _.sumBy(result.products, 'lineTotal');
                    var discountTotal = _.sumBy(result.products, 'discountTotal');
                    cb(false, { success: true, cartItems: result.products, cartTotal, discountTotal, shippingAddresses: result.shippingAddresses });
                }
            })
        }
    },

    'getShippingCharges' : function (model, req, method, cb) {
        if(method === 'POST'){
            const options = {
                shippingId : req.shippingId,
                shop_location : req.shop_location,
                shop_lat : req.shop_lat,
                shop_long : req.shop_long
            }
            
            models.ShopProducts.getShippingDetails(options, (err, shippingCharges) => {
                if(err){
                    cb(err)
                }else{
                    cb(false, {shippingCharges :shippingCharges})
                }
            })
        }
    },

    'clear-cart': function (model, req, method, cb) {
        if (method === 'GET') {
            delete req.session.cart
            cb(false, { success: true });
        }
    },

    'remove-cart': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.userId;
          
            async.auto({
                cart: (cb) => {
                    model.Cart.GetUserCart({userId}, (err, cart) => {
                        cb(err ? err : null, cart.cart)
                    })
                },
                updateCart: ['cart',(result,cb) => {
                    var cart = (result.cart)?(JSON.parse(result.cart)):({});
                    var line = (cart)?(cart.line):([]);
                    _.remove(line, item => (item.productId == req.productId ));
                    
                    cart = {
                        line: line
                    }
                   
                    model.Cart.SetUserCart({userId: userId, cart: JSON.stringify(cart)}, (err) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null)
                        }
                    })
                }]
            },(err,result) => {
                if(err){
                    cb(true,{success:false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'update-cart-quantity': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.userId;
            const productId = req.productId;
            const quantity = parseInt(req.quantity);
            async.auto({
                cart: (cb) => {
                    model.Cart.GetUserCart({userId}, (err, cart) => {
                        cb(err ? err : null, cart.cart)
                    })
                },
                updateCart: ['cart',(result,cb) => {
                    var cart = (result.cart)?(JSON.parse(result.cart)):(null);
                    var line = cart.line;
                    const lineIdx = _.findIndex(line, {productId});
                    const locationId = line[lineIdx].locationId;
                
                    if(lineIdx!=-1){
                        line[lineIdx] = {
                            productId: productId,
                            quantity: quantity,
                            locationId: locationId,
                            save_for_later: 0
                        }
                    }
                    cart = {
                        line: line
                    }
                    model.Cart.UpdateUserCart({userId: userId, cart: JSON.stringify(cart)}, (err, cartDetail) => {
                        cb(err ? err : null, cartDetail)
                    })
                }]
            },(err,result) => {
                if(err){
                   cb(true,{success:false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'single-product': function (model, req, method, cb) {
        if (method === 'POST') {
            const productId = req.productId;
            const userId = req.userId;

            async.parallel({
                product: (cb) => {
                    model.ShopProducts.GetSingle({ productId }, (err, product) => {
                        cb(err ? err : null, product)
                    })
                },
                images: (cb) => {
                    model.ShopProducts.GetProductImages({ productId }, (err, images) => {
                        cb(err ? err : null, images)
                    })
                },
                variations: (cb) => {
                    model.ShopProducts.GetProductVariations({ productId }, (err, variations) => {
                        cb(err ? err : null, variations)
                    })
                },
                roles: (cb) => {
                    model.Users.GetRoles({all: false}, (err, roles) => {
                        cb(err ? err : null, roles)
                    })
                },
                // brandLocations: (callback) => {
                //     model.Users.GetAllLocation((err, brandLocations) => {
                //         if (err) {
                         
                //             callback(err)
                //         } else {
                //             callback(null, brandLocations)
                //         }
                //     })
                // },
                Wishlist: (cb) => {
                    model.Users.ViewWishlist({userId, productId},(err,Wishlist)=>{
                        if(err){
                            cb(err);
                        }
                        else{
                            cb(null,Wishlist);
                        }
                    })
                },
                review: (cb) => {
                    model.Orders.ViewReview({productId},(err,review)=>{
                        if(err){
                            cb(err);
                        }
                        else{
                            cb(null,review);
                        }
                    })
                },
                rate: (cb) => {
                    model.Orders.ViewRateByProduct({productId},(err,rate)=>{
                        if(err){
                            cb(err);
                        }
                        else{
                            cb(null,rate);
                        }
                    })
                },
                rating: (cb) =>{
                    model.Orders.productRating({productId, userId},(err,rating) =>{
                        if(err){
                            cb(err);
                        }
                        else{
                            cb(null,rating);
                        }
                    })
                }
            }, (err, result) => {
                if (err) {
                    cb(true, { success: false })
                } else {
                    cb(false, 
                    { success: true,
                      product: result.product, 
                      images: result.images, 
                      variations: result.variations ,
                      roles : result.roles,
                      rating: result.rating,
                    review : result.review,
                    rate :result.rate,
                    brandLocations : result.brandLocations,
                    Wishlist : result.Wishlist,
                    })
                }
            })
        }
    },

    'products': function (model, req, method, cb) {
        if (method === 'POST') {
            const slug = req.slug;
            const search = req.search;
            model.ShopProducts.GetAll({ offset: 0, limit: 20, slug, search }, (err, products) => {
                if (err) {
                    cb(true, { success: false })
                } else {
                    cb(false, { success: true, products: products })
                }
            })
        }
    },

    '/:categorySlug/:productId': function (model, req, method, cb) {
        if (method === 'POST') {
            const params = req.params;
          
            async.parallel({
                productData: (cb) => {
                    model.ShopProducts.GetSingle({ productId: params.productId }, (err, product) => {
                        cb(err ? err : null, product)
                    })
                },
                variationData: (cb) => {
                    model.ShopProducts.GetVariation({ productId: params.productId }, (err, variations) => {
                        cb(err ? err : null, variations)
                    })
                },
                media: (cb) => {
                    model.ShopProducts.GetMedia({ productId: params.productId }, (err, media) => {
                        cb(err ? err : null, media)
                    })
                }
            }, (err, result) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    res.render('front/single-product', {
                        title: 'FitBiz Shop - Home',
                        productData: result.productData,
                        variationData: result.variationData,
                        media: result.media,
                        styles: ['/plugins/toastr/toastr.min.css'],
                        scripts: ['/plugins/toastr/toastr.min.js', '/js/lodash.min.js', '/js/page-level/single-product.js']
                    })
                }
            })
        }
    },

    'getproductlist': function (model, req, method, cb) {
        if (method === 'POST') {
            const slug = req.slug;
           const CId = req.CId;
            const search = req.search;
            const minPrice = req.minPrice;
            const maxPrice = req.maxPrice;
 
            model.ShopProducts.GetProducts({ offset: 0, limit: 20, slug,CId, search, minPrice, maxPrice }, (err, products) => {
                if (err) {
                    cb(true, { success: false })
                } else {
                    cb(false, { products: products })
                }
            })
        }
    },

    'gethomecategories':(model, req, method ,cb)=>{
        if(method === 'POST'){
            var catId= req.parent_id;
            model.ShopProducts.getHomeCategories({catId}, (err, getCategories) => {
            if(err){
                cb(true, { success: false })
            }else{
                cb(false, { products: getCategories })
            }
            })
       }
    },

    'search_items':(model, req, method ,cb)=>{
        if(method === 'POST'){
            // var catId= req.parent_id;
           var s_data=req.s_data;
           var search_data=req.search_data;
            model.ShopProducts.SearchItems({s_data,search_data}, (err, searchedData) => {
            if(err){
                cb(true, { success: false })
            }else{
                cb(false, { searchedData: searchedData })
            }
            })
       }
    },

    'shopby_location_category':(model, req, method ,cb)=>{
        if(method === 'POST'){
           var location=req.location;
           var category=req.category;
           model.ShopProducts.product_category({category}, (err, category) => {
            if(err){
                cb(true, { success: false })
            }else{
                var ids=category
                    var cat_id=[];
                    for(var i=0;i<category.length;i++){
                        cat_id.push(ids[i].id)
                    }
            model.ShopProducts.ShopbyLocationCategory({location,cat_id}, (err, searchedData) => {
            if(err){
                cb(true, { success: false })
            }else{
                cb(false, { searchedData: searchedData })
            }
            })
        }
    })
       }
    },

    'addshopfavourite' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                userId : req.userId,
                brand_location_id : req.brand_location_id
            }
            model.Users.addShopWishlist1(options, (err, Wishlist) =>{
                if (err) {
                    cb(true,{success : false})
                }
                else{
                   cb(false,{success : true, Wishlist : Wishlist});
                }
            })
        }
    },

    'removeShop-from-wishlist' : function(model, req, method, cb){
        if (method === 'POST') { 
            model.Users.RemoveWishlistShop({userId:req.userId, brandLocationId:req.brandLocationId}, (err, product) =>{
                if(err){
                    cb(err)
                }else{
                    cb(false, product)
                }
            })
        }
    },

    'addproductWishlist' : function(model, req, method, cb){
        if(method === "POST"){
            model.ShopProducts.addProductWishlist1({userId:req.userId, productId:req.productId}, (err, Wishlist) =>{
                if (err) {
                    cb(true,{success : false})
                }
                else{
                   cb(false,{success : true, Wishlist : Wishlist});
                }
            })
        }
    },

    'returnOrderProduct' : function (model, req, method, cb) {
        if(method === 'POST'){
            const options = {
                productId : req.productId,
                orderId : req.orderId
            }
            model.Orders.return_order(options, (err, order) =>{
                if (err) {
                    cb(true,{success : false})
                }
                else{
                   cb(false,{sucess : true, order});
                }
            })
        }
    },

    'shop-reviews' : function(model, req, method, cb){
        if(method === 'POST'){
            const options = {location_id : req.location_id}
            model.ShopProducts.getShopReview(options, (err, Shopreview)=>{
                if(err){
                    cb(err)
                }else{
                    cb(false,{success:true, Shopreview})
                }
            })
        }
    },

    'shop-rating' : function(model, req, method, cb){
        if(method === 'POST'){
            const options = {locationId : req.locationId, userId : req.userId}
            model.ShopProducts.getShopRating(options, (err, Shoprate)=>{
                if(err){
                    console.log(err)
                    cb(err)
                }else{
                    cb(false,{success:true, Shoprate})
                }
            })
        }
    },

    'addShopReview' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                    brand_id: req.brand_id,
                    userId : req.userId,
                    username : req.username,
                    brand_location_id : req.brand_location_id,
                    review_text: req.review_text,
            }
            model.Orders.addShopReview(options, (err, review)=>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'addShopRate' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                rate : req.rate,
                userId : req.userId, 
                username: req.username, 
                brandId: req.brandId
            }
            model.ShopProducts.shopRate(options, (err, rate) =>{
                if(err){
                    cb(true,{success:false})
                }else{
                    cb(false,{success:true})
                }
            })
        }
    },

    'brand-admin-list' : function(model, req, method, cb){
        if(method === "GET"){
            // const options = {
            //     userId : req.userId
            // }

            model.Users.shopOrderLocation1((err, list) =>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true, list:list})
                }
            })
        }
    },

    'getParentCtegory' : function(model, req, method, cb){
        if(method === "POST"){
            const options ={
                parentId : req.parentId
            }
            model.ShopProducts.getParentCtegory(options, (err, category) =>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true, category:category})
                }
            })
        }
    },

    'registerShop' : function(model, req, method, cb){
        if (method === 'POST') {
            const registerOpts = {
              fname: req.fname,
              lname: req.lname,
              email: req.email,
              phone: req.phone,
              password: req.password,
              panno: req.panno,
              gstno: req.gstin,
              shopactno: req.shopactno,
              shopname: req.shopname,
              roles_id: req.roleid,
              panDocument: req.panDocument,
              gstDocument: req.gstDocument,
              locationname: req.locationname
            };
                var files = req.files;
                var imgArr = []
                if (!files.file.length) {
                    imgArr.push(files.file)
                } else {
                    imgArr = files.file;
                }
            async.map(imgArr, (i, callback) => {
                var filename = `${moment().unix()}-${i.name}`;
                var imgDir = `${require('path').resolve()}/public/documents/${filename}`;
                i.mv(imgDir, (err) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, { fileName: filename })
                    }
                })
            }, (err, result) => {
                if (err) {
                    console.log(err)
                    cb(true,{ success: false })
                } else {
                    model.Users.SignUpShop(registerOpts, (err, data) => {
                        if (err) {
                            cb(true,{ success: false })
                        } else {
                            var userId = data.result.insertId
                            var locationId = data.locationId;
                            model.Users.AddUserDocuments({userId, locationId, images:result}, (err, data) => {
                                if(err){
                                    console.log(err)
                                    cb(true,{success: false})
                                }else{
                                    cb(false,{success:true, data : data, message: "register successfully"})
                                }
                            })
                        }
                    })
                }
            }) 
        }
    },

    'shop-search-location' : function(model, req, method, cb){
        if(method === "POST"){
            var s_loc = req.s_loc;
            var s_catId = undefined
            var myLocation = req.myLocation;

            async.auto({
                shops: (callback) => {
                    model.Users.Getshops2({offset: 0, limit: 8,s_loc,s_catId,myLocation},(err, shops) => {
                        if (err) {
                            console.log(err)
                            callback(err)
                        } else {
                            callback(null, shops)
                        }
                    })
                },
                category:(cb)=>{
                    model.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                        if(err){
                            cb(err);
                        }else{
                            cb(null,shop_categories);
                        }
                    })
                },
                roles: (cb) => {
                    model.Users.GetRoles({all: false}, (err, roles) => {
                        cb(err ? err : null, roles)
                    })
                },
                brandLocations: (callback) => {
                    model.Users.GetAllLocation((err, brandLocations) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, brandLocations)
                        }
                    })
                },
        },(err,result)=>{
            if(err){
                cb(true,{success:false})
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
                cb(false, {
                    success:false,
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
                })
            }
        })
        }
    },

    'wishlisted-shop' : function(model, req, method, cb){
        if(method === "POST"){
            const options ={
                userId : req.userId,
                location_id : req.location_id
            }
            model.ShopProducts.wishlistShop(options, (err, wishlistShop) =>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true, wishlistShop})
                }
            })
        }
    },

    'specificParent' :function(model, req, method, cb){
        if(method === "POST"){ 
            const options = {
                locationId : req.locationId
            }
            model.ShopProducts.specificParent(options,(err, data) =>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true, data})
                }
            })
        }
    },

    'specificSubParent' :function(model, req, method, cb){
        if(method === "POST"){ 
            const options = {
                locationId : req.locationId,
                catId : req.catId
            }
            model.ShopProducts.specificSubParent(options,(err, data) =>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true, data})
                }
            })
        }
    },

    'specificSubSubParent' :function(model, req, method, cb){
        if(method === "POST"){ 
            const options = {
                locationId : req.locationId,
                subcatId : req.subcatId
            }
            model.ShopProducts.specificSubSubParent(options,(err, data) =>{
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true, data})
                }
            })
        }
    },

    'getSubCategory' : function(model, req, method, cb){
        if(method === "POST"){ 
            const id = req.id
            model.ShopProducts.getSubCategory({id}, (err, getSubCategory) => {
                if(err){
                    cb(true,{success: false})
                }else{
                    cb(false,{success:true, getSubCategory})
                }
            })
        }
    }

}