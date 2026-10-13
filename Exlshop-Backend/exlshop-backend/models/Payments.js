/********************************************************/
/***** Payments Model *****/
/********************************************************/

const Payments = (connection, logger) => {
    const module = {}
    const moment = require('moment');

    module.GetMethods = (options, callback) => {
        connection.query("SELECT * FROM payment_methods_master", (err, methods) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, methods)
            }
        })
    }

    module.GetByUserId = (options, callback) => {
        connection.query(`SELECT
    a.id,
    a.sale_location_id,
    a.created_date,
    a.completed,
    a.total_amount,
    ROUND(SUM(b.amount), 2) AS amount_paid,    
    a.comment,
    a.deleted
FROM
    sales AS a
        INNER JOIN
    sales_payments AS b ON b.sale_id = a.id        
WHERE
    a.brand_locations_id = ? AND a.member_id = ?
GROUP BY a.id ORDER BY a.created_date DESC`, [options.locationId, options.userId], (err, payments) => {
            callback(err, payments)
        })
    }

    module.LocationSaleTillDate = (options, callback) => {
        var search = ``;
        if(options.startDate && options.endDate){
            var date1 = moment(options.startDate+' 00:00:00','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate+' 23:59:59','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if(options.startDate && options.endDate){
                search = ` AND a.created_date BETWEEN '${date1}' AND '${date2}' `; 
            }else if(options.startDate){
                search = ` AND a.created_date >= '${date1}' `; 
            }else if(options.endDate){
                search = ` AND a.created_date <= '${date2}' `; 
            }  
        }else{
            search = ` AND DATE_FORMAT(a.created_date,"%m-%Y") = "${moment().format('MM-YYYY')}"  `;
        }
        connection.query(`SELECT 
    COALESCE(SUM(a.total_amount),0) AS total_amount
FROM
    sales AS a
WHERE
    a.brand_locations_id = ? ${search} `, [options.locationId], (err, saleTotal) => {
            callback(err, saleTotal[0].total_amount)
        })
    }

    module.TotalReceivedByLocation = (options, callback) => {
        var search = ``;
        if(options.startDate || options.endDate){
            var date1 = moment(options.startDate+' 00:00:00','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate+' 23:59:59','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if(options.startDate && options.endDate){
                search = ` AND b.created_date BETWEEN '${date1}' AND '${date2}' `; 
            }else if(options.startDate){
                search = ` AND b.created_date >= '${date1}'`; 
            }else if(options.endDate){
                search = ` AND b.created_date <= '${date2}' `; 
            }  
        }else{
            search = ` AND DATE_FORMAT(b.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;
        }

        connection.query(`SELECT IFNULL(SUM(e.amount),0) as total_amount  from shop_payment_request as e where e.amount IN( 
            SELECT (d.amount) as total_amount
                    FROM  shop_products AS a
                    INNER JOIN shop_orders_products AS b
                    ON a.id=b.product_id
                    INNER JOIN shop_orders AS c
                    ON c.id=b.order_id
                    INNER JOIN shop_payment_request AS d
                    ON d.instamojo_payment_request_id=c.instamojo_payment_request_id
                    where a.location_id=? ${search}
                    group by d.amount)`, [options.locationId], (err, receivedTotal) => {
            callback(err, receivedTotal[0].total_amount)
        })
    }

    module.GetOutstandingByLocation = (options, callback) => {
        var search = ``;
        if(options.startDate || options.endDate){
            var date1 = moment(options.startDate+' 00:00:00','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate+' 23:59:59','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if(options.startDate && options.endDate){
                search = ` AND a.created_date BETWEEN '${date1}' AND '${date2}' AND b.created_date BETWEEN '${date1}' AND '${date2}' `; 
            }else if(options.startDate){
                search = ` AND a.created_date >= '${date1}' AND b.created_date >= '${date1}'`; 
            }else if(options.endDate){
                search = ` AND a.created_date <= '${date2}' AND b.created_date <= '${date2}' `; 
            }  
        }
        connection.query(`SELECT
    a.id,
    a.sale_location_id,
    a.created_date,
    a.completed,
    COALESCE(a.total_amount,0) AS total_amount,
    COALESCE(ROUND(SUM(b.amount), 2),0) AS amount_paid,
    COALESCE(a.total_amount - b.amount,0) AS outstanding_amount,
    c.fname,
    c.lname,
    c.phone,
    a.comment,
    a.deleted,
    d.expiry_date,
    GROUP_CONCAT(f.name SEPARATOR '<br>') AS packages,
        DATEDIFF(NOW(), a.created_date) AS ageing
FROM
    sales AS a
        INNER JOIN
    sales_payments AS b ON b.sale_id = a.id
        INNER JOIN
    users AS c ON c.id = a.member_id
        INNER JOIN membership_logs AS d ON d.sale_id = a.id
        INNER JOIN sales_packages AS e ON e.sale_id = a.id
        INNER JOIN packages AS f ON f.id = e.package_id        
WHERE
    a.brand_locations_id = ? AND a.completed = 0 AND deleted = 0 AND COALESCE(a.total_amount - b.amount,0) != 0 ${search}
    GROUP BY a.id, b.amount, d.expiry_date ORDER BY a.created_date DESC`, [options.locationId], (err, outstandingSales) => {
            callback(err, outstandingSales)
        })
    }

    return module;
};

module.exports = Payments;