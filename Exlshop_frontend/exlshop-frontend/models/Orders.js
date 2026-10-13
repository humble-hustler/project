/********************************************************/
/***** Orders Model *****/
/********************************************************/

const { options } = require("request");
const async = require("async");
const { result } = require("lodash");
const { payment_method } = require("../routes/api/versions/v1/order");
var FCM = require('fcm-node');
var serverKey = 
'AAAATE0L40g:APA91bGL6bVyxbdDq_5xZGAWnr2TBbuwzBIpdwrSPEeA41-4_oYtUUKMk0svtvESYmU6aaIaunwolc4-9R1Ww7eGSwZng1I-x2Cy1_UuhwKcwGSI7WO2gyX9XKPAX3ZHRBH6EB2Bdk8S'
var serverKey1 = 'AAAA9fp2meU:APA91bHsnhA-keeAfdE5HrsUFWiRVA-ppe-QBvCaJlI6vD-Ql5zsDqvn2lqyKaK2ISXgK9WffvDYwylW9OxId0_Zm627xx2eR_k2A9VqQ_j0L4hs8mIJ_hhRjjZwwFcRoGVOCPYmCUDo'
var fcm = new FCM(serverKey);
var fcm1 = new FCM(serverKey1)
const Cart = (connection, logger) => {
    const module = {}

    module.GetSearchedOrders = (options, callback) => {

         var search=``;
        //  search += `AND d.name LIKE "%' + ${options.searchValue} + '%"  `;
        if(options.searchValue){
         search += 'AND a.id LIKE "%' + options.searchValue + '%"  ';
        //  search += `AND (h.slug = ${connection.escape(options.searchValue)} OR (d.name = ${connection.escape(options.searchValue)} OR a.id = ${connection.escape(options.searchValue)}) OR (d.regular_price = ${connection.escape(options.searchValue)} OR i.name  = ${connection.escape(options.searchValue)})  )`;
        }
        var arr1=[]; 
        var arr2=[];
        arr1=options.timestatusval;
        arr2=options.statusvalarray;
        if(options.timestatusval){
        if((options.timestatusval).indexOf('1')!== -1){
            // year(a.created_date )>=(2021)
            // DATE(a.created_date) >= DATE(NOW()) - INTERVAL 30 DAY
            search += ' AND DATE(a.created_date) >= DATE(NOW()) - INTERVAL 30 DAY ';
           
            arr1.shift()
        }
        if(arr1.length >=1){
            search += `and year(a.created_date ) in (${arr1})`;}
        }
       
        if(options.statusvalarray){
            if((options.statusvalarray).indexOf('1')!== -1){
                // search += `AND  c.order_status in(1,2,3)`; 
                arr2.push(1)
                arr2.push(2)
                arr2.push(3)
            }
            search += `AND  c.order_status in( ${arr2} )`; 
        }
        
        connection.query(` SELECT 
        a.id, a.delivery_date,  GROUP_CONCAT(distinct a.users_id) as users_id, 
        a.created_date, DATE_FORMAT(a.created_date, "%W %M %e %Y") as order_date,
     
       GROUP_CONCAT(distinct c.order_status) as order_status,
       GROUP_CONCAT(distinct m.amount) as amount,
       GROUP_CONCAT(distinct m.payment_mode) as payment_mode,
       count(d.id) as products,
       GROUP_CONCAT( distinct i.name) as status,
     
      GROUP_CONCAT(distinct j.name) as location_name , GROUP_CONCAT(distinct k.name) as brand_name
  FROM
  shop_orders AS a
  INNER JOIN shop_user_shipping_address AS b ON b.id = a.shipping_address_id
  inner join shop_orders_products as c on c.order_id=a.id
  inner join shop_products as d on d.id=c.product_id
  inner join shop_product_categories as g on g.product_id = d.globalproduct_id
  inner join shop_categories as h on h.id = g.category_id
  inner join order_status as i on i.id = c.order_status
  inner join brand_locations as j on j.id=d.location_id
  inner join brands as k on k.id=j.brands_id
  inner join shop_product_images as l on l.product_id=d.id
      left join shop_payment_request as m on (m.instamojo_payment_request_id = a.instamojo_payment_request_id OR m.order_id = a.id)
 
    WHERE l.is_featured=1 ${search} and a.users_id = ? group by a.id  order by a.id desc;`, [options.userId], (err, orders) => {
         
            callback(err, orders)
        })


    }

    module.Add_Delivery_Details = (options, callback) => {
      
        connection.query(`UPDATE shop_orders_products SET delivery_details='${JSON.stringify(options.details_delivery)}' WHERE order_id = '${options.order_id.order_id}'`, (err,data) => {
          
            callback(err,data)
        })
    }

    module.CreatePaymentRequest = (options, callback) => {
        connection.query(`INSERT INTO shop_payment_request SET users_id = ?,  instamojo_payment_request_id = ?, shipping_charges = ?, amount = ?, currency = ?,payment_mode=?`, [options.userId, options.orderId, options.delChr, options.amount, options.currency,options.type], (err,data) => {
            callback(err,data)//.insertId
        })
    }


    module.getordereditem = (options, callback) => {
      
        connection.query(`SELECT a.instamojo_payment_request_id,
        a.id,c.name,
        d.file_name,
        b.quantity,
        c.regular_price,
        c.discount_price,
        c.discount_percentage,
        e.address_line_1,
        f.payment_mode, 
        f.amount
         FROM shop_orders as a
        inner join  shop_orders_products as b  on b.order_id=a.id
        inner join shop_products as c on c.id=b.product_id
        inner join shop_product_images as d on d.product_id=c.id

        inner join shop_user_shipping_address as e on e.id = a.shipping_address_id
        inner join shop_payment_request as f on f.order_id = a.id
        where a.id= ${options.order_id} and d.is_featured=1;`, (err,data) => {
          console.log(err, data)
           
            callback(err,data)
        })
    }

    module.getordereditem1 = (options, callback) => {
        connection.query(`SELECT 
        a.id,
      GROUP_CONCAT(c.name) as product,
	sum(b.quantity) as total_product_quantity,
 sum(c.regular_price) as total_regular_price,
        sum(c.discount_price) as total_discount_price,
        sum(c.regular_price * b.quantity) as product_total_amount,
        sum(c.discount_price * b.quantity) as product_total_discount,
      
       sum(c.regular_price - c.discount_price) as total_amount
        
         FROM shop_orders as a
        inner join  shop_orders_products as b  on b.order_id=a.id
        inner join shop_products as c on c.id=b.product_id
        inner join shop_product_images as d on d.product_id=c.id
        inner join shop_user_shipping_address as e on e.id = a.shipping_address_id
        inner join shop_payment_request as f on f.order_id = a.id
       where a.id = ? and d.is_featured=1 group by a.id`, [options.order_id], (err, data) =>{
            callback(err, data)
       })
    }

    module.getordereditem2 = (options, callback) => {
        connection.query(`SELECT 
        a.id,
      GROUP_CONCAT(c.name) as product,
	sum(b.quantity) as total_product_quantity,
 sum(c.regular_price) as total_regular_price,
        sum(c.discount_price) as total_discount_price,
        sum(c.regular_price * b.quantity) as product_total_amount,
        sum(c.discount_price * b.quantity) as product_total_discount,
       sum(c.regular_price - c.discount_price) as total_amount
        
         FROM shop_orders as a
        inner join  shop_orders_products as b  on b.order_id=a.id
        inner join shop_products as c on c.id=b.product_id
        inner join shop_product_images as d on d.product_id=c.id
        inner join shop_user_shipping_address as e on e.id = a.shipping_address_id
        inner join shop_payment_request as f on f.order_id = a.id
       where a.id = ? group by a.id`, [options.order_ID], (err, data) =>{
            callback(err, data)
       })
    }

    module.BuyInsertProducts = (options, callback) => {
        connection.query(`INSERT INTO shop_orders_products SET order_id=?, product_id=?, quantity=?,order_status=? `, [options.orderId,options.productId,options.quantityval,1], (err,data) => {
            if(err){
                callback(err)
            }else{
                connection.query('UPDATE shop_products SET quantity = quantity - "'+ options.quantityval+'" WHERE id = "'+options.productId+'" ', (err) =>{
                    if(err){
                        callback(err)
                    }else{
                        callback(err,{order_id:options.orderId})
                    }
                })
            }
        })
    }

    module.Create = (options, callback) => {
        connection.query(`INSERT INTO shop_orders SET instamojo_payment_request_id = ?, instamojo_payment_id = ?, users_id = ?, shipping_address_id = ?, delivery_choice = ?`, [options.orderId, options.paymentId, options.userId, options.shippingId, options.delivery_choice], (err, order) => {
            if(err){
                console.log(err)
                callback(err)
            }else{
                connection.query(`INSERT INTO Brand_location_order_delivery_history SET order_id = ?, Order_Placed = ?`, [order.insertId, 1], (err, data) =>{
                    if(err){
                        console.log(err)
                        callback(err)
                    }else{
                        callback(false, order.insertId)
                    }
                })
            }
        })
    }
    module.UpdateShopPaymentRequest = (options, callback) =>{
        connection.query(`UPDATE shop_payment_request SET order_id = ${options.orderId} WHERE id = ?`, [options.shop_payment_request_id], (err, order) =>{
            callback(err, order)
        })
    }

    module.InsertProducts = (options, callback) => {
        var values = []
        options.cart.forEach((c) => {
            values.push([options.orderId, c.productId, c.variationId ? c.variationId : null, c.quantity, c.lineId,1])
        })
        connection.query(`INSERT INTO shop_orders_products (order_id, product_id, variation_id, quantity, line_id,order_status) VALUES ?`, [values], (err) => {
            callback(err,{order_id:options.orderId})
        })

    }

    module.UpdateStockQuantity = (options, callback) =>{
        connection.query('UPDATE shop_products SET quantity = quantity - "'+ options.quantity+'" WHERE id = "'+options.productId+'" ', (err, stock) =>{
            if(err){
                console.log(err)
            }else{
            callback(err,{order_id:options.orderId})
            }
        })
    }

    module.GetCountByUser = (options, callback) => {
        connection.query(`SELECT sql_calc_found_rows b.id, 
        group_concat(a.order_status) as order_status
                FROM
                shop_orders_products as a inner join
                shop_orders as b on b.id = a.order_id 
                WHERE b.users_id = ? group by b.id;
                select found_rows() as total`, [options.userId], (err, count) => {
            callback(err, count[1][0].total)
        })
    }
 
    module.awaitingOrder = (options, callback) =>{
        connection.query(`SELECT sql_calc_found_rows b.id, 
        group_concat(a.order_status) as order_status
                FROM
                shop_orders_products as a inner join
                shop_orders as b on b.id = a.order_id 
                WHERE b.users_id = ? and (a.order_status = 1 OR a.order_status = 2 OR a.order_status = 3 OR a.order_status = 7) group by b.id;
                select found_rows() as total` , [options.userId], (err, awaitOrder) =>{
                 
                    callback(err, awaitOrder[1][0].total)
                })
    }

    module.deliveritem = (options,callback)=>{
        connection.query(`SELECT sql_calc_found_rows b.id, 
        group_concat(a.order_status) as order_status
                FROM
                shop_orders_products as a inner join
                shop_orders as b on b.id = a.order_id 
                WHERE b.users_id = ? and a.order_status = 4  group by b.id;
                select found_rows() as total`, [options.userId], (err, count) => {
            callback(err, count[1][0].total)
        })
    }

    module.RecentOrdersByUser = (options, callback) => {
        connection.query(`SELECT * FROM shop_orders WHERE users_id = ? ORDER BY created_date DESC`, [options.userId, options.offset, options.limit], (err, order) => {
            if (err) {
                callback(err)
            } else {
                if (order.length) {
                  
                    connection.query(`SELECT a.id, a.order_id, a.product_id, a.variation_id, a.quantity as quant, a.line_id,
                    a.created_date, a.cancel_order, a.order_status, a.delivery_details, a.pickup_details FROM shop_orders_products as a WHERE a.order_id = ?`, [order[0].id], (err, orderItems) => {
                       
                        callback(err, { orderData: order[0], orderItems:orderItems })
                    })
                } else {
                    callback(err, { orderData: null, orderItems: null })
                }
            }
        })
    }


    module.viewOrders = (options, callback) => {
        connection.query(`SELECT a.id, a.created_date as order_date,  a.users_id, day(a.created_date) as created_date, month(a.created_date) as created_month,  year(a.created_date) as created_year, a.delivery_date, c.product_id, c.order_status, concat(b.address_line_1, ", ", b.address_line_2) as shipping_address_1, concat( p.name, ", ", o.name, ", ", n.name, ", ",  b.zip)  as shipping_address_2, b.phone,
        concat(q.fname,  " ", q.lname) as username, q.email, q.phone as user_mobile,l.file_name,
      d.is_returnable, d.returnable_days,  d.regular_price,d.discount_price,d.name as product_name,  m.amount,m.payment_mode, m.shipping_charges, c.quantity,
   i.name as status,j.name as location_name , concat(j.name, ", ", j.address_line_1, ", ", j.address_line_2) as brand_address_1, 
     concat(t.name, ", ", s.name, ", ", r.name, ", ", j.zip) as brand_address_2,k.name as brand_name
   FROM
   shop_orders AS a
   left JOIN shop_user_shipping_address AS b ON b.id = a.shipping_address_id
   left join shop_orders_products as c on c.order_id=a.id
   left join shop_products as d on d.id=c.product_id
   left join shop_product_categories as g on g.product_id = d.globalproduct_id
   left join shop_categories as h on h.id = g.category_id
   left join order_status as i on i.id = c.order_status
   left join brand_locations as j on j.id=d.location_id
   left join brands as k on k.id=j.brands_id
   left join shop_product_images as l on l.product_id=d.id
       left join shop_payment_request as m on (m.instamojo_payment_request_id = a.instamojo_payment_request_id OR m.order_id = a.id)
   left join countries as n on n.id = b.country_id
   left join states as o on o.id = b.state_id
   left join cities as p on p.id = b.city_id
   left join users as q on q.id = a.users_id
     left join countries as r on r.id = j.country_id
   left join states as s on s.id = j.state_id
   left join cities as t on t.id = j.city_id
 
    WHERE l.is_featured=1  and a.id = ? order by a.id desc;`, [options.order_ID], (err, orders) => {
    if(err){
        callback(err)
    }else{
        callback(false, orders)
    }
    })
    }

    module.GetByUserId = (options, callback) => {
        connection.query(`SELECT 
    a.id, a.created_date, b.label, c.order_status,b.name,d.name,d.id as p_id,c.product_id,c.variation_id,c.quantity,h.slug,i.name as status,
    d.regular_price,
    l.file_name,
    j.name as location_name ,k.name as brand_name
FROM
    shop_orders AS a
    INNER JOIN shop_user_shipping_address AS b ON b.id = a.shipping_address_id
    inner join shop_orders_products as c on c.order_id=a.id
    inner join shop_products as d on d.id=c.product_id
    inner join shop_product_categories as g on g.product_id = d.globalproduct_id
    inner join shop_categories as h on h.id = g.category_id
    inner join order_status as i on i.id = c.order_status
    inner join brand_locations as j on j.id=d.location_id
    inner join brands as k on k.id=j.brands_id
    inner join shop_product_images as l on l.product_id = c.id
WHERE
l.is_featured=1  and a.users_id = ?  order by a.id desc`, [options.userId], (err, orders) => {
      
            callback(err, orders)
        })
    }

    module.cancel_order = (options,callback)=>{
       connection.query(`UPDATE shop_orders_products
       SET cancel_order = '1' , order_status='5'
       WHERE  
       order_id = ?`,[options.orderId],(err,product)=>{
               if(err){
                callback(err)
               }else{
                connection.query(`UPDATE shop_orders SET order_status='5' WHERE id = ?`, [options.orderId], (err, order) =>{
                    if(err){
                        callback(err)
                    }else{
                    callback(false,order);
                    }
                })
               }
            })
    }

    module.return_order = (options,callback)=>{
        connection.query(`UPDATE shop_orders_products
        SET shop_orders_products.order_status = 6
        WHERE  
        shop_orders_products.product_id = ? and shop_orders_products.order_id = ?`,[options.productId, options.orderId],
             (err,product)=>{
                if(err){
                    callback(err)
                }else{
                    connection.query(`UPDATE shop_orders SET order_status = 6 WHERE id = ?`, [options.orderId], (err, product1) =>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false, product1)
                        }
                    } )
                }
             })
     }


    module.GetDeliverOrder = (options,callback)=>{

        connection.query(`select a.*,b.users_id,e.label,b.created_date,d.name as product_name,d.regular_price as price  
        FROM
        shop_orders_products  as a
        inner join shop_orders as b on b.id = a.order_id
        inner join users as c on c.id = b.users_id 
        inner join shop_products as d on d.id = a.product_id
        INNER JOIN shop_user_shipping_address AS e ON e.id = b.shipping_address_id
        where b.users_id = ? and b.order_status = '4' and a.cancel_order ='0'`,[options.userId],(err,deliver_orders)=>{
            callback(err,deliver_orders);
        })
    }

    module.AddReview = (options,callback)=>{
        connection.query(`INSERT INTO product_review
         SET product_review = ?, users_id = ?, order_id = ?,product_id = ? `,[options.review,options.userId,options.orderId,options.productId],(err,review)=>
            {
                if(err){
                    callback(true,err);
                }
                else{
                    callback(false,review);
                }
            }
        )
    }

    module.ViewShopReview = (options, callback) =>{
        connection.query(`select a.*,date_format(a.created_at, "%M %d %Y %T") as date, concat(b.fname , +" ", b.lname) as username from shop_review as a inner join users as b on b.id = a.users_id
         where a.brand_location_id = ?`,[ options.brandLocationId], (err, review) =>{
            if(err){
                callback(err)
            }else{
                callback(false, review)
            }
        })
    }

    module.ViewReview = (options,callback)=>{
        connection.query(`select a.*,date_format(a.created_at, "%M %d %Y %T") as date, concat(b.fname , +" ", b.lname) as username from product_review as a inner join users as b on b.id = a.users_id
         where product_id = ?`,[options.productId], (err,review)=>{
            if(err){
                callback(true,err);
            }
            else{
                callback(false, review);
            }
        })
    }

    module.ViewRate = (options,callback)=>{
        connection.query(`select * from product_rate where users_id=?`,[options.userId],(err,rate)=>{
            if(err){
                callback(true,err);
            }
            else{
                callback(err, rate);
            }
        })
    }

    module.GetSingleData = (options, callback) => {
        connection.query(`SELECT 
    a.id,a.created_date,a.instamojo_payment_id,
    b.label,b.name,b.phone,b.address_line_1,b.address_line_2,
    c.name AS state,
    d.name AS city,
    b.zip,
    e.amount
FROM
    shop_orders AS a
        INNER JOIN
    shop_user_shipping_address AS b ON b.id = a.shipping_address_id
        INNER JOIN
    states AS c ON c.id = b.state_id
        INNER JOIN
    cities AS d ON d.id = b.city_id
        INNER JOIN shop_payment_request AS e ON e.instamojo_payment_request_id = a.instamojo_payment_request_id
    WHERE a.users_id = ? AND a.id = ?`, [options.userId, options.orderId], (err, orderData) => {
            callback(err, orderData[0])
        })
    }

    module.GetProductLine = (options, callback) => {
        connection.query(`SELECT id FROM shop_orders WHERE users_id = ? AND id = ?`, [options.userId, options.orderId], (err, order) => {
            if (err) {
                callback(err)
            } else {
                connection.query(`SELECT * FROM shop_orders_products WHERE order_id = ?`, [order[0].id], (err, orderItems) => {
               
                    callback(err, orderItems)
                })
            }
        })
    }
   
    module.addProductRate = (options,callback)=>{
        connection.query(`INSERT INTO product_rate SET product_rate = ?,users_id = ?, product_id = ?, order_id = ?`, [options.rate,options.userId,options.productId, options.orderId], (err) => {
            callback(err)
        })
    }


    module.updateRate = (options, callback) =>{
        connection.query(`UPDATE product_rate SET product_rate = '${options.updateProductRate}' WHERE product_id = '${options.proId}' and users_id = '${options.userId}'`, (err, data) =>{
            if(err){
              
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.updateShopRate = (options, callback) =>{
        connection.query(`UPDATE shop_rate SET stars = '${options.shop_rate}' WHERE shop_id = '${options.shopId}' and user_id = '${options.userId}'`, (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }


    module.addRate = (options, callback) =>{
        connection.query(`INSERT INTO product_rate SET product_rate = ?, users_id = ?, product_id = ?`, [options.addProductRate, options.userId, options.proId], (err, data) =>{
            if(err){
               
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.addShopRate = (options, callback) =>{
        connection.query(`INSERT INTO shop_rate SET stars = ?, user_id = ?, shop_id = ?, cust_name = ?`, [options.shop_rate, options.userId, options.shopId, options.username], (err, data) =>{
            if(err){
              
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.addReview = (options, callback) => {
        connection.query(`INSERT INTO product_review SET product_review = ?, users_id = ?, order_id = ?, product_id = ?`, [options.review_text, options.userId,options.order_Id, options.proId], (err, data) =>{
            if(err){
             
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.addShopReview = (options, callback) => {
        connection.query(`INSERT INTO shop_review SET shop_review = ?, users_id = ?, brand_id = ?, brand_location_id = ?, cust_name = ?`, [options.review_text, options.userId, options.brand_id, options.brand_location_id, options.username], (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.getProductByRate = (options, callback) => {
        connection.query(`SELECT 
        a.id as order_id,c.name as product_name, c.id as product_id,
        d.file_name,b.quantity,c.regular_price,c.discount_price
         FROM shop_orders as a
        inner join  shop_orders_products as b  on b.order_id=a.id
        inner join shop_products as c on c.id=b.product_id
        inner join shop_product_images as d on d.product_id=c.id
        where d.is_featured = 1 and a.id = ? `, [options.orderId], (err, order) =>{
            if(err){
                callback(err)
            }else{
                async.eachSeries(order, (o, cb) =>{
                    connection.query(`SELECT product_rate  from product_rate where product_id = ? and users_id = ?`, [o.product_id, options.userId], (err, rating) => {
                        if(err){
                           
                            cb(err)
                        }else{
                            if(rating[0]){
                                o.product_rate = rating[0].product_rate ? rating[0].product_rate : 0
                            }else{
                                o.product_rate = 0
                            }
                            connection.query(`SELECT a.*,date_format(a.created_at, "%M %d %Y %T") as date, concat(b.fname , +" ", b.lname) as username from product_review as a
                            inner join users as b on b.id = a.users_id where  a.product_id = ? and a.order_id = ?`, [ o.product_id, options.orderId], (err, review) => {
                                if(err){
                                    cb(err)
                                }else{
                                    if(review[0]){
                                        var arr = []
                                        review.forEach((r) =>{
                                            arr.push([r.product_review,r.date,r.username])
                                        })
                                        o.product_review = arr ? arr : 0
                                    }else{
                                        o.product_review = 0
                                       
                                    }
                                    cb()
                                }
                            })
                        }
                    })
                }, (err, result) =>{
                    if(err){
                        console.log(err)
                    }else{
                    callback(false, order)
                    }
                })
            }
        })
    }

    module.ViewRateByProduct =(options,callback)=>{
        connection.query(`SELECT 
        round(AVG(product_rate),1) 'avg_rate',
        (select count(users_id) from product_rate where product_id = ${options.productId} and product_rate = 1) as one_star_count,
        (select count(users_id) from product_rate where product_id = ${options.productId} and product_rate = 2) as two_star_count,
        (select count(users_id) from product_rate where product_id = ${options.productId} and product_rate = 3) as three_star_count,
        (select count(users_id) from product_rate where product_id = ${options.productId} and product_rate = 4) as four_star_count,
        (select count(users_id) from product_rate where product_id = ${options.productId} and product_rate = 5) as five_star_count
        FROM
        product_rate where product_id = ${options.productId}`, (err,rate)=>{
            if(err){
                callback(true,err);
            }else{
                callback(err, rate);
            }
        })
    }

    module.productRating =(options,callback)=>{
        connection.query(`SELECT * FROM product_rate where product_id = ? and users_id =?`,[options.productId, options.userId],(err,rating)=>{
            if(err){
                callback(true,err);
            }
            else{
                callback(err, rating);
            }
        })
    }

    module.AverageRate = (options, callback) =>{
        connection.query(`SELECT round(AVG(stars),1) 'avg_rate' FROM shop_rate where shop_id = ?`, [options.brandLocationId], (err, AverageRate) =>{
            if(err){
                callback(err)
            }else{
                callback(false, AverageRate)
            }
        })
    }

    module.ViewRateByShop = (options, callback) => {
       
        connection.query(`select * from shop_rate where user_id = ? and shop_id = ?`, [options.userId, options.brandLocationId], (err, rate) =>{
            if(err){
                callback(err)
            }else{
                callback(false, rate)
            }
        })

    }

    module.getPaymentMethods = ( callback) =>{
        connection.query(`select * from payment_methods_master;`, (err, paymentMethod) =>{
            if(err){
                callback(err)
            }else{
                callback(false, paymentMethod)
            }
        })
    }
    
    module.pendingShipments = (options, callback) =>{
        connection.query(`select a.*, b.shipping_charges, b.amount, b.payment_mode
        from shop_orders as a 
        left join shop_payment_request as b on b.order_id = a.id 
         where a.users_id = ? and a.order_status = 1`, [options.userId], (err, pendingShipments) =>{
            if(err){
                callback(err)
            }else{
                callback(false, pendingShipments)
            }
         })
    }

    module.getLocationAdmin= (options, callback) =>{
        connection.query(`SELECT a.users_id, a.brand_locations_id 
        from brand_location_users as a
        inner join users as b on b.id = a.users_id 
        inner join user_roles as c on c.users_id = a.users_id
        where a.brand_locations_id = ${options.locationId} and b.is_active = 1 and b.is_deleted = 0 and c.roles_id = 2`, (err, adminList) =>{
            if(err){
                callback(err)
            }else{
                callback(false, adminList[0].users_id)
            }
        })
    }

    module.sendNotification= (options, callback) =>{
        connection.query(`INSERT INTO Notifications SET type_id = 1, order_id = ${options.orderId}, description = 'Your order has been placed', user_id = ${options.userId}, receiver_id = ${options.userId}`, (err, data) =>{
            if(err){
                callback(err)
            }else{
                connection.query(`INSERT INTO Notifications SET type_id = 1, order_id = ${options.orderId}, description = 'New order is placed', user_id = ${options.adminId}, receiver_id = ${options.adminId}`, (err, data1) =>{
                    if(err){
                        callback(err)
                    }else{
                        // callback(false, data1)

                        connection.query(`select a.device_token,   CONCAT(b.fname, ' ' ,b.lname) as name from fcm_token as a
                        inner join users as b on b.id = a.user_id where a.user_id= ${options.userId}`, (err, customerToken)=>{
                            if(err){
                                callback(err)
                            }else{
                                connection.query(`select device_token from fcm_token where user_id= ${options.adminId}`, (err, adminToken) =>{
                                    if(err){
                                        callback(err)
                                    }else{
                                        if(customerToken.length){
                                            customerToken.forEach(customerToken => {
                                                console.log("token", customerToken.device_token)
                                                var message = {
                                                    to: customerToken.device_token,
                                                    notification: {
                                                    // title: 'notification',
                                                        body: 'Your order has been placed',
                                                    },   
                                                    data: {
                                                        screen: 'RecentOrdersScreen',
                                                        userId: options.userId,
                                                        orderId:options.orderId
                                                    },
                                                    // Required for background/quit data-only messages on iOS
                                                    contentAvailable: true,
                                                    // Required for background/quit data-only messages on Android
                                                    priority: 'high',
                                                };
                                                console.log("message",message)
                                                fcm1.send(message, function (err, response) {
                                                    if (err) {
                                                        console.log("Something has gone wrong!" + err);
                                                    } else {
                                                        console.log("Successfully sent with response: ", response);
                                                    }
                                                });
                                            })
                                        }
                                        
                                        if(adminToken.length){
                                            adminToken.forEach(adminToken => {
                                                console.log("token", adminToken.device_token)
                                                var message = {
                                                    to: adminToken.device_token,
                                                    notification: {
                                                    // title: 'notification',
                                                        body: 'New order is placed',
                                                    },   
                                                    data: {
                                                        screen: 'OrdersScreen',
                                                        userId: options.adminId,
                                                        orderId:options.orderId
                                                    },
                                                    // Required for background/quit data-only messages on iOS
                                                    contentAvailable: true,
                                                    // Required for background/quit data-only messages on Android
                                                    priority: 'high',
                                                };
                                                console.log("message",message)
                                                fcm.send(message, function (err, response) {
                                                    if (err) {
                                                        console.log("Something has gone wrong!" + err);
                                                    } else {
                                                        console.log("Successfully sent with response: ", response);
                                                    }
                                                });
                                            })
                                        }
                                        callback(false)
                                    }
                                })
                            }
                        })
                    }
                })    
            }
        })
    }

    return module;
};

module.exports = Cart;