const auth = require('../auth');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const async = require('async');
const { success } = require('toastr');

router.post('/import_products', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const user_id = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    const post = req.body.productData;
    const files = req.files;
    models.Assets.ImportProducts({post, user_id, locationId}, (err, products) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, products})
        }
    })
})

router.get('/view/product/:id', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const productId = req.params.id;

    async.parallel({
        product: (cb) => {
            models.ShopProducts.GetSingle({ productId }, (err, product) => {
                cb(err ? err : null, product)
            })
        },
        categories: (cb) => {
            models.ShopProducts.GetCategories(null, (err, categories) => {
                cb(err ? err : null, categories)
            })
        },
        types: (cb) => {
            models.ShopProducts.GetTypes(null, (err, types) => {
                cb(err ? err : null, types)
            })
        },
        status: (cb) => {
            models.ShopProducts.GetStatus(null, (err, status) => {
                cb(err ? err : null, status)
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
        },
        inventoryLog: (cb) => {
            models.ShopProducts.GetProductInventory({ productId }, (err, inventory) => {
                cb(err ? err : null, inventory)
            })
        },
        variations: (cb) => {
            models.ShopProducts.GetProductVariations({ productId }, (err, variations) => {
                cb(err ? err : null, variations)
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('app/single-product', {
                title: 'Exlshop - Edit Product',
                categories: result.categories,
                types: result.types,
                status: result.status,
                product: result.product,
                images: result.images,
                assignedCategories: result.assignedCategories,
                inventoryLog: result.inventoryLog,
                variations: result.variations,
                scripts: ['/global/vendor/toastr/toastr.min.js', '/js/page-level/single-product.js'],
                styles: ['/global/vendor/toastr/toastr.min.css']
            });
        }
    })
})
router.get('/view/asset/:id', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const productId = req.params.id;

    async.parallel({
        product: (cb) => {
            models.Assets.GetSingle({ productId }, (err, product) => {
                cb(err ? err : null, product)
            })
        },
        types: (cb) => {
            models.ShopProducts.GetTypes(null, (err, types) => {
                cb(err ? err : null, types)
            })
        },
        status: (cb) => {
            models.ShopProducts.GetStatus(null, (err, status) => {
                cb(err ? err : null, status)
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
        },
        inventoryLog: (cb) => {
            models.ShopProducts.GetProductInventory({ productId }, (err, inventory) => {
                cb(err ? err : null, inventory)
            })
        },
        variations: (cb) => {
            models.ShopProducts.GetProductVariations({ productId }, (err, variations) => {
                cb(err ? err : null, variations)
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('app/single-asset', {
                title: 'Exlshop - Edit Product',
                categories: result.categories,
                types: result.types,
                status: result.status,
                product: result.product,
                images: result.images,
                assignedCategories: result.assignedCategories,
                inventoryLog: result.inventoryLog,
                variations: result.variations,
                scripts: ['/global/vendor/toastr/toastr.min.js', '/js/app/single-asset.js'],
                styles: ['/global/vendor/toastr/toastr.min.css']
            });
        }
    })
})

router.post('/send/product_request', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    console.log(req.body, req.files, "llloooo")
    const file = req.files ? req.files.Files : null
    const subcategoryId = post.subcategory_id == 'undefined' ? null : post.subcategory_id 
    const sub_subcategoryId = post.sub_subcategory_id == 'undefined'?  null : post.sub_subcategory_id 
    const new_categoryId = post.new_category_id == 'undefined' ?  null : post.new_category_id
    const new_subcategoryId = post.new_subcategory_id == 'undefined' ?  null : post.new_subcategory_id
    const new_sub_subcategoryId = post.new_sub_subcategory_id == 'undefined' ?  null : post.new_sub_subcategory_id
    options={
        name :post.product_name,
         description:post.description,
         categoryId:post.category_id,
         subcategoryId,
         sub_subcategoryId,
         new_categoryId,
         new_subcategoryId,
         new_sub_subcategoryId,
         userId :req.session.user.id,
         locationId:req.session.user.currentLocation.id,
         file
    }
   
    models.Assets.SendRequest(options, (err, productId) => {
        if (err) {
            console.log(err)
            res.redirect('/404')
        } else {
            res.send({success:true})
        }
    })
})

router.post('/duplicate_product', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    options={
        name :post.name,
    }
   
    models.Assets.check_DuplicateProduct(options, (err, data) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, data})
        }
    })
})

