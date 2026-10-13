const { json } = require('body-parser');
const { options } = require('../routes/super-admin/shop');

const Orders = (connection, logger) => {
    const module = {}
    const moment = require('moment');
    
module.AddPickupDetails= (options, callback) => {
    connection.query(`UPDATE  shop_orders_products SET pickup_details ='${JSON.stringify(options.json)}' WHERE order_id = '${options.order_id}'`, (err,pickup_details) => {
        if(err){callback(err)}else{
           callback(false,pickup_details)
       }
    })
}

    module.GetAllShopOrders= (options, callback) => {
        var search = ``;
        var filterQuery = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.id like  ${keyword} or a.instamojo_payment_request_id LIKE ${keyword} OR b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR b.email LIKE ${keyword} OR b.phone LIKE ${keyword} OR e.name LIKE ${keyword} OR f.name LIKE ${keyword} OR c.label LIKE ${keyword} OR c.name LIKE ${keyword} OR c.address_line_1 LIKE ${keyword} or j.name like ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if(options.filter){
            var filter=options.filter
            if (filter.order_status) {
                filterQuery += ` AND   j.name= ${connection.escape(filter.order_status)} `
            }
            if(filter.order_id){
                filterQuery+=`AND a.instamojo_payment_request_id= ${connection.escape(filter.order_id)}`
            }
            if(filter.customer_name){
                filterQuery+=`AND  (b.fname= ${connection.escape(filter.customer_name)} || b.lname= ${connection.escape(filter.customer_name)})`
            }
        }
       var dateFilter = ``;
        if (options.filter.orderplaced_datefrom||options.filter.orderplaced_dateto) {
            var date1 = options.filter.orderplaced_datefrom
            var date2 =options.filter.orderplaced_dateto 
            if (options.filter.orderplaced_datefrom&& options.filter.orderplaced_dateto) {
                dateFilter = ` AND a.created_date BETWEEN '${options.filter.orderplaced_datefrom}' AND '${options.filter.orderplaced_dateto}' `;
               
            } else if (options.filter.orderplaced_datefrom) {
                dateFilter = ` AND a.created_date >= '${date1}' `;
        
            } else if (options.filter.orderplaced_dateto) {
                dateFilter = ` AND a.created_date <= '${date2}' `;
             
            }
        } else if (options.currentMonthOnly) {
            dateFilter = ` AND DATE_FORMAT(a.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;      
        }      
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
        a.id, 
        a.created_date,
        a.instamojo_payment_request_id,
        a.order_status as order_status_id,
        a.assignedId,
        k.payment_mode,
        j.name,
        CONCAT(b.fname, ' ', b.lname) AS user_name,
        b.email,
        b.phone,
        b.id as user_id,
        c.label AS address_label,
        c.name AS address_name,
        c.address_line_1,
        c.address_line_2,
        c.phone,
        c.zip,
        d.delivery_details,
        GROUP_CONCAT(e.name, IF(f.name , CONCAT(' (',f.name,') '), ''),' ') AS products,
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
        LEFT JOIN 
    shop_product_variations AS f ON f.id = d.variation_id
        LEFT JOIN 
    countries AS g ON g.id = c.country_id
        LEFT JOIN 
    states AS h ON h.id = c.id
        LEFT JOIN
    cities AS i ON i.id = c.city_id
        LEFT JOIN 
    order_status as j ON j.id=a.order_status
        LEFT JOIN
	shop_payment_request as k on (k.instamojo_payment_request_id = a.instamojo_payment_request_id OR k.order_id = a.id)
    WHERE e.user_id=${options.userId} AND e.location_id=${options.locationId}
    ${search} ${filterQuery} ${dateFilter}  AND a.id IS NOT NULL GROUP BY a.id,d.delivery_details,k.payment_mode
    ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, orders) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
               callback(false, {total: orders[1][0].total, orders: orders[0]});
            }
        })
    }

    module.GetAllShopOrdersForStaff= (options, callback) => {
        var search = ``;
        var filterQuery = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.id like  ${keyword} or a.instamojo_payment_request_id LIKE ${keyword} OR b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR b.email LIKE ${keyword} OR b.phone LIKE ${keyword} OR e.name LIKE ${keyword} OR f.name LIKE ${keyword} OR c.label LIKE ${keyword} OR c.name LIKE ${keyword} OR c.address_line_1 LIKE ${keyword} or j.name like ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if(options.filter){
            var filter=options.filter
            if (filter.order_status) {
                filterQuery += ` AND   j.name= ${connection.escape(filter.order_status)} `
            }
            if(filter.order_id){
                filterQuery+=`AND a.instamojo_payment_request_id= ${connection.escape(filter.order_id)}`
            }
            if(filter.customer_name){
                filterQuery+=`AND  (b.fname= ${connection.escape(filter.customer_name)} || b.lname= ${connection.escape(filter.customer_name)})`
            }
        }
       var dateFilter = ``;
        if (options.filter.orderplaced_datefrom||options.filter.orderplaced_dateto) {
            var date1 = options.filter.orderplaced_datefrom
            var date2 =options.filter.orderplaced_dateto 
            if (options.filter.orderplaced_datefrom&& options.filter.orderplaced_dateto) {
                dateFilter = ` AND a.created_date BETWEEN '${options.filter.orderplaced_datefrom}' AND '${options.filter.orderplaced_dateto}' `;
               
            } else if (options.filter.orderplaced_datefrom) {
                dateFilter = ` AND a.created_date >= '${date1}' `;
        
            } else if (options.filter.orderplaced_dateto) {
                dateFilter = ` AND a.created_date <= '${date2}' `;
            }
        } else if (options.currentMonthOnly) {
            dateFilter = ` AND DATE_FORMAT(a.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;      
        }      
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
        a.id, 
        a.created_date,
        a.instamojo_payment_request_id,
        a.order_status as order_status_id,
        a.assignedId,
        k.payment_mode,
        j.name,
        CONCAT(b.fname, ' ', b.lname) AS user_name,
        b.email,
        b.phone,
        b.id as user_id,
        c.label AS address_label,
        c.name AS address_name,
        c.address_line_1,
        c.address_line_2,
        c.phone,
        c.zip,
        d.delivery_details,
        GROUP_CONCAT(e.name, IF(f.name , CONCAT(' (',f.name,') '), ''),' ') AS products,
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
        LEFT JOIN 
    shop_product_variations AS f ON f.id = d.variation_id
        LEFT JOIN 
    countries AS g ON g.id = c.country_id
        LEFT JOIN 
    states AS h ON h.id = c.id
        LEFT JOIN
    cities AS i ON i.id = c.city_id
        LEFT JOIN 
    order_status as j ON j.id=a.order_status
        LEFT JOIN
	shop_payment_request as k on (k.instamojo_payment_request_id = a.instamojo_payment_request_id OR k.order_id = a.id)
    WHERE a.assignedId=${options.userId} AND e.location_id=${options.locationId}
    ${search} ${filterQuery} ${dateFilter}  AND a.id IS NOT NULL GROUP BY a.id,d.delivery_details,k.payment_mode
    ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, orders) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
               callback(false, {total: orders[1][0].total, orders: orders[0]});
            }
        })
    }

    module.GetAll = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            var date = moment(`%${keyword}%` , 'DD-MM-YYYY').format('YYYY-MM-DD');
            search = ` AND (a.instamojo_payment_request_id LIKE ${keyword} OR b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR b.email LIKE ${keyword} OR b.phone LIKE ${keyword} OR e.name LIKE ${keyword} OR f.name LIKE ${keyword} OR c.label LIKE ${keyword} OR c.name LIKE ${keyword} OR c.address_line_1 LIKE ${keyword}
                or a.created_date like '%${date}%')`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if(options.userId){
            search += ` AND a.users_id = ${options.userId} `;
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
            a.id, 
            a.created_date,
            a.order_status,
            a.instamojo_payment_request_id, a.instamojo_payment_id,
            CONCAT(b.fname, ' ', b.lname) AS user_name,
            b.fname,
            b.lname,
            b.email,
            b.phone,
            b.id as user_id,
            c.label AS address_label,
            c.name AS address_name,
            c.address_line_1,
            c.address_line_2,
            c.phone,
            c.country_id,
            c.state_id,
            c.city_id,
            c.zip,
            GROUP_CONCAT(distinct k.name) as shop_name,
            (g.name) as country_name,
            (h.name) as state_name,
            (i.name) as city_name,
         SUM (e.regular_price ) AS sub_total,
         SUM (e.discount_price ) AS total_discount,
            m.amount AS total_amount,
            GROUP_CONCAT(e.name, IF(f.name , CONCAT(' (',f.name,') '), ''),' ') AS products,
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
            LEFT JOIN 
        shop_product_variations AS f ON f.id = d.variation_id
            LEFT JOIN 
        countries AS g ON g.id = c.country_id
            LEFT JOIN 
        states AS h ON h.id = c.state_id
            LEFT JOIN
        cities AS i ON i.id = c.city_id
        left join brand_locations as j on j.id = e.location_id
        left join brands as k on k.id = j.brands_id
        left join shop_payment_request as m on (m.instamojo_payment_request_id = a.instamojo_payment_request_id OR m.order_id = a.id)
        WHERE a.id IS NOT NULL ${search} GROUP BY a.id, m.amount ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, orders) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                console.log(orders[0])
               callback(false, {total: orders[1][0].total, orders: orders[0]});
            }
        })
    }

    module.GetStaffList = (options,callback) => {
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
                b.id, CONCAT(b.fname, " " ,b.lname) user_name
        FROM
            brand_location_users AS a
            INNER JOIN users AS b ON b.id = a.users_id
            INNER JOIN user_roles AS c ON c.users_id = a.users_id AND c.roles_id = 9
        WHERE
            a.brand_locations_id=? AND b.is_deleted = 0 GROUP BY b.id`, [options.locationId], (err,staff) => {
                if (err) {
                    logger.error.error(err)
                    callback(err)
                } else {
                    callback(false, staff);
                }
            })
    }

    module.assignStaff = (options,callback) => {
        connection.query(`UPDATE shop_orders SET assignedId = ? WHERE id = ?`, [options.assignedId, options.orderId], (err) => {
                if (err) {
                    logger.error.error(err)
                    callback(err)
                } else {
                    callback(false);
                }
            })
    }

    module.GetSingle = (options,callback) =>{
        connection.query(`SELECT 
        a.*,
        b.label ,
        b.name as address_name,
        b.address_line_1,
        b.address_line_2,
        b.zip,
        b.phone,
        c.name AS country_name,
        d.name AS state_name,
        e.name AS city_name,
        f.amount
    FROM shop_orders AS a
        JOIN 
        shop_user_shipping_address AS b ON b.id = a.shipping_address_id
        LEFT JOIN 
        countries AS c ON c.id = b.country_id
        LEFT JOIN 
        states AS d ON d.id = b.state_id
        LEFT JOIN 
        cities AS e ON e.id = b.city_id
        LEFT JOIN 
        shop_payment_request AS f ON (f.instamojo_payment_request_id=a.instamojo_payment_request_id OR f.order_id=a.id)
    WHERE a.id =? `, [options.orderId],(err, order) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, order[0]);
            }
        })
    }

    module.GetProducts = (options,callback) =>{
        connection.query(`SELECT 
            a.id ,
            a.order_id,
            a.quantity,
            b.id AS product_id,
            b.name AS product_name,
            b.product_type,
            b.regular_price,
            b.discount_price,
            c.regular_price AS variation_regular_price,
            c.discount_price AS variation_discount_price,
            c.name AS variation_name,
            d.file_name ,
            f.name AS category_name, f.slug,
            g.dietitian_id,
            a.delivery_details,
            i.delivery_option,
            CONCAT(h.fname,' ',h.lname) AS dietitian_name
        FROM shop_orders_products AS a
            JOIN 
            shop_products  AS b ON b.id = a.product_id
            inner join brand_location_users as i on i.users_id=b.user_id and i.brand_locations_id= b.location_id
            LEFT JOIN 
            shop_product_variations AS c ON c.id = a.variation_id
            LEFT JOIN 
            shop_product_images AS d ON d.product_id = b.id
            AND d.is_featured = 1
            LEFT JOIN 
            shop_product_categories AS e ON e.product_id = b.globalproduct_id
            LEFT JOIN 
            shop_categories AS f ON f.id = e.category_id
            LEFT JOIN 
            shop_orders_products_dietitians AS g ON g.shop_orders_products_id = a.id
            LEFT JOIN
            users AS h ON h.id = g.dietitian_id
        WHERE a.order_id IN (${options.orderId}) `,(err, orderProducts) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, orderProducts);
            }
        })
    }

    module.RegistrationCheckout = (options, callback) => {
        connection.query(`select * from shop_subscription_request where users_id = ? and shop_id = ? and is_deleted = 0`, [options.userId, options.locationId], (err, data) =>{
            if(err){
                callback(err)
            }else{
                if(!data.length){
                    connection.query(`INSERT INTO shop_subscription_request SET users_id = ?, shop_id = ?, instamojo_payment_request_id = ?, amount = ?, currency = ?`, [options.userId, options.locationId, options.subscriptioId, options.amount, options.currency], (err,orderdata) => {
                        if(err){
                            callback(err)
                        }else{
                            callback(false,orderdata)
                        }
                     })
                }else{
                    connection.query(`update shop_subscription_request set is_deleted = 1 where users_id = ? and shop_id = ?`, [options.userId, options.locationId], (err) =>{
                        if(err){
                            callback(err)
                        }else{
                            connection.query(`INSERT INTO shop_subscription_request SET users_id = ?, shop_id = ?, instamojo_payment_request_id = ?, amount = ?, currency = ?`, [options.userId, options.locationId, options.subscriptioId, options.amount, options.currency], (err,orderdata) => {
                                if(err){
                                    callback(err)
                                }else{
                                    callback(false,orderdata)
                                }
                             })
                            // callback(false,orderdata)
                        }
                    })
                    // callback(false)
                }
            }
        })
        
     
    }

    module.cancelCurrentPlan = (options, callback) => {
        connection.query(`UPDATE shop_subscription_request SET is_deleted = 1 WHERE  users_id = ? AND shop_id = ?;`, [ options.userId, options.locationId], (err,oldOrder) => {
            if(err){
                callback(err)
            }else{
                // callback(false,oldOrder)
                connection.query(`update shop_subsription SET is_deleted = 1 where users_id = ? AND shop_id = ?`, [options.userId, options.locationId], (err)=>{
                    if(err){
                        callback(err)
                    }else{
                        callback(false)
                    }
                })
            }
        })
    }

    module.Create = (options, callback) => {
        connection.query(`select * from shop_subsription where users_id = ${options.userId} AND shop_id = ${options.locationId}`, (err, subsriptionDetails) =>{
            if(err){
                callback(err)
            }else{
                if(!subsriptionDetails.length){

                    var duration = null
                    if(options.planPeriod && options.planPeriod == 'monthly') {
                        if (options.interval == 1) {
                            duration = `DATE_ADD(now(), INTERVAL 1 month )`
                        } else if (options.interval == 3) {
                            duration = `DATE_ADD(now(), INTERVAL 3 month )`
                        } else if (options.interval == 6) {
                            duration = `DATE_ADD(now(), INTERVAL 6 month )`
                        }
                    } else if(options.planPeriod && options.planPeriod == 'yearly') {
                        if (options.interval == 12) {
                            duration = `DATE_ADD(now(), INTERVAL 1 year )`
                        }
                    }

                    if(options.planId == 1){
                        duration = `DATE_ADD(now(), INTERVAL 1 month )`
                    }
                    connection.query(`Insert into shop_subsription SET plan_id = ${options.planId}, instamojo_payment_request_id = ${options.subscriptionId}, 
                    instamojo_payment_id = ${options.paymentId},amount= ${options.amount},status= 1, start_date = now(), end_date = ${duration}, is_deleted = 0, users_id = ${options.userId}, shop_id = ${options.locationId}`, 
                     (err, order) => {
                        callback(err, order)
                    })

                }else{
                    var duration = null
                    if(options.planPeriod && options.planPeriod == 'monthly') {
                        if (options.interval == 1) {
                            duration = `DATE_ADD(now(), INTERVAL 1 month )`
                        } else if (options.interval == 3) {
                            duration = `DATE_ADD(now(), INTERVAL 3 month )`
                        } else if (options.interval == 6) {
                            duration = `DATE_ADD(now(), INTERVAL 6 month )`
                        }
                    } else if(options.planPeriod && options.planPeriod == 'yearly') {
                        if (options.interval == 12) {
                            duration = `DATE_ADD(now(), INTERVAL 1 year )`
                        }
                    }
                    connection.query(`UPDATE shop_subsription SET plan_id = ?, instamojo_payment_request_id = ?, 
                    instamojo_payment_id = ?,amount=?,status=?, start_date = now(), end_date = ${duration}, status = 1, is_deleted = 0 WHERE users_id = ? AND shop_id = ?`, 
                    [options.planId, options.subscriptionId, options.paymentId,options.amount,1, 
                        options.userId, options.locationId], (err, order) => {
                        callback(err, order)
                    })
                }
            }
        })
       
    }

    module.getorderstatus= ( callback) => {
        connection.query('select *from order_status', (err, order_status) => {
            callback(err, order_status)
        })
    }

    module.getorderstatushistory= (options,callback) => {
        connection.query('SELECT * from Brand_location_order_delivery_history WHERE order_id = ?',[options.orderId], (err, order_status_history) => {
            callback(err, order_status_history[0])
        })
    }

    module.getOrderDetails= (options, callback)=>{
        connection.query(`select c.name,c.sku,(b.quantity) as units,CONCAT(c.regular_price - c.discount_price) AS selling_price, (c.discount_price) as discount,a.tax, a.hsn  from shop_orders as a 
        JOIN shop_orders_products as b ON b.order_id = a.id
        JOIN shop_products as c ON c.id = b.product_id
        where a.id = ?`,[options.id], (err, data)=>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.updatestatus= (options, callback) => {
        connection.query(`UPDATE  shop_orders SET order_status = ? WHERE id = ?`, [options.statusId,  options.orderId], (err, order) => {
            callback(err, order.insertId)
        })
    }
    module.up_status= (options, callback) => {
        connection.query(`UPDATE  shop_orders_products SET order_status = ? WHERE order_id = ?`, [options.statusId,  options.orderId], (err, order) => {
           if(err){
            callback(err)
           }else{
            callback(false, order)
           }
        })
    }

    module.updateOrderStatusHistory= (options, callback) => {
        var col = ''
        if(options.statusId == 1) {
            col = `Order_Placed`
        } else if(options.statusId == 2) {
            col = `Shipped`
        } else if(options.statusId == 3) {
            col = `Out_for_Delivery`
        } else if(options.statusId == 4) {
            col = `Delivered`
        } else if(options.statusId == 5) {
            col = `Cancelled`
        } else if(options.statusId == 6) {
            col = `Returned`
        } else if(options.statusId == 7) {
            col = `push_to_shiprocket`
        }
        connection.query(`UPDATE Brand_location_order_delivery_history SET ${col} = 1 WHERE order_id = ?`, [options.orderId], (err, order) => {
            callback(err, order)
        })
    }

    module.updateOrderDelStatus= (options, callback) => {
        connection.query(`UPDATE brand_exlshop_shipping_details SET del_order_id = ?, shipment_id = ?,
        status = ?, status_code = ?, awb_code = ? WHERE order_id = ? AND user_id = ? AND location_id = ?;`, 
        [options.del_order_id,  options.del_shipment_id, options.del_status, options.del_status_code, options.awb_code,
            options.orderId, options.user_id, options.locationId], (err, order) => {
                if(err){
                    callback(err)
                }else{
                    callback(false, order.insertId)
                }
        })
    }

    module.statusUpadte= (options, callback) => {
        var num
        if(options.selectText == 'Shipped'){
          num = 2
        }else if(options.selectText == 'Order Placed'){
            num = 1
        }else if(options.selectText == 'Out for Delivery'){
           num = 3
        }else if(options.selectText == 'Delivered'){
            num = 4
        }else if(options.selectText == 'Cancelled'){
            num = 5
        }else if(options.selectText == 'Returned'){
            num = 6
        }
        connection.query(`UPDATE  shop_orders SET order_status = ? WHERE id = ?`, [num,  options.id], (err, order) => {
            if(err){
                callback(err)
            }else{
                connection.query(`UPDATE  shop_orders_products SET order_status = ? WHERE order_id = ?`, [num,  options.id], (err, orders) => {
                    if(err){
                        callback(err)
                    }else{
                         callback(false, orders)
                    }
                })
            }
        })
    }

    module.shipRocketStatus= (options, callback) => {
        var num
        if(options.pushedStatus == 'push to shiprocket'){
            var num = 7
        }
        connection.query(`UPDATE  shop_orders SET order_status = ? WHERE id = ?`, [num,  options.id], (err, order) => {
            if(err){
                callback(err)
            }else{
                connection.query(`UPDATE  shop_orders_products SET order_status = ? WHERE order_id = ?`, [num,  options.id], (err, orders) => {
                    if(err){
                        callback(err)
                    }else{
                         callback(false, orders)
                    }
                })
            }
        })
    }

    module.setOrderAmountDistance=(options, callback)=> {
        connection.query(`UPDATE brand_locations SET ?? = ? WHERE id = ?;`, [options.col, options.val, options.locationId], (err, setoption) => {
            if(err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.setDeliveryOption=(options, callback)=> {
        connection.query(`UPDATE brand_locations SET delivery_choice = ? WHERE id = ?;`, [options.choice, options.locationId], (err, setchoice) => {
            if(err) {
                callback(err)
            } else {
                connection.query(`INSERT INTO brand_location_delivery_log SET user_id = ?, location_id = ?,
                choice = ?;`,[options.user_id, options.locationId, options.choice], (err, choicelog) => {
                    if(err) {
                        callback(err)
                    } else {
                        callback(false)
                    }
                })
            }
        })
    }
    module.getDeliveryOption=(options, callback)=> {
        connection.query(`SELECT delivery_choice FROM brand_locations WHERE id = ?;`, [options.locationId], (err, getchoice) => {
            if(err) {
                callback(err)
            } else {
                callback(false, getchoice[0].delivery_choice)
            }
        })
    }
    module.getShippingCharges=(options, callback)=>{
        connection.query(`select * from brand_shipping_charges where brand_location_id = ${options.locationId}
        AND is_deleted = 0 LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`,(err, record)=> {
            if(err){
                callback(err)
            }else{
                callback(err, { total: record[1][0].total, record: record[0] })
            }
        })
    }

    module.deleteShippingCharges=(options, callback)=>{
        connection.query(`UPDATE brand_shipping_charges SET is_deleted = 1
        WHERE id = ?;`,[options.record_id], (err, record)=> {
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    module.addShippingCharges=(options, callback)=>{
        connection.query(`select * from brand_shipping_charges where user_id = ${options.user_id} and brand_location_id = ${options.locationId}`,(err, charges)=> {
            if(err){
                callback(err)
            }else{
                if(charges.length == 0){
                    connection.query('INSERT INTO brand_shipping_charges SET user_id = ?, brand_location_id = ?, d_0_5_Km = ?, d_5_10_Km = ?, d_10_20_Km = ?, d_20_40_Km = ?, d_40_60_Km = ?, d_60_100_Km = ?, d_more_than_100_Km = ?',
                    [options.user_id, options.locationId, options.post.range0_5, options.post.range5_10, options.post.range10_20, options.post.range20_40, options.post.range40_60, options.post.range60_100, options.post.rangeMorethan_100], (err, insertRecord)=>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false, insertRecord)
                        }
                    })
                }else{
                    connection.query(`UPDATE brand_shipping_charges SET d_0_5_Km = '${options.post.range0_5}',  d_5_10_Km = '${options.post.range5_10}', d_10_20_Km = '${options.post.range10_20}', d_20_40_Km = '${options.post.range20_40}', d_40_60_Km = '${options.post.range40_60}', d_60_100_Km = '${options.post.range60_100}', d_more_than_100_Km = '${options.post.rangeMorethan_100}' , is_deleted = 0 WHERE user_id = ${options.user_id} and brand_location_id = ${options.locationId}`, (err, updateRecord)=>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false, updateRecord)
                        }
                    })
                }
            }
        })
    }

    module.brandExlshopDelDetails=(options, callback)=>{
        connection.query('SELECT * FROM brand_exlshop_shipping_details WHERE order_id = ?', [options.order_id], (err, data) =>{
            if(err){
                callback(err)
            }else{
                if(data.length == 0){
                    connection.query('INSERT INTO brand_exlshop_shipping_details SET order_id = ?, user_id = ?, location_id = ?, weight = ?, height = ?, length = ?, breadth = ?',
                    [options.order_id, options.user_id, options.locationId, options.weight, options.height, options.length, options.breadth], (err, insertRecord)=>{
                    if(err){
                        callback(err)
                    }else{
                        callback(false, insertRecord)
                    }
                })
                }else{
                    callback(false, null)
                }
            }
           
        })
       
    }

    module.updatebrandExlshopDelDetails=(options, callback)=>{
        connection.query('UPDATE brand_exlshop_shipping_details SET user_id = ?, location_id = ?, weight = ?, height = ?, length = ?, breadth = ? WHERE order_id = ?;',
            [options.user_id, options.locationId, options.weight, options.height, options.length, options.breadth, options.order_id], (err, insertRecord)=>{
            if(err){
                callback(err)
            }else{
                callback(false, insertRecord)
            }
        })
    }

    module.getExlShopDelDetails=(options, callback)=>{
        connection.query('SELECT * FROM brand_exlshop_shipping_details WHERE order_id = ?',
            [options.orderId], (err, delDetails)=>{
            if(err){
                callback(err)
            }else{
                callback(false, delDetails)
            }
        })
    }

    module.updatePickupStatus=(options, callback)=> {
        connection.query(`UPDATE brand_locations SET set_pickup = 1 WHERE id = ?;`, [options.locationId], (err, setpickup) => {
            if(err) {
                callback(err)
            } else {
                callback(false, setpickup)
            }
        })
    }

    module.dailyOrder=(callback) =>{
        connection.query(`SELECT COUNT(*) as cnt FROM shop_orders WHERE created_date >=  current_date()`, (err, totalOrder) => {
            if(err){
                callback(err)
            }else{
                callback(false, totalOrder[0].cnt)
            }
    
        })
    }
    module.weeklyOrder=(callback) =>{
        connection.query(`SELECT COUNT(*) as cnt FROM shop_orders where  created_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`, (err, totalOrder) => {
            if(err){
                callback(err)
            }else{
                callback(false, totalOrder[0].cnt)
            }
    
        })
    }
    module.monthlyOrder=(callback) =>{
        connection.query(`SELECT COUNT(*) as cnt FROM shop_orders where  created_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`, (err, totalOrder) => {
            if(err){
                callback(err)
            }else{
                callback(false, totalOrder[0].cnt)
            }
    
        })
    }

    module.getOrderStatus = (callback) =>{
        connection.query(`select * from order_status`, (err, Status) =>{
            if(err){
                callback(err)
            }else{
                callback(false, Status)
            }
        })
    }

    module.getStatus=(options, callback) =>{
        connection.query(`SELECT  
        a.id, 
        a.created_date,
        a.instamojo_payment_request_id,
        a.order_status as order_status_id,
        a.assignedId,
        k.payment_mode,
        j.name,
        CONCAT(b.fname, ' ', b.lname) AS user_name,
        b.email,
        b.phone,
        b.id as user_id,
        c.label AS address_label,
        c.name AS address_name,
        c.address_line_1,
        c.address_line_2,
        c.phone,
        c.zip,
        d.delivery_details
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
    order_status as j ON j.id=a.order_status
        LEFT JOIN
	shop_payment_request as k on (k.instamojo_payment_request_id = a.instamojo_payment_request_id OR k.order_id = a.id)
    WHERE e.user_id= ? AND e.location_id= ?  AND a.id IS NOT NULL
    AND ((a.updated_at > NOW() - INTERVAL 300 SECOND) OR (a.created_date > NOW() - INTERVAL 300 SECOND))
    group by a.id, k.payment_mode, d.delivery_details`,[options.user_id, options.locationId], (err, orders) => {
            if(err){
                callback(err)
            }else{
                callback(false, orders)
            }
        })
    }


    module.UpdateSubscription = (options, callback) =>{
        connection.query(`update shop_subsription set plan_id = 1 where users_id = ${options.userId} and shop_id = ${options.locationId}`, (err) =>{
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    return module;
};
module.exports = Orders;