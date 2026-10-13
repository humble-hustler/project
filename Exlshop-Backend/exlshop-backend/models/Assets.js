const { options, search } = require("../routes/app/assets");
const Assets = (connection, logger) => {
    const module = {}

module.ImportProducts=(options,callback)=>{
    var values = []
    options.post.forEach((p) => {
        values.push([p.name, p.description, options.user_id, options.locationId, p.globalid, p.quantity, p.returnable, p.days?p.days:null])
    })
    connection.query(`INSERT INTO shop_products(name, description, user_id, location_id,
        globalproduct_id, quantity, is_returnable, returnable_days) VALUES ?`, [values], (err, data) => {
        if (err) {
            callback(err)
        } else {
            callback(false, data);
        }
    })   
}
    module.AddDuplicateProduct = (options, callback) => {
        connection.query(`SELECT * FROM shop_products WHERE id = ?`,[options.product_id],(err, productdetails) => {
        connection.query(`INSERT INTO shop_products
        ( name, description, regular_price, discount_price, user_id, location_id, globalproduct_id, discount_percentage)
        values(?,?,?,?,?,?,?,?)`,
        [productdetails[0].name,productdetails[0].description,productdetails[0].regular_price,productdetails[0].discount_price,productdetails[0].user_id,productdetails[0].location_id,productdetails[0].globalproduct_id,productdetails[0].discount_percentage] ,(err, productdata) => {
            callback(err, productdata)
        })            
    })
    }
    module.get_images=(options,callback)=>{
        connection.query(`SELECT * FROM shop_product_images WHERE product_id = ?`,[options.product_id], (err, images) => {
            callback(err, images)
        })  
    }

    module.AddDuplicateProductImage=(options,callback)=>{
        connection.query(`SELECT * FROM shop_product_images WHERE product_id = ?`,[options.product_id], (err, images) => {
            if(images.length) {
                var valuesNestedArray  = [];
                images.forEach((i) => {
                    valuesNestedArray.push([options.insert_id, i.file_name, i.is_featured]);
                })
                connection.query(`INSERT INTO shop_product_images ( product_id, file_name, is_featured) values ?`, [valuesNestedArray] ,(err, imagedata) => {
                        callback(err, images)
                })
            } else {
                callback(false)
            }
        })  
    }

    module.GetCategories = (options, callback) => {
        connection.query(`SELECT * FROM shop_categories WHERE parent_id = 0`, (err, categories) => {
            callback(err, categories)
        })
    }

    module.Category_Check=(options,callback)=>{
        connection.query(`SELECT * FROM shop_categories WHERE name='${options.new_cat_val}'`,(err,category_check_details)=>{
            callback(err, category_check_details)
        })
    }

    module.SubCategory_Check=(options,callback)=>{
        connection.query(`SELECT * FROM shop_categories WHERE name='${options.new_subcat_val}'`,(err,subcategory_check_details)=>{
            callback(err, subcategory_check_details)
        })   
    }

    module.SubSubCategory_Check=(options,callback)=>{
        connection.query(`SELECT * FROM shop_categories WHERE name='${options.new_subsubcat_val}'`,(err,subsubcategory_check_details)=>{
            callback(err, subsubcategory_check_details)
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

    module.Check_Sku=(options,callback)=>{
        connection.query(`SELECT * FROM shop_products where sku='${options.sku_val}'`, (err, product_details) => {
            if (err) {
                callback(err)
            } else {
                callback(false, product_details)
            }
        }) 
    }

    module.Shopadmin_Delivery=(options,callback)=>{
        connection.query(`INSERT INTO shop_order_delivery SET  pickup_date='${options.pickup_date}', pickup_time='${options.pickup_time}', pickup_location='${options.pickup_location}', order_id=${options.order_id}, staff_id=${options.staff_id}`, (err, Shopadmin_Delivery) => {
            if (err) {
                callback(err)
            } else {
                callback(false, Shopadmin_Delivery)
            }
        }) 
    }

   module.SendRequest= (options, callback) => {
    var insertPath
    if(options.file){
        var File = options.file
        var path = options.file.name
        File.mv('./public/request-product-image/' + path)
        insertPath = '/public/request-product-image/' + path
    }else{
        insertPath = null
    }
    
    connection.query(`INSERT INTO product_request SET name=?, description = ?, category = ?, 
    subcategory = ?, subsubcategory = ?, new_category = ?, new_subcategory = ?, new_subsubcategory = ?, users_id = ?, location_id = ?, request_file_name = ?`,
    [options.name, options.description, options.categoryId, options.subcategoryId, options.sub_subcategoryId,
        options.new_categoryId, options.new_subcategoryId, options.new_sub_subcategoryId, options.userId, options.locationId, insertPath], (err, data) => {
        callback(err, data)
    })
}

module.getSize = (options, callback) => {
    connection.query(`SELECT * FROM admin_exlshop.m_size;`, (err, data) => {
        callback(err, data)
    })
}

module.getColor =(options, callback) => {
    connection.query(`SELECT * FROM m_color;`, [options.name, options.description, options.categoryId, options.subcategoryId, options.sub_subcategoryId], (err, data) => {
        callback(err, data)
    })
}

module.check_DuplicateProduct=(options,callback)=>{
    connection.query(`SELECT *  FROM admin_exlshop.product_request where name=?`, [options.name], (err, data) => {
        callback(err, data)
    })
}

    module.Add = (options, callback) => {
        connection.query(`INSERT INTO asset_inventory SET brand_locations_id = ?, asset_name = ?, equipment_type_id = ?, purchase_date = ?, purchase_value = ?, warranty_months = ?, manufacturer = ?, model = ?, serial_number = ?, vendor_id = ?, category = ?`, [options.locationId, options.name, options.equipmentType, options.purchaseDate, options.purchaseValue, options.warrantyMonths, options.manufacturer, options.model, options.serialNumber, options.vendorId, options.category], (err, data) => {
            callback(err, data.insertId)
        })
    }

    module.GetByLocation = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.asset_name LIKE ${keyword} OR a.manufacturer LIKE ${keyword} OR b.name LIKE ${keyword})`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if(options.category){
            search += ` AND a.category = ${options.category} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    a.id,
    a.asset_name,
    a.manufacturer,
    a.purchase_date,
    a.warranty_months,
    IF(DATE_ADD(a.purchase_date,
            INTERVAL a.warranty_months MONTH) < NOW(),
        1,
        0) AS warranty_expired,
    b.name,
    GROUP_CONCAT(c.file_path) AS file_paths,
    a.category
    FROM asset_inventory AS a
        LEFT JOIN wo_equipment_master AS b ON b.id = a.equipment_type_id 
        LEFT JOIN  asset_uploads AS c ON c.asset_id = a.id 
    WHERE a.brand_locations_id = ? AND a.is_deleted = 0 ${search} GROUP BY a.id  ${orderBy}  LIMIT ${options.offset}, ${options.limit} ;SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, assets) => {
            callback(err, {total: assets[1][0].total, assets: assets[0]})
        })
    }

    module.GetSingleAsset = (options, callback) => {
        connection.query(`SELECT asset_inventory.*,wo_equipment_master.name as equipment_name,vendor.vendor_name, vendor.vendor_gst    
            FROM asset_inventory LEFT JOIN wo_equipment_master ON wo_equipment_master.id = asset_inventory.equipment_type_id
            LEFT JOIN vendor ON vendor.id = asset_inventory.vendor_id
            WHERE asset_inventory.id = ?`, [options.id], (err,asset) => {
            if(err){
                callback(err)
            }else{
                callback(err,asset[0])
            }
        })
    }
    
    module.Updatee = (options, callback) => {
        connection.query(`UPDATE asset_inventory SET asset_name = ?, equipment_type_id = ?, purchase_date = ?, purchase_value = ?, warranty_months = ?, manufacturer = ?, model = ?, serial_number = ?, vendor_id = ? , category = ? WHERE id = ?`, [ options.name, options.equipmentType, options.purchaseDate, options.purchaseValue, options.warrantyMonths, options.manufacturer, options.model, options.serialNumber, options.vendorId, options.category, options.id], (err) => {
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }
    module.Update = (options, callback) => {
         var discount_percentage=((options.discountPrice*100)/options.regularPrice)
        connection.query(`UPDATE shop_products SET quantity=?, sku = ?, name = ?, description = ?, regular_price = ?, discount_price = ? ,discount_percentage=?, is_returnable=?, returnable_days=? WHERE id = ?`,
         [options.quantity, options.sku, options.name, options.description, options.regularPrice, options.discountPrice, discount_percentage,  options.isreturnable, options.daystoreturn, options.productId,], (err,result) => {
           if(err){
            callback(err)
           }
           else{
            callback(false, result)   
           }
        })
    }
    module.AddFiles = (options, callback) => {
        connection.query(` INSERT INTO asset_uploads (asset_id, file_path) VALUES (?, ?) `, [options.id, options.filename], (err) => {
            callback(err)
        })
    }
    module.GetSingle = (options, callback) => {
        connection.query(`SELECT a.* FROM shop_products AS a WHERE a.id = ? AND a.is_deleted= 0`, [options.productId], (err, product) => {
            callback(err, product[0])
        })
    }

    module.Delete = (options, callback) => {
        connection.query(`UPDATE shop_products SET is_deleted =  1 WHERE id = ? `, [options.id], (err) => {
            callback(err)
        })
    }

    module.GetGlobalProducts = (options,callback) => {
        connection.query(`select a.*,c.name as category,c.slug from  global_product_management as a
        inner join shop_product_categories as b
        on a.id=b.product_id 
        inner join shop_categories as c
        on b.category_id=c.id
         where is_deleted =0`,  (err,products) => {
                callback(false,products)
        })
    }

    module.ProductsByCatid= (options,callback) => {
        connection.query(`select a.*,c.name as category,c.slug from  global_product_management as a
        inner join shop_product_categories as b
        on a.id=b.product_id 
        inner join shop_categories as c
        on b.category_id=c.id
         where a.is_deleted =0 and c.id=?`, [options.catId], (err,products) => {
                callback(false,products)
        })
    }

    module.ProductsByMainCat= (options,callback) => {
        connection.query(`SELECT
        f.*, a.id as catId,
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
        WHERE f.location_id = ? AND f.is_deleted = 0 and a.id = ?`, [options.locationId, options.mainCatId], (err,products) => {
            if(err){
                console.log(err)
                callback(err)
            } else {
                callback(false,products)
            }
        })
    }

    module.ProductsByFilter= (options,callback) => {
        connection.query(`select a.*,c.name as category,c.slug from  global_product_management as a
        inner join shop_product_categories as b
        on a.id=b.product_id 
        inner join shop_categories as c
        on b.category_id=c.id
         where a.is_deleted =0 and c.id=?`, [options.catId], (err,products) => {
                callback(false,products)
        })
    }

    module.subCategories = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.name LIKE ${keyword} OR a.name LIKE ${keyword})`
        }
        connection.query(`select SQL_CALC_FOUND_ROWS a.*, b.name as parent_name from shop_categories as a 
        inner join shop_categories as b on b.id = a.parent_id
        where a.parent_id in (1, 2, 3, 4, 191) ${search}
        LIMIT ${options.offset}, ${options.limit}; SELECT FOUND_ROWS() AS total;`, (err, subCategories) =>{
            if(err){
                callback(err)
            }else{
                callback(false, {total: subCategories[1][0].total, subCategories: subCategories[0]})
            }
        })
    }

    module.subsubCategories = (options, callback) =>{
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (s3.name LIKE ${keyword} OR s2.name LIKE ${keyword} OR s1.name LIKE ${keyword})`
        }

        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        s3.id AS sub_sub_category_id,
        s3.parent_id AS sub_category_id,
        s2.parent_id AS parent_category_id,
        s3.name AS sub_sub_category_name, s3.slug,
        s2.name AS sub_category_name,
        s1.name AS parent_category_name
    FROM 
        shop_categories AS s1 
    JOIN 
        shop_categories AS s2 ON s1.id = s2.parent_id 
    JOIN 
        shop_categories AS s3 ON s2.id = s3.parent_id 
    WHERE 
        s3.parent_id IS NOT NULL ${search} LIMIT ${options.offset}, ${options.limit}; SELECT FOUND_ROWS() AS total;`, (err, subsubCategories) =>{
            if(err){
                callback(err)
            }else{
                callback(false, {total: subsubCategories[1][0].total, subsubCategories: subsubCategories[0]})
            }
        })
    }

    module.delete_sub_category = (options, callback) =>{
        connection.query(`select * from shop_categories where id = ${options.sub_category_id}`, (err, data)=>{
            if(err){
                callback(err)
            }else{
                connection.query(`DELETE from shop_categories where id = ${options.sub_category_id}`,(err)=>{
                    if(err){
                        callback(err)
                    }else{
                        connection.query(`Insert into deleted_shop_categories set name = '${data[0].name}', slug = '${data[0].slug}', parent_id = ${data[0].parent_id}, existing_id = ${data[0].id}, is_sub_sub = ${options.is_sub_sub}`, (err) =>{
                            if(err){
                                callback(err)
                            }else{
                                // callback(false)
                                connection.query(`select * from shop_categories where parent_id = ${options.sub_category_id}`, (err, subsubCat)=>{
                                    if(err){
                                        callback(err)
                                    }else{
                                        if(subsubCat.length > 0){
                                            connection.query(`DELETE from shop_categories where parent_id = ${options.sub_category_id}`,(err)=>{
                                                if(err){
                                                    callback(err)
                                                }else{
                                                    var values = []
                                                    subsubCat.forEach((s) =>{
                                                        values.push([s.name, s.slug, options.sub_category_id, s.id, 1])
                                                    })
    
                                                    connection.query(`INSERT into deleted_shop_categories (name, slug, parent_id, existing_id, is_sub_sub) VALUES ?`, [values], (err) =>{
                                                        if(err){
                                                            callback(err)
                                                        }else{
                                                            callback(false)
                                                        }
                                                    })
                                                }
                                            })
                                        }else{
                                            callback(false)
                                        }
                                       
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }

    module.delete_sub_sub_category = (options, callback) =>{
        connection.query(`select * from shop_categories where id = ${options.sub_sub_category_id}`, (err, data)=>{
            if(err){
                callback(err)
            }else{
                connection.query(`DELETE from shop_categories where id = ${options.sub_sub_category_id}`,(err)=>{
                    if(err){
                        callback(err)
                    }else{
                        connection.query(`Insert into deleted_shop_categories set name = '${data[0].name}', slug = '${data[0].slug}', parent_id = ${data[0].parent_id}, existing_id = ${data[0].id}, is_sub_sub = ${options.is_sub_sub}`, (err) =>{
                            if(err){
                                callback(err)
                            }else{
                                callback(false)
                            }
                        })
                    }
                })
            }
        })
    }

    module.deletedCategories = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` where (a.name LIKE ${keyword} OR a.slug LIKE ${keyword} OR b.name LIKE ${keyword})`
        }
        
        connection.query(`SELECT SQL_CALC_FOUND_ROWS 
                a.*,
                CASE
                    WHEN a.is_sub_sub = 0 THEN b.name
                    ELSE COALESCE(c1.name, a1.name, e1.name)
                END AS category,
                CASE
                    WHEN a.is_sub_sub = 1 THEN COALESCE(a1.name, d1.name)
                    ELSE null
                END AS sub_category
            FROM
                deleted_shop_categories AS a
            LEFT JOIN
                shop_categories AS b ON b.id = a.parent_id
            LEFT JOIN
                deleted_shop_categories AS a1 ON a1.existing_id = a.parent_id
            LEFT JOIN
                shop_categories AS c1 ON c1.id = a1.parent_id AND a1.is_sub_sub = 0
            LEFT JOIN
                shop_categories AS d1 ON d1.id = a.parent_id AND a.is_sub_sub = 1
            LEFT JOIN
                shop_categories AS e1 ON e1.id = d1.parent_id
                where a.is_sub_sub = 1
                ${search}
                LIMIT ${options.offset}, ${options.limit}; SELECT FOUND_ROWS() AS total;`, (err, deletedCategories) =>{
                    if(err){
                        callback(err)
                    }else{
                        callback(false, {total: deletedCategories[1][0].total, deletedCategories: deletedCategories[0]})
                    }
                })
    }

    module.addCategory = (options, callback) =>{
        connection.query(`Insert into shop_categories set name = '${options.category_name}', slug = '${options.category_name}', parent_id = ${options.category_id}`, (err) =>{
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    module.AddNewSize = (options, callback) =>{
        connection.query(`Insert into m_size set name = '${options.size}'`, (err, data)=>{
            if(err){
                callback(err)
            }else{
                callback(false, data.insertId)
            }
        })
    }

    module.AddNewColor = (options, callback) =>{
        connection.query(`Insert into m_color set name = '${options.color}'`, (err, data)=>{
            if(err){
                callback(err)
            }else{
                callback(false, data.insertId)
            }
        })
    }
    
    module.getColors = (options, callback) => {
        connection.query(`SELECT * FROM admin_exlshop.m_color;`, (err, data) => {
            callback(err, data)
        })
    }

    

    return module;
};
module.exports = Assets;