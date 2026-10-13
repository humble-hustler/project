const { options } = require('../routes');
const geolib = require('geolib')

const Assets = (connection, logger) => {
    const module = {}
    module.GetProductsById = (options, callback) => {
        var search = ``
        connection.query(`SELECT a.*, a.id, a.product_type,a.name,a.regular_price,a.discount_price,
                            IF(a.discount_price < a.regular_price, 1, 0) AS is_discount, 
                            b.file_name,
                            e.slug
                            FROM
                            shop_products AS a
                                LEFT JOIN
                            shop_product_images AS b ON b.product_id = a.id
                                AND b.is_featured = 1
                                LEFT JOIN shop_product_categories AS d ON d.product_id = a.id
                                LEFT JOIN shop_categories AS e ON e.id = d.category_id
                        WHERE
                        GROUP BY a.id, b.file_name, e.slug LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, (err, products) => {
                        if (err) callback(err)
                        else {
                            callback(false, products)
                        }
                        })
    }

    module.GetProductsByLocationId = (options, callback) => {
        connection.query(`SELECT COUNT(*) as count FROM
        shop_products as a
        INNER JOIN shop_subsription as b ON b.shop_id = a.location_id
        WHERE location_id = ${options.locationId} AND b.start_date < a.created_date;`, (err, products) => {
            if (err) callback(err)
            else {
                callback(false, products)
            }
        })
    }

    module.GetProductsByLocationId1 = (options, callback) => {
        connection.query(`SELECT COUNT(*) as count FROM
        shop_products 
        WHERE location_id = ${options.locationId}`, (err, products) => {
            if (err) callback(err)
            else {
                callback(false, products)
            }
        })
    }

    module.GetSingleProduct = (options, callback) => {
        connection.query(`SELECT a.*, a.id,a.product_type,a.name,a.regular_price,a.discount_price,
                            IF(a.discount_price < a.regular_price, 1, 0) AS is_discount, 
                            b.file_name,
                            e.slug
                            FROM
                            shop_products AS a
                                LEFT JOIN
                            shop_product_images AS b ON b.product_id = a.id
                                AND b.is_featured = 1
                                LEFT JOIN shop_product_categories AS d ON d.product_id = a.id
                                LEFT JOIN shop_categories AS e ON e.id = d.category_id
                        WHERE a.id = ? ;`,options.productId, (err, product) => {
                            if (err) callback(err)
                            else {
                                callback(false, product)
                            }
                        })
    }

    module.AddReqestedProducts = (options, callback) => {
        connection.query(`INSERT INTO global_product_management SET name=?`, options.name, (err, types) => {
            callback(err, types)
        })
    }
    module.AddRequestedCategory = (options, callback) => {
        connection.query(`INSERT INTO shop_requested_categories SET category_name=?`, options.name, (err, types) => {
            callback(err, types)
        })
    }
    module.AddRequestedSubCategory = (options, callback) => {
        connection.query(`INSERT INTO shop_requested_categories SET subcategory_name=?,category_id=?`, [options.name, options.category_id], (err, result) => {
            callback(err, result)
        })
    }
    module.AddRequestedSubSubCategory = (options, callback) => {
        connection.query(`INSERT INTO shop_requested_categories SET subsubcategory_name=?,category_id=?,subcategory_id=?`, [options.name, options.category_id, options.subcategory_id], (err, types) => {
            callback(err, types)
        })
    }
    module.GetRequestedCategory = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` WHERE (category_name LIKE ${keyword}  OR subcategory_name LIKE ${keyword} OR subsubcategory_name LIKE ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.categories) {
                filterQuery += ` AND c.id IN (${options.filter.categories.join(',')}) `;
            }
        }
        connection.query(` SELECT * FROM shop_requested_categories ${search} ${filterQuery} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, (err, requestedCategory) => {
            callback(err, { total: requestedCategory[1][0].total, requestedCategory: requestedCategory[0] })
        })
    }
    module.AddCategory = (options, callback) => {
        connection.query(`INSERT INTO global_product_management SET name=?`, options.name, (err, types) => {
            callback(err, types)
        })
    }
    
    module.getRequestedProduct = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = `AND (a.name LIKE ${keyword}  OR a.id LIKE ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.categories) {
                filterQuery += ` AND c.id IN (${options.filter.categories.join(',')}) `;
            }
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        a.*,b.slug as catname
        from product_request as a
        LEFT JOIN shop_categories as b
        ON a.subsubcategory=b.id
        where a.is_added=0 ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, (err, products) => {
            if (err) callback(err)
            else {
                callback(err, { total: products[1][0].total, products: products[0] })
            }
        })
    }
    module.getRequestedCategory = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.id LIKE ${keyword}  OR a.category_name  LIKE ${keyword} OR a.subcategory_name LIKE ${keyword} OR a.subsubcategory_name LIKE ${keyword}  )`
        }
        if (options.slug) {
            search += ` AND c.slug = "` + options.slug + `" `;
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.categories) {
                filterQuery += ` AND c.id IN (${options.filter.categories.join(',')}) `;
            }
        }
        connection.query(`SELECT a.id as id,a.category_name as c_name,a.subcategory_name as sub_name,a.subsubcategory_name as sub_sub_name,a.category_id as c_id,a.subcategory_id as s_id
    from shop_requested_categories as a where a.is_added=0 ${search} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, (err, categories) => {
            if (err) callback(err)
            else {
                callback(err, { total: categories[1][0].total, products: categories[0] })
            }
        })
    }
    module.getReqProduct = (options, callback) => {
        connection.query(`SELECT SQL_CALC_FOUND_ROWS 
        a.*,b.slug as catname
        from product_request as a
        LEFT JOIN shop_categories as b
        ON a.subsubcategory=b.id
        where a.is_added=0 `, (err, reqproduct) => {
            if (err) callback(err)
            else {
                callback(err, { reqproduct: reqproduct })
            }
        })
    }

    module.addProductRequestByBrand = (options, callback) => {
        connection.query(`SELECT *
        FROM
        product_request as a
        INNER JOIN shop_subsription as b ON b.shop_id = a.location_id
        WHERE location_id = ${options.locationId} AND b.start_date < a.created_at`, (err, reqproduct) => {
            if (err) callback(err)
            else {
                callback(err, reqproduct)
            }
        })
    }
    module.getReqCategory = (options, callback) => {
        connection.query(`SELECT a.id as id,a.category_name as c_name,a.subcategory_name as sub_name,a.subsubcategory_name as sub_sub_name,a.category_id as c_id,a.subcategory_id as s_id
    from shop_requested_categories as a where a.is_added=0`, (err, reqcategories) => {
            if (err){ 
                callback(err)
            }else {
                callback(err, { reqcategories: reqcategories })
            }
        })
    }
    module.AddReqProducts = (options, callback) => {
        connection.query(`INSERT INTO global_product_management SET name = ?, description= ?`, [options.name, options.desc], (err, product) => {
            if (err) {
                callback(err)
            }
            else {
                connection.query(`INSERT INTO global_product_images SET global_product_id = ?, files = ?`, [product.insertId, options.file_name], (err) =>{
                    if(err){
                        callback(err)
                    }else{
                        connection.query('INSERT INTO shop_product_categories SET category_id=?,product_id=?', [options.catId, product.insertId], (err, shop_category) => {
                            if (err) {
                                callback(err)
                            }
                            else {
                                connection.query('UPDATE  product_request SET is_added=1 where id=?', [options.id], (err, result) => {
                                    callback(err, { success: true, product: product, result: result })
                                })
                            }
                        })
                    }
                })
              
            }
        })
    }
    module.AddReqcategory = (options, callback) => {
        if (options.c_name && options.sub_name && options.sub_sub_name) {
            connection.query(`INSERT INTO shop_categories SET name = ?, slug=?, parent_id = 0; `, [options.c_name, options.c_name], (err, cat) => {
                if (err) {
                    callback(err)
                } else {
                    connection.query(`INSERT INTO shop_categories SET name = ?, slug = ?, parent_id = ?;`, [options.sub_name, options.sub_name, cat.insertId], (err,subcat) => {
                        if(err) {
                            callback(err)
                        } else {
                            connection.query(`INSERT INTO shop_categories SET name = ?, slug = ?, parent_id = ?;`, [options.sub_sub_name, options.sub_sub_name, subcat.insertId], (err,subsubcat) => {
                                callback(err, { success: true, catId : cat.insertId, subCatId : subcat.insertId, subsubCatId : subsubcat.insertId })
                            })
                        }
                    })
                }
            })
        } else if (options.c_id && options.sub_name && options.sub_sub_name) {
            connection.query(`INSERT INTO shop_categories SET name = ?, slug = ?, parent_id = ?`, [options.sub_name, options.sub_name, options.c_id], (err, subcat) => {
                if (err) {
                    callback(err)
                } else {
                    connection.query(`INSERT INTO shop_categories SET name = ?, slug=?,parent_id=? `, [options.sub_sub_name, options.sub_sub_name, subcat.insertId], (err, subsubcat) => {
                        callback(err, { success: true, catId : options.c_id, subCatId : subcat.insertId, subsubCatId : subsubcat.insertId })
                    })
                }
            })
        } else if (options.c_id && options.s_id && options.sub_sub_name){
            connection.query(`INSERT INTO shop_categories SET name = ?, slug=?,parent_id=? `, [options.sub_sub_name, options.sub_sub_name, options.s_id], (err, subsubcat) => {
                callback(err, { success: true, catId : options.c_id, subCatId : options.s_id, subsubCatId : subsubcat.insertId })
            })
        }
    }

    module.getSubscription= (options, callback) => {   
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = `and ( (b.email LIKE ${keyword}) or (d.name LIKE ${keyword} ) or (a.status like ${keyword})   )`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.categories) {
                filterQuery += ` AND c.id IN (${options.filter.categories.join(',')}) `;
            }
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  c.instamojo_payment_request_id as subscriptionId, e.name as plan_name, e.period,
        a.id,a.amount,CASE  a.status WHEN 0 THEN 'Pending' ELSE 'Subscribed' END as  subcriptionStatus,b.fname,b.lname,b.email,d.name as brandName,d.id as brandid,CASE  d.is_active WHEN 1 THEN 'Active' ELSE 'Inactive' END  as shopStatus
               from shop_subsription as a
               INNER JOIN users as b
               ON b.id=a.users_id
               left JOIN shop_subscription_request AS c
               ON c.instamojo_payment_request_id=a.instamojo_payment_request_id
               INNER JOIN brands as d ON d.id=a.shop_id  
               inner join shop_subscription_plan  as e on e.id = a.plan_id 
               where a.is_deleted = 0 ${search}  LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, (err,subscriptions) => {
            if (err) callback(err)
            else {
                callback(err, { total: subscriptions[1][0].total, subscriptions: subscriptions[0] })
            }
        })
    }
    module.getSubscriptionPlans=(options,callback)=>{
        connection.query(`SELECT * FROM admin_exlshop.shop_subscription_plan WHERE is_deleted = 0;SELECT FOUND_ROWS() AS total`, (err,subscriptionplans) => {
            if (err) callback(err)
            else {
                callback(err, { total: subscriptionplans[1][0].total, subscriptions: subscriptionplans[0] })
            }
        }) 
    }
    module.pickup_delivery_details=(options,callback)=>{
        connection.query(`SELECT * FROM admin_exlshop.delivery_person;SELECT FOUND_ROWS() AS total`, (err,pickup_delivery_details) => {
            if (err) callback(err)
            else {
                callback(err, { total: pickup_delivery_details[1][0].total, pickup_delivery: pickup_delivery_details[0] })
            }
        })    
    }

    module.GetProducts = (options, callback) => {
        connection.query(`SELECT * FROM shop_products`, (err, products) => {
            callback(err, products)
        })
    }
    module.GetProducts1 = (options, callback) => {
        connection.query(`SELECT * FROM shop_products`, (err, products1) => {
            if (!err) {
                callback(null, products1);
            }
        })
    }

    module.GetAll = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.id LIKE ${keyword} OR a.name LIKE ${keyword} OR a.description LIKE ${keyword})`;
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        a.*, b.files
        FROM global_product_management AS a 
        left join global_product_images as b on b.global_product_id = a.id
        WHERE a.is_deleted= 0 ${search} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, products) => {
            callback(err, { total: products[1][0].total, products: products[0] })
        })
    }

    module.GetAll1 = (options, callback) => {
        var search = ``
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        a.*
        FROM global_product_management AS a 
        WHERE a.is_deleted= 0 ;SELECT FOUND_ROWS() AS total;`, (err, products) => {
            callback(err, { products })
        })
    }

    module.GetSingleProductDetail = (options, callback) => {
        connection.query(`SELECT 
                a.*,
                c.name as category,
                c.id as catid,
                f.status,
                d.file_name,
                d.id as imageId,
                d.is_featured
            FROM shop_products AS a
            LEFT JOIN shop_product_categories AS b ON b.product_id = a.globalproduct_id
            LEFT JOIN shop_categories AS c ON c.id = b.category_id
            LEFT JOIN shop_product_images AS d ON d.product_id = a.id
            LEFT JOIN shop_product_type AS e ON e.id = a.product_type
            LEFT JOIN shop_product_status AS f ON f.id = a.status_id 
            where a.id = ${options.productId}`, (err, products) => {
            if(err){
                callback(err)
            }else{
                callback(false, products)
            }
        })
    }

    module.GetProductAll = (options, callback) => {
        var search = ``
        if (options.search) {
            search = ' ( (a.name LIKE "%' + options.search + '%") OR (c.catName LIKE "%' + options.search + '%") OR (c.subcatName LIKE "%' + options.search + '%") OR (c.subsubcatName LIKE "%' + options.search + '%") OR (a.sku LIKE "%' + options.search + '%") OR (a.id LIKE "%' + options.search + '%")) AND ';
        }    
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
     
        if (options.filter) {
            var filter = options.filter;

            if (filter.quantity) {
                filterQuery+=`AND a.quantity LIKE "%${filter.quantity}%"`;
            }
            if (filter.status_id) {
                filterQuery+=`AND a.is_available LIKE "%${filter.status_id}%"`;
            }
            if (filter.product_name) {
                filterQuery+=`AND a.name LIKE "%${filter.product_name}%"`;
            }
            if(filter.sku_no) {
                filterQuery+=`AND a.sku LIKE "%${filter.sku_no}%"`;
            }
            if(filter.price_min && filter.price_max) {
                filterQuery+=`AND a.regular_price BETWEEN ${connection.escape(filter.price_min)} AND ${connection.escape(filter.price_max)} `;
            }
            if(filter.price_min) {
                filterQuery+=`AND a.regular_price >= ${connection.escape(filter.price_min)}`;
            }
            if(filter.price_max) {
                filterQuery+=`AND a.regular_price < ${connection.escape(filter.price_max)}`;
            }
            if(filter.sub_subcategory) {
                filterQuery+=`AND c.subsubcatId LIKE "%${filter.sub_subcategory}%"`;
            }
            if(filter.subcategory) {
                filterQuery+=`AND c.subcatId LIKE "%${filter.subcategory}%"`;
            }
            if(filter.category) {
                filterQuery+=`AND c.catId LIKE "%${filter.category}%"`;
            }
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
                    a.id,
                    a.name,
                    a.description,
                    j.files as image,
                    a.globalproduct_id,
                    a.is_returnable,
                    a.returnable_days,
                    a.regular_price,
                    a.discount_price,
                    a.is_available,
                    c.*,
                    CASE  a.is_available WHEN 0 THEN 'Out Of Stock' ELSE 'In Stock' END as  stock_status,
                    e.name AS product_type,
                    a.is_service, a.quantity,
                    f.status,
                    d.file_name,
                    a.sku as sku,
                    SUM(IF(g.order_status = 1,1,0)) as order_placed_count,
					SUM(IF(g.order_status = 2,1,0)) as shipped_count,
					SUM(IF(g.order_status = 3,1,0)) as out_for_count,
					SUM(IF(g.order_status = 4,1,0)) as delivered_count,
					SUM(IF(g.order_status = 5,1,0)) as cancelled_count,
					SUM(IF(g.order_status = 6,1,0)) as returned_count,
					SUM(IF(g.order_status = 7,1,0)) as order_pushed_count
                FROM shop_products AS a
                LEFT JOIN shop_product_categories AS b ON b.product_id = a.globalproduct_id
                LEFT JOIN (SELECT 
                a.id as catId,
                a.name as catName,
                b.id as subcatId,
                b.name as subcatName,
                c.id as subsubcatId,
                c.name as subsubcatName
                FROM shop_categories as a
                INNER JOIN shop_categories as b ON b.parent_id = a.id
                LEFT JOIN shop_categories as c ON c.parent_id = b.id) AS c ON c.subsubcatID = b.category_id
                LEFT JOIN shop_product_images AS d ON d.product_id = a.id
                AND d.is_featured = 1
                LEFT JOIN shop_product_type AS e ON e.id = a.product_type
                LEFT JOIN shop_product_status AS f ON f.id = a.status_id
                LEFT JOIN shop_orders_products AS g ON g.product_id = a.id
				LEFT JOIN shop_orders AS h ON h.id = g.order_id AND h.created_date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()
				LEFT JOIN order_status AS i ON i.id = h.order_status
                left join global_product_images as j on j.global_product_id = a.globalproduct_id

                WHERE ${search}  a.id IS NOT NULL AND a.is_deleted = 0 AND a.user_id= ${options.userId}  AND a.location_id=${options.locationId}  
                ${filterQuery} GROUP BY a.id, c.catId, c.subcatId, c.subsubcatId, d.file_name, j.files LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, (err, products) => {
                   console.log(err)
                    callback(err, { total: products[1][0].total, products: products[0] })
                })
    }

   module.ProductsApplyFilter=(options, callback) => {
    sub_subcatId=options.sub_subcategoryId?options.sub_subcategoryId:null
   
    connection.query(`SELECT SQL_CALC_FOUND_ROWS
            a.id,a.name,
            c.name as category,
            e.name AS product_type,
            a.is_service,
            f.status,
            d.file_name,
            a.sku as sku
            FROM shop_products AS a
            LEFT JOIN shop_product_categories AS b ON b.product_id = a.globalproduct_id
            LEFT JOIN shop_categories AS c ON c.id = b.category_id
            LEFT JOIN shop_product_images AS d ON d.product_id = a.id
            AND d.is_featured = 1
            LEFT JOIN shop_product_type AS e ON e.id = a.product_type
            LEFT JOIN shop_product_status AS f ON f.id = a.status_id
            WHERE a.is_available=1 AND a.id IS NOT NULL AND a.is_deleted = 0 AND a.user_id= ${options.userId}  AND a.location_id=${options.locationId} AND c.id=${sub_subcatId} ;SELECT FOUND_ROWS() AS total`, (err, products) => {
                callback(err, { total: products[1][0].total, products: products[0] })
            })
    }

    module.GetOutOfStockProduct = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search =  '((a.name LIKE "%' + options.search + '%") OR (a.id LIKE "%' + options.search + '%") ) AND '
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.categories) {
                // filterQuery += ` AND c.id IN (${options.filter.categories.join(',')}) `;
            }
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
                    a.id,
                    a.name,
                    c.name as category,
                    e.name AS product_type,
                    a.is_service,
                    f.status,
                    d.file_name,
                    a.sku as sku,
                    a.is_available
                    FROM shop_products AS a
                    LEFT JOIN shop_product_categories AS b ON b.product_id = a.globalproduct_id
                    LEFT JOIN shop_categories AS c ON c.id = b.category_id
                    LEFT JOIN shop_product_images AS d ON d.product_id = a.id
                    AND d.is_featured = 1
                        LEFT JOIN shop_product_type AS e ON e.id = a.product_type
                        LEFT JOIN shop_product_status AS f ON f.id = a.status_id
                    WHERE ${search} a.is_available=0 AND a.id IS NOT NULL AND a.is_deleted = 0 AND a.user_id= ${options.userId}  AND a.location_id=${options.locationId}   ${filterQuery} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, (err, outofstockproducts) => {
                        callback(err, { total: outofstockproducts[1][0].total, outofstockproducts: outofstockproducts[0] })
                    })
    }

    module.GetLowStockProduct = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search =  '((a.name LIKE "%' + options.search + '%") OR (a.id LIKE "%' + options.search + '%") ) AND '
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.categories) {
                // filterQuery += ` AND c.id IN (${options.filter.categories.join(',')}) `;
            }
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
                    a.id,
                    a.name,
                    a.quantity,
                    c.name as category,
                    e.name AS product_type,
                    a.is_service,
                    f.status,
                    d.file_name,
                    a.sku as sku,
                    a.is_available
                    FROM shop_products AS a
                    LEFT JOIN shop_product_categories AS b ON b.product_id = a.globalproduct_id
                    LEFT JOIN shop_categories AS c ON c.id = b.category_id
                    LEFT JOIN shop_product_images AS d ON d.product_id = a.id
                    AND d.is_featured = 1
                        LEFT JOIN shop_product_type AS e ON e.id = a.product_type
                        LEFT JOIN shop_product_status AS f ON f.id = a.status_id
                    WHERE ${search} a.quantity <=10 AND a.is_available=1 AND a.id IS NOT NULL AND a.is_deleted = 0
                    AND a.user_id= ${options.userId}  AND a.location_id=${options.locationId}
                    ${filterQuery} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, (err, lowstockproducts) => {
                        callback(err, { total: lowstockproducts[1][0].total, lowstockproducts: lowstockproducts[0] })
                    })
    }

    module.UpdateStockProduct= (options,callback)=>{
        var status;
        if(options.stock_status=='In Stock'){
          status=0;
        }else{
           status=1;
        }
        connection.query('UPDATE shop_products SET is_available=? WHERE id=?', [status, options.productId], (err, updateResult) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateStockProduct= (options,callback)=>{
        var status;
        if(options.stock_status=='In Stock'){
          status=0;
        }else{
           status=1;
        }
        connection.query('UPDATE shop_products SET is_available=? WHERE id=?', [status, options.productId], (err, updateResult) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.GetAllCategory = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.name LIKE ${keyword} OR a.description LIKE ${keyword} OR a.sku LIKE ${keyword})`
        }
        if (options.slug) {
            search += ` AND c.slug = "` + options.slug + `" `;
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.categories) {
                filterQuery += ` AND c.id IN (${options.filter.categories.join(',')}) `;
            }
        }
        connection.query(`select id,name from shop_categories ;`, (err, categories) => {
            callback(err, { categories: categories })
        })
    }
    module.GetCategories = (callback) => {
        connection.query(`SELECT * FROM shop_categories where parent_id=0`, (err, categories) => {
            callback(err, categories)
        })
    }
    module.getParentCategory = (callback) => {
        connection.query(`SELECT * FROM shop_categories where parent_id=0`, (err, parentcategories) => {
            if(err){
                callback(err)
            }else{
                parentcategories.push({id : 1000, name : 'All', slug : "All", parent_id : 0})
                callback(err, parentcategories)
            }
        })
    }

    module.getSubCategory = (options, callback) =>{
        connection.query(`select * from shop_categories where parent_id = ${options.subcategory_id}`, (err, subcategories) =>{
            if(err){
                callback(err)
            }else{
                callback(err, subcategories)
            }
        })
    }
    module.getSubSubCategory = (options, callback) =>{
        connection.query(`select * from shop_categories where parent_id = ?`, [options.id], (err, sub_subcategories) =>{
            if(err){
                callback(err)
            }else{
                callback(err, sub_subcategories)
            }
        })
    }

    module.GetSubcategories=(options, callback) => {
        var filterState = ``
        if (options) {
            filterState = `WHERE parent_id = ${options.categoryId}`
        }
        connection.query(`SELECT * FROM shop_categories ${filterState}`, (err, subcategories) => {
            if (err) {
                callback(err)
            } else {
                callback(false, subcategories)
            }
        })
    }
    
    module.GetCategoriesForFilter = (options, callback) => {
        connection.query(`SELECT * FROM shop_categories where shop_categories.id > 36`, (err, categories) => {
            callback(err, categories)
        })
    }

    module.GetTypes = (options, callback) => {
        connection.query(`SELECT * FROM shop_product_type`, (err, types) => {
            callback(err, types)
        })
    }

    module.GetStatus = (options, callback) => {
        connection.query(`SELECT * FROM shop_product_status`, (err, types) => {
            callback(err, types)
        })
    }
    module.AddglobalProducts = (options, callback) => {
        connection.query(`INSERT INTO global_product_management SET name=?`, options.name, (err, data) => {
            if(err){
                callback(err)
            }else{
                connection.query(`INSERT INTO shop_product_categories SET category_id=? ,product_id=?`, [options.cid, data.insertId], (err, types) => {
                    if(err){
                        callback(err)
                    }else{
                        callback(false, data)
                    }
                    })
            }
        })
    }

    module.AttachGlobalImg = (options, callback) =>{
        var values = []
        options.images.forEach((i) => {
            i.fileName = "/global-product/" + i.fileName
            values.push([options.global_product_id, i.fileName,])
        })
        connection.query(`INSERT INTO global_product_images(global_product_id, files) VALUES ?`, [values], (err, data) => {
            if (err) {
                callback(err);
            } else {
                callback(false, data);
            }
        })
    }


    module.Add = (options, callback) => {
        var discount_percentage=((options.discount_price*100)/options.regular_price)
        connection.query(`INSERT INTO shop_products SET name = ?, product_type = ?, description=?,user_id=?,regular_price = ?, discount_price = ?,discount_percentage=?,
        location_id=?,globalproduct_id=?,quantity=?,is_returnable=?,returnable_days=?`, 
        [options.name, options.is_variable, options.description,options.userId, options.regular_price, options.discount_price, discount_percentage,  options.locationId, options.globalproduct_id,
            options.quantity,options.isreturnable, options.daystoreturn], (err, product) => {
            if (err){ console.log(err)
                 callback(err)}
            else {
                if(options.size != null && options.color != null && options.size != 'NA' && options.color !='NA' ){
                    connection.query("INSERT INTO shop_product_properties SET product_id=?, size=?, color=? ",[product.insertId,options.size,options.color],(err,result)=>{
                        if(err){
                            console.log(err)
                            callback(err)
                        }
                        else{
                        callback(false, { success: true, product: product })
                        }
                    })
                }else{
                    callback(false, { success: true, product: product })
                }
            }
        })
    }

    module.AddCategory = (options, callback) => {
        connection.query(`INSERT INTO shop_categories SET name = ?, slug =?, parent_id = ?`, [options.name, options.slug, options.parent_id], (err, product) => {
           if(err){callback(err)}
           else{
            callback(false, {success: true, product})
           }
        })
    }

    module.GetSingle = (options, callback) => {
        connection.query(`SELECT a.*, b.files
            FROM global_product_management AS a
            left join global_product_images as b on b.global_product_id = a.id
            WHERE a.id = ? AND a.is_deleted= 0`, [options.productId], (err, product) => {
            callback(err, product[0])
        })
    }

    module.Update = (options, callback) => {
        connection.query(`UPDATE global_product_management SET  name = ? ,description=? WHERE id = ?`, [options.name, options.description, options.productId], (err, result) => {
            if (err) {
                console.log(err)
                callback(err)
            } else {
                connection.query('select count(*) as count from shop_product_categories where product_id=?;', [options.productId], (err, countRow) => {
                    if (countRow[0].count == 0) {
                        connection.query('INSERT INTO shop_product_categories SET category_id=? ,product_id=?', [options.category, options.productId], (err, result) => {
                            if (err) {
                                console.log(err)
                                callback(err)
                            } else {
                                callback(false)
                            }
                        })
                    } else {
                        connection.query('UPDATE shop_product_categories SET category_id=? WHERE product_id=?', [options.category, options.productId], (err, updateResult) => {
                            if (err) {
                                console.log(err)
                                callback(err)
                            } else {
                                callback(false)
                            }
                        })
                    }
                })
            }
        })
    }

    module.UpdateQuantity = (options, callback) => {
        connection.query(`UPDATE shop_products SET  quantity = ? WHERE id = ?`, [options.quantity, options.id], (err, result) => {
            if (err) {
                callback(err)
            } else {
                callback(false, result)
            }
        })
    }

    module.AttachImages = (options, callback) => {
        var values = []
        options.images.forEach((i) => {
            i.fileName = "/product-img/" + i.fileName
            values.push([options.productId, i.fileName, i.isFeatured])
        })
        connection.query(`INSERT INTO shop_product_images(product_id, file_name, is_featured) VALUES ?`, [values], (err, data) => {
            if (err) {
                callback(err);
            } else {
                callback(false);
            }
        })
    }

    module.promtionsImage = (options, callback) => {
        var values = []
        options.images.forEach((i) => {
            i.fileName = "/promotions/" + i.fileName
            values.push([i.fileName])
        })
        connection.query(`INSERT INTO promotions(file_name) VALUES ?`, [values], (err, data) => {
            if (err) {
                callback(err);
            } else {
                callback(false, data);
            }
        })
    }

    module.getPromotionsImage = (callback) =>{
        connection.query(`select * from promotions where is_deleted = 0`, (err, images) =>{
            if(err){
                callback(err)
            }else{
                callback(false, images)
            }
        })
    }

    module.deletePromotionImage = (options, callback) =>{
        connection.query(`UPDATE promotions SET is_deleted = 1 where id = ?`, [options.promotionId], (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.AttachNewProductImages= (options, callback) => {
        var values = []
            var fileName = "https://admin.exlshop.com/product-img/" + '/' + options.images
            values.push([options.productId, fileName])
    }

    module.SetFeaturedImage = (options, callback) => {
        if(options.imageName) {
            connection.query(`SELECT product_id FROM shop_product_images WHERE file_name = ?`, [options.imageName], (err,productId) => {
                if(err) {
                    callback(err)
                } else {
                    connection.query(`UPDATE shop_product_images SET is_featured = 0 WHERE product_id = ?`, [productId[0].product_id], (err) => {
                        if (err) {
                            callback(err)
                        } else {
                            connection.query(`UPDATE shop_product_images SET is_featured = 1 WHERE file_name = ?`, [options.imageName], (err) => {
                                callback(err)
                            })
                        }
                    })
                }
            })
        } else {
            connection.query(`UPDATE shop_product_images SET is_featured = 0 WHERE product_id = ?`, [options.productId], (err) => {
                if (err) {
                    callback(err)
                } else {
                    connection.query(`UPDATE shop_product_images SET is_featured = 1 WHERE id = ?`, [options.imageId], (err) => {
                        callback(err)
                    })
                }
            })
        }
    }

    module.DeleteImage = (options, callback) => {
        if(options.imageId){
            connection.query(`SELECT * FROM shop_product_images WHERE id = ?`, [options.imageId], (err, image) => {
                if (err) {
                    callback(err)
                } else {
                    if(image.length){
                        require('fs').unlink(`${require('path').resolve()}/public/product-img/${image[0].file_name}`, (err) => {
                     
                            connection.query(`DELETE FROM shop_product_images WHERE id = ?`, [options.imageId], (err) => {
                                callback(err)
                            })
                        })
                    } else {
                        callback(false)
                    }
                }
            })
        } else {
            connection.query(`SELECT * FROM shop_product_images WHERE file_name = ?`, [options.imageName], (err, image) => {
                if (err) {
                    callback(err)
                } else {
                    if(image.length){
                        require('fs').unlink(`${require('path').resolve()}/public/product-img/${image[0].file_name}`, (err) => {
                     
                            connection.query(`DELETE FROM shop_product_images WHERE file_name = ?`, [options.imageName], (err) => {
                                callback(err)
                            })
                        })
                    } else {
                        callback(false)
                    }
                }
            })
        }
    }

    module.GetProductImages = (options, callback) => {
        connection.query(`SELECT * FROM shop_product_images WHERE product_id = ?`, [options.productId], (err, images) => {
            callback(err, images)
        })
    }

    module.UpdateInventory = (options, callback) => {
        connection.query(`update shop_product_inventory SET comment = ?, inventory_count = ? where  product_id = ?`, [options.comment, options.inventoryCount, options.productId], (err) => {
            callback(err)
        })
    }

    module.UpdateVariationInventory = (options, callback) => {
        connection.query(`INSERT INTO shop_product_inventory SET product_id = ?, product_variation_id = ?, comment = ?, inventory_count = ?`, [options.productId, options.variationId, options.comment, options.inventoryCount], (err) => {
            callback(err)
        })
    }

    module.GetProductInventory = (options, callback) => {
        connection.query(`SELECT * FROM shop_product_inventory WHERE product_id = ? ORDER BY created_date DESC`, [options.productId], (err, inventory) => {
            callback(err, inventory)
        })
    }

    module.GetProductVariations = (options, callback) => {
        connection.query(`SELECT 
                a.*, SUM(b.inventory_count) AS inventory_count
            FROM
                shop_product_variations AS a
                LEFT JOIN shop_product_inventory AS b ON b.product_variation_id = a.id
            WHERE a.product_id = ? GROUP BY a.id, a.sku`, [options.productId], (err, variations) => {
                callback(err, variations)
            })
    }

    module.GetVariationsInventory = (options, callback) => {
        connection.query(`SELECT * FROM shop_product_inventory WHERE product_id = ? AND product_variation_id = ? ORDER BY created_date DESC`, [options.productId, options.variationId], (err, variations) => {
            callback(err, variations)
        })
    }

    module.AssignCategories = (options, callback) => {
        connection.query(`DELETE FROM shop_product_categories WHERE product_id = ?`, [options.productId], (err) => {
            if (err) {
                callback(err)
            } else {
                var values = []
                options.categories.forEach((c) => {
                    values.push([options.productId, c])
                })
                connection.query(`INSERT INTO shop_product_categories SET product_id=?, category_id=?`, [values[0][1], values[0][0]], (err) => {
                    callback(err)
                })
            }
        })
    }

    module.GetAssignedCategories = (options, callback) => {
        connection.query(`SELECT
                    a.id as category,
                    b.id as subcategory, b.name as bbb,
                    c.id as subsubcategory, c.name as ccc, d.product_id
                    FROM shop_categories as a
                    INNER JOIN shop_categories as b ON b.parent_id = a.id
                    INNER JOIN shop_categories as c ON c.parent_id = b.id
                    INNER JOIN shop_product_categories as d ON d.category_id = c.id
                    where d.product_id = ?`, [options.productId], (err, categories) => {
                        callback(err, categories)
        })
    }

    module.UpdateProductType = (options, callback) => {
        connection.query(`UPDATE shop_products SET product_type = ? WHERE id = ?`, [options.typeId, options.productId], (err) => {
            callback(err)
        })
    }

    module.UpdateProductIsService = (options, callback) => {
        connection.query(`UPDATE shop_products SET is_service = ? WHERE id = ?`, [options.isService, options.productId], (err) => {
            callback(err)
        })
    }

    module.UpdateProductStatus = (options, callback) => {
        connection.query(`UPDATE shop_products SET status_id = ? WHERE id = ?`, [options.productStatus, options.productId], (err) => {
            callback(err)
        })
    }

    module.AddVariation = (options, callback) => {
        connection.query(`INSERT INTO shop_product_variations SET product_id = ?, sku = ?, name = ?, regular_price = ?, discount_price = ?`, [options.productId, options.sku, options.name, options.regularPrice, options.discountPrice], (err) => {
            callback(err)
        })
    }

    module.Delete = (options, callback) => {
        connection.query(`UPDATE global_product_management SET is_deleted=1 WHERE id = ? `, [options.id], (err) => {
            callback(err)
        })
    }

    module.DeleteShopProduct = (options, callback) => {
        connection.query(`UPDATE shop_products SET is_deleted=1 WHERE id = ? `, [options.id], (err) => {
            if(err){
                callback(true, err)
            }else{
                callback(false)
            }
        })
    }

    module.GetDietitianBased = (options, callback) => {
        connection.query(`SELECT * FROM diet_plans AS a
            LEFT JOIN dietitian_category AS b ON b.diet_plan_id = a.id AND dietitian_id = ?; `, [options.userId], (err, DietPlan) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, DietPlan);
            }
        })
    }

    module.AddDietitianCategories = (options, callback) => {
        dietPlans = options.dietPlans;
        connection.query(`DELETE FROM dietitian_category WHERE dietitian_id = ?;
            INSERT INTO dietitian_category (dietitian_id, diet_plan_id) VALUES ?; `, [options.dietitianId, dietPlans.map(dp => [options.dietitianId, dp])], (err, DietPlan) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, DietPlan);
            }
        })
    }

    module.UpdateDietitian = (options, callback) => {
        connection.query(`INSERT shop_orders_products_dietitians SET dietitian_id = ?, shop_orders_products_id = ? ON DUPLICATE KEY UPDATE dietitian_id = dietitian_id `, [options.dietitianId, options.orderProductId], (err) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false);
            }
        })
    }

    module.addProduct = (options, callback) => {
        connection.query(`INSERT INTO shop_products SET name =?, description =?, regular_price=?, discount_price=?, user_id =?, location_id=?`, [options.name, options.description, options.regular_price, options.discount_price, options.user_id, options.location_id], (err, product)=>{
            if(err) {
                callback(err)
            } else {
                callback(false, product)
            }
        })
    }

    module.getbrandrecord = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (k.name like ${keyword} OR  (e.regular_price - e.discount_price) like ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if(options.day == 01){
            var num = 16
        }
        if(options.day == 15){
            var num = 31
        }
        var halfdate = options.year + "-"+ options.month 

        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
                j.brands_id,
                k.name ,
                sum(e.regular_price - e.discount_price) as price,
                GROUP_CONCAT(a.id) as total_order,
                COUNT(DISTINCT a.id) AS count
            FROM
            shop_orders AS a
            join shop_payment_request as aa on aa.order_id = a.id and aa.payment_mode != "COD"
                JOIN
            users AS b ON b.id = a.users_id
                JOIN 
            shop_orders_products AS d ON d.order_id = a.id
                LEFT JOIN 
            shop_products AS e ON e.id = d.product_id
                LEFT JOIN 
            brand_locations as j on j.id = e.location_id
            left join
            brands as k on k.id = j.brands_id
            where a.created_date between '${options.param.period}' and '${halfdate + '-' + num}' ${search} group by j.brands_id LIMIT ${options.offset}, ${options.limit};  SELECT FOUND_ROWS() AS total`, (err, record)=>{
                if(err){
                    callback(err)
                }else{
                    callback(false, {record:record[0], total:record[1][0].total})
                }
            })
    }

    module.getbrandrecordfirst = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (k.name like ${keyword} OR  (e.regular_price - e.discount_price) like ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }

        connection.query(`
                SELECT SQL_CALC_FOUND_ROWS
            month(a.created_date) as month,
            year(a.created_date) as year,
                sum(e.regular_price - e.discount_price) AS sub_total,
                CONCAT(DATE_FORMAT(a.created_date,'%Y-%m-'),IF(DAY(a.created_date)<16,'01','15'))
                            + INTERVAL 0 DAY as period,
                GROUP_CONCAT(j.brands_id) as vendor_id,
                COUNT(DISTINCT j.brands_id) AS count
                FROM
                shop_orders AS a
                join shop_payment_request as aa on aa.order_id = a.id and aa.payment_mode != "COD"
                    JOIN
                users AS b ON b.id = a.users_id
                    JOIN 
                shop_user_shipping_address AS c ON c.id = a.shipping_address_id 
                    LEFT JOIN 
                shop_orders_products AS d ON d.order_id = a.id
                    LEFT JOIN 
                shop_products AS e ON e.id = d.product_id
                    LEFT JOIN 
                brand_locations as j on j.id = e.location_id
                where j.brands_id IS NOT NULL ${search} GROUP BY month(a.created_date), year(a.created_date), CONCAT(DATE_FORMAT(a.created_date,'%Y-%m-'),IF(DAY(a.created_date)<16,'01','15'))
                + INTERVAL 0 DAY order by period desc LIMIT ${options.offset}, ${options.limit}; SELECT FOUND_ROWS() AS total`, (err, firstrecord)=>{
                if(err){
                    callback(err)
                }else{
                    callback(false, {record:firstrecord[0], total:firstrecord[1][0].total})  
                }
            })
    }

       module.getOrderRecord = (options, callback) => {
            var search = ``
            if (options.search) {
                var keyword = connection.escape(`%${options.search}%`);
                search = ` AND (k.name like ${keyword} OR  (e.regular_price - e.discount_price) like ${keyword})`
            }
            var orderBy = ``;
            if (options.orderByColumn) {
                orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
            }
            if(options.day == 01){
                var num = 16
            }
            if(options.day == 15){
                var num = 31
            }
            var halfdate = options.year + "-"+ options.month 

            connection.query(`SELECT  
                a.id,
                a.created_date,
                a.instamojo_payment_request_id,
                b.phone,
                b.id as user_id,
                c.lat,
                c.lng,
            CONCAT(b.fname, ' ', b.lname) AS user_name,
            GROUP_CONCAT(e.name) AS products,
            CONCAT(i.name,', ',h.name,', ',g.name) AS shipping_address,
            sum(e.regular_price - e.discount_price) as price,
            GROUP_CONCAT(distinct j.lat) AS to_lat,
            GROUP_CONCAT(distinct j.lng) AS to_long,
            GROUP_CONCAT(l.id) AS Shipping_charges
            FROM
            shop_orders AS a
            join shop_payment_request as aa on aa.order_id = a.id and aa.payment_mode != "COD"
                JOIN
            users AS b ON b.id = a.users_id
                JOIN 
            shop_user_shipping_address AS c ON c.id = a.shipping_address_id 
                LEFT JOIN 
            shop_orders_products AS d ON d.order_id = a.id
                LEFT JOIN 
            shop_products AS e ON e.id = d.product_id
                LEFT JOIN 
            countries AS g ON g.id = c.country_id
                    LEFT JOIN 
            states AS h ON h.id = c.state_id
                LEFT JOIN
            cities AS i ON i.id = c.city_id
            left join
            brand_locations as j on j.id = e.location_id
            left join
            brands as k on k.id = j.brands_id
            left join
            brand_shipping_charges as l on l.brand_location_id = j.id 
            where k.name = '${options.param.name}' and a.created_date between '${options.param.period}' and '${halfdate + '-' + num}' ${search}
            group by a.id  LIMIT ${options.offset}, ${options.limit};  SELECT FOUND_ROWS() AS total`, (err, record)=>{
            if(err){
                callback(err)
            }else{
                const lat  = record[0][0].lat
                const long = record[0][0].lng
                record[0].forEach(r=>{
                    currentLat = r.to_lat
                    currentLong = parseFloat(r.to_long)
                })
                if(currentLat != null && currentLong != null){
                    const Distance=[Math.round(geolib.getDistance({ latitude: currentLat, longitude: currentLong }, { latitude:lat, longitude:long }) / 1000)]
                    const distance=[];
                    Distance.forEach(d=>{
                        distance.push(d)
                    })
                var query2;
                var query1 = `SELECT  
                        a.id,
                        a.created_date,
                        a.instamojo_payment_request_id,
                        b.phone,
                        b.id as user_id,
                        c.lat,
                        c.lng,
                        CONCAT(b.fname, ' ', b.lname) AS user_name,
                        GROUP_CONCAT(e.name) AS products,
                        CONCAT(i.name,', ',h.name,', ',g.name) AS shipping_address,
                        sum(e.regular_price - e.discount_price) as price,
                        GROUP_CONCAT(distinct j.lat) AS to_lat,
                        GROUP_CONCAT(distinct j.lng) AS to_long,`
                    console.log(distance, "distancedistance", distance[0])
                if(distance[0] <= 5){
                   query1 +=  `GROUP_CONCAT(l.d_0_5_Km) AS Shipping_charges`
                } 
                else if ((distance[0] > 5) & (distance[0] <= 10 )){
                    query1 +=   `GROUP_CONCAT(l.d_5_10_Km) AS Shipping_charges`
                }
                else if ((distance[0] > 10) & (distance[0] <= 20 )){
                    query1 +=   `GROUP_CONCAT(l.d_10_20_Km) AS Shipping_charges`
                }
                else if((distance[0] > 20) &(distance[0] <= 40)){ 
                    query1 += `GROUP_CONCAT(l.d_20_40_Km) AS Shipping_charges`
                }
                else if((distance[0] > 40) & (distance[0] <= 60)){ 
                    query1 += `GROUP_CONCAT(l.d_40_60_Km) AS Shipping_charges`
                }
                else if((distance[0] > 60) & (distance[0] <=100)){ 
                    query1 +=  `GROUP_CONCAT(l.d_60_100_Km ) AS Shipping_charges`
                }
                else if(distance[0] > 100){
                    query1 +=  `GROUP_CONCAT(l.d_more_than_100_Km) AS Shipping_charges`
                }

              query1 += ` FROM
                shop_orders AS a
                   JOIN
               users AS b ON b.id = a.users_id
                   JOIN 
                    shop_user_shipping_address AS c ON c.id = a.shipping_address_id 
                       LEFT JOIN 
               shop_orders_products AS d ON d.order_id = a.id
                   LEFT JOIN 
               shop_products AS e ON e.id = d.product_id
                   LEFT JOIN 
                 countries AS g ON g.id = c.country_id
                       LEFT JOIN 
                   states AS h ON h.id = c.state_id
                       LEFT JOIN
                   cities AS i ON i.id = c.city_id
                   left join
               brand_locations as j on j.id = e.location_id
               left join
               brands as k on k.id = j.brands_id
               left join
               brand_shipping_charges as l on l.brand_location_id = j.id 
                where k.name = '${options.param.name}' and a.created_date between '${options.param.period}' and '${halfdate + '-' + num}' ${search}
                 group by a.id LIMIT ${options.offset}, ${options.limit};  SELECT FOUND_ROWS() AS total`

                connection.query(query1, (err, record1)=>{
                    if(err){
                        callback(err)
                    }else{
                        callback(false, {record1:record1[0], total:record1[1][0].total})
                    }
                  })
            }
        }
    })
    }

    module.getLocationrecordfirst = (options, callback) =>{
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (j.name like ${keyword} OR  (e.regular_price - e.discount_price) like ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }

        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        month(a.created_date) as month,
        j.id, group_concat(a.id) as orders, j.name,
        year(a.created_date) as year,
            sum(e.regular_price - e.discount_price) AS sub_total,
            CONCAT(DATE_FORMAT(a.created_date,'%Y-%m-'),IF(DAY(a.created_date)<16,'01','15'))
                        + INTERVAL 0 DAY as period,
            COUNT(DISTINCT a.id) AS count
            FROM
            shop_orders AS a
                JOIN users AS b ON b.id = a.users_id
                JOIN shop_user_shipping_address AS c ON c.id = a.shipping_address_id 
                LEFT JOIN shop_orders_products AS d ON d.order_id = a.id
                LEFT JOIN shop_products AS e ON e.id = d.product_id
                LEFT JOIN brand_locations as j on j.id = e.location_id 
                where j.id = ${options.brandId} ${search} GROUP BY month(a.created_date), year(a.created_date), 
                CONCAT(DATE_FORMAT(a.created_date,'%Y-%m-'),
                IF(DAY(a.created_date)<16,'01','15'))
                + INTERVAL 0 DAY order by period desc LIMIT ${options.offset}, ${options.limit}; SELECT FOUND_ROWS() AS total`, (err, firstrecord)=>{
                if(err){
                    console.log(err)
                    callback(err)
                }else{
                    callback(false, {record:firstrecord[0], total:firstrecord[1][0].total})  
                }
            })
    }

    module.getLocationrecord = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (k.name like ${keyword} OR  (e.regular_price - e.discount_price) like ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if(options.day == 01){
            var num = 16
        }
        if(options.day == 15){
            var num = 31
        }
        var halfdate = options.year + "-"+ options.month 

        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
                j.id,
                j.name ,
                sum(e.regular_price - e.discount_price) as price,
                GROUP_CONCAT(a.id) as total_order,
                COUNT(DISTINCT a.id) AS count
            FROM
            shop_orders AS a
                JOIN
            users AS b ON b.id = a.users_id
                JOIN 
            shop_orders_products AS d ON d.order_id = a.id
                LEFT JOIN 
            shop_products AS e ON e.id = d.product_id
                LEFT JOIN 
            brand_locations as j on j.id = e.location_id
            left join
            brands as k on k.id = j.brands_id
            where a.created_date between '${options.param.period}' and '${halfdate + '-' + num}' ${search} group by j.id LIMIT ${options.offset}, ${options.limit};  SELECT FOUND_ROWS() AS total`, (err, record)=>{
                if(err){
                    callback(err)
                }else{
                    callback(false, {record:record[0], total:record[1][0].total})
                }
            })
    }

    module.getLocationOrderRecord = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (j.name like ${keyword} OR  (e.regular_price - e.discount_price) like ${keyword} OR b.fname like ${keyword} OR b.phone like ${keyword} OR i.name like ${keyword} OR h.name like ${keyword} OR g.name like ${keyword} OR a.instamojo_payment_request_id like ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if(options.day == 01){
            var num = 16
        }
        if(options.day == 15){
            var num = 31
        }
        var halfdate = options.year + "-"+ options.month 

        connection.query(`SELECT  SQL_CALC_FOUND_ROWS
            a.id,
            a.created_date,
            a.instamojo_payment_request_id,
            b.phone,
            b.id as user_id,
            c.lat,
            c.lng,
        CONCAT(b.fname, ' ', b.lname) AS user_name,
        GROUP_CONCAT(e.name) AS products,
        CONCAT(i.name,', ',h.name,', ',g.name) AS shipping_address,
        sum(e.regular_price - e.discount_price) as price,
        GROUP_CONCAT(distinct j.lat) AS to_lat,
        GROUP_CONCAT(distinct j.lng) AS to_long,
        GROUP_CONCAT(DISTINCT l.id) AS Shipping_charges
        FROM
        shop_orders AS a
            JOIN
        users AS b ON b.id = a.users_id
            JOIN 
        shop_user_shipping_address AS c ON c.id = a.shipping_address_id 
            LEFT JOIN 
        shop_orders_products AS d ON d.order_id = a.id
            LEFT JOIN 
        shop_products AS e ON e.id = d.product_id
            LEFT JOIN 
        countries AS g ON g.id = c.country_id
                LEFT JOIN 
        states AS h ON h.id = c.state_id
            LEFT JOIN
        cities AS i ON i.id = c.city_id
        left join
        brand_locations as j on j.id = e.location_id
        left join
        brands as k on k.id = j.brands_id
        left join
        brand_shipping_charges as l on l.brand_location_id = j.id 
        where j.id = ${options.param.locationId} and a.created_date between '${options.param.period}' and '${halfdate + '-' + num}' ${search}
        group by a.id  LIMIT ${options.offset}, ${options.limit};  SELECT FOUND_ROWS() AS total`, (err, record)=>{
        if(err){
            console.log(err)
            callback(err)
        }else{
            
            if(record[0].length){
                const lat  = record[0][0].lat
                const long = record[0][0].lng
                record[0].forEach(r=>{
                    currentLat = r.to_lat
                    currentLong = parseFloat(r.to_long)
                })
                if(currentLat != null && currentLong != null){
                    const Distance=[Math.round(geolib.getDistance({ latitude: currentLat, longitude: currentLong }, { latitude:lat, longitude:long }) / 1000)]
                    const distance=[];
                    Distance.forEach(d=>{
                    distance.push(d)
                    })
                var query2;
                var query1 = `SELECT  SQL_CALC_FOUND_ROWS
                        a.id,
                        a.created_date,
                        a.instamojo_payment_request_id,
                        b.phone,
                        b.id as user_id,
                        c.lat,
                        c.lng,
                        CONCAT(b.fname, ' ', b.lname) AS user_name,
                        GROUP_CONCAT(e.name) AS products,
                        CONCAT(i.name,', ',h.name,', ',g.name) AS shipping_address,
                        sum(e.regular_price - e.discount_price) as price,
                        
                        GROUP_CONCAT(distinct j.lat) AS to_lat,
                        GROUP_CONCAT(distinct j.lng) AS to_long`
                    console.log(distance[0])
                if(distance[0] <= 5){
                query1 +=  `,GROUP_CONCAT(DISTINCT l.d_0_5_Km) AS Shipping_charges`
                } 
                else if ((distance[0] > 5) & (distance[0] <= 10 )){
                    query1 +=   `,GROUP_CONCAT(DISTINCT l.d_5_10_Km) AS Shipping_charges`
                }
                else if((distance[0] > 10) &(distance[0] <= 20)){ 
                    query1 += `,GROUP_CONCAT(DISTINCT l.d_10_20_Km) AS Shipping_charges`
                }
                else if((distance[0] > 20) & (distance[0] <= 40)){ 
                    query1 += `,GROUP_CONCAT(DISTINCT l.d_20_40_Km) AS Shipping_charges`
                }
                else if((distance[0] > 40) & (distance[0] <= 60)){ 
                    query1 +=  `,GROUP_CONCAT(DISTINCT l.d_40_60_Km ) AS Shipping_charges`
                }
                else if((distance[0] > 60) & (distance[0] <= 100)){
                    query1 +=  `,GROUP_CONCAT(DISTINCT l.d_60_100_Km) AS Shipping_charges`
                }
                else if(distance[0] > 100){
                    query1 +=  `,GROUP_CONCAT(DISTINCT l.d_more_than_100_Km) AS Shipping_charges`
                }

            query1 += ` FROM
                shop_orders AS a
                JOIN
            users AS b ON b.id = a.users_id
                JOIN 
                    shop_user_shipping_address AS c ON c.id = a.shipping_address_id 
                    LEFT JOIN 
            shop_orders_products AS d ON d.order_id = a.id
                LEFT JOIN 
            shop_products AS e ON e.id = d.product_id
                LEFT JOIN 
                countries AS g ON g.id = c.country_id
                    LEFT JOIN 
                states AS h ON h.id = c.state_id
                    LEFT JOIN
                cities AS i ON i.id = c.city_id
                left join
            brand_locations as j on j.id = e.location_id
            left join
            brands as k on k.id = j.brands_id
            left join
            brand_shipping_charges as l on l.brand_location_id = j.id 
                where j.id = ${options.param.locationId} and a.created_date between '${options.param.period}' and '${halfdate + '-' + num}' ${search}
                group by a.id  LIMIT ${options.offset}, ${options.limit};  SELECT FOUND_ROWS() AS total`

                console.log(query1, "qqqqqqqqqqqqqqqqqqqq")
                connection.query(query1, (err, record1)=>{
                    if(err){
                        console.log(err)
                        callback(err)
                    }else{
                        // console.log(record1, " 444444444444444")
                        callback(false, {record1:record1[0], total:record1[1][0].total})
                    }
                })
                }
            }else{
                console.log(record, " uuuuuuuuuuuuuu")
                callback(false, {record1:record[0], total:record[1][0].total})
            }
    }
})
}