router.post('/getimages', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    options={
        product_id :post.product_id,
    }
   
    models.Assets.get_images(options, (err, data) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({ data})
        }
    })
})

router.get('/', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const userId = req.session.user.id;
    async.auto({
        categories: (cb) => {
            models.Assets.GetCategories({ offset: 0, limit: 100 }, (err, categories) => {
                cb(err ? err : null, categories)
            })
        },
        products: (cb) => {
            models.Assets.GetGlobalProducts({ limit: 100 }, (err, products) => {
                cb(err ? err : null, products)
            })
        },
        size: (cb) => {
            models.Assets.getSize({}, (err, size) => {
                cb(err ? err : null, size)
            })
        },
        color: (cb) => {
            models.Assets.getColor({}, (err, color) => {
                cb(err ? err : null, color)
            })
        },
        addedProducts: (cb) => {
            models.ShopProducts.GetProductsByLocationId({locationId},(err, addPro) => {
                cb(err ? err : null, addPro)
            })
        },
        productRequest: (cb) => {
            models.ShopProducts.addProductRequestByBrand({locationId, userId}, (err, proReq) => {
                cb(err ? err : null, proReq)
            })
        },
    }, function(err,result) {
        if(err){
            res.send({ success: false })
        }else{
            res.render('app/asset-management', {
                title: 'Exlshop | Product Management',
                fw: false,
                menuActive: 'assets',
                submenuActive: '',
                addedProducts: result.addedProducts,
                productRequest: result.productRequest,
                product: result.products,
                categories: result.categories,
                size:result.size,
                color:result.color,
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/asset-management.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })
        }
    })
})

router.post('/GetSubcategories', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
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

router.post('/add', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    var category = 0;
    if (post.category) {
        category = post.category == 'gym' ? 1 : 2;
    }
    const options = {
        locationId,
        name: post.asset_name,
        equipmentType: category == 1 ? post.equipment_type : post.office_equipment_type,
        purchaseDate: moment(post.purchase_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        purchaseValue: (post.purchase_value) ? (post.purchase_value) : (null),
        warrantyMonths: (post.warranty) ? (post.warranty) : (null),
        manufacturer: post.manufacturer,
        model: post.model,
        serialNumber: post.serial_number,
        vendorId: (post.vendor) ? (post.vendor) : (null),
        category: category
    }
    models.Assets.Add(options, (err, id) => {
        if (err) {
            res.send({ success: false })
        }

        const files = req.files;
        var fileArr = [];
        if (files) {
            if (!files.file.length) {
                fileArr.push(files.file)
            } else {
                fileArr = files.file;
            }
        }
        async.map(fileArr, (a, cb) => {
            var filename = (a) ? (`${moment().unix()}-${a.name}`) : (null);
            var imgDir = `${require('path').resolve()}/public/asset-inventory/${filename}`;;
            a.mv(imgDir, (err) => {
                if (err) {
                    cb(err)
                } else {
                    models.Assets.AddFiles({ id, filename }, (err) => {
                        if (err) {
                            cb(err)
                        } else {
                            cb(null)
                        }
                    })
                }
            })
        }, (err, result) => {
            if (err) {
                res.send({ success: false })
            } else {
                res.send({ success: true })
            }
        })
    })
})

router.post('/add/shopadmin_delivery', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options={
        pickup_time:post.pickup_time,
            pickup_date:post.pickup_date,
            pickup_location:post.pickup_location,
            staff_id:post.staff_id,
            order_id:post.order_id,
    }
    models.Assets.Shopadmin_Delivery(options, (err, id) => {
        if (err) {
            res.send({ success: false })
        }
    })
})

