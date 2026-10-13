const _ = require('lodash');
const moment = require('moment-timezone');
const auth = require('../auth');
const async = require('async');
const express = require('express');
const router = express.Router();
const config=require('./../../config')
const Razorpay = require('razorpay');
const { route } = require('..');
const { success } = require('toastr');
const razorPay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});

router.get('/products', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    models.ShopProducts.GetCategories((err, categories) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.ShopProducts.GetProducts(null, (err, products) => {
                if (err) {
                    res.redirect('/404')
                }
                res.render('super-admin/products', {
                    title: 'Exlshop - Shop Products',
                    categories,
                    menuActive: 'global-list',
                    submenuActive: '',
                    products,
                    // fw: true,
                    scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/view-products.js'],
                    styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
                });
            })
        }
    })
})

router.post('/add-products', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const files = req.files;

    var fileArr = [];
    if (!files.file.length) {
        fileArr.push(files.file)
    } else {
        fileArr = files.file;
    }

    async.map(fileArr, (i, callback) => {
        var filename = `${moment().unix()}-${i.name}`;
        var imgDir = `${require('path').resolve()}/public/global-product/${filename}`;
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
            models.ShopProducts.AddglobalProducts({name: req.body.product_name ,cid:req.body.sub_subcategory_id}, (err, data) => {
                if (err) {
                    res.send({ success: false })
                } else {
                    models.ShopProducts.AttachGlobalImg({global_product_id : data.insertId, images:result}, (err, record) =>{
                        if (err) {
                            res.send({ success: false })
                        }else{
                            res.redirect('/super-admin/shop/products')
                        }
                    })
                }
            })
        }
    })
})

router.get('/requested/products', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    models.ShopProducts.getReqProduct({ id: 0 }, (err, reqproducts) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.render('super-admin/reqproducts', {
                title: 'Exlshop - Shop Products',
                // fw: true,
                menuActive: 'product-list',
                submenuActive: '',
                reqproduct: reqproducts.reqproduct,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/view-reproducts.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
            });
        }
    })
})

router.get('/requested/categories', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    models.ShopProducts.getReqCategory({ id: 0 }, (err, reqcategories) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.render('super-admin/reqcategories', {
                title: 'Exlshop - Shop Category',
                // fw: true,
                menuActive: 'category-list',
                submenuActive: '',
                reqcategories:reqcategories.reqcategories,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/view-reqcategories.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
            })
        }
    })
})

router.get('/subscription', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
             res.render('super-admin/subscription', {
                title: 'Exlshop - Super Subscription ',
                // fw: true,
                menuActive: 'subscription',
                submenuActive: '',
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/view-subscription.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })     
})

router.get('/subscription_plan', auth.checkPermission(['super-admin']), (req, res) => {
            res.render('super-admin/subscription_plan', {
                title: 'Exlshop - Super subscription_plan ',
                // fw: true,
                menuActive: 'subscription_plan',
                submenuActive: '',
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/view_subscription_plan.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })     
})
    
router.get('/pickup&delivery', auth.checkPermission(['super-admin']), (req, res) => {
    res.render('super-admin/pickup_delivery', {
        title: 'Exlshop - Super pickup&delivery ',
        // fw: true,
        menuActive: 'orders',
        submenuActive: '',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/toastr/toastr.min.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/view_pickupdelivery.js'],
        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css'],
        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
    })     
})

router.post('/pickup_delivery/view-all', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    models.ShopProducts.pickup_delivery_details({ }, (err, pickup_delivery_details) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, draw: req.query, recordsTotal: pickup_delivery_details.total, recordsFiltered: pickup_delivery_details.total, data: pickup_delivery_details.pickup_delivery })     
        }
    })          
})

router.post('/subscription_plan/view-all', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    models.ShopProducts.getSubscriptionPlans({ }, (err, subscriptionplan_details) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, draw: req.query, recordsTotal: subscriptionplan_details.total, recordsFiltered: subscriptionplan_details.total, data: subscriptionplan_details.subscriptions })
        }
    })          
})

