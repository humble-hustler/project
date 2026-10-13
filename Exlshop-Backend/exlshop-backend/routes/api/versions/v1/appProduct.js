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
    'duplicateProduct': function (model, req, method, cb) {
        if (method === 'POST') {
            const product_id = req.product_id;
            model.Assets.AddDuplicateProduct({  product_id }, (err, products) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, data: products })
                }
            })

        }
    },

    'addduplicateproductimg': function (model, req, method, cb) {
        if (method === 'POST') {
            const product_id = req.product_id;
            const insert_id = req.insert_id;
            model.Assets.AddDuplicateProductImage({ insert_id, product_id }, (err, products) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, data: products })
                }
            })

        }
    },

    'getProductsById': function (model, req, method, cb) {
        
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = "";
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
            const userId = req.userId;
            const locationId = req.locationId;
            model.ShopProducts.GetProductAll({ offset, limit, search, userId, locationId, orderByColumn, orderByValue, filter }, (err, products) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, data: products })
                }
            })

        }
    },
    'getSingleProduct': function (model, req, method, cb) {
        if (method === 'POST') {
            const productId = req.productId;
            model.ShopProducts.GetSingleProduct({ productId }, (err, product) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, data: product })
                }
            })

        }
    },
    'getCategories': function (model, req, method, cb) {
        if (method === 'POST') {
            
            const user_id = req.user_id;
            const categoryId = req.categoryId
            model.Assets.GetCategories({  user_id }, (err, products) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, data: products })
                }
            })

        }
    },
    'sendProductRequest': function (model, req, method, cb) {
        if (method === 'POST') {
            const  file =req.files ? req.files.Files : null
            const name = req.name;
            const description = req.description;
            const categoryId = req.categoryId;
            const subcategoryId = req.subcategoryId;
            const sub_subcategoryId = req.sub_subcategoryId;
            const userId = req.userId;
            const locationId = req.locationId;
            console.log("reqqqqqqqq", req)
            model.Assets.SendRequest({ name, description, categoryId, subcategoryId, sub_subcategoryId, userId, locationId, file }, (err, data) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, data })
                }
            })

        }
    },

    'addProducts': function (model, req, method, cb) {
        if (method === 'POST') {
            model.ShopProducts.Add({ name: req.name, userId: req.userId, locationId: req.locationId, 
                globalproduct_id: req.globalproduct_id, quantity:req.quantity, isreturnable:req.isreturnable,
                daystoreturn:req.daystoreturn ? req.daystoreturn :null }, (err, productId) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, productId: productId })
                }
            })

        }
    },

    'deleteProduct': function (model, req, method, cb) {
        if (method === 'POST') {
            const id = req.id;
           
            model.ShopProducts.DeleteShopProduct({id}, (err) => {
                if (err) {
                    cb( true, { success: false });
                } else {
                    cb(false, { success: true })
                }
            })

        }
    },

    'getSingleProductDetail' : function(model, req, method, cb){
        if(method === 'POST'){
            const productId = req.productId
            model.ShopProducts.GetSingleProductDetail({productId}, (err, singleProduct) =>{
                if(err){
                    cb(true, {success: false})
                }else{
                    cb(false, {success: true, singleProduct})
                }
            })
        }
    },

    'addProductImage': function (model, req, method, cb) {
        if (method === 'POST') {
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
                        callback(null, { fileName: filename, isFeatured: 0 })
                    }
                })
            }, (err, result) => {
                if (err) {
                    cb(true,{ success: false })
                } else {
                    model.ShopProducts.AttachImages({ productId, images: result }, (err) => {
                        if (err) {
                            cb(true,{ success: false })
                        } else {
                            cb(false,{ success: true, result })
                        }
                    })
                }
            })

        }
    },
    'getProducts': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = req.search;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
            const locationId = req.locationId;
            const userId = req.userId;

            async.parallel({
                products: (cb) => {
                    model.ShopProducts.GetProductAll({ offset, limit, search, orderByColumn, userId, locationId, orderByValue, filter }, (err, products) => {
                        cb(err ? err : null, products)
                    })
                },
                addedProducts: (cb) => {
                    model.ShopProducts.GetProductsByLocationId({locationId:locationId},(err, addPro) => {
                        cb(err ? err : null, addPro)
                    })
                },
                productRequest: (cb) => {
                    model.ShopProducts.addProductRequestByBrand({locationId:locationId, userId:userId}, (err, proReq) => {
                        cb(err ? err : null, proReq)
                    })
                }
            }, function(err, result) {
                if(err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, result })
                }
            })
        }
    },

    'updateProducts': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = true;
            const orderByArr = '';
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
            const sku = req.sku;
            const name = req.name;
            const quantity = req.quantity;
            const description = req.description;
            const regularPrice = req.regularPrice;
            const discountPrice = req.discountPrice;
            const productId = req.productId;
            const isreturnable = req.isreturnable;
            const daystoreturn = req.daystoreturn
            
            model.Assets.Update({ offset, limit, search, orderByColumn, orderByValue, filter, quantity, sku, name, description, regularPrice, discountPrice, productId, isreturnable, daystoreturn}, (err, result) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, result })

                }
            })
        }
    },

    'category-view-all': function (model, req, method, cb) {
        if (method === 'GET') {
          
            model.ShopProducts.GetCategories( (err, categories) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, categories: categories })
                }

            })

        }
    },

    'add-category': function (model, req, method, cb) {
        if (method === 'POST') {
            const category_name = req.category_name;
            const slug = req.slug;
            const parent_id = req.parent_id;
            model.ShopProducts.AddCategory({ name: category_name, slug: slug, parent_id: parent_id }, (err) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true })
                }
            })

        }
    },
    'update-product-featured-image': function (model, req, method, cb) {
        model.ShopProducts.SetFeaturedImage({productId: req.productId, imageId: req.imageId, imageName: req.imageName}, (err) => {
            if (err) {
                cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
            } else {
                cb(false, { success: true })
            }
        })
    },
    'ProductsByCatid': function (model, req, method, cb) {
        if (method === 'POST') {
            const catId = req.subsubcategory_val;
            model.Assets.ProductsByCatid({ catId }, (err, productsbycatid) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, data: productsbycatid })
                }
            })
        }
    },
    'delete-product-images': function (model, req, method, cb) {
            model.ShopProducts.DeleteImage({imageId: req.imageId,imageName : req.imageName}, (err) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success: true })
                }
            })
     },

     'ProductsByMainCat': function (model, req, method, cb) {
        if (method === 'POST') {
            const locationId = req.locationId;
            const mainCatId = req.mainCatId
            model.Assets.ProductsByMainCat({ locationId, mainCatId }, (err, productsbymaincat) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, data: productsbymaincat })
                }
            })
        }
    },

    'asset-management' : function(model, req, method, cb){
        var locationId = req.locationId
        var userId = req.userId

        async.auto({
            categories: (cb) => {
                model.Assets.GetCategories({ offset: 0, limit: 100 }, (err, categories) => {
                    cb(err ? err : null, categories)
                })
            },
            products: (cb) => {
                model.Assets.GetGlobalProducts({ limit: 100 }, (err, products) => {
                    cb(err ? err : null, products)
                })
            },
            size: (cb) => {
                model.Assets.getSize({}, (err, size) => {
                    cb(err ? err : null, size)
                })
            },
            color: (cb) => {
                model.Assets.getColor({}, (err, color) => {
                    cb(err ? err : null, color)
                })
            },
            addedProducts: (cb) => {
                model.ShopProducts.GetProductsByLocationId({locationId},(err, addPro) => {
                    cb(err ? err : null, addPro)
                })
            },
            productRequest: (cb) => {
                model.ShopProducts.addProductRequestByBrand({locationId, userId}, (err, proReq) => {
                    cb(err ? err : null, proReq)
                })
            },
            userLocations: (cb) => {
                model.Users.GetAssignedLocations({userId}, (err, locations) => {
                    cb(err ? err : null, locations.locations)
                })
            },
        }, function(err,result) {
            if(err){
                cb(true,{ success: false })
            }else{
                cb(false, {
                    success: true,
                    addedProducts: result.addedProducts,
                    productRequest: result.productRequest,
                    product: result.products,
                    categories: result.categories,
                    size:result.size,
                    color:result.color,
                    userLocations: result.userLocations,
                    scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/asset-management.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                    styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
                })
            }
        })
    },

    'getAllLocationProduct': function(model, req, method, cb){
        if(method === "POST"){
            const options={
                locationId : req.locationId
            }
          
            model.ShopProducts.getAllLocationProduct(options, (err, products) =>{
                if(err){
                    cb(true, { success: false });
                }else{
                    cb(false, { success: true, products})
                }
            })
        }
    },

    'getAllProductReview' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                productId : req.productId
            }
            model.ShopProducts.getAllProductReview(options, (err, review) =>{
                if(err){
                    cb(true, { success: false });
                }else{
                    cb(false, { success: true, review})
                }
            })
        }
    },

    'updateStockQuantity' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                quantity : req.quantity,
                id : req.productId
            }
            model.ShopProducts.UpdateQuantity(options, (err)=>{
                if(err){
                    cb(true, { success: false });
                }else{
                    cb(false, { success: true})
                }
            })
        }
    }
}