router.post('/products/view-all', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['d.file_name', 'a.name', 'product_type', 'a.is_service', 'categories', 'f.status'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
   const  globalproduct_id=req.body.globalproduct_id;

    models.ShopProducts.GetProductAll({ userId: userId,locationId,   search, limit, offset, orderByColumn, orderByValue, filter }, (err, products) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, draw: req.query.draw, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })
        }
    })
})
router.post('/requestedcategory/view-all', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['d.file_name', 'a.name', 'product_type', 'a.is_service', 'categories', 'f.status'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
   const  globalproduct_id=req.body.globalproduct_id;

    models.ShopProducts.GetRequestedCategory({ userId: userId,locationId, offset, limit, search, orderByColumn, orderByValue, filter }, (err, requestedCategory) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, draw: req.query.draw, recordsTotal: requestedCategory.total, recordsFiltered: requestedCategory.total, data: requestedCategory.requestedCategory })
        }
    })
})

router.post('/category/view-all', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = "0";
    const limit = "0";
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = "";
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter;
    models.ShopProducts.GetAllCategory({ offset, limit, search, orderByColumn, orderByValue, filter }, (err, categories) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, data: categories })
        }
    })
})

router.post('/add/shop_product', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    const product_name = post.product_name;
    const userId = req.session.user.id;
    const locationId=req.session.user.currentLocation.id
    const  globalproduct_id=post.id;
    const catId=post.cat_id;
    const size=post.size ? post.size : null;
    const color=post.color ? post.color : null;
    const regular_price = post.regular_price
    const discount_price = post.discount_price
    const quantity=post.quantity;
    const isreturnable = post.isreturnable;
    const daystoreturn = post.daystoreturn ? post.daystoreturn : null;
    models.ShopProducts.Add({catId:catId, name: post.product_name,discount_price, regular_price, is_variable : post.is_variable, userId: userId, locationId:locationId ,globalproduct_id:globalproduct_id,size:size,color:color,quantity:quantity,isreturnable:isreturnable,daystoreturn:daystoreturn}, (err, productId) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect(`/app/asset-management`)
        }
    })
})

router.post('/add/shop_category', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    const category_name= post.category_name;
    const userId = req.session.user.id;
    const locationId=req.session.user.currentLocation.id
    const  globalproduct_id=req.body.globalproduct_id;
    const categories=post.categories
    models.ShopProducts.AddRequestedCategory({ name: post.category_name, userId: userId, locationId:locationId ,globalproduct_id:globalproduct_id}, (err, productId) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect(`/app/asset-management`)
        }
    })
})

router.post('/add/shop_subcategory', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    const subcategory_name= post.subcategory_name;
    const userId = req.session.user.id;
    const locationId=req.session.user.currentLocation.id
    const  globalproduct_id=req.body.globalproduct_id;
    const categories=post.categories;
    const category_id=post.category_id
    models.ShopProducts.AddRequestedSubCategory({ category_id:category_id,name: post.subcategory_name}, (err, productId) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect(`/app/asset-management`)
        }
    })
})

router.post('/add/shop_subsubcategory', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    const subsubcategory_name= post.subsubcategory_name;
    const userId = req.session.user.id;
    const locationId=req.session.user.currentLocation.id
    const category_id=post.category_id;
    const subcategory_id=post.subcategory_id;
    const name= post.subsubcategory_name
    models.ShopProducts.AddRequestedSubSubCategory({ category_id,subcategory_id,name}, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect(`/app/asset-management`)
        }
    })
})

router.post('/get-single-asset', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const id = req.body.id;
    models.Assets.GetSingleAsset({ id }, (err, asset) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, asset: asset })
        }
    })
})

router.post('/superAdminProducts', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    models.Assets.superAdminProducts({ id }, (err, asset) => {
        if (err) {
            res.send({err})
        } else {
            res.send({ success: true, asset: asset })
        }
    })
})

router.post('/get-globalproducts', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    models.Assets.GetGlobalProducts({ stateId: post.stateId }, (err, cities) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, cities })
        }
    })
})

router.post('/update', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    var category = 0;
    const options = {
        productId: post.productId,
        name: post.name,
        description:post.description,
        regularPrice:post.regularPrice,
        discountPrice:post.discountPrice,
        sku:post.sku,
        quantity:post.quantity,
        isreturnable : post.isreturnable,
        daystoreturn : post.daystoreturn ? post.daystoreturn : null
    }
    models.Assets.Update(options, (err) => {
        if (err) {
            res.send({ success: false })
        }else
            res.send({ success: true })
    })
})