module.getAllLocationProduct = (options, callback) =>{
    connection.query(`SELECT
    f.*,
    a.name as category,
    b.name as subcategory, g.file_name,
    c.name as subsubcategory
    FROM shop_categories as a
    INNER JOIN shop_categories as b ON b.parent_id = a.id
    INNER JOIN shop_categories as c ON c.parent_id = b.id
    INNER JOIN shop_product_categories as d ON d.category_id = c.id
    INNER JOIN global_product_management as e ON e.id = d.product_id
    INNER JOIN shop_products as f ON f.globalproduct_id = e.id
    left join shop_product_images as g on g.product_id = f.id and g.is_featured = 1
    WHERE f.location_id = ? AND f.is_deleted = 0;`,[options.locationId], (err, products) =>{
        if(err){
            callback(err)
        }else{
            callback(false, products)
        }
    })
}

module.getAllProductReview = (options, callback) =>{
    connection.query(`select a.*,  CONCAT(b.fname, ' ', b.lname) AS user_name from product_review as a left join users as b on b.id = a.users_id where product_id = ${options.productId}`, (err, review) =>{
        if(err){
            callback(err)
        }else{
            callback(false, review)
        }
    })
}

module.getbrand = (options, callback) =>{
    connection.query(`select * from brand_locations where id = ${options.locationId}`, (err, data) =>{
        if(err){
            callback(err)
        }else{
            callback(false, data)
        }
    })
}

