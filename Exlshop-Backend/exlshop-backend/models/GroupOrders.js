const GroupOrders = (connection, logger) => {
    const module = {}
    const moment = require('moment');

    module.GetPincodes= (options,callback) =>{
        connection.query(`SELECT b.zip as zip FROM shop_orders as a 
        INNER JOIN shop_user_shipping_address as b
        ON a.shipping_address_id=b.id 
        INNER JOIN shop_orders_products as d
        ON d.order_id=a.id
        INNER JOIN shop_products as e
        ON e.id=d.product_id
        WHERE e.user_id=?
        GROUP BY b.zip;`,[options.userId],(err, orderaddress) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, orderaddress);
            }
        })
    }
    module.Add = (options,callback) =>{
        connection.query(`INSERT INTO group_orders (name,locations) values("${options.groupname}","${options.locationId}") `,(err, grouporder) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, grouporder);
            }
        })
    }

    module.Update = (options,callback) =>{
        connection.query(`UPDATE group_orders SET name=?, locations="${options.locationId}" WHERE id=?`,[options.groupname, options.group_id],(err, grouporder) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, grouporder);
            }
        })
    }

    module.deleteGroup = (options,callback) =>{
        connection.query(`DELETE FROM group_orders WHERE id=?`,[options.group_id],(err, grouporder) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, grouporder);
            }
        })
    }

    module.GetGroupOrders=(options,callback)=>{
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search += `and  (a.name LIKE ${keyword} )`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.group_name) {
                search += ` and   a.name LIKE ${connection.escape(`%${filter.group_name}%`)} `
            }
            if (filter.zip_code) {
                search += ` and   a.locations LIKE ${connection.escape(`%${filter.zip_code}%`)} `
            }
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS a.id as id,a.name as name,a.locations as locations FROM group_orders as a where a.is_active ${search}  LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`,(err,gorders)=>{
            if(err){
                callback(err)
            } else {
               callback(false,{total: gorders[1][0].total,gorders:gorders[0]})
            }
        }) 
    }
    module.GetGroupLocations=(options,callback)=>{
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` where (a.name LIKE ${keyword} )`
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
        connection.query(`SELECT a.id,a.name,
        (b.zip) as zipcode from group_orders as a
            INNER JOIN shop_user_shipping_address as b
            ON FIND_IN_SET(b.zip,a.locations )
            where a.id=?
            GROUP BY a.name,a.id,b.zip;SELECT FOUND_ROWS() AS total`,[options.groupId],(err,gorders)=>{
            if(err){
                callback(err)
            } else {
               callback(false,{total: gorders[1][0].total,gorders:gorders[0]})
            }
        })
    }
    module.GetOrdersByLocation=(options,callback)=>{
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = `AND ((b.fname LIKE ${keyword} ) OR (b.lname LIKE ${keyword} ) OR (c.address_line_1 LIKE ${keyword}) OR 
            (c.address_line_2 LIKE ${keyword}) OR (g.name LIKE ${keyword}) OR (h.name LIKE ${keyword}) OR (i.name LIKE ${keyword}))`
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
        connection.query(`select a.id, 
        j.locations,
        a.created_date,
        a.instamojo_payment_request_id,l.name,
        k.amount,
        k.payment_mode,
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
        e.name AS products,
        CONCAT(i.name,', ',h.name,', ',g.name) AS shipping_address
    FROM
    shop_orders AS a
        LEFT JOIN
	shop_payment_request as k ON k.order_id = a.id
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
    group_orders AS j ON j.locations=c.zip
    inner JOIN order_status AS l ON l.id = d.order_status
    WHERE c.zip=? AND e.user_id=? AND e.location_id=? AND a.id IS NOT NULL ${search}
    LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`,[options.zipId,options.userId,options.locationId],(err,gorders)=>{
            if(err){
                callback(err)
            } else {
               callback(false,{total: gorders[1][0].total,gorders:gorders[0]})
            }
        })
    }
    return module;
};

module.exports = GroupOrders;