router.post('/check_sku', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    models.Assets.Check_Sku({ sku_val: post.sku_val }, (err, product_details) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, product_details })
        }
    })
})

router.post('/category_check',auth.checkPermission(['brand-admin','manager','operator']),(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
    models.Assets.Category_Check({ new_cat_val: post.new_cat_val }, (err, category_checked) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, category_checked })
        }
    })
})

router.post('/subcategory_check',auth.checkPermission(['brand-admin','manager','operator']),(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
    models.Assets.SubCategory_Check({ new_subcat_val: post.new_subcat_val,category_id:post.category_id }, (err, subcategory_checked) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, subcategory_checked })
        }
    })
})

router.post('/subsubcategory_check',auth.checkPermission(['brand-admin','manager','operator']),(req,res)=>{
    const post = req.body;
    const models = req.Core.Models;
    models.Assets.SubSubCategory_Check({ new_subsubcat_val: post.new_subsubcat_val,subcategory_id:post.subcategory_id }, (err, subsubcategory_checked) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, subsubcategory_checked })
        }
    })
})

router.post('/delete', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const id = req.body.product_id;
    models.Assets.Delete({ id }, (err) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.redirect('/app/asset-management/')
        }
    })
})

router.post('/add/product-images', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
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

router.post('/add/requested_product-images', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    var fileArr = [];
    const productId = 51;
            models.ShopProducts.AttachNewProductImages({ productId, images: req.body.name }, (err) => {
                if (err) {
                    res.send({ success: false })
                } else {
                    res.send({ success: true, result })
                }
            })
})

router.post('/productsbycatid',auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const catId = req.body.subsubcategory_val;
    models.Assets.ProductsByCatid({ catId }, (err, productsbycatid) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, asset: productsbycatid })
        }
    })
})

router.post('/applyfilter',auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
   const  globalproduct_id=req.body.globalproduct_id;
    const catId = req.body.cat;
    const sub_categoryId=req.body.subcategory_id
    const sub_subcategoryId=req.body.sub_subcategory_id
    models.ShopProducts.ProductsApplyFilter({ catId,sub_categoryId,sub_subcategoryId,userId,locationId}, (err, productsbyfilter) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, asset: productsbyfilter })
        }
    })
})

router.post('/products/DealsofTheDay', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['d.file_name', 'a.name', 'product_type', 'a.is_service', 'categories', 'f.status'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
   const  globalproduct_id=req.body.globalproduct_id;

    models.ShopProducts.GetDealsProducts({ userId: userId,locationId,   search, limit, offset, orderByColumn, orderByValue, filter }, (err, products) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true, draw: req.query.draw, recordsTotal: products.total, recordsFiltered: products.total, data: products.products })
        }
    })
})

router.post('/products/add-product-to-deals', auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;

    models.ShopProducts.addDealsProduct(req.body, (err)=>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true})
        }
    })
})

router.post('/products/delete-deals-product', auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;

    models.ShopProducts.deleteDealsProduct(req.body, (err)=>{
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true})
        }
    })
})

router.post("/add-new-size", auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;

    models.Assets.AddNewSize(req.body, (err, data) =>{
        if(err){
            console.log(err)
            res.send({success: false})
        }else{
            res.send({success: true, id : data})
        }
    })
})

router.post("/getSizes", auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;

    models.Assets.getSize({},(err, sizes)=>{
        if(err){
            console.log(err)
            res.send({success: false})
        }else{
            res.send({success: true, sizes})
        }
    })
})

router.post("/add-new-color", auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;

    models.Assets.AddNewColor(req.body, (err, data) =>{
        if(err){
            console.log(err)
            res.send({success: false})
        }else{
            res.send({success: true, id : data})
        }
    })
})

router.post("/getColors", auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;

    models.Assets.getColors({},(err, colors)=>{
        if(err){
            console.log(err)
            res.send({success: false})
        }else{
            res.send({success: true, colors})
        }
    })
})

module.exports = router;