module.getProductBySubCategory = (options, callback) => {
    var search = ``
    if (options.search) {
        var keyword = connection.escape(`%${options.search}%`);
        search = ` AND (a.id LIKE ${keyword} OR a.name LIKE ${keyword} OR a.description LIKE ${keyword})`;
    }
    var orderBy = ``;
    if (options.orderByColumn) {
        orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
    }
    connection.query(`SELECT SQL_CALC_FOUND_ROWS
    a.*, b.files
    FROM global_product_management AS a 
    left join global_product_images as b on b.global_product_id = a.id
    left join shop_product_categories as c on c.product_id = a.id
    WHERE a.is_deleted= 0 and c.category_id = ${options.categoryId} ${search} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, products) => {
        callback(err, { total: products[1][0].total, products: products[0] })
    })
}

module.GetDealsProducts = (options, callback) => {
    var search = ``
    if (options.search) {
        search = ' ( (a.name LIKE "%' + options.search + '%") OR (a.sku LIKE "%' + options.search + '%") OR (a.id LIKE "%' + options.search + '%") OR (d.name LIKE "%' + options.search + '%") OR (b.name LIKE "%' + options.search + '%") OR (cc.start_date LIKE "%' + options.search + '%") OR (cc.end_date LIKE "%' + options.search + '%")) AND ';
    }    
 
    connection.query(`SELECT SQL_CALC_FOUND_ROWS
                    a.id, a.name, e.file_name,
                    j.files as image, b.name as location,d.name as shop,
                    cc.start_date, cc.end_date
                FROM shop_products AS a
                inner join deals_of_the_day as cc on cc.product_id = a.id
                inner join brand_locations as b on b.id = cc.shop_id
                inner join brands as d on d.id = cc.brands_id
                left join global_product_images as j on j.global_product_id = a.globalproduct_id
                LEFT JOIN shop_product_images AS e ON e.product_id = a.id AND e.is_featured = 1
            WHERE ${search}  a.id IS NOT NULL AND a.is_deleted = 0  AND a.location_id=${options.locationId}  
             LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, (err, products) => {
               console.log(err)
                callback(err, { total: products[1][0].total, products: products[0] })
            })
}

