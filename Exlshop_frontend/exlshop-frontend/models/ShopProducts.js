const { options } = require("../routes");
const {SphericalUtil, PolyUtil} = require("node-geometry-library");
const geolib = require('geolib')
const async = require("async");
const { error } = require("../logger");

const ShopProducts = (connection, logger) => {
    const module = {}
    module.User_Details=(options,callback)=>{
        connection.query(`SELECT  a.* FROM users AS a WHERE a.id = ? ;`,[options.userId] ,(err, user_details) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(false, user_details)
                    }
                }) 
       }

       module.GetProduct = (options,callback)=>{
        connection.query(` SELECT 
            a.id as p_id,a.product_type, a.name,a.regular_price,a.discount_price,a.discount_percentage,
            g.lat,g.lng,g.delivery_choice,g.brands_id as brand,
            g.name as location_name,
            b.file_name,
            e.slug, g.minimum_order_amount,
            f.*
        FROM
            shop_products AS a
                inner JOIN shop_product_images AS b ON b.product_id = a.id
                AND b.is_featured = 1
                inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
                inner JOIN shop_categories AS e ON e.id = d.category_id
                inner join brand_location_users as f on 
                f.brand_locations_id=a.location_id AND f.users_id=a.user_id
                inner join brand_locations as g on 
                g.id = a.location_id
                where a.id=?  limit 1`, [options.productId], (err, product) => {
            callback(err, product)
        })
    }
    
   module.GetOrders=(options,callback) =>{
       connection.query(`SELECT SQL_CALC_FOUND_ROWS  
       a.id,a.created_date,a.instamojo_payment_request_id,
       CONCAT(b.fname, ' ', b.lname) AS user_name,
       b.email,b.phone,b.id as user_id, d.order_status,
       c.label AS address_label,c.name AS address_name,c.address_line_1,c.address_line_2,c.phone,c.zip,
       j.amount,
       GROUP_CONCAT(e.name, ' ') AS products,
       CONCAT(i.name,', ',h.name,', ',g.name) AS shipping_address
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
   LEFT JOIN shop_payment_request AS j ON j.instamojo_payment_request_id=a.instamojo_payment_request_id
       LEFT JOIN 
   countries AS g ON g.id = c.country_id
       LEFT JOIN 
   states AS h ON h.id = c.id
       LEFT JOIN
   cities AS i ON i.id = c.city_id
   WHERE b.id=? AND   a.id IS NOT NULL GROUP BY a.id ,j.amount`,[options.userId],(err,getorders)=>{
    if (err) {
        callback(err)
    } else {
        callback(false, getorders)
    }
    })
   }

    module.ShopSearch=(options,callback) =>{
        connection.query(`select  a.name AS brands_name,
        a.id as brands_id,
        b.id as brand_location_id,
        b.name as location_name,
        b.brand_logo,
        b.id as location_id,
        CONCAT(b.lat, ',' ,b.lng) AS latlong,
        AVG (CASE WHEN (NOT ISNULL(d.stars)) THEN d.stars ELSE 0 END) as stars,
        COUNT(c.location_id) as count,
        CONCAT(b.address_line_1, ', ' ,b.address_line_2) AS address
        from brands as a
        inner join brand_locations as b on b.brands_id = a.id
        inner join shop_products as c on c.location_id = b.id
        left join shop_rate as d on d.shop_id = b.id
        where a.name LIKE '%${options.search}%'  AND b.is_active = 1 AND c.is_available = '1' GROUP BY(c.location_id)`, (err, shop_details) => {
                if (err) {
                    callback(err)
                } else {
                    async.eachSeries(shop_details, (s, cb) =>{
                        connection.query(`select brand_location_id from user_shop_wishlist where users_id = ? and brand_location_id = ?`, [options.userId, s.location_id], (err, wishlistShop) =>{
                            if(err){
                                cb(err)
                            }else{
                                if(wishlistShop.length){
                                    s.wishlist = 1 
                                }else{
                                    s.wishlist = 0
                                }
                                cb()
                            }
                        })
                    },(err, result) => {
                        if(err){
                            console.log(err)
                        }else{
                            callback(false, shop_details)
                        }
                    })
                }
            })
    }

    module.ShopSearchforApp=(options,callback) =>{
        connection.query(`select  a.name AS brands_name,
        a.id as brands_id,
        b.id as brand_location_id,
        b.name as location_name,
        b.brand_logo,
        b.id as location_id,
        CONCAT(b.lat, ',' ,b.lng) AS latlong,
        b.lat, b.lng,
        group_concat(distinct g.id) as users,
        AVG (CASE WHEN (NOT ISNULL(d.stars)) THEN d.stars ELSE 0 END) as stars,
        COUNT(c.location_id) as count, group_concat(distinct c.user_id) as user_id,
        CONCAT(b.address_line_1, ', ' ,b.address_line_2) AS address, group_concat(distinct l.phone) as admin_phone
        from brands as a
        inner join brand_locations as b on b.brands_id = a.id
        inner join shop_products as c on c.location_id = b.id
        left join shop_rate as d on d.shop_id = b.id
        left join brand_location_users as e on e.brand_locations_id = b.id
        left join user_roles as f on f.users_id = e.users_id and f.roles_id = 2
        left join users as g on g.id = e.users_id and g.is_active = 1 and g.is_deleted = 0
        left join users as l on l.id = c.user_id
        where a.name LIKE '%${options.search}%'  AND b.is_active = 1 AND c.is_available = '1' GROUP BY(c.location_id)`, (err, shop_details) => {
                if (err) {
                    console.log(err)
                    callback(err)
                } else {
                    async.eachSeries(shop_details, (s, cb) =>{
                        const lat  = options.lat
                        const long = options.lng
                        if(lat != null && long != null){
                            const Distance=[Math.round(geolib.getDistance({ latitude: lat, longitude: long }, { latitude: s.lat, longitude: s.lng }) / 1000)]
                            Distance.forEach(d=>{
                            s.distance = d
                            })
                        }
                        connection.query(`select brand_location_id from user_shop_wishlist where users_id = ? and brand_location_id = ?`, [options.userId, s.location_id], (err, wishlistShop) =>{
                            if(err){
                                cb(err)
                            }else{
                                if(wishlistShop.length){
                                    s.wishlist = 1 
                                }else{
                                    s.wishlist = 0
                                }
                                cb()
                            }
                        })
                    },(err, result) => {
                        if(err){
                            console.log(err)
                        }else{
                            callback(false, shop_details)
                        }
                    })
                }
            })
    }

    module.ProductSearch=(options,callback) =>{
        connection.query(`SELECT 
        a.id,
         a.product_type,
         a.name,
         b.file_name,
         a.regular_price,
         a.discount_price,
         a.location_id,
         f.name as brands_name,
         IF(a.discount_price < a.regular_price, 1, 0) AS is_discount,
         e.slug
     FROM
         shop_products AS a
             inner JOIN
         shop_product_images AS b ON b.product_id = a.id
             AND b.is_featured = 1
             inner join brand_locations AS c ON c.id = a.location_id
             inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
             inner JOIN shop_categories AS e ON e.id = d.category_id 
             inner join brands AS f ON f.id = c.brands_id
             WHERE a.is_available=1  AND a.name LIKE ? order by a.id;`,[options.search] ,(err, product_details) => {
                if (err) {
                    callback(err)
                } else {
                    callback(false, product_details)
                }
            })
    }

    module.getCategory = (options, callback) => {
        connection.query(`select *from shop_categories where parent_id= 0 ;`, (err, shop_categories) => {
            if (err) {
                callback(err)
            } else {
                callback(false, shop_categories)
            }
        })
    }

    module.ShopbyLocationCategory =(options,callback)=>{
        connection.query(`SELECT e.id,e.name,c.id,c.name,a.id,a.name,a.brands_id,b.name,a.address_line_1,a.address_line_2,a.city_id,a.state_id,a.country_id FROM brand_locations as a
        inner join brands as b on a.brands_id=b.id 
        inner join shop_products as c on c.location_id=a.id
        inner join shop_product_categories as d on d.product_id=c.id
        inner join shop_categories as e on e.id=d.category_id
        where a.name=? and e.id in(?);`, [options.location,options.cat_id], (err, searchedData) => {
            if (err) {
                callback(err)
            } else {
                callback(false, searchedData)
            }
        }) 
    }

    module.getSubCategory = (options, callback) => {
        connection.query(`select *from shop_categories where parent_id= ?;`, [options.id], (err, shop_subcategories) => {
            if (err) {
                callback(err)
            } else {
                callback(false, shop_subcategories)
            }
        })
    }
    module.getSubSubCategory = (options, callback) => {
        connection.query(`select * from shop_categories where parent_id= ?;`, [options.id], (err, shop_subsubcategories) => {
            if (err) {
                callback(err)
            } else {
                callback(false, shop_subsubcategories)
            }
        })
    }

    module.getSubCategory1 = (options, callback) => {
        connection.query(`select a.* from shop_categories  as a 
        inner join shop_product_categories as b on b.category_id = a.id where a.parent_id= ?  group by a.id;`, [options.id], (err, shop_subcategories) => {
            if (err) {
                callback(err)
            } else {
                callback(false, shop_subcategories)
            }
        })
    }
    module.getSubSubCategory1 = (options, callback) => {
        connection.query(`select a.* from shop_categories  as a 
        inner join shop_product_categories as b on b.category_id = a.id where parent_id= ?  group by a.id;`, [options.id], (err, shop_subsubcategories) => {
            if (err) {
                callback(err)
            } else {
                callback(false, shop_subsubcategories)
            }
        })
    }

    module.GetUsers = (options, callback) => {
        var isFrontFilter = ''
        connection.query(`select ur.users_id,u.fname,u.lname,u.email,u.phone,r.name  from users as u 
        inner join user_roles as ur
        on u.id=ur.users_id
        inner join roles as r
        on r.id=ur.roles_id where r.is_front =1; `, (err, users) => {
            if (err) {
                callback(err)
            } else {
                callback(false, users)
            }
        })
    }
    module.GetAll = (options, callback) => {
        var search = '';
        var cat = ''
        if (options.slug) {
            search = ' AND e.slug = "' + options.slug + '" ';
        }
        if (options.search) {
            search += ' AND a.name LIKE "%' + options.search + '%" ';
        }
        if (options.minPrice) {
            search += ' AND (a.regular_price >= ' + options.minPrice + ' OR c.regular_price >= ' + options.minPrice + ')';
        }
        if (options.maxPrice) {
            search += ' AND (a.regular_price <= ' + options.maxPrice + ' OR c.regular_price <= ' + options.maxPrice + ')';
        }
        if(options.cid){
            cat += `and e.id = ${options.cid}`;
        }
        
        connection.query(
          `SELECT 
        a.id,a.product_type,a.name,a.regular_price, a.discount_price,a.location_id,
         b.file_name,g.name as location_name,h.name as brand_name,
         IF(a.discount_price < a.regular_price, 1, 0) AS is_discount,
         e.slug,
         round(AVG(f.product_rate),1) AS avg_rate
     FROM shop_products AS a
	inner JOIN shop_product_images AS b ON b.product_id = a.id AND b.is_featured = 1
	inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
	inner JOIN shop_categories AS e ON e.id = d.category_id  
    left join product_rate as f on f.product_id= a.id
     inner join brand_locations as g on g.id = a.location_id
			inner join brands as h on h.id = g.brands_id
     WHERE a.is_available=1 and a.is_deleted=0  ${cat}
    group by  a.id,a.product_type,a.name, a.regular_price,a.discount_price,b.file_name, e.slug
	order by a.id;`,
          (err, products) => {
            callback(err, products);
          }
        );

    }

    module.get_filter_product = (options, callback) => {
        if (options.s_data == 'all' || options.s_data == 'category' || options.s_data == 'subcategory') {
            var search = '';
            if (options.search_data) {
                search += `AND a.name LIKE "%${options.search_data}%" `;
               
                connection.query(`SELECT 
                a.id,
                 a.product_type,
                 a.name,
                 b.file_name,
                 a.regular_price,
                 a.discount_price,
                 a.location_id,
                 f.name as brands_name,
                 IF(a.discount_price < a.regular_price, 1, 0) AS is_discount,
                 e.slug
             FROM
                 shop_products AS a
                     inner JOIN
                 shop_product_images AS b ON b.product_id = a.id
                     AND b.is_featured = 1
                     inner join brand_locations AS c ON c.id = a.location_id
                     inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
                     inner JOIN shop_categories AS e ON e.id = d.category_id 
                     inner join brands AS f ON f.id = c.brands_id
                     WHERE a.is_available=1 and a.is_deleted =0  ${search} order by a.id;`,(err, products) => {
                        if(err){
                            callback(err)
                        }else{
                            callback(false, products)
                        }
                })
            }
        }
        else if(options.s_data == 'shops'){
            var search ='';
            if (options.search_data) {
                search = 'AND a.name LIKE "%' + options.search_data + '%"  ' ;
            }
            connection.query(`SELECT 
            a.id,
             a.product_type,
             a.name,
             b.file_name,
             a.regular_price,
             a.discount_price,
             a.location_id,
             g.name AS brands_name,
             g.id AS brands_id,
             f.name as location_name,
             CONCAT(f.address_line_1, ', ' ,f.address_line_2) AS address,
             IF(a.discount_price < a.regular_price, 1, 0) AS is_discount,
             e.slug
         FROM
             shop_products AS a
                 inner JOIN
             shop_product_images AS b ON b.product_id = a.id
                 AND b.is_featured = 1
                 inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
                 inner JOIN brand_locations AS f ON f.id = a.location_id
                 inner Join brands AS g ON g.id = f.brands_id
                 inner JOIN shop_categories AS e ON e.id = d.category_id WHERE a.is_available=1 ${search} order by a.id;`,(err, products) => {
                callback(err, products)
            })
        }
    }

    module.SearchItems =(options,callback)=>{
        if (options.s_data == 'shops'){
            var search ='';
            if (options.search_data) {
                search = 'AND a.name LIKE "%' + options.search_data + '%"  ' ;
            }
            connection.query(`select  a.name AS brands_name,
            a.id as brands_id,
            b.name as location_name,
            b.brand_logo,
            b.id as location_id,
            COUNT(c.location_id) as count,
            CONCAT(b.address_line_1, ', ' ,b.address_line_2) AS address
            from brands as a
            inner join brand_locations as b on b.brands_id = a.id
            inner join shop_products as c on c.location_id = b.id
            ${search} AND c.is_available = '1' GROUP BY(c.location_id)`, (err,shops) => {
                if (err) {
                    callback(err)
                } else {
                    callback(false,shops);
                }
            })
        }else if(options.s_data == 'Products'){
            var search ='';
            if (options.search_data) {
                search = 'AND a.name LIKE "%' + options.search_data + '%"  ' ;
            }
            connection.query(`SELECT 
            a.id,
             a.product_type,
             a.name,
             b.file_name,
             a.regular_price,
             a.discount_price,
             a.location_id,
             g.name AS brands_name,
             g.id AS brands_id,
             f.name as location_name,
             CONCAT(f.address_line_1, ', ' ,f.address_line_2) AS address,
             IF(a.discount_price < a.regular_price, 1, 0) AS is_discount,
             e.slug
         FROM
             shop_products AS a
                 inner JOIN
             shop_product_images AS b ON b.product_id = a.id
                 AND b.is_featured = 1
                 inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
                 inner JOIN brand_locations AS f ON f.id = a.location_id
                 inner Join brands AS g ON g.id = f.brands_id
                 inner JOIN shop_categories AS e ON e.id = d.category_id WHERE a.is_available=1 ${search} order by a.id;`,(err, products) => {
                callback(err, products)
            })
        }
    }

    module.getRating = (options, callback) => {
        connection.query(`select * from user_shop_wishlist where users_id = ? and brand_location_id = ?`, [options.userId, options.location_id], (err, rating) =>{
            if(err){
                callback(err)
            }else{
                callback( false, rating)
            }
        })
    }

    module.getShopReview = (options, callback) => {
        connection.query(`select a.*,date_format(a.created_at, "%M %d %Y %T") as date, concat(b.fname , +" ", b.lname) as username
             from shop_review as a inner join users as b on b.id = a.users_id
        where a.brand_location_id = ?`, [options.location_id], (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }
    
    module.getProductByShop = (options,callback)=>{
        connection.query(`select a.*,a.location_id,d.file_name,f.slug,c.name as shop_name,b.name as location_name, g.product_rate as avg_rate from
        shop_products  as a 
        inner join brand_locations as b ON a.location_id = b.id
        inner join brands as c on c.id = b.brands_id 
        inner join shop_product_images AS d ON d.product_id = a.id
            AND d.is_featured = 1
        inner JOIN shop_product_categories AS e ON e.product_id = a.globalproduct_id
        inner JOIN shop_categories AS f ON f.id = e.category_id
        inner join product_rate as g on g.product_id = a.id
        where c.id = ?  AND  a.location_id = ? AND a.is_available = '1'`,[options.brand_id,options.location_id], (err, products) => {
                callback(err, products)
        });
    }

     module.product_category=(options,callback)=>{
        var arr=[];
        arr=options.catvalarray
        arr=((arr==undefined)?38:arr)
        connection.query(`select id,name from admin_exlshop.shop_categories as a 
        where parent_id IN (select id from admin_exlshop.shop_categories where parent_id in(${arr}));`, (err, category) => {
            callback(err, category)
            });  
     }

    module.shop_by_product_category=(options,callback)=>{
        var arr=[];
        arr=options.catvalarray
        arr=((arr==undefined)?37:arr)
        connection.query(`select  a.name AS brands_name,
        a.id as brands_id,
        b.brand_logo,
        b.id as location_id,
        COUNT(c.location_id) as count,
        CONCAT(b.address_line_1, ', ' ,b.address_line_2) AS address,
        round(AVG(f.stars),1) as stars
        from brands as a
        inner join brand_locations as b on b.brands_id = a.id
        inner join shop_products as c on c.location_id = b.id
        inner join shop_product_categories as d on d.product_id = c.id
        inner join shop_categories as e on e.id = d.category_id
        inner join shop_rate as f on f.shop_id = b.id
        where 
        (b.address_line_1 like '%warje%' OR b.address_line_2 like '%warje%') 
        AND 
        e.id IN (select id from admin_exlshop.shop_categories where parent_id in(${arr})) AND c.is_available = '1'
        GROUP BY(c.location_id);`,[], (err, category) => {
            callback(err, category)
            });  
    }

    module.GetProducts=(options, callback) => {
        var search = '';
        if (options.cat_id) {
          if (options.cat_id.length > 0) {
            search += "and d.category_id in(" + options.cat_id + ") ";
          }
        } 
        if(options.CId) {
          search += `and e.id= ${[options.CId]}`;
        }
        var arr2=options.ratingvalarray
        var search2='';
        if(arr2 != undefined){
        for(var j=0;j<arr2.length;j++){
        if(j==0){
            search2 +=`having`
        }
       { search2 += `  round(AVG(f.product_rate),1)  >= ${arr2[j]} `;
         if(j!=(arr2.length-1)){
            search2 +=`or`
         }}
         }}    
   
      if(options.percentagevalarray){
        if(options.percentagevalarray==9){
            search += ` AND (discount_percentage) <=  ${options.percentagevalarray} `;
        }else
        {search += ` AND (discount_percentage) >=  ${options.percentagevalarray} `;}
      }
     
        if (options.search) {
            search += ' and  a.name LIKE "%' + options.search + '%" ';
        }
        if (options.minPrice) {
            search += ' AND ((a.regular_price -a.discount_price) >= ' + options.minPrice + ' OR (a.regular_price -a.discount_price) >= ' + options.minPrice + ')';
        }
        if (options.maxPrice) {
            search += ' AND ((a.regular_price -a.discount_price) <= ' + options.maxPrice + ' OR (a.regular_price -a.discount_price) <= ' + options.maxPrice + ')';
        }
        var sorting=``;
        if(options.valueforsort==1){
            sorting +=`order by  round(AVG(f.product_rate),1) desc`
        }
        if(options.valueforsort==2){
            sorting +=  `order by (a.regular_price -a.discount_price)  asc`
        }
        if(options.valueforsort==3){
            sorting +=  `order by (a.regular_price -a.discount_price) desc`
        }
        if(options.valueforsort==4){
            sorting +=  `order by (a.discount_percentage) desc `
        }
      
        // var arr1 = options.catvalarray;
        // if(arr1 != undefined){
        //     for(var j=0;j<arr1.length;j++){
        //     search += ' and  e.id =' + parseInt(arr1[j]) + ' ';
        //     }
        // }

       
            connection.query(`SELECT 
            a.id,a.location_id,a.product_type,a.name,a.regular_price,a.discount_price,
            b.file_name,
            e.slug,
            i.name as brand_name,
            g.name as location_name,g.lat, g.lng, g.maximum_order_distance,
            round(AVG(f.product_rate),1) AS avg_rate,
              a.discount_percentage
        FROM
            shop_products AS a
                inner JOIN shop_product_images AS b ON b.product_id = a.id
                AND b.is_featured = 1
                inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
                inner JOIN shop_categories AS e ON e.id = d.category_id
                left join product_rate as f on f.product_id=a.id
                inner join brand_locations as g on g.id = a.location_id
                inner join brands as i on i.id = g.brands_id
                where g.is_active = 1 and a.is_deleted = 0 ${search}
                group by a.id,a.product_type,a.name,b.file_name,a.regular_price,a.discount_price,e.slug
           ${search2} ${sorting};`,[options.CId],(err, products) => {
                callback(err, products)
            })
    }

    module.GetProducts1=(options, callback) => {
       var search = '';
       if(options.catvalarray){
           search += ' and  d.category_id in('+ options.cat_id+')   AND  a.name LIKE "%' + options.header_search + '%" ';
       }else{
        search = ' and a.name LIKE "%' + options.header_search + '%" ';
      }
       var arr2=options.ratingvalarray
       var search2='';
       if(arr2 != undefined){
       for(var j=0;j<arr2.length;j++){
       if(j==0){
           search2 +=`having`
       }
      { search2 += ` round(AVG(f.product_rate),1)  >= ${arr2[j]} `;
       
        if(j!=(arr2.length-1)){
           search2 +=`or`
        }}
        }}    
  
       if(options.percentagevalarray!=9){
       var z = options.percentagevalarray
       var search3='';
       if(z != undefined){
       for(var j=0;j<z.length;j++){
       if(j==0){
           search3 +=`having`
       }
      { search3 += ` AVG(a.discount_percentage)  >= ${z[j]} `;
        if(j!=(z.length-1)){
           search3 +=`or`
        }}
    }}    
    } else{
        var z = options.percentagevalarray
        var search3='';
       if(z != undefined){
       for(var j=0;j<z.length;j++){
       if(j==0){
           search3 +=`having`
       }
      { search3 += ` AVG(a.discount_percentage)  <= ${z[j]} `;
        if(j!=(z.length-1)){
           search3 +=`or`
        }}
        }}   
    }
       if (options.header_search) {
           search += ' and  a.name LIKE "%' + options.header_search + '%" ';
       }
       if (options.minPrice) {
           search += ' AND ((a.regular_price -a.discount_price) >= ' + options.minPrice + ' OR (a.regular_price -a.discount_price) >= ' + options.minPrice + ')';
       }
       if (options.maxPrice) {
           search += ' AND ((a.regular_price -a.discount_price) <= ' + options.maxPrice + ' OR (a.regular_price -a.discount_price) <= ' + options.maxPrice + ')';
       }
       var sorting=``;
       if(options.valueforsort==1){
           sorting +=`order by  round(AVG(f.product_rate),1) desc`
       }
       if(options.valueforsort==2){
           sorting +=  `order by (a.regular_price -a.discount_price)  asc`
       }
       if(options.valueforsort==3){
           sorting +=  `order by (a.regular_price -a.discount_price) desc`
       }
       if(options.valueforsort==4){
           sorting +=  `order by (a.discount_percentage) desc `
       }

           connection.query(`SELECT 
            a.id,a.product_type,a.name,a.location_id,a.regular_price,a.discount_price,
            b.file_name,
            e.slug,
            e.parent_id,
            d.category_id,
            g.name as location_name, g.lat, g.lng, g.maximum_order_distance,
            i.name as brand_name,
            round(AVG(f.product_rate),1) AS avg_rate,
            a.discount_percentage
            FROM
            shop_products AS a
               inner JOIN shop_product_images AS b ON b.product_id = a.id
               AND b.is_featured = 1
               inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
               inner JOIN shop_categories AS e ON e.id = d.category_id
               left join product_rate as f on f.product_id=a.id 
               inner join brand_locations as g on g.id = a.location_id
               inner join brands as i on i.id = g.brands_id
               where g.is_active = 1 and a.is_available = 1 and a.is_deleted = 0 ${search}
               group by a.id,
               d.category_id,
               a.product_type,
               a.name,
               b.file_name,
               e.slug,
               a.regular_price,
               a.discount_price ${search2} ${search3} ${sorting};`,(err, products) => {
                callback(err, products)
            })
   }

   module.GetShopProducts=(options, callback) => {
    var search = '';
    if(options.catvalarray>0){
        search += ' and  e.category_id in('+ options.cat_id+') ';
    }
    var arr2 = options.ratingvalarray
    var search2='';
    if(arr2 != undefined){
    for(var j=0;j<arr2.length;j++){
    if(j==0){
        search2 +=`having `
    }
   { search2 += `g.product_rate  >= ${arr2[j]} `;
     if(j!=(arr2.length-1)){
        search2 +=`or`
     }}
     }}    

    if(options.percentagevalarray!=9){
    var z = options.percentagevalarray
    var search3='';
    if(z != undefined){
    for(var j=0;j<z.length;j++){
    if(j==0){
        search3 +=`having `
    }
   { search3 += ` a.discount_percentage >= ${z[j]} `;

     if(j!=(z.length-1)){
        search3 +=`or`
     }}
     }}    
    } else{
        var z = options.percentagevalarray
        var search3='';
    if(z != undefined){
    for(var j=0;j<z.length;j++){
    if(j==0){
        search3 +=`having`
    }
   { search3 += ` a.discount_percentage  <= ${z[j]} `;

     if(j!=(z.length-1)){
        search3 +=`or`
     }
    }}   
    }}

    if (options.header_search) {
        search += ' and  a.name LIKE "%' + options.header_search + '%" ';
    }
    if (options.minPrice) {
        search += ' AND ((a.regular_price -a.discount_price) >= ' + options.minPrice + ' OR (a.regular_price -a.discount_price) >= ' + options.minPrice + ')';
    }
    if (options.maxPrice) {
        search += ' AND ((a.regular_price -a.discount_price) <= ' + options.maxPrice + ' OR (a.regular_price -a.discount_price) <= ' + options.maxPrice + ')';
    }

    var sorting=``;
    if(options.valueforsort==1){
        sorting +=`order by  g.product_rate desc`
    }
    if(options.valueforsort==2){
        sorting +=  `order by (a.regular_price -a.discount_price)  asc`
    }
    if(options.valueforsort==3){
        sorting +=  `order by (a.regular_price -a.discount_price) desc`
    }
    if(options.valueforsort==4){
        sorting +=  `order by (a.discount_percentage) desc `
    }
        connection.query(` select a.*,d.file_name,f.slug,c.name as shop_name,b.name as location_name, g.product_rate as avg_rate from
        shop_products  as a 
        inner join brand_locations as b ON a.location_id = b.id
        inner join brands as c on c.id = b.brands_id 
        inner join shop_product_images AS d ON d.product_id = a.id
            AND d.is_featured = 1
        inner JOIN shop_product_categories AS e ON e.product_id = a.globalproduct_id
        inner JOIN shop_categories AS f ON f.id = e.category_id
        left join product_rate as g on g.product_id = a.id
        where c.id = ?  AND  a.location_id = ? AND a.is_available = '1' and a.is_deleted = 0 ${search} ${search2} ${search3} ${sorting}`, [options.brandId, options.brand_location_id],(err, products) => {
          if(err){
            callback(err)
          }else{
            callback(false, products)
          }
         })
}
 
    module.GetShops=(options, callback) => {
                var flag = 2;
                var arr1 = options.catvalarray;
                var newsearch1 = '';
                var newsearch = '';
                var search =``;
                var search2=``;
                if(arr1 != undefined){
                    for(var j=0; j<arr1.length;j++){
                        newsearch1 += 'AND e.id LIKE "%' + arr1[j] + '%"'
                    }
                }
                newsearch += 'where (b.address_line_1 LIKE "%' + options.s_loc + '%" OR b.address_line_2 LIKE "%' + options.s_loc + '%")';
            connection.query(`SET SQL_SAFE_UPDATES=0; DELETE FROM User_Searched_Shops;
            SET SQL_SAFE_UPDATES=1;
                INSERT INTO User_Searched_Shops(
                SELECT a.id as id, a.name AS brands_name,
                a.id as brands_id,
                b.brand_logo,
                b.id as location_id,
                b.name as location_name,
                CONCAT(b.lat, ',' ,b.lng) AS latlong,
                COUNT(c.location_id) as count,
                CONCAT(b.address_line_1, ', ' ,b.address_line_2) AS address,
                b.operating_hour_end as closetime,
                round(AVG(f.stars),1) as stars,
                '0' as Distance
                from brands as a
                inner join brand_locations as b on b.brands_id = a.id
                inner join shop_products as c on c.location_id = b.id
                inner join shop_product_categories as d on d.product_id = c.id
                inner join shop_categories as e on e.id = d.category_id
                inner join shop_rate as f on f.shop_id = b.id
                ${newsearch} ${newsearch1} AND b.is_active = 1 AND c.is_available = '1' GROUP BY(c.location_id));
                
                SELECT * FROM User_Searched_Shops `, [1,2,3,4,5], (err,shops) => {
                    if (err) {
                        console.log(err)
                    } else {
                                var shopsList = shops[4];
                                for (let j=0;j<shops[4].length;j++){
                                    var shopdestination = []
                                    var myloc = []
                                    shopdestination.push((shopsList[j].latlong).split(',')[0])
                                    shopdestination.push((shopsList[j].latlong).split(',')[1])
                                    myloc.push((options.myLocation).split(',')[0])
                                    myloc.push((options.myLocation).split(',')[1])
                                    var distance =SphericalUtil.computeLength([{'lat': myloc[0], 'lng': myloc[1]}, {'lat': shopdestination[0], 'lng': shopdestination[1]}]);
                                    connection.query(`SET SQL_SAFE_UPDATES=0; UPDATE User_Searched_Shops SET Distance=${(distance/1000).toFixed(1)} WHERE location_id=${shopsList[j].location_id}; SET SQL_SAFE_UPDATES=1;`, (err,shops) => {
                                        if(err) {
                                            console.log("Adding Distance Error",err)
                                        }
                                    })
                                    }
                            }
                        })

        var arr2=options.ratingvalarray
        if(arr2 != undefined){
            for(var j=0;j<arr2.length;j++){
                if(j==0){
                    search2 +=` having (`
                }
                { search2 += ` stars  >= ${arr2[j]} `;
                    if(j==(arr2.length-1)){
                        search2 +=`) `
                    }
                    if(j!=(arr2.length-1)){
                        search2 +=`or`
                    }
                }
            }   
        }    
   
      if(options.distancevalarray != undefined){
        var flag = 0;
        var arr3 = options.distancevalarray
        var arr4 = options.shopid
        for(let i=0; i<arr3.length; i++){
            for(let j=0; j<arr4.length; j++){
                if(Number(options.shopdistances[j]) <= Number(arr3[i])){
                    flag = 1
                }
            }
        }
        if (flag == 1){
            for(let i=0; i<arr3.length; i++ ) {
                if(search == ''){
                    search += ` WHERE `;
                }
                else if (i == 0){
                    search += ` AND `;    
                }
                for(let j=0; j<arr4.length; j++) {
                    if(Number(options.shopdistances[j]) <= Number(arr3[i])){
                        search += ` location_id = ${arr4[j]} `
                        if(j!=(arr4.length-1)){
                            search += ` OR `
                        }
                        }
                    }
                }
            }
        }
        if (options.search) {
            if (search!=''){
                search += 'and  brands_name LIKE "%' + options.search + '%" ';
            }else{
                search += 'WHERE brands_name LIKE "%' + options.search + '%" ';
            }
            }

        if (options.timingvalarray) {
            var arr5 = options.timingvalarray;
            var arr6 = options.shopid;
            const nDate = new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Calcutta',
                hour12: false
              });
             var $time = (nDate.split(', ')[1]);
             if(search!=''){
                search += 'AND '
             }else{
                search += 'WHERE '
             }
            for (let i=0;i<arr5.length;i++){
                if(i==0){
                    search += '( ';
                }
                    if(arr5[i]==1){
                        search += 'closetime >= "(' + $time + ')" ';
                    }
                    if(arr5[i]==2){
                        search += `closetime >= '18:00:00' `;
                    }
                    if(arr5[i]==3){
                        search += `closetime >= '22:00:00' `;
                    }
                    if(arr5[i]==4){
                        search += `closetime <= '23:59:59' `;
                    }
                    if(i!=(arr5.length-1)){
                        search += `OR `
                    }
                    if(i==(arr5.length-1)){
                        search += `) `
                    }

            }
        }
        
        // if (options.timingvalarray) {
        //     var arr5 = options.timingvalarray;
        //     var arr6 = options.shopid;
        //     const nDate = new Date().toLocaleString('en-US', {
        //         timeZone: 'Asia/Calcutta',
        //         hour12: false
        //       });
        //      var $time = (nDate.split(', ')[1]);
        //      if(search!=''){
        //         search += 'AND '
        //      }else{
        //         search += 'WHERE '
        //      }
        //     for (let i=0;i<arr5.length;i++){
        //         if(i==0){
        //             search += '( ';
        //         }
        //             if(arr5[i]==1){
        //                 search += 'closetime >= "(' + $time + ')" ';
        //             }
        //             if(arr5[i]==2){
        //                 search += `closetime >= '18:00:00' `;
        //             }
        //             if(arr5[i]==3){
        //                 search += `closetime >= '22:00:00' `;
        //             }
        //             if(arr5[i]==4){
        //                 search += `closetime <= '23:59:59' `;
        //             }
        //             if(i!=(arr5.length-1)){
        //                 search += `OR `
        //             }
        //             if(i==(arr5.length-1)){
        //                 search += `) `
        //             }

        //     }
        // }
        var sorting=``;
        if(options.valueforsort==1){
            sorting +=`order by stars desc`
        }
        if(options.valueforsort==2){
            sorting += 'order by Distance asc'
        }
        if(options.valueforsort==3){
            sorting += 'order by Distance desc'
        }
        var quey1=`SELECT * FROM User_Searched_Shops${search}${search2}${sorting};`
        connection.query(quey1,(err, shops) => {
            if(flag==0){
                var obj = []
                callback(err,obj)
            }else if(flag==1){
                connection.query(`SELECT * FROM User_Searched_Shops ${search} ${search2} ${sorting};`,(err,shops1) => {
                    callback(err, shops1)
                })
            }else if(flag==2){
                connection.query(`SELECT * FROM User_Searched_Shops ${search} ${search2} ${sorting};`,(err,shops2) => {
                    callback(err, shops2)
                })
            }
        })
        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        module.GetShops2=(options, callback) => {
            var flag = 2;
            var search = ``;
                    var newsearch = '';
                    var search =``;
                    var search2=``;
                     newsearch += 'WHERE a.name LIKE "%' + options.search_data + '%" ';
                connection.query(`SET SQL_SAFE_UPDATES=0; DELETE FROM User_Searched_Shops;
                SET SQL_SAFE_UPDATES=1;
                    INSERT INTO User_Searched_Shops(
                    SELECT a.id as id, a.name AS brands_name,
                    a.id as brands_id,
                    b.brand_logo,
                    b.id as location_id,
                    b.name as location_name,
                    CONCAT(b.lat, ',' ,b.lng) AS latlong,
                    COUNT(c.location_id) as count,
                    CONCAT(b.address_line_1, ', ' ,b.address_line_2) AS address,
                    b.operating_hour_end as closetime,
                    round(AVG(f.stars),1) as stars,
                    '0' as Distance
                    from brands as a
                    inner join brand_locations as b on b.brands_id = a.id
                    inner join shop_products as c on c.location_id = b.id
                    inner join shop_product_categories as d on d.product_id = c.id
                    inner join shop_categories as e on e.id = d.category_id
                    inner join shop_rate as f on f.shop_id = b.id
                    ${newsearch} AND c.is_available = '1' GROUP BY(c.location_id));
                    
                    SELECT * FROM User_Searched_Shops`, [1,2,3,4,5], (err,shops) => {
                        if (err) {
                            console.log(err)
                        } else {
                                    var shopsList = shops[4];
                                    for (let j=0;j<shops[4].length;j++){
                                        var shopdestination = []
                                        var myloc = []
                                        shopdestination.push((shopsList[j].latlong).split(',')[0])
                                        shopdestination.push((shopsList[j].latlong).split(',')[1])
                                        myloc.push((options.myLocation).split(',')[0])
                                        myloc.push((options.myLocation).split(',')[1])
                                        var distance =SphericalUtil.computeLength([{'lat': myloc[0], 'lng': myloc[1]}, {'lat': shopdestination[0], 'lng': shopdestination[1]}]);
                                       
                                        connection.query(`SET SQL_SAFE_UPDATES=0; UPDATE User_Searched_Shops SET Distance = ${(distance/1000).toFixed(1)} WHERE location_id = ${shopsList[j].location_id}; SET SQL_SAFE_UPDATES=1;`, (err,shops) => {
                                            if(err) {
                                                console.log("Adding Distance Error",err)
                                            }
                                        })
                                        }
                                }
                            })
    
            
            var arr2=options.ratingvalarray
            if(arr2 != undefined){
                for(var j=0;j<arr2.length;j++){
                    if(j==0){
                        search2 +=` having (`
                    }
                    { search2 += ` stars  >= ${arr2[j]} `;
                        if(j==(arr2.length-1)){
                            search2 +=`) `
                        }
                        if(j!=(arr2.length-1)){
                            search2 +=`or`
                        }
                    }
                }   
            }    
       
          if(options.distancevalarray != undefined){
            var flag = 0;
            var arr3 = options.distancevalarray
            var arr4 = options.shopid
            for(let i=0; i<arr3.length; i++){
                for(let j=0; j<arr4.length; j++){
                    if(Number(options.shopdistances[j]) <= Number(arr3[i])){
                        flag = 1
                    }
                }
            }
            if (flag == 1){
                for(let i=0; i<arr3.length; i++ ) {
                    if(search==''){
                        search += ` WHERE `;
                    }
                    else if (i == 0){
                        search += ` AND `;    
                    }
                    for(let j=0; j<arr4.length; j++) {
                        if(Number(options.shopdistances[j]) <= Number(arr3[i])){
                            search += `location_id = ${arr4[j]} `
                            if(j!=(arr4.length-1)){
                                search += `OR `
                            }
                            }
                        }
                    }
                }
            }

            if (options.search_data) {
                if (search!=''){
                    search += ' and  brands_name LIKE "%' + options.search_data + '%" ';
                }else{
                    search += ' WHERE brands_name LIKE "%' + options.search_data + '%" ';
                }
                
            }
            
            if (options.timingvalarray) {
                var arr5 = options.timingvalarray;
                var arr6 = options.shopid;
                const nDate = new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Calcutta',
                    hour12: false
                  });
                 var $time = (nDate.split(', ')[1]);
                 if(search!=''){
                    search += 'AND '
                 }else{
                    search += 'WHERE '
                 }
                for (let i=0;i<arr5.length;i++){
                    if(i==0){
                        search += '( ';
                    }
                        if(arr5[i]==1){
                            search += 'closetime >= "(' + $time + ')" ';
                        }
                        if(arr5[i]==2){
                            search += `closetime >= '18:00:00' `;
                        }
                        if(arr5[i]==3){
                            search += `closetime >= '22:00:00' `;
                        }
                        if(arr5[i]==4){
                            search += `closetime <= '23:59:59' `;
                        }
                        if(i!=(arr5.length-1)){
                            search += `OR `
                        }
                        if(i==(arr5.length-1)){
                            search += `) `
                        }
                }
            }
            var sorting=``;
            if(options.valueforsort==1){
                sorting +=`order by stars desc`
            }
            if(options.valueforsort==2){
                sorting += 'order by Distance asc'
            }
            if(options.valueforsort==3){
                sorting += 'order by Distance desc'
            }
            var quey1=`SELECT * FROM User_Searched_Shops${search}${search2}${sorting};`
            connection.query(quey1,(err, shops) => {
                if(flag==0){
                    var obj = []
                    callback(err,obj)
                }else if(flag==1){
                    connection.query(`SELECT * FROM User_Searched_Shops${search}${search2}${sorting};`,(err,shops1) => {
                        callback(err, shops1)
                    })
                }else if(flag==2){
                    connection.query(`SELECT * FROM User_Searched_Shops ${search} ${search2} ${sorting};`,(err,shops2) => {
                        callback(err, shops2)
                    })
                }
            })
            }

      module.GetSubCategory_products = (options, callback) => {
        var search = '';
        if (options.slug) {
            search = ' AND e.slug = "' + options.slug + '" ';
        }
        if (options.search) {
            search += ' AND a.name LIKE "%' + options.search + '%" ';
        }
        if (options.minPrice) {
            search += ' AND ((a.regular_price-a.discount_price) >= ' + options.minPrice + ' OR (c.regular_price-c.discount_price) >= ' + options.minPrice + ')';
        }
        if (options.maxPrice) {
            search += ' AND ((a.regular_price-a.discount_price) <= ' + options.maxPrice + ' OR (c.regular_price-c.discount_price) <= ' + options.maxPrice + ')';
        }
        connection.query(` SELECT 
    a.id,a.product_type,a.name,
    b.file_name,
    a.regular_price,a.discount_price,
    IF(a.discount_price < a.regular_price, 1, 0) AS is_discount,
    GROUP_CONCAT(c.regular_price) AS variation_regular_price,
    GROUP_CONCAT(c.discount_price) AS variation_discount_price,
    GROUP_CONCAT(c.name) AS variations,
    e.slug
FROM
    shop_products AS a
        inner JOIN
    shop_product_images AS b ON b.product_id = a.id
        AND b.is_featured = 1
        inner JOIN shop_product_variations AS c ON c.product_id = a.id
        inner JOIN shop_product_categories AS d ON d.product_id = a.id
        inner JOIN shop_categories AS e ON e.id = d.category_id where a.is_deleted = 0
        GROUP BY a.id, b.file_name, e.slug order by a.id desc;`, (err, products) => {
            callback(err, products)
        })
    }

    module.getShopRating = (options, callback) =>{
        connection.query(`select * from shop_rate where user_id =? and shop_id = ?`, [options.userId, options.locationId], (err, rating) =>{
            if(err){
                callback(err)
            }else{
                callback(false, rating)
            }
        })
    }

    module.GetSingle = (options, callback) => {
       connection.query(`select a.*,b.name AS location,b.lat,b.lng, b.minimum_order_amount, b.maximum_order_distance, c.name AS brand, 
       f.name as size, g.name as color
        FROM shop_products AS a 
        INNER JOIN brand_locations AS b ON a.location_id = b.id 
        INNER JOIN brands AS c ON b.brands_id = c.id 
        left join shop_product_properties as e on e.product_id = a.id
        left join m_size as f on f.id = e.size
        left join m_color as g on g.id = e.color
        where a.id = ?;`,[options.productId], (err, product) => {
                callback(err, product[0])
              
            });
    }

    module.GetShopSingle = (options, callback) => {
        connection.query(`  SELECT a.id as brands_id,   b.id as location_id, a.name AS brands_name,b.zip, b.name as brand_location_name,
        b.brand_logo, c.name as country, d.name as city, e.name as state,
        CONCAT(b.lat, ',' ,b.lng) AS latlong,
        CONCAT(b.address_line_1, ', ' ,b.address_line_2) AS address,
        b.operating_hour_end as closetime
        from brands as a
        inner join brand_locations as b on b.brands_id = a.id
        left join countries as c on c.id = b.country_id 
        left join cities as d on d.id = b.city_id 
        left join states as e on e.id = b.state_id where b.id = ?`, [options.brandLocationId], (err, shops) =>{
          if(err){
            callback(err)
          }else{
            callback(err, shops[0])
          } 
        })
    }

    module.GetVariation = (options, callback) => {
        connection.query(`SELECT * FROM shop_product_variations WHERE product_id = ?`, [options.productId], (err, variations) => {
            callback(err, variations)
           
        })
    }

    module.GetMedia = (options, callback) => {
        connection.query(`SELECT * FROM shop_product_images WHERE product_id = ?`, [options.productId], (err, media) => {
            callback(err, media)
        })
    }

    module.GetShopMedia = (options, callback) => {
        connection.query(`SELECT brand_logo FROM brand_locations WHERE id = ?`, [options.brandLocationId], (err, media) => {
            if(err){
                callback(err)
            }else{
            callback(false, media)
            }
        })
    }

    module.Popular_Products=(options,callback)=>{
       connection.query(`SELECT 
       a.id,a.product_type,a.name,
        b.file_name,g.name as location_name,
        a.regular_price,a.discount_price,h.name as brand_name,
        IF(a.discount_price < a.regular_price, 1, 0) AS is_discount,
        e.slug,
        round(AVG(f.product_rate),1) AS avg_rate
    FROM shop_products AS a
   inner JOIN shop_product_images AS b ON b.product_id = a.id AND b.is_featured = 1
   inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
   inner JOIN shop_categories AS e ON e.id = d.category_id  
   left join product_rate as f on f.product_id= a.id
   inner join brand_locations as g on g.id = a.location_id
   inner join brands as h on h.id = g.brands_id
    WHERE a.is_available=1 and a.is_deleted=0  
   group by  a.id,a.product_type,a.name,b.file_name,a.regular_price,a.discount_price,e.slug,(f.product_rate)
   order by f.product_rate desc;`,(err,popular_products)=>{
           if(err){
            callback(err)
           }else{
            callback(false,popular_products)
           }
       })
     }
   
     module.BestSeller_Products=(options,callback)=>{
       connection.query(`SELECT 
       a.id,a.product_type,a.name,
       b.file_name,i.name as location_name,h.name as brand_name,
       a.regular_price,a.discount_price,
       e.slug,
              IF(a.discount_price < a.regular_price, 1, 0) AS is_discount,
              round(AVG(f.product_rate),1) AS avg_rate,
         COUNT(g.product_id) as count_orderedproducts
   FROM
       shop_products AS a
          inner join shop_orders_products as g on g.product_id=a.id
           inner JOIN shop_product_images AS b ON b.product_id = a.id
           AND b.is_featured = 1
           inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
           inner JOIN shop_categories AS e ON e.id = d.category_id
           left join product_rate as f on f.product_id=a.id
           inner join brand_locations as i on i.id = a.location_id
			inner join brands as h on h.id = i.brands_id
        WHERE a.is_available=1 and a.is_deleted=0  
           group by a.id,a.product_type,a.name,b.file_name,a.regular_price,a.discount_price,e.slug
       order by count_orderedproducts desc;`,(err,bestSeller_products)=>{
           if(err){
            callback(err)
           }else{
            callback(false,bestSeller_products)
           }
       })
     }
   
    module.GetForCart = (options, callback) => {
        const variation = options.variationId ? `AND b.id = ${options.variationId}` : ''
        connection.query(`SELECT 
    a.id as product_id,a.name AS product_name,
    c.file_name,
    f.name as location_name,f.brands_id as brand,f.lat,f.lng, f.delivery_choice, f.minimum_order_amount,f.maximum_order_distance,
    a.regular_price AS product_regular_price,a.discount_price as product_discount_price,a.product_type,
    b.id as variation_id,b.name AS variation_name,b.regular_price AS variation_regular_price,
    e.slug,
    a.discount_percentage as discount_percentage
FROM
    shop_products AS a
    LEFT JOIN shop_product_variations AS b ON b.product_id = a.id
        LEFT JOIN
    shop_product_images AS c ON c.product_id = a.id
        AND c.is_featured = 1
        LEFT JOIN shop_product_categories AS d ON d.product_id = a.id
        LEFT JOIN shop_categories AS e ON e.id = d.category_id
        inner join brand_locations as f on f.id = a.location_id
WHERE a.id = ? ${variation}`, [options.productId], (err, product) => {
        if(err){
            console.log("error is",err)
        }
            callback(err, product[0])
        })
    }
  
    module.GetImages = (options, callback) => {
        connection.query(`select spi.images from shop_products as sp 
        inner join
        shop_product_images as spi
        on sp.id=spi.product_id
        inner join 
        shop_product_categories as spc
        on spc.product_id=sp.id
        inner join 
        shop_categories as sc
        on sc.id=spc.category_id where sc.id=?;
        `, [options.CId], (err, images) => {
            callback(err, images)
        })
    }
    module.GetProductImages = (options, callback) => {
        connection.query(`SELECT * FROM shop_product_images WHERE product_id = ?`, [options.productId], (err, images) => {
            callback(err, images)
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
   
    module.GetSearchProducts = (options,callback)=>{
        var search = '';
        if (options.search) {
            search = ' where a.name LIKE "%' + options.search + '%" ';
        }
        connection.query(`SELECT 
        a.id,a.product_type,a.name,
        b.file_name,
        a.regular_price,a.discount_price,
        e.slug
    FROM
        shop_products AS a
            inner JOIN shop_product_images AS b ON b.product_id = a.id
            AND b.is_featured = 1
            inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
            inner JOIN shop_categories AS e ON e.id = d.category_id
            ${search} and a.location_id =?
           order by a.id desc;`,[options.brand_location_id],(err, products) => {
            callback(err, products)
        })
    }

    module.getHomeCategories=(options,callback)=>{
        var cat_id=options.catId ?options.catId :0;
        connection.query(`select * from shop_categories where parent_id=? `, [cat_id], (err, getHomeCategories) => {
        callback(err, getHomeCategories)
    })
    }

    module.getShippingDetails = (options, callback) =>{
        connection.query(`select * from shop_user_shipping_address where id = ?`, [options.shippingId], (err, data) =>{
            if(err){
                callback(err)
            }else{
                const lat  = data[0].lat
                const long = data[0].lng
                var currentLat = options.shop_lat
                var currentLong = options.shop_long
                if(currentLat != null && currentLong != null){
                    const Distance=[Math.round(geolib.getDistance({ latitude: currentLat, longitude: currentLong }, { latitude:lat, longitude:long }) / 1000)]
                    const distance=[];
                    Distance.forEach(d=>{
                       distance.push(d)
                    })
                  
                    var query1 = `select`
                   if(distance <= 5){
                    query1 += ` d_0_5_Km as charges`
                   } else if ((distance > 5) & (distance <= 10 )){
                    query1 += ` d_5_10_Km as charges`
                   } else if((distance > 10) &(distance <= 20)){
                    query1 += ` d_10_20_Km as charges`
                   } else if((distance > 20) & (distance <= 40)){
                    query1 += ` d_20_40_Km as charges`
                   } else if((distance > 40) & (distance<= 60)){
                    query1 += ` d_40_60_Km as charges`
                   }else if((distance > 60) & (distance<= 100)){
                    query1 += ` d_60_100_Km as charges`
                   } else if(distance > 100){
                    query1 += ` d_more_than_100_Km as charges`
                   }

                   query1 += ` from brand_shipping_charges where brand_location_id = ${options.shop_location}`
                 
                   connection.query(query1, (err, record)=>{
                    if(err){
                        callback(err)
                    }else{
                     if(!record.length){
                        callback(false, {record:null})
                     }else{
                        callback(false, {record:record[0].charges})
                     }
                    }
                   })
                }
            }
        })
    }

    module.addProductWishlist1 = (options, callback) =>{
        connection.query(`select * from user_wishlist where users_id = ? and  product_id = ?`, [options.userId, options.productId], (err, result) =>{
            if(err){
                callback(err)
            }else{
                if(!result.length){
                    connection.query(`INSERT INTO user_wishlist SET users_id = ?,  product_id = ?`, [options.userId, options.productId], (err, wishlist) =>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false, wishlist)
                        }
                    })
                }else{
                    callback(false, null)
                }
            }
        })
    }

    module.shopRate = (options, callback) =>{
        connection.query(`select * from shop_rate where shop_id = ? and user_id =?`, [options.brandId, options.userId], (err, rate) =>{
            if(err){
                callback(err)
            }else{
                if(!rate.length){
                    connection.query(`INSERT INTO shop_rate SET shop_id = ?, stars =?, user_id =?, cust_name =?`, [options.brandId, options.rate, options.userId, options.username], (err, rate1) =>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false, rate1)
                        }
                    })
                }else{
                    connection.query(`UPDATE shop_rate SET stars = ? WHERE shop_id = ? and user_id =?`, [options.rate, options.brandId, options.userId], (err, rate2) =>{
                        if(err){
                            console.log(err)
                        }else{
                            callback(false, rate2)
                        }
                    })
                }
            }
        })
    }

    module.productRate = (options, callback) =>{
        connection.query(`select * from product_rate where product_id = ? and users_id =?`, [options.productId, options.userId], (err, rate) =>{
            if(err){
                callback(err)
            }else{
                if(!rate.length){
                    connection.query(`INSERT INTO product_rate SET product_id = ?, product_rate =?, users_id =?`, [options.productId, options.rate, options.userId], (err, rate1) =>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false, rate1)
                        }
                    })
                }else{
                    connection.query(`UPDATE product_rate SET product_rate = ? WHERE product_id = ? and users_id =?`, [options.rate, options.productId, options.userId], (err, rate2) =>{
                        if(err){
                            console.log(err)
                        }else{
                            callback(false, rate2)
                        }
                    })
                }
            }
        })
    }

    module.WishlistProducts = (options, callback) => {
        connection.query(`select a.id, a.users_id, a.product_id,b.name as product_name, b.location_id, b.regular_price, b.discount_price, c.file_name from user_wishlist as a
        inner join shop_products as b on b.id = a.product_id
        inner join shop_product_images as c on c.product_id = a.product_id
         where a.users_id = ? and c.is_featured = 1`, [options.userId], (err, wishlist)=>{
            if(err){
                callback(err)
            }else{
                callback(false, wishlist)
            }
        })
    }

    module.FavouriteShops = (options, callback) =>{
        connection.query(`select a.id, a.users_id, b.id as brand_id, a.brand_location_id, b.name as brands_name, c.name as location_name, c.address_line_1 , c.address_line_2, CONCAT( c.address_line_1, ' ',c.address_line_2) AS address,
        d.name as city, e.name as state,c.brand_logo, c.id as location_id, f.name as country, group_concat(g.stars) as stars
     from user_shop_wishlist as a
    left join brand_locations as c on c.id = a.brand_location_id 
      left join brands as b on b.id = c.brands_id
    left join cities as d on d.id = c.city_id
    left join states as e on e.id = c.state_id
    left join countries as f on f.id = c.country_id
    left join shop_rate as g on g.shop_id = c.id and g.user_id = ${options.userId}
    where a.users_id = ? group by a.id`, [options.userId], (err, wishlist)=>{
            if(err){
                callback(err)
            }else{
                async.eachSeries(wishlist, (w, cb) =>{
                    connection.query(`select group_concat(a.name) as brand_name, b.id, b.name, group_concat( c.users_id) as users from brands as a 
                    left join brand_locations as b on b.brands_id = a.id
                    left join brand_location_users as c on c.brand_locations_id = b.id
                    left join user_roles as d on d.users_id = c.users_id and d.roles_id = 2
                    left join users as e on e.id = c.users_id and e.is_active = 1 and e.is_deleted = 0
                    where b.id = ${w.location_id} group by b.id`, (err, users1) =>{
                        if(err){
                            cb(err)
                        }else{
                            if(users1.length){
                                w.users = users1[0].users 
                            }else{
                                w.users = 0
                            }
                            cb()
                        }
                    })
                }, (err, result) =>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log(wishlist, "wwwwwwwwww");
                        callback(false, wishlist)
                    }
                })
            }
        })
    }

    module.getParentCtegory = (options, callback) =>{
        connection.query(`select * from shop_categories where id = ${options.parentId}`, (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.wishlistShop = (options, callback) =>{
        connection.query(`select * from user_shop_wishlist where users_id = ? and brand_location_id = ?`, [options.userId, options.location_id], (err, wishlistShop) =>{
            if(err){
                callback(err)
            }else{
                if(wishlistShop.length){
                    wishlistShop[0].wishlist = 1 
                }else{
                    wishlistShop[0].wishlist = 0
                }
                callback(false, wishlistShop)
            }
            
        })
    }

    module.specificParent = (options,callback) =>{
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        c.catId, c. catName as name
    FROM shop_products AS a
    LEFT JOIN shop_product_categories AS b ON b.product_id = a.globalproduct_id
    inner JOIN (SELECT 
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

    WHERE   a.id IS NOT NULL AND a.is_deleted = 0  AND a.location_id= ${options.locationId} GROUP BY c.catId`, (err, data) =>{
            if(err){
                callback(err)
            }else{
              callback(false, data)
            }
         })
    }

    module.specificSubParent = (options, callback) =>{
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
       
         c.subcatId, c. subcatName as name
         
     FROM shop_products AS a
     LEFT JOIN shop_product_categories AS b ON b.product_id = a.globalproduct_id
     INNER JOIN (SELECT 
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

     WHERE   a.id IS NOT NULL AND a.is_deleted = 0  AND a.location_id= ${options.locationId} and  c.catId = ${options.catId} GROUP BY  c.subcatId`, (err, data) =>{
        if(err){
            callback(err)
        }else{
            callback(false, data)
        }
     })
    }

    module.specificSubSubParent = (options, callback) =>{
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        c.subsubcatName as name, c.subsubcatId, c.slug
    FROM shop_products AS a
    LEFT JOIN shop_product_categories AS b ON b.product_id = a.globalproduct_id
    INNER JOIN (SELECT 
    a.id as catId,
    a.name as catName,
    b.id as subcatId,
    b.name as subcatName,
    c.id as subsubcatId,
    c.name as subsubcatName,
    c.slug
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

    WHERE a.id IS NOT NULL AND a.is_deleted = 0 and c.subcatId = ${options.subcatId}  AND a.location_id= ${options.locationId}  GROUP BY   c.subsubcatId`, (err, data) =>{
        if(err){
            console.log(err)
            callback(err)
        }else{
            callback(false, data)
        }
    })
    }


    module.GetDealsProducts = (options, callback) => {
        connection.query(`SELECT 
        a.id,a.product_type,a.name,a.regular_price, a.discount_price,
         b.file_name,g.name as location_name,h.name as brand_name,
         IF(a.discount_price < a.regular_price, 1, 0) AS is_discount,
         e.slug,
         round(AVG(f.product_rate),1) AS avg_rate
     FROM shop_products AS a
     inner join deals_of_the_day as cc on cc.product_id = a.id
	inner JOIN shop_product_images AS b ON b.product_id = a.id AND b.is_featured = 1
	inner JOIN shop_product_categories AS d ON d.product_id = a.globalproduct_id
	inner JOIN shop_categories AS e ON e.id = d.category_id  
    left join product_rate as f on f.product_id= a.id
     inner join brand_locations as g on g.id = a.location_id
			inner join brands as h on h.id = g.brands_id
     WHERE a.is_available=1 and a.is_deleted=0  AND CURRENT_DATE() BETWEEN cc.start_date AND cc.end_date
    group by  a.id,a.product_type,a.name, a.regular_price,a.discount_price,b.file_name, e.slug
	order by a.id;
`,(err, products) => {
            callback(err, products)
        })

    }
 

    return module;
};
module.exports = ShopProducts;