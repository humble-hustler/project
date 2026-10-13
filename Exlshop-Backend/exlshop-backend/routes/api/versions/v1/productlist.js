const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const { response } = require('express');
const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
module.exports = {
    'products-view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const post = req.body;
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';

            model.ShopProducts.GetAll({ offset, limit, search, orderByColumn, orderByValue, filter }, (err, products) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { draw: req.query, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })
                }

            })
        }
    },
    
    'add-products': function (model, req, method, cb) {
        if (method === 'POST') {
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
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    model.ShopProducts.AddglobalProducts({name: req.product_name, cid:req.sub_subcategory_id}, (err, data) => {
                        if (err) {
                            cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                        } else {
                            model.ShopProducts.AttachGlobalImg({global_product_id : data.insertId, images:result}, (err, record) =>{
                                if (err) {
                                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                                }else{
                                    cb(false, { success: true })
                                }
                            })
                        }
                    })
                }
            })
        }
    },

    'add-ReqestedProducts': function (model, req, method, cb) {
        if (method === 'POST') {
            model.ShopProducts.AddReqestedProducts({ name: req.product_name }, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true })
                }
            })
        }
    },

    'update-products': function (model, req, method, cb) {
        if (method === 'POST') {
            const post = req;
            async.parallel({
                // assignCategories: (cb) => {
                //     model.ShopProducts.AssignCategories({ productId: post.productId, categories: post.catIds }, (err) => {
                //         cb(null)
                //     })
                // },
                updateProduct: (cb) => {
                    const options = {
                        productId: post.productId,
                       // sku: post.sku,
                        name: post.name,
                       category: post.catIds,
                        description: post.description,
                        
                      //  regularPrice: post.regularPrice,
                       // discountPrice: post.discountPrice
                    }
                    model.ShopProducts.Update(options, (err) => {
                        cb(err ? err : null)
                    })
                }
            }, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true })
                }
            })
        }
    },
    'delete-products':function (model, req, method, cb) {
        if (method === 'POST') {
            model.ShopProducts.Delete({id: req.product_id}, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true })
                }
            })
        }
    },
    'add-product-variation': function (model, req, method, cb) {
        if (method === 'POST') {
            const options = {
                productId: req.productId,
                name: req.name,
                sku: req.sku,
                regularPrice: req.regularPrice,
                discountPrice: req.discountPrice
            }
            model.ShopProducts.AddVariation(options, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true })
                }
            })
        }
    },
    'update-product-inventory': function (model, req, method, cb) {
        const options = {
            productId: req.id,
            comment: req.comment,
            inventoryCount: req.inventoryCount
        }
        model.ShopProducts.UpdateInventory(options, (err) => {
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true })
            }
        })
    },
    'update-variation-inventory': function (model, req, method, cb) {
        const options = {
            productId: req.productId,
            variationId: req.variationId,
            comment: req.comment,
            inventoryCount: req.inventoryCount
        }
        model.ShopProducts.UpdateVariationInventory(options, (err) => {
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true })
            }
        })
    },
    'add-product-images': function (model, req, method, cb) {
        const files = req.files;
        var fileArr = [];   
        if (!files.file.length) {
            fileArr.push(files.file)
        } else {
            fileArr = files.file;
        }   
        const productId = req.productId;
        async.map(fileArr, (i, callback) => {
            var filename = `${moment().unix()}-${i.name}`;
            var imgDir = `${require('path').resolve()}/public/product-img/${filename}`;
          
            i.mv(imgDir, (err) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, {fileName: filename, isFeatured: 0})
                }
            })
        }, (err, result) => {
            if (err) {
                cb(true, { success: false })
            } else {
                model.ShopProducts.AttachImages({productId, images: result}, (err) => {
                    if (err) {
                        cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                    } else {
                        cb(false, { success: true })
                    }
                })
            }
        })
    },
    'update-product-featured-image': function (model, req, method, cb) {
        model.ShopProducts.SetFeaturedImage({productId: req.productId, imageId: req.imageId}, (err) => {
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true })
            }
        })
    },
    'delete-product-images': function (model, req, method, cb) {
        model.ShopProducts.DeleteImage({imageId: req.imageId}, (err) => {
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true })
            }
        })
    },
    'update-is-service': function (model, req, method, cb) {
        model.ShopProducts.UpdateProductIsService({isService: req.isService, productId: req.productId}, (err) => {
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true })
            }
        })
    },
    'update-product-status': function (model, req, method, cb) {
        model.ShopProducts.UpdateProductStatus({productStatus: req.productStatus, productId: req.productId}, (err) => {
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true })
            }
        })
    },
    'update-product-type': function (model, req, method, cb) {
        model.ShopProducts.UpdateProductType({typeId: req.typeId, productId: req.productId}, (err) => {
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true })
            }
        })
    },
    'get-variation-inventory':function (model, req, method, cb) {
        model.ShopProducts.GetVariationsInventory({productId: req.productId, variationId: req.variationId}, (err, inventory) => {
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true ,data:inventory})
            }
        })
    },

    'add-product': function(model,req, method, cb){
        
        if (method === 'POST') {
        const productDetails = {
            name:req.name,
            description:req.description,
            regular_price:req.regular_price,
            discount_price:req.discount_price,
            user_id:req.user_id,
            location_id:req.location_id
        }
        model.ShopProducts.addProduct(productDetails, (err, product)=>{
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true, product:product })
            }
        })
    }}
}