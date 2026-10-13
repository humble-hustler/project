/********************************************************/
/***** API Shop Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const moment = require('moment');
const models = require('../../models')
const async = require('async');
const _ = require('lodash');

router.post('/products', (req, res) => {
    const post = req.body;
    const slug = post.slug;
    const search = post.search;

    models.ShopProducts.GetAll({offset: 0, limit: 20, slug, search}, (err, products) => {
        if (err) {
        
            res.send({success: false})
        } else {
            res.send({success: true, products: products})
        }
    })  
})

router.post('/single-product', (req, res) => {
    const post = req.body;
    const productId = post.productId;

    async.parallel({
        product: (cb) => {
            models.ShopProducts.GetSingle({productId}, (err, product) => {
                cb(err ? err : null, product)
            })
        },
        images: (cb) => {
            models.ShopProducts.GetProductImages({productId}, (err, images) => {
                cb(err ? err : null, images)
            })
        },
        variations: (cb) => {
            models.ShopProducts.GetProductVariations({productId}, (err, variations) => {
                cb(err ? err : null, variations)
            })
        }
    }, (err, result) => {
        if (err) {
        
            res.send({success: false})
        } else {
            res.send({
                success: true,
                product: result.product, 
                images: result.images,
                variations: result.variations
            })
        }
    }) 
})

router.post('/add-to-cart', (req, res) => {
    const post = req.body;
    const userId = req.body.userId;
   
    async.auto({
        cart: (cb) => {
            models.Cart.GetUserCart({userId}, (err, cart) => {
                cb(err ? err : null, cart.cart)
            })
        },
        updateCart: ['cart',(result,cb) => {
            var cart = (result.cart)?(JSON.parse(result.cart)):({});
            var line = (cart)?(cart.line):([]);
            const lineIdx = _.findIndex(line, {productId: post.productId, variationId: post.variationId});
            if (lineIdx !== -1) {
                line[lineIdx] = {
                    productId: post.productId,
                    variationId: post.variationId,
                    quantity: post.quantity,
                    regular_price: post.regular_price,
                    discount_price: post.discount_price,
                    // save_for_later:0
                }
            } else {
                line.push({
                    productId: post.productId,
                    variationId: post.variationId,
                    quantity: post.quantity,
                    regular_price: post.regular_price,
                    discount_price: post.discount_price,
                    // save_for_later:0
                })
            }
            cart = {
                line: line
            }
            models.Cart.SetUserCart({userId: userId, cart: JSON.stringify(cart)}, (err) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null)
                }
            })
        }]
    },(err,result) => {
        if(err){
            res.send({success:false})
        }else{
         
            res.send({
                success:true
            })
        }
    })
})

router.post('/update-cart-quantity', (req, res) => {
    const post = req.body;
    const userId = req.body.userId;
    const productId = post.productId;
    const variationId = post.variationId;
    const quantity = post.quantity;

    async.auto({
        cart: (cb) => {
            models.Cart.GetUserCart({userId}, (err, cart) => {
                cb(err ? err : null, cart.cart)
            })
        },
        updateCart: ['cart',(result,cb) => {
            var cart = (result.cart)?(JSON.parse(result.cart)):(null);
            var line = cart.line;
            const lineIdx = _.findIndex(line, {productId, variationId});
            
            if(lineIdx!=-1){
                line[lineIdx] = {
                    productId: productId,
                    variationId: variationId,
                    quantity: quantity,
                    regular_price: regular_price,
                    discount_price: discount_price,
                }
            }
            
            cart = {
                line: line
            }
            models.Cart.SetUserCart({userId: userId, cart: JSON.stringify(cart)}, (err) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null)
                }
            })
        }]
    },(err,result) => {
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true})
        }
    })
})

router.post('/remove-cart-item', (req, res) => {
    const post = req.body;
    const userId = post.userId;

    async.auto({
        cart: (cb) => {
            models.Cart.GetUserCart({userId}, (err, cart) => {
                cb(err ? err : null, cart.cart)
            })
        },
        updateCart: ['cart',(result,cb) => {
            var cart = (result.cart)?(JSON.parse(result.cart)):({});
            var line = (cart)?(cart.line):([]);
            _.remove(line, item => (item.productId == post.productId && item.variationId == post.variationId));
            
            cart = {
                line: line
            }
            models.Cart.SetUserCart({userId: userId, cart: JSON.stringify(cart)}, (err) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null)
                }
            })
        }]
    },(err,result) => {
        if(err){
            res.send({success:false})
        }else{
            res.send({success:true})
        }
    })
})

router.post('/my-cart', (req, res) => {
    const post = req.body;
    const userId = req.body.userId;
    async.auto({
        cart: (cb) => {
            models.Cart.GetUserCart({userId}, (err, cart) => {
                if (err) {
                  
                    cb(err)
                } else {
                   
                    cb(null, cart ? cart.cart : null)
                }
            })
        },
        products: ['cart',(result,cb) => {
            var cart = (result.cart)?(JSON.parse(result.cart)):({});
            var line = (cart.line)?(cart.line):([]);
            async.map(line, (l, callback) => {
                models.ShopProducts.GetForCart({productId: l.productId, variationId: l.variationId}, (err, product) => {
                    if (err) {
                     
                        callback(err)
                    } else {
                        callback(null, _.merge(l, product))
                    }
                })
            }, (err, result) => {
                cb(err ? err : null, result)
            })
        }],
        shippingAddresses: (cb) => {
            models.Users.GetShippingAddress({userId}, (err, address) => {
                cb(err ? err : null, address)
            })
        },
        updateCart: ['products','cart',(result,cb) => {
            var cart = (result.cart)?(JSON.parse(result.cart)):({});
            var line = (cart.line)?(cart.line):([]);
            result.products.forEach((r, i) => {
                line[i].lineId = i + 1;
                r.lineTotal = r.product_type == 2 ? r.variation_regular_price * parseInt(r.quantity) : r.product_regular_price * parseInt(r.quantity)
            })
            var cartTotal = _.sumBy(result.products, 'lineTotal');
            cart={
                line: line,
                cartTotal: cartTotal
            }
            models.Cart.SetUserCart({userId: userId, cart: JSON.stringify(cart)}, (err) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null)
                }
            })
        }]
    }, (err, result) => {
        if (err) {
          
            res.send({success:false})
        } else {
            result.products.forEach((r, i) => {
                r.lineId = i + 1
                r.lineTotal = r.product_type == 2 ? r.variation_regular_price * parseInt(r.quantity) : r.product_regular_price * parseInt(r.quantity)
            })
            var cartTotal = _.sumBy(result.products, 'lineTotal');
            res.send({
                success:true,
                cartItems: result.products,
                cartTotal,
                shippingAddresses: result.shippingAddresses,
            })
        }
    })
})


module.exports = router;