module.addDealsProduct = (options, callback) =>{
    connection.query(`Insert into deals_of_the_day set product_id = ${options.productId}, shop_id = ${options.shopId}, brands_id = ${options.brandId}, start_date = '${options.startDate}', end_date = '${options.endDate}'`,(err) =>{
        if(err){
            console.log(err)
            callback(err)
        }else{
            callback(false)
        }
    })
}

module.deleteDealsProduct = (options, callback) =>{
    connection.query(`Delete from deals_of_the_day where product_id = ${options.id}`, (err) =>{
        if(err){
            callback(err)
        }else{
            callback(false)
        }
    })
}

module.GetProductAll1 = (options, callback) => {
    connection.query(`SELECT 
                a.id, a.name
            FROM 
                shop_products AS a
            LEFT JOIN 
                deals_of_the_day AS cc ON cc.product_id = a.id
            WHERE   
                a.is_deleted = 0 
                AND a.user_id = ${options.userId}  
                AND a.location_id = ${options.locationId}
                AND cc.product_id IS NULL`, (err, products) => {
               console.log(err)
                callback(err, { products: products })
            })
}


module.UpdateImage = (options, callback) =>{
    connection.query(`UPDATE global_product_images SET files = ? WHERE global_product_id = ?`, [options.images[0].fileName, options.productId], (err, result) => {
        if(err){
            callback(err)
        }else{
            callback(false)
        }
    })
}

    return module;
};
module.exports = Assets;