router.post('/add_subscription_plan', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const planName=req.body.planName
    const planPeriod=req.body.planPeriod
    const planAmount=req.body.planAmount
    const allowedProducts=req.body.allowedProducts
    const addProReq=req.body.addProReq
    const noofreq=req.body.noofreq
    const allowedFeatures=req.body.allowedFeatures
    const planInterval=req.body.planInterval==12?'1':req.body.planInterval
    
    models.Subscription.addSubscriptionPlans({planPeriod:planPeriod,planInterval,planName,planAmount,allowedProducts,
        addProReq,noofreq,allowedFeatures}, (err, subscriptionplan) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true })
        }
    })
})

router.post('/update_subscription_plan', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const planId = req.body.planId
    const planName=req.body.planName
    const planPeriod=req.body.planPeriod
    const planAmount=req.body.planAmount
    const allowedProducts=req.body.allowedProducts
    const addProReq=req.body.addProReq
    const noofreq=req.body.noofreq
    const allowedFeatures=req.body.allowedFeatures
    const planInterval=req.body.planInterval==12?'1':req.body.planInterval
    
    models.Subscription.updateSubscriptionPlans({planId,planPeriod,planInterval,planName,planAmount,allowedProducts,
        addProReq,noofreq,allowedFeatures}, (err, subscriptionplan) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true })
        }
    })
})

router.post('/delete_subscription_plan', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const planId = req.body.planId
    
    models.Subscription.deleteSubscriptionPlans({planId}, (err, subscriptionplan) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true })
        }
    })
})

router.post('/GetSubcategories', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    models.ShopProducts.GetSubcategories({categoryId: post.categoryId}, (err, subcategories) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, subcategories})
        }
    })
})

router.get('/view/product/:id', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const productId = req.params.id;
        async.parallel({
            product: (cb) => {
                models.ShopProducts.GetSingle({ productId }, (err, product) => {
                    cb(err ? err : null, product)
                })
            },
            categories: (cb) => {
                models.ShopProducts.GetCategories((err, categories) => {
                    cb(err ? err : null, categories)
                })
            },
            images: (cb) => {
                models.ShopProducts.GetProductImages({ productId }, (err, images) => {
                    cb(err ? err : null, images)
                })
            },
            assignedCategories: (cb) => {
                models.ShopProducts.GetAssignedCategories({ productId }, (err, categories) => {
                    cb(err ? err : null, categories)
                })
            }
        }, (err, result) => {
            if (err) {
                res.redirect('/404')
            } else {
                res.render('super-admin/single-product', {
                    title: 'FitBiz - Edit Product',
                    menuActive: 'global-list',
                    submenuActive: '',
                    categories: result.categories,
                    product: result.product,
                    images: result.images,
                    assignedCategories: result.assignedCategories,
                    scripts: ['/global/vendor/toastr/toastr.min.js', '/js/page-level/single-product.js'],
                    styles: ['/global/vendor/toastr/toastr.min.css']
                });
            }
        })
})

router.post('/subscription/view-all', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['d.file_name', 'a.name', 'product_type', 'a.is_service', 'categories', 'f.status'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter;

    models.ShopProducts.getSubscription({ offset, limit, search, orderByColumn, orderByValue, filter }, (err, subscription_details) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, draw: req.query, recordsTotal: subscription_details.total, recordsFiltered: subscription_details.total, data: subscription_details.subscriptions })
        }
    })
})

    router.post('/reqproducts/view-all', auth.checkPermission(['super-admin']), (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;
        const orderByArr = ['a.created_at', 'a.name', 'product_type', 'a.is_service', 'categories', 'f.status'];
        const orderByColumn = orderByArr[req.body.order[0].column];
        const orderByValue = req.body.order[0].dir;
        const filter = req.body.filter;

        models.ShopProducts.getRequestedProduct({ offset, limit, search, orderByColumn, orderByValue, filter }, (err, products) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true, draw: req.query, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })
            }
        })
    })

    router.post('/reqcategories/view-all', auth.checkPermission(['super-admin']), (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;
        const orderByArr = ['d.file_name', 'a.name', 'product_type', 'a.is_service', 'categories', 'f.status'];
        const orderByColumn = orderByArr[req.body.order[0].column];
        const orderByValue = req.body.order[0].dir;
        const filter = req.body.filter;

        models.ShopProducts.getRequestedCategory({ offset, limit, search, orderByColumn, orderByValue, filter }, (err, products) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true, draw: req.query.draw, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })
            }
        })
    })

    router.post('/add/reqproduct', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;
        const options = {
            name: post.product_name,
            id: post.id,
            desc:post.desc,
            catId: post.catId,
            file_name: post.file_name
        }
        models.ShopProducts.AddReqProducts(options, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/add/reqcategory', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;
        const options = {
            c_name: post.newCatName,
            sub_name: post.newsubCatName,
            sub_sub_name: post.newsubsubCatName,
            id: post.id,
            c_id: post.catId,
            s_id: post.subCatId
        }
        models.ShopProducts.AddReqcategory(options, (err, result) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true, result:result })
            }
        })
    })

    router.post('/add/product-variation', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;
        const options = {
            productId: post.productId,
            name: post.name,
            sku: post.sku,
            regularPrice: post.regularPrice,
            discountPrice: post.discountPrice
        }
        models.ShopProducts.AddVariation(options, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/update/product-inventory', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;
        const options = {
            productId: post.productId,
            comment: post.comment,
            inventoryCount: post.inventoryCount
        }
        models.ShopProducts.UpdateInventory(options, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/update/variation-inventory', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;
        const options = {
            productId: post.productId,
            variationId: post.variationId,
            comment: post.comment,
            inventoryCount: post.inventoryCount
        }
        models.ShopProducts.UpdateVariationInventory(options, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/update/product-featured-image', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;

        models.ShopProducts.SetFeaturedImage({ productId: post.productId, imageId: post.imageId }, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/delete/product-image', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;

        models.ShopProducts.DeleteImage({ imageId: post.imageId }, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/add/product-images', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;
        const files = req.files;
        var fileArr = [];

        if (!files.file.length) {
            fileArr.push(files.file)
        } else {
            fileArr = files.file;
        }
        const productId = post.productId;
        async.map(fileArr, (i, callback) => {
            var filename = `${moment().unix()}-${i.name}`;
            var imgDir = `${require('path').resolve()}/public/product-img/${filename}`;
            i.mv(imgDir, (err) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, { fileName: filename, isFeatured: 0 })
                }
            })
        }, (err, result) => {
            if (err) {
                res.send({ success: false })
            } else {
                models.ShopProducts.AttachImages({ productId, images: result }, (err) => {
                    if (err) {
                        res.send({ success: false })
                    } else {
                        res.send({ success: true, result })
                    }
                })
            }
        })
    })

    router.post('/update/product-type', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;

        models.ShopProducts.UpdateProductType({ typeId: post.typeId, productId: post.productId }, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/update/is-service', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;

        models.ShopProducts.UpdateProductIsService({ isService: post.isService, productId: post.productId }, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/update/product-status', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;

        models.ShopProducts.UpdateProductStatus({ productStatus: post.productStatus, productId: post.productId }, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/update/product', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;
        async.parallel({
            assignCategories: (cb) => {
                models.ShopProducts.AssignCategories({ productId: post.productId, categories: post.catIds }, (err) => {
                    cb(null)
                })
            },
            updateProduct: (cb) => {
                const options = {
                    productId: post.productId,
                    sku: post.sku,
                    name: post.name,
                    description: post.description,
                    regularPrice: post.regularPrice,
                    discountPrice: post.discountPrice
                }
                models.ShopProducts.Update(options, (err) => {
                    cb(err ? err : null)
                })
            }
        }, (err) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })

    router.post('/get/variation-inventory', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;

        models.ShopProducts.GetVariationsInventory({ productId: post.productId, variationId: post.variationId }, (err, inventory) => {
            if (err) {
                res.send({ succeess: false })
            } else {
                res.send({ success: true, inventory })
            }
        })
    })

    router.post('/add/product', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;
        const files = req.files;

        models.ShopProducts.Add({ name: post.product_name }, (err, productId) => {
            if (err) {
                res.redirect('/404')
            } else {
                res.redirect(`/super-admin/shop/view/product/${productId}`)
            }
        })
    })

    router.post('/products/view-all', auth.checkPermission(['super-admin']), (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;
        const orderByArr = ['a.id', 'a.name'];
        const orderByColumn = orderByArr[req.body.order[0].column];
        const orderByValue = req.body.order[0].dir;
        const filter = req.body.filter;

        models.ShopProducts.GetAll({ offset, limit, search, orderByColumn, orderByValue, filter }, (err, products) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true, draw: req.query.draw, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })

            }
        })
    })

    router.post('/delete/product', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const post = req.body;

        models.ShopProducts.Delete({ id: post.product_id }, (err) => {
            if (err) {
                res.redirect('/404')
            } else {
                res.redirect(`/super-admin/shop/products`);
            }
        })
    })

    router.get('/orders', auth.checkPermission(['super-admin']), (req, res) => {
        res.render('super-admin/orders', {
            title: 'FitBiz - Orders',
            menuActive: 'orders',
            submenuActive: '',
            scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/orders.js'],
            styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
        });
    })

    router.post('/orders/view-all', auth.checkPermission(['super-admin']), (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;
        const orderByArr = ['a.created_date', 'a.razorpay_order_id', 'user_name', 'products', 'address_label'];
        const orderByColumn = orderByArr[req.body.order[0].column];
        const orderByValue = req.body.order[0].dir;
        models.Orders.GetAll({ offset, limit, search, orderByColumn, orderByValue }, (err, orders) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true, draw: req.query.draw, recordsTotal: orders.total, recordsFiltered: orders.total, data: orders.orders })
            }
        })
    })

    router.post("/orders/update-order-status", auth.checkPermission(["super-admin"]), (req, res) =>{
        const models = req.Core.Models;
        models.Orders.statusUpadte(req.body, (err, Status) => {
            if(err){
                res.send({success: false})
            }else{
                res.send({success:true, Status})
            }
        })
    })

    router.post("/orders/shirocketStatus", auth.checkPermission(["super-admin"]), (req, res) =>{
        const models = req.Core.Models;
        models.Orders.shipRocketStatus(req.body, (err, Status) => {
            if(err){
                res.send({success: false})
            }else{
                res.send({success:true, Status})
            }
        })
    })

    router.post("/orders/get-order-details", auth.checkPermission(["super-admin"]), (req, res)=>{
        const models = req.Core.Models;
        models.Orders.getOrderDetails(req.body, (err, data) => {
            if(err){
                res.send({success: false})
            }else{
                res.send({success:true, data})
            }
        })
    })

    router.get('/view/order/:id', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const orderId = req.params.id;
        async.auto({
            order: (cb) => {
                models.Orders.GetSingle({ orderId }, (err, order) => {
                    cb(err ? err : null, order)
                })
            },
            orderProducts: (cb) => {
                models.Orders.GetProducts({ orderId }, (err, orderProducts) => {
                    cb(err ? err : null, orderProducts)
                })
            },
            user: ['order', (result, cb) => {
                var userId = result.order.users_id;
                models.Users.GetSingle({ userId }, (err, user) => {
                    cb(err ? err : null, user)
                })
            }]
        }, function (err, result) {
            if (err) {
                res.redirect('/404')
            } else {
                res.render('super-admin/single-order', {
                    title: 'Exlshop - Order',
                    menuActive: 'orders',
                    submenuActive: '',
                    order: result.order,
                    orderProducts: result.orderProducts,
                    user: result.user,
                    scripts: ['/global/vendor/select2/select2.js', '/js/page-level/single-order.js'],
                    styles: ['/global/vendor/select2/select2.css']
                });
            }
        })
    })

    router.get('/view/user-orders/:id', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const userId = req.params.id;
        async.auto({
            orders: (cb) => {
                models.Orders.GetAll({ userId, limit: 100, offset: 0, orderByColumn: 'a.created_date', orderByValue: 'desc' }, (err, orders) => {
                    cb(err ? err : null, orders.orders)
                })
            },
            orderProducts: ['orders', (result, cb) => {
                var orderIdsArr = [];
                result.orders.forEach(function (o) {
                    orderIdsArr.push(o.id);
                })
                var orderId = orderIdsArr.join(',');
                models.Orders.GetProducts({ orderId }, (err, orderProducts) => {
                    cb(err ? err : null, orderProducts)
                })
            }],
            user: (cb) => {
                models.Users.GetSingle({ userId }, (err, user) => {
                    cb(err ? err : null, user)
                })
            }
        }, function (err, result) {
            if (err) {
                res.redirect('/404')
            } else {
                res.render('super-admin/single-user-orders', {
                    title: 'FitBiz - Order',
                    menuActive: 'orders',
                    submenuActive: '',
                    orders: result.orders,
                    orderProducts: result.orderProducts,
                    user: result.user,
                    scripts: ['/js/page-level/single-user-orders.js']
                });
            }
        })
    })

    router.post('/search/dietitian', auth.checkPermission(['super-admin']), (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        const options = {
            userName: post.text,
            roleId: 8 // dietitian id
        }
        models.Users.SearchUser(options, (err, dietitians) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true, dietitians })
            }
        })
    });

    router.post('/update-dietitian', auth.checkPermission(['super-admin']), (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        const options = {
            dietitianId: post.dietitian_id,
            orderProductId: post.order_product_id
        }
        models.ShopProducts.UpdateDietitian(options, (err) => {
            if (err) {
                res.redirect('/404')
            } else {
                res.redirect('back')
            }
        })
    });

    router.get('/vendor', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        res.render('super-admin/vendor', {
            title: 'Vendor - settlement',
            menuActive: 'vendor-settlement',
            submenuActive: '',
            
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/vendor.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
        });
    })

    router.post('/vendor/vendor-list', auth.checkPermission(['super-admin']), (req, res) => {
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;
        const orderByArr =  ['k.name', 'sub_total'];
        const orderByColumn = orderByArr[req.body.order[0].column];
        const orderByValue = req.body.order[0].dir;
     
        models.ShopProducts.getbrandrecordfirst({ offset, limit, search, orderByColumn, orderByValue },(err, record)=>{
            if(err){
                res.send({success: false})
            }else{
            res.send({success:true, draw: req.query.draw, recordsTotal:record.total, recordsFiltered: record.total, data:record.record})
            }
        })
    })


    router.get('/view/vendor/:period', auth.checkPermission(['super-admin']), (req, res) =>{
        const models = req.Core.Models;
            var a = req.params
            res.render('super-admin/vendorlist', {
                title: 'vendorlist',
               a,
               menuActive: 'vendor-settlement',
                submenuActive: '',
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/vendorlist.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
            })        
            
    })

    router.post('/view/vendorlist/:period', auth.checkPermission(['super-admin']), (req, res) => {
            var date = req.params.period
            var day = date.split("-")[2]
            var month = date.split("-")[1]
            var year = date.split("-")[0]
            var param = req.params
            const models = req.Core.Models;
            const offset = req.body.start;
            const limit = req.body.length;
            const search = req.body.search.value ? req.body.search.value : false;
            const orderByArr = ['k.name', 'sub_total'];
            const orderByColumn = orderByArr[req.body.order[0].column];
            const orderByValue = req.body.order[0].dir;
      
        models.ShopProducts.getbrandrecord({offset, limit, search, orderByColumn, orderByValue, param, day,month, year}, (err, record) =>{
            if(err){
                res.send({success:false})
            }else{
                res.send({success:true, draw: req.query.draw, recordsTotal:record.total, recordsFiltered: record.total, data:record.record})
            }
        })
    })

    router.get('/view/vendor/:name/:period', auth.checkPermission(['super-admin']), (req, res) =>{
            const models = req.Core.Models;
            var a = req.params
            res.render('super-admin/orderlist', {
                title: 'orderlist',
                a,
                menuActive: 'vendor-settlement',
                submenuActive: '',
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/orderlist.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
            })        
    })

    router.post('/view/vendor/:name/:period', auth.checkPermission(['super-admin']), (req, res) =>{
        var date = req.params.period
        var day = date.split("-")[2]
        var month = date.split("-")[1]
        var year = date.split("-")[0]
        var param = req.params
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;
        const orderByArr = ['k.name', 'sub_total'];
        const orderByColumn = orderByArr[req.body.order[0].column];
        const orderByValue = req.body.order[0].dir;
       
    models.ShopProducts.getOrderRecord({offset, limit, search, orderByColumn, orderByValue, param, day,month, year}, (err, record) =>{
        if(err){
            console.log(err)
            res.send({success:false})
        }else{
            res.send({success:true, draw: req.query.draw, recordsTotal:record.total, recordsFiltered: record.total, data:record.record1})
        }
    })       
    })

    router.get('/category', auth.checkPermission(['super-admin']), (req, res) =>{
        const models = req.Core.Models;
        async.auto({
            categories: (cb) => {
                models.Assets.GetCategories({ offset: 0, limit: 100 }, (err, categories) => {
                    cb(err ? err : null, categories)
                })
            },
        }, function(err,result) {
            res.render('super-admin/categorylist', {
                title: 'categorylist',
                menuActive: 'category-list',
                submenuActive: '',
                categories: result.categories,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/toastr/toastr.min.js','/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/categorylist.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/toastr/toastr.min.css',]
            }) 
        })
              
    })

    router.post('/GetSubcategories', auth.checkPermission(['super-admin']), (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        models.Assets.GetSubcategories({categoryId: post.categoryId}, (err, subcategories) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true, subcategories})
            }
        })
    })

    router.post('/subCategories', auth.checkPermission(['super-admin']), (req, res) =>{
        const post = req.body;
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;

        models.Assets.subCategories({search,limit, offset},(err, subCategories) =>{
            if (err) {
                res.send({success: false})
            } else {
                res.send({ draw: req.query.draw, recordsTotal: subCategories.total, recordsFiltered: subCategories.total, data: subCategories.subCategories })
                // res.send({success: true, subCategories})
            }
        })
    })

    router.post('/subsubCategories', auth.checkPermission(['super-admin']), (req, res) =>{
        const post = req.body;
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;

        models.Assets.subsubCategories({search, limit, offset},(err, subsubCategories) =>{
            if (err) {
                console.log(err)
                res.send({success: false})
            } else {
                res.send({ draw: req.query.draw, recordsTotal: subsubCategories.total, recordsFiltered: subsubCategories.total, data: subsubCategories.subsubCategories })
                // res.send({success: true, subCategories})
            }
        })
    })

    router.post("/delete-sub-sub-category", auth.checkPermission(['super-admin']), (req, res) =>{
        const models = req.Core.Models;

        models.Assets.delete_sub_sub_category(req.body,(err) =>{
            if (err) {
                console.log(err)
                res.redirect("/404")
            } else {
                res.redirect("back")
            }
        })
    })

    router.post("/delete-sub-category", auth.checkPermission(['super-admin']), (req, res) =>{
        const models = req.Core.Models;

        models.Assets.delete_sub_category(req.body,(err) =>{
            if (err) {
                console.log(err)
                res.redirect("/404")
            } else {
                res.redirect("back")
            }
        })
    })

    router.post('/deletedCategories', auth.checkPermission(['super-admin']), (req, res) =>{
        const post = req.body;
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;

        models.Assets.deletedCategories({search, limit, offset},(err, deletedCategories) =>{
            if (err) {
                console.log(err)
                res.send({success: false})
            } else {
                res.send({ draw: req.query.draw, recordsTotal: deletedCategories.total, recordsFiltered: deletedCategories.total, data: deletedCategories.deletedCategories })
                // res.send({success: true, subCategories})
            }
        })
    })

    router.post('/add-category', auth.checkPermission(['super-admin']), (req, res) =>{
        const models = req.Core.Models;

        models.Assets.addCategory(req.body,(err) =>{
            if (err) {
                console.log(err)
                res.send({success : false})
            } else {
                res.send({success : true})
            }
        })
    })

    router.get("/view-product/:id", auth.checkPermission(['super-admin']), (req, res) =>{
        const models = req.Core.Models;
        const categoryId = req.params.id
        res.render('super-admin/productList', {
            title: 'categorylist',
            menuActive: 'global-list',
            submenuActive: '',
            categoryId,
            scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/toastr/toastr.min.js','/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/productlist.js'],
            styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/toastr/toastr.min.css',]
        })         
    })

    router.post('/productsBySubCategory/view-all', auth.checkPermission(['super-admin']), (req, res) => {
        const post = req.body;
        const models = req.Core.Models;
        const offset = req.body.start;
        const limit = req.body.length;
        const search = req.body.search.value ? req.body.search.value : false;
        const categoryId = req.body.categoryId

        models.ShopProducts.getProductBySubCategory({ offset, limit, search, categoryId}, (err, products) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true, draw: req.query, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })
            }
        })
    })

    router.post('/update-products', auth.checkPermission(['super-admin']), (req, res) =>{
        const models = req.Core.Models;
        if(req.files != null){
            const files = req.files;

            var fileArr = [];
            if (!files.Files.length) {
                fileArr.push(files.Files)
            } else {
                fileArr = files.Files;
            }

            async.map(fileArr, (i, callback) => {
                var filename = `${moment().unix()}-${i.name}`;
                var imgDir = `${require('path').resolve()}/public/global-product/${filename}`;
                i.mv(imgDir, (err) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, { fileName: `/global-product/${filename}`})
                    }
                })
            }, (err, result) => {
                if (err) {
                    res.send({ success: false })
                } else {
                    console.log(req.body)
                    models.ShopProducts.Update(req.body, (err) => {
                        if (err) {
                            res.send({ success: false })
                        } else {
                            // res.send({ success: true})
                            console.log(result, "kkkkk")
                            models.ShopProducts.UpdateImage({images:result, productId: req.body.productId}, (err) =>{
                                if (err) {
                                    console.log(err)
                                    res.send({ success: false })
                                }else{
                                    res.send({ success: true})
                                }
                            })
                        }
                    })
                }
            })
        }else{
            models.ShopProducts.Update(req.body, (err) => {
                if (err) {
                    res.send({ success: false })
                } else {
                    res.send({ success: true })
                }
            })
        }
        
    })

    router.post("/update/global-product-images", auth.checkPermission(['super-admin']), (req, res) =>{
        const models = req.Core.Models;
        console.log(req.files)

        const files = req.files;

        var fileArr = [];
        if (!files.file.length) {
            fileArr.push(files.file)
        } else {
            fileArr = files.file;
        }

        async.map(fileArr, (i, callback) => {
            var filename = `${moment().unix()}-${i.name}`;
            var imgDir = `${require('path').resolve()}/public/global-product/${filename}`;
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
                models.ShopProducts.AddglobalProducts({name: req.body.product_name ,cid:req.body.sub_subcategory_id}, (err, data) => {
                    if (err) {
                        res.send({ success: false })
                    } else {
                        models.ShopProducts.AttachGlobalImg({global_product_id : data.insertId, images:result}, (err, record) =>{
                            if (err) {
                                res.send({ success: false })
                            }else{
                            }
                        })
                    }
                })
            }
        })
    })

module.exports = router;