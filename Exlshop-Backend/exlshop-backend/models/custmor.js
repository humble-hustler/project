const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const moment = require('moment');

const custmor = (connection, logger) => {
    const module = {}

    module.GetCustmorDetail = (options, callback) => {
        var search = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.users_id LIKE ${keyword} OR a.fname LIKE ${keyword} OR a.lname LIKE ${keyword} OR a.phone LIKE ${keyword})`;
        }
        var filterQuery='';
        if(options.filter){
            var filter=options.filter
            if (filter.customer_name) {
                filterQuery += ` AND   (a.fname LIKE ${connection.escape(`%${filter.customer_name}%`)} || a.lname LIKE ${connection.escape(`%${filter.customer_name}%`)} )`
            }
            if(filter.email_id){
                filterQuery+=`AND a.email LIKE ${connection.escape(`%${filter.email_id}%`)}`        
            }
            if(filter.phone_no){
                filterQuery+=`AND  (a.phone LIKE ${connection.escape(`%${filter.phone_no}%`)} )`
            }
            if(filter.zip_code){
                filterQuery+=`AND  (a.zip LIKE ${connection.escape(`%${filter.zip_code}%`)} )` 
            }
        }
        connection.query(`select COUNT(users_id),b.users_id,
                    SUM(IF(b.order_status = 1,1,0)) as cnt1,
                    SUM(IF(b.order_status = 2,1,0)) as cnt2,
                    SUM(IF(b.order_status = 3,1,0)) as cnt3,
                    SUM(IF(b.order_status = 4,1,0)) as cnt4,
                    SUM(IF(b.order_status = 5,1,0)) as cnt5,
                    SUM(IF(b.order_status = 6,1,0)) as cnt6,
                    SUM(IF(b.order_status = 7,1,0)) as cnt7,
                    CONCAT(a.fname, ' ', a.lname) AS user_name,
                    a.phone,
                    a.email ,
                    a.zip
            from users AS a
                    JOIN
            shop_orders AS b ON a.id = b.users_id
                    JOIN 
            shop_orders_products as c ON c.order_id = b.id
                JOIN
            shop_products as d ON d.id = c.product_id
                JOIN
            brand_locations as e ON e.id = d.location_id
            where a.id = b.users_id  and  e.id = ?
            ${search} ${filterQuery} GROUP BY b.users_id
            LIMIT ${options.offset}, ${options.limit} ;SELECT FOUND_ROWS() AS total;`,[options.locationId],
                (err, customer) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(false, {total: customer[1][0].total, customer: customer[0]})
                    }
                })
    }

    module.GetLocationCustomer = (options, callback) => {
        connection.query(`SELECT 
        a.id,
        CONCAT(a.fname, ' ', a.lname) AS user_name
    FROM
        users AS a
            JOIN 
        shop_orders as b ON b.users_id = a.id
            JOIN 
        shop_orders_products as c ON c.order_id = b.id
            JOIN
        shop_products as d ON d.id = c.product_id
            JOIN
        brand_locations as e ON e.id = d.location_id
    WHERE e.id = ? AND a.is_deleted = 0 
    GROUP BY a.id ORDER BY a.fname ASC`, [options.locationId], (err, users) => {
            if (err) {
                callback(err)
            } else {
                callback(false, users)
            }
        })
    }
    return module;
}
module.exports = custmor;