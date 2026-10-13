/***** User Model *****/
/********************************************************/
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')
const randtoken = require('rand-token');
const sesClient = require('../ses-client');
const saltRounds = 10;
const moment = require('moment');
const { CodeStarconnections } = require('aws-sdk');
const { options } = require('../routes');
const { forEach } = require('lodash');
var FCM = require('fcm-node');
var serverKey = 
'AAAATE0L40g:APA91bGL6bVyxbdDq_5xZGAWnr2TBbuwzBIpdwrSPEeA41-4_oYtUUKMk0svtvESYmU6aaIaunwolc4-9R1Ww7eGSwZng1I-x2Cy1_UuhwKcwGSI7WO2gyX9XKPAX3ZHRBH6EB2Bdk8S'
var serverKey1 = 'AAAA9fp2meU:APA91bHsnhA-keeAfdE5HrsUFWiRVA-ppe-QBvCaJlI6vD-Ql5zsDqvn2lqyKaK2ISXgK9WffvDYwylW9OxId0_Zm627xx2eR_k2A9VqQ_j0L4hs8mIJ_hhRjjZwwFcRoGVOCPYmCUDo'
var fcm = new FCM(serverKey);
var fcm1 = new FCM(serverKey1)

const Users = (connection, logger) => {
    const module = {}
    module.Recent_Orders=(options,callback)=>{
        const todaysdate=new Date();
        let date = todaysdate.getDate();
        let month = todaysdate.getMonth() + 1;
        let year = todaysdate.getFullYear();
      connection.query(`SELECT SQL_CALC_FOUND_ROWS  
      DISTINCT a.id,
      a.created_date,
      a.instamojo_payment_request_id,
      j.name,
      CONCAT(b.fname, ' ', b.lname) AS user_name,
      c.address_line_1,
      c.address_line_2,
      k.amount,
      k.payment_mode,
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
shop_payment_request k ON  (k.order_id=a.id OR k.instamojo_payment_request_id=a.instamojo_payment_request_id)
where e.location_id = ${options.locationId}
   order by a.created_date desc
   limit 5`, (err, recentorders) => {
    if (err) {
        logger.error.error(err)
        callback(err)
    } else {
       callback(false, { recentorders: recentorders});
        
    }
})
}

module.Recent_Orders_Products=(options,callback)=>{
    const todaysdate=new Date();
    let date = todaysdate.getDate();
    let month = todaysdate.getMonth() + 1;
    let year = todaysdate.getFullYear();
  connection.query(`SELECT SQL_CALC_FOUND_ROWS  
  a.id, 
  a.created_date,
  a.instamojo_payment_request_id,
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
  k.amount AS Amount,
  k.payment_mode,
  e.name as products,
  e.id as productId,
  e.regular_price as regularPrice,
  e.discount_price as discountPrice,
  d.quantity as quantity,
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
shop_payment_request k ON  (k.order_id=a.id OR k.instamojo_payment_request_id=a.instamojo_payment_request_id)
WHERE e.location_id = ${options.locationId}
order by a.created_date desc`, (err, recentorders) => {
if (err) {
    logger.error.error(err)
    callback(err)
} else {
   callback(false, { recentorders: recentorders});
    
}
})
}
    module.GetTotalOrders = (options, callback) => {
        var dateFilter = ``;
        if (options.startDate || options.endDate) {
            var date1 = moment(options.startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (options.startDate && options.endDate) {
                dateFilter = ` AND a.created_date BETWEEN '${date1}' AND '${date2}' `;
            } else if (options.startDate) {
                dateFilter = ` AND a.created_date >= '${date1}' `;
            } else if (options.endDate) {
                dateFilter = ` AND a.created_date <= '${date2}' `;
            }
        } else if (options.currentMonthOnly) {
            dateFilter = ` AND DATE_FORMAT(a.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
        a.id, 
        a.created_date,
        a.instamojo_payment_request_id,
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
        GROUP_CONCAT(e.name,' ') AS products
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
    WHERE e.user_id=? AND e.location_id=? AND a.id IS NOT NULL
    ${dateFilter} GROUP BY a.id;SELECT FOUND_ROWS() AS total `, [options.userId, options.locationId], (err, totalorders) => {
            callback(err, totalorders[1][0].total)
        })
    }

    module.GetTotalOrdersForStaff = (options, callback) => {
        var dateFilter = ``;
        if (options.startDate || options.endDate) {
            var date1 = moment(options.startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (options.startDate && options.endDate) {
                dateFilter = ` AND a.created_date BETWEEN '${date1}' AND '${date2}' `;
            } else if (options.startDate) {
                dateFilter = ` AND a.created_date >= '${date1}' `;
            } else if (options.endDate) {
                dateFilter = ` AND a.created_date <= '${date2}' `;
            }
        } else if (options.currentMonthOnly) {
            dateFilter = ` AND DATE_FORMAT(a.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
        a.id, a.created_date, a.instamojo_payment_request_id, a.assignedId, a.order_status,
        CONCAT(b.fname, ' ', b.lname) AS user_name,
        b.email, b.phone, b.id as user_id,
        c.label AS address_label, c.name AS address_name, c.address_line_1, c.address_line_2, c.phone, c.zip,
        GROUP_CONCAT(e.name,' ') AS products
        FROM shop_orders AS a
        JOIN users AS b ON b.id = a.users_id
        JOIN shop_user_shipping_address AS c ON c.id = a.shipping_address_id 
        LEFT JOIN shop_orders_products AS d ON d.order_id = a.id
        LEFT JOIN shop_products AS e ON e.id = d.product_id
    WHERE a.assignedId = ? AND e.location_id=? AND a.id IS NOT NULL
    ${dateFilter} GROUP BY a.id;SELECT FOUND_ROWS() AS total `, [options.userId, options.locationId], (err, totalorders) => {
            callback(err, totalorders[1][0].total)
        })
    }

    module.GetPendingOrdersForStaff = (options, callback) => {
        var dateFilter = ``;
        if (options.startDate || options.endDate) {
            var date1 = moment(options.startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (options.startDate && options.endDate) {
                dateFilter = ` AND a.created_date BETWEEN '${date1}' AND '${date2}' `;
            } else if (options.startDate) {
                dateFilter = ` AND a.created_date >= '${date1}' `;
            } else if (options.endDate) {
                dateFilter = ` AND a.created_date <= '${date2}' `;
            }
        } else if (options.currentMonthOnly) {
            dateFilter = ` AND DATE_FORMAT(a.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
        count(*) as count, a.order_status
        FROM shop_orders AS a
        JOIN users AS b ON b.id = a.users_id
        JOIN shop_user_shipping_address AS c ON c.id = a.shipping_address_id 
        LEFT JOIN shop_orders_products AS d ON d.order_id = a.id
        LEFT JOIN shop_products AS e ON e.id = d.product_id
        WHERE a.assignedId=? AND e.location_id=? AND a.id IS NOT NULL
    ${dateFilter} GROUP BY a.order_status;SELECT FOUND_ROWS() AS total `, [options.userId, options.locationId], (err, totalorders) => {
            callback(err, totalorders[0])
        })
    }

    module.getTotalOrders = (options, callback) => {
        connection.query(`SELECT 
        a.id, a.created_date, a.instamojo_payment_request_id,
        CONCAT(b.fname, ' ', b.lname) AS user_name,
        b.email, b.phone, b.id as user_id,
        c.label AS address_label, c.name AS address_name, c.address_line_1, c.address_line_2, c.phone, c.zip,
        GROUP_CONCAT(e.name,' ') AS products
    FROM shop_orders AS a
        JOIN users AS b ON b.id = a.users_id
        JOIN shop_user_shipping_address AS c ON c.id = a.shipping_address_id 
        LEFT JOIN shop_orders_products AS d ON d.order_id = a.id
        LEFT JOIN shop_products AS e ON e.id = d.product_id
    WHERE e.user_id=? AND e.location_id=? AND a.id IS NOT NULL GROUP BY a.id;`, [options.userId, options.locationId], (err, totalorders)=>{
        if(err) {
            callback(err)
        } else {
            callback(false, totalorders)  
        }
    })
    }

    module.maxordersByGroup = (options, callback) => {
        var search = ``;
        if (options.startDate && options.endDate) {
            var date1 = moment(options.startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (options.startDate && options.endDate) {
                search = ` AND a.created_date BETWEEN '${date1}' AND '${date2}' `;
            } else if (options.startDate) {
                search = ` AND a.created_date >= '${date1}' `;
            } else if (options.endDate) {
                search = ` AND a.created_date <= '${date2}' `;
            }
        } else {
            search = ` AND DATE_FORMAT(a.created_date,"%m-%Y") = "${moment().format('MM-YYYY')}"  `;
        }
        connection.query(`SELECT 
        b.name AS productName,e.file_name as image ,g.name AS category,a.product_id, COUNT(*)as pcount FROM
          shop_orders_products AS a
      INNER JOIN shop_products AS b
      ON b.id=a.product_id
      INNER JOIN shop_product_images AS e
      ON a.product_id=e.product_id
      INNER JOIN shop_product_categories AS f
      ON f.product_id=b.id
      INNER JOIN shop_categories AS g
      ON g.id=f.category_id
      WHERE b.location_id=? AND e.is_featured=1
      GROUP BY a.product_id,e.file_name,g.name
      ORDER BY pcount DESC
      LIMIT 10`, [options.locationId], (err, mostorderproducts) => {
           
            callback(err, mostorderproducts)
        })
    }
    module.MostOrderProduct = (options, callback) => {
        var search = ``;
        if (options.startDate && options.endDate) {
            var date1 = moment(options.startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (options.startDate && options.endDate) {
                search = ` AND a.created_date BETWEEN '${date1}' AND '${date2}' `;
            } else if (options.startDate) {
                search = ` AND a.created_date >= '${date1}' `;
            } else if (options.endDate) {
                search = ` AND a.created_date <= '${date2}' `;
            }
        } else {
            search = ` AND DATE_FORMAT(a.created_date,"%m-%Y") = "${moment().format('MM-YYYY')}"  `;
        }
        connection.query(`SELECT 
        b.name AS productName,e.file_name as image ,g.name AS category,a.product_id, COUNT(*)as pcount FROM
          shop_orders_products AS a
      INNER JOIN shop_products AS b
      ON b.id=a.product_id
      INNER JOIN shop_product_images AS e
      ON a.product_id=e.product_id
      INNER JOIN shop_product_categories AS f
      ON f.product_id=b.id
      INNER JOIN shop_categories AS g
      ON g.id=f.category_id
      WHERE b.location_id=? AND e.is_featured=1
     
      GROUP BY a.product_id,e.file_name,g.name
      ORDER BY pcount DESC
      LIMIT 10`, [options.locationId], (err, mostorderproducts) => {
          
            callback(err, mostorderproducts)
        })
    }

    module.LocationSaleTillDate = (options, callback) => {
        var search = ``;
        if (options.startDate && options.endDate) {
            var date1 = moment(options.startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (options.startDate && options.endDate) {
                search = ` AND c.created_date BETWEEN '${date1}' AND '${date2}' `;
            } else if (options.startDate) {
                search = ` AND c.created_date >= '${date1}' `;
            } else if (options.endDate) {
                search = ` AND c.created_date <= '${date2}' `;
            }
        } else {
            search = ` AND DATE_FORMAT(c.created_date,"%m-%Y") = "${moment().format('MM-YYYY')}"  `;
        }
       
        connection.query(`SELECT IFNULL(SUM(e.amount),0) as total_amount  from shop_payment_request as e where e.amount IN( 
            SELECT (d.amount) as total_amount
                    FROM  shop_products AS a
                    INNER JOIN shop_orders_products AS b
                    ON a.id=b.product_id
                    INNER JOIN shop_orders AS c
                    ON c.id=b.order_id
                    INNER JOIN shop_payment_request AS d
                    ON (d.instamojo_payment_request_id=c.instamojo_payment_request_id OR d.order_id=c.id)
                    where a.location_id=?  ${search} group by d.amount )`, [options.locationId], (err, saleTotal) => {
         
            callback(err, saleTotal[0].total_amount)
        })
    }
    
    /* Login methods */
    module.SendVerificationEmail = (options, callback) => {
        const email = options.email
       
        connection.query("select * from users where email=?", email, (err, result) => {
            if (err) {
              
                callback(err)
            } else {
                var type = ''
                var msg = ''
            
                if (result[0]) {

                    var token = randtoken.generate(20);
                    var sent = sesClient.sendEmail(email, token, "Reset Password Link from ExlShop");
                    // var sent = sendEmail(email, token);

                    if (sent != '0') {

                        var data = {
                            token: token
                        }

                        connection.query('UPDATE users SET ? WHERE email ="' + email + '"', data, function (err, result) {
                            if (err) {
                              
                                callback(err)
                            } else {
                                type = 'success';
                                msg = 'The reset password link has been sent to your email address';
                                callback(false, { success: true })
                            }

                        })

                    } else {
                        type = 'error';
                        msg = 'Something goes to wrong. Please try again';
                        callback(true, { success: false })
                    }

                } else {
                  
                    type = 'error';
                    msg = 'The Email is not registered with us';
                    callback(true, { success: false })
                }
            }

        })
    }

    module.forgotPassword = (options, callback) => {
        var token = options.token;
        var password = options.password;
      
        connection.query('SELECT * FROM users WHERE token ="' + token + '"', function (err, result) {
            if (err) throw err;
            var type
            var msg
            if (result.length > 0) {
                var saltRounds = 10;
                // var hash = bcrypt.hash(password, saltRounds);
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(password, salt, function (err, hash) {
                        var data = {
                            password: hash
                        }
                        connection.query('UPDATE users SET ? WHERE email ="' + result[0].email + '"', data, function (err, result) {
                            if (err) throw err
                        });
                    });
                });
                type = 'success';
                msg = 'Your password has been updated successfully';
                callback(false, { success: true })
            } else {
               
                type = 'success';
                msg = 'Invalid link; please try again';
                callback(true, { success: false })
            }
        });
    }
    module.Login = (options, callback) => {
        var search = ``;
        if (options.filter) {
            search = ` AND c.name = '${options.filter.roleName}' `;
        }
        connection.query(`SELECT 
         a.id, a.fname, a.lname, a.email, a.password, c.id AS role_id, c.name AS role_name
     FROM
         users AS a
         INNER JOIN user_roles AS b ON b.users_id = a.id
         INNER JOIN roles AS c ON c.id = b.roles_id
     WHERE
         a.email = '${options.email}' AND a.is_active = 1 ${search}
LIMIT 1`, (err, user) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                if (user.length === 0) {
                    callback(true)
                } else {
                    const comparePass = bcrypt.compareSync(options.password, user[0].password);
                    if (comparePass) {
                       
                        delete user[0].password;

                        // connection.query("select *From shop_subsription as a where a.users_id=?",[user[0].id],(err,user1)=>{
                      
                        // user[0].status=user1[0].status
                        // callback(false, user[0])
                        // })
                        callback(false, user[0]);
                    }
                    else {
                     
                        callback(true, { success: false })
                    }
                }
            }
        })
    }

    module.FcmToken = (options, callback) =>{
        connection.query(`select * from fcm_token where device_token = '${options.device_token}'`, (err, token) =>{
            if(err){
                callback(err)
            }else{
                if(!token){
                    connection.query(`Insert into fcm_token SET user_id = ${options.user_id}, device_token = '${options.device_token}'`, (err, data) =>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false, data)
                        }
                    })
                }else{
                    connection.query(`UPDATE fcm_token SET device_token = '${options.device_token}' WHERE device_token = '${options.device_token}'`, (err, data) =>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false, data)
                        }
                    })
                }
            }
        })
       
    }

    module.userDetails = (options, callback) => {
        var search = ``;
        if (options.filter) {
            search = ` AND c.name = '${options.filter.roleName}' `;
        }
        connection.query(`SELECT 
        a.fname,a.lname,a.email,a.phone,a.gender,a.address_line_1,a.address_line_2,a.city_id,a.state_id,a.country_id,a.zip,a.blood_group,a.marital_status,a.birth_date,a.anniversary_date,a.emergency_contact_name,a.emergency_contact_number,a.profile_image_descriptor,a.token, c.id AS role_id, c.name AS role_name
    FROM
        users AS a
        INNER JOIN user_roles AS b ON b.users_id = a.id
        INNER JOIN roles AS c ON c.id = b.roles_id
    WHERE
        a.id ='${options.userId}' AND a.is_active = 1 ${search}
LIMIT 1`, (err, user) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, user)
            }
        })
    }

    module.GetRoles = (options, callback) => {
        var isFrontFilter = ''
        if (!options.all) {
            isFrontFilter = `WHERE is_front = 1`
        }
        connection.query(`SELECT * FROM roles ${isFrontFilter}`, (err, roles) => {
            if (err) {
             
                callback(err)
            } else {
                callback(false, roles)
            }
        })
    }
    module.GetUsers = (options, callback) => {
        var isFrontFilter = ''

        connection.query(`select ur.users_id,u.fname,u.lname,u.email,u.phone,r.name  from users as u 
        inner join user_roles as ur on u.id=ur.users_id
        inner join roles as r on r.id=ur.roles_id
        inner join brand_location_users as bu on bu.users_id = u.id
        where r.is_front = 1 and bu.brand_locations_id = ?`,[options.locationId], (err, users) => {
            if (err) {
                callback(err)
            } else {
                callback(false, users)
            }
        })
    }
    module.IsEmailValid = (options, callback) => {
        connection.query("SELECT id FROM users WHERE email = ?", [options.email], (err, user) => {
            if (err) {
            
                callback(err)
            } else {
                callback(false, user.length == 0 ? true : false)
            }
        })
    }

    module.IsPhoneValid = (options, callback) => {
        connection.query("SELECT id FROM users WHERE phone = ?", [options.phone], (err, user) => {
            if (err) {
            
                callback(err)
            } else {
                callback(false, user.length == 0 ? true : false)
            }
        })
    }

    module.GetAssignedLocations = (options, callback) => {
        connection.query(`SELECT 
        b.id,
        b.brands_id,
        b.name,
        b.minimum_order_amount,
        b.maximum_order_distance,
        c.plan_id,
        c.instamojo_payment_request_id,
        c.razorpay_signature,
        c.instamojo_payment_id,
        c.shop_id,
        c.amount,
        c.start_date,
        c.end_date,
        c.status,
        c.is_deleted,
        d.name as plan_name,
        d.period,
        d.plan_interval,
        d.allowed_products,
        d.add_product_req,
        d.no_of_req,
        d.allowed_features
    FROM
        brand_location_users AS a
        INNER JOIN brand_locations AS b ON b.id = a.brand_locations_id
        LEFT JOIN shop_subsription as c ON c.shop_id = b.id AND c.users_id = a.users_id
        LEFT JOIN shop_subscription_plan AS d ON d.id = c.plan_id
    WHERE
        a.users_id = ? AND b.is_deleted=0`, [options.userId], (err, locations) => {
            if (err) {
               
                callback(err)
            } else {
                callback(false, {locations})
            }
        })
    }

    module.SetLocations = (options, callback) => {
        connection.query(`DELETE FROM brand_location_users WHERE users_id = ?`, [options.userId], (err) => {
            if (err) {
                callback(err)
            } else {
                var values = []
                options.locations.forEach((l) => {
                    values.push([options.userId, l])
                })
                connection.query(`INSERT INTO brand_location_users (users_id, brand_locations_id) VALUES ?`, [values], (err) => {
                    callback(err)
                })
            }
        })
    }

    module.GetMembers = (options, callback) => {
        const moment = require('moment');
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR b.phone LIKE ${keyword} OR b.email LIKE ${keyword} OR b.gender LIKE ${keyword} OR e.name LIKE ${keyword} )`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(b.created_date) BETWEEN DATE(${connection.escape(moment(filter.from, 'DD-MM-YYYY').format('YYYY-MM-DD'))}) AND DATE(${connection.escape(moment(filter.to, 'DD-MM-YYYY').format('YYYY-MM-DD'))}) `
            }
            if (filter.gender) {
                filterQuery += ` AND b.gender = ${connection.escape(filter.gender)} `
            }
            if (filter.isActive) {
                filterQuery += ` AND b.is_active = ${connection.escape(filter.isActive)} `
            }
            if (filter.expiryFrom && filter.expiryTo) {
                filterQuery += ` HAVING DATE(expiry_date) BETWEEN DATE(${connection.escape(moment(filter.expiryFrom, 'DD-MM-YYYY').format('YYYY-MM-DD'))}) AND DATE(${connection.escape(moment(filter.expiryTo, 'DD-MM-YYYY').format('YYYY-MM-DD'))}) `
            }
        }

        if (!options.all) {
            search += ` AND a.brand_locations_id = ${options.locationId} `;
        }
        var dateFilter = ``;
        if (options.startDate || options.endDate) {
            var date1 = moment(options.startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (options.startDate && options.endDate) {
                dateFilter = ` AND b.created_date BETWEEN '${date1}' AND '${date2}' `;
            } else if (options.startDate) {
                dateFilter = ` AND b.created_date >= '${date1}' `;
            } else if (options.endDate) {
                dateFilter = ` AND b.created_date <= '${date2}' `;
            }
        } else if (options.currentMonthOnly) {
            dateFilter = ` AND DATE_FORMAT(b.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;
        }

        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    b.id,
    CONCAT(b.fname, ' ', IF(b.lname IS NOT NULL, b.lname, '')) AS member_name,
    b.email,
    b.phone,
    b.created_date,
    b.gender,
    b.birth_date,
    b.is_active,
    (SELECT expiry_date 
        FROM membership_logs 
        WHERE (member_id = a.users_id OR transferred_to_member = a.users_id) AND CURDATE() between start_date and expiry_date
        AND ((is_frozen = 0) OR (CURDATE() NOT between frozen_start_date and frozen_end_date))
        AND ((is_transferred = 0) OR (member_id != a.users_id))
        LIMIT 1) AS expiry_date,
    e.name AS brand_location_name
FROM
    brand_location_users AS a
        INNER JOIN
    users AS b ON b.id = a.users_id
        INNER JOIN
    user_roles AS c ON c.users_id = a.users_id
        INNER JOIN
    roles AS d ON d.id = c.roles_id
        INNER JOIN
    brand_locations AS e ON e.id = a.brand_locations_id
WHERE
    d.name = 'member' ${search} ${filterQuery} ${dateFilter} ${orderBy}  LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, members) => {
            if (err) {
              
                callback(err)
            } else {
                callback(false, { total: members[1][0].total, members: members[0] })
            }
        })
    }

    module.Add = (options, callback) => {
    
        connection.getConnection((err, connection) => {
            if (err) {
             
                callback(err)
            }
            connection.beginTransaction(function (err) {
                if (err) {
                 
                    callback(err)
                }
              
                const myPlaintextPassword = options.password;
                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(myPlaintextPassword, salt);

                connection.query('INSERT INTO users SET fname = ?, lname = ?, email = ?, password = ?, phone = ?, gender = ?, address_line_1 = ?, address_line_2 = ?, city_id = ?, state_id = ?, zip = ? , marital_status = ?,emergency_contact_name = ?,emergency_contact_number = ? , blood_group = ?, birth_date = ?, anniversary_date = ?', [options.fname, options.lname, options.email, hash, options.phone, options.gender, options.address1, options.address2, options.cityId, options.stateId, options.zip, options.marital_status, options.emergency_contact_name, options.emergency_contact_number, options.blood_group, options.birth_date, options.anniversary_date], function (error, results) {
                    if (error) {
                     
                        connection.rollback(function (err) {
                        
                            callback(err)
                        });
                    }
                    connection.query('INSERT INTO brand_location_users SET users_id = ?, brand_locations_id = ?', [results.insertId, options.locationId], function (error, brand_location) {
                        if (error) {
                            
                            connection.rollback(function (err) {
                              
                                callback(err)
                            });
                        }
                        connection.query('INSERT INTO user_roles SET users_id = ?, roles_id = ?', [results.insertId, options.roleId], function (error, user_roles) {
                            if (error) {
                            
                                connection.rollback(function (err) {
                                  
                                    callback(err)
                                });
                            }else{
                                if(options.roleId == 2 || options.roleId == '2'){
                                    connection.query('select a.*,b.id as brandId from brand_location_users as a inner join brand_locations as b on b.id=a.brand_locations_id where a.users_id=?', [results.insertId], function (error, user_brand) {
                                        if (error) {
                                            console.log(error)
                                        } else {
                                            connection.query(`select * from shop_subsription where shop_id = ?`, [user_brand[0].brandId], (err, data)=>{
                                                if (error) {
                                                    callback(true,error)
                                                }else{
                                                    if(data.length){
                                                        connection.query(`UPDATE shop_subsription SET users_id = ? where shop_id = ?`, [results.insertId, user_brand[0].brandId], (err)=>{
                                                            if(err){
                                                                callback(true,error)
                                                            }else{
                                                                callback(false, results.insertId)
                                                            }
                                                        })
                                                    }else{
                                                        connection.query('INSERT INTO shop_subsription SET users_id = ?, shop_id = ?', [results.insertId, user_brand[0].brandId], function (error, user_subscription) {
                                                            if (error) {
                                                                callback(true,error)
                                                            }else{
                                                                callback(false, results.insertId)
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    })
                                }else{
                                    
                                    connection.commit(function (err) {
                                
                                        if (err) {
                                            connection.rollback(function (err) {
                                            
                                                callback(err)
                                            });
                                        }
                                        callback(false, results.insertId)
                                    });
                                }
                            } 
                            

                        });
                    });
                });
            });
        })
    }

    module.GetSingle = (options, callback) => {
        connection.query(`SELECT 
    a.*, d.roles_id, b.image_file, CONCAT('/profile-img/',c.brand_locations_id,'/',b.image_file) AS profile_image, c.brand_locations_id, e.*, f.name AS brand_location_name,
    g.name AS state_name, h.name AS city_name,
    count(i.id) as experience_added,
    count(j.id) as education_added,
    count(k.id) as salary_added,
    count(l.id) as training_pay_added,
    IF((count(i.id) AND count(j.id) AND (count(k.id) OR count(l.id)) ),1,0) AS completed
FROM
    users AS a
    LEFT JOIN member_profile_images AS b ON b.users_id = a.id
    LEFT JOIN brand_location_users AS c ON c.users_id = a.id
    LEFT JOIN user_roles AS d ON d.users_id = a.id
    LEFT JOIN user_profile AS e ON e.users_id = a.id
    LEFT JOIN brand_locations AS f ON f.id = c.brand_locations_id
    LEFT JOIN states AS g ON g.id = a.state_id
    LEFT JOIN cities AS h ON h.id = a.city_id
    LEFT JOIN user_experience AS i ON i.user_id = a.id
    LEFT JOIN user_education AS j ON j.user_id = a.id
    LEFT JOIN team_salary_log AS k ON k.users_id = a.id
    LEFT JOIN team_personal_training_pay_log AS l ON l.users_id = a.id
WHERE
    a.id = ? group by a.id, c.brand_locations_id`, [options.userId], (err, user) => {
        if(err){
            callback(err)
        }else{
            callback(err, user[0])
        }
        })
    }

    module.UpdateRole = (options, callback) => {
        connection.query(`UPDATE user_roles SET roles_id = ? WHERE users_id = ?`, [options.roleId, options.userId], (err, user) => {
            callback(err, user[0])
        })
    }

    module.UpdateProfile = (options, callback) => {
        connection.query(`INSERT user_profile SET users_id = ?, ?? = ? ON DUPLICATE KEY UPDATE ?? = ?`, [options.userId, options.col, options.val, options.col, options.val], (err) => {
            callback(err)
        })
    }

    module.AddEducation = (options, callback) => {
        connection.query(`INSERT user_education SET user_id = ?, education_level = ?, institute = ?, description = ?, month = ?, year = ?`, [options.userId, options.educationLevel, options.institute, options.description, options.month, options.year], (err) => {
            callback(err)
        })
    }

    module.updateEducation = (options, callback) => {
        connection.query(`UPDATE user_education SET user_id = ?, education_level = ?, institute = ?, description = ?, month = ?, year = ? where id = ?`, [options.user_id, options.education_level, options.institute, options.description, options.month, options.year, options.id], (err) => {
           if(err){
            callback(err)
           }else{
            callback(false)
           }
        })
    }

    module.deleteEducation = (options, callback) => {
        connection.query(`UPDATE user_education SET is_deleted = 1 where id = ?`, [options.id], (err) => {
            callback(err)
        })
    }

    module.deleteExperience = (options, callback) => {
        connection.query(`UPDATE user_experience SET is_deleted = 1 where id = ?`, [options.id], (err) => {
            callback(err)
        })
    }

    module.AddExperience = (options, callback) => {
        connection.query(`INSERT user_experience SET user_id = ?, job_position = ?, employer_name = ?, job_description = ?, from_month = ?, to_month = ?, from_year = ?, to_year = ?`, [options.userId, options.jobPosition, options.employerName, options.jobDescription, options.fromMonth, options.toMonth, options.fromYear, options.toYear], (err) => {
            callback(err)
        })
    }

    module.UpdateExperience = (options, callback) => {
        connection.query(`UPDATE user_experience SET user_id = ?, job_position = ?, employer_name = ?, job_description = ?, from_month = ?, to_month = ?, from_year = ?, to_year = ? where id = ?`, [options.user_id, options.job_position, options.employer_name, options.job_description, options.from_month, options.to_month, options.from_year, options.to_year, options.id], (err) => {
            callback(err)
        })
    }
    module.GetEducations = (options, callback) => {
        connection.query(`SELECT * FROM user_education WHERE user_id = ? and is_deleted = 0`, [options.userId], (err, educations) => {
            if(err){
                callback(err)
            }else{
                callback(false, educations)
            }
        })
    }

    module.GetExperience = (options, callback) => {
        connection.query(`SELECT * FROM user_experience WHERE user_id = ? and is_deleted = 0`, [options.userId], (err, experience) => {
            callback(err, experience)
        })
    }

    module.AddSalary = (options, callback) => {
        connection.query(`INSERT INTO team_salary_log SET brand_locations_id = ?, users_id = ?, salary_type = ?, salary_amount = ?, department_id =?, designation_id = ?, is_promoted = ?;
        UPDATE user_profile SET department_id =?, designation_id=? WHERE users_id = ?`, [options.locationId, options.userId, options.salaryType, options.salaryAmount, options.department, options.designation, options.isPromoted, options.department, options.designation, options.userId], (err, data) => {
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.AddPay = (options, callback) => {
        connection.query(`INSERT INTO team_personal_training_pay_log SET brand_locations_id = ?, pay_type = ?, pay_amount = ?, users_id = ?`, [options.locationId, options.payType, options.payAmount, options.userId], (err) => {
            callback(err);
        })
    }

    module.GetUserSalaryLog = (options, callback) => {
        connection.query(`SELECT * FROM team_salary_log WHERE users_id = ? `, [options.userId], (err, salaryLog) => {
            callback(err, salaryLog)
        })
    }

    module.GetUserPTPayLog = (options, callback) => {
        connection.query(`SELECT * FROM team_personal_training_pay_log WHERE users_id = ? `, [options.userId], (err, payLog) => {
            callback(err, payLog)
        })
    }

    module.Delete = (options, callback) => {
        connection.query(`UPDATE users SET is_deleted =1 WHERE id = ?`, [options.teamMemberId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(null)
            }
        })
    }
    module.Update_member = (options, callback) => {
        connection.query('UPDATE users SET  fname = ?, lname = ?, email = ?, phone = ? WHERE id = ?',
            [options.fname, options.lname, options.email, options.phone, options.id], (err, result) => {
               
                if (err) {
                  
                    connection.rollback(function (err) {
                      
                        callback(err)
                    });
                }
                else {
                    connection.query('UPDATE user_roles SET roles_id = ? WHERE users_id = ?', [options.roleId, options.id], function (error) {
                        if (error) {
                          
                            connection.rollback(function (err) {
                             
                                callback(err)
                            });
                        }
                        else {
                            connection.query('UPDATE brand_location_users SET brand_locations_id = ? WHERE users_id = ?',
                                [options.location, options.id], (err, result) => {
                                    if (err) {
                                    
                                        connection.rollback(function (err) {
                                          
                                            callback(err)
                                        });
                                    }
                                    else {
                                        callback(false, { success: true, result })
                                    }
                                })
                        }
                    })
                }
            })
    }
    module.Update = (options, callback) => {
        connection.query('UPDATE users SET fname = ?, lname = ?, email = ?, phone = ?,gender=?,marital_status=?,emergency_contact_name=?,emergency_contact_number=?,blood_group=?,birth_date=?,anniversary_date=?,address_line_1=?,address_line_2=?,city_id=?,state_id=?,zip=?  WHERE id= ?',
            [options.fname, options.lname, options.email, options.phone, options.gender, options.marital_status, options.emergency_contact_name, options.emergency_contact_number, options.blood_group, options.birth_date, options.anniversary_date, options.address1, options.address2, options.cityId, options.stateId, options.zip, options.userId], function (error, results) {
                if (error) {
                    connection.rollback(function (err) {
                        callback(err)
                    });
                }
                else {
                    connection.query('UPDATE user_roles SET roles_id = ? WHERE users_id = ?', [options.roleId, options.userId], function (error) {
                        if (error) {
                            connection.rollback(function (err) {
                                callback(err)
                            });
                        }
                        else {
                            connection.query('UPDATE user_profile SET department_id=?,designation_id=? WHERE users_id=?', [options.departments_id, options.designation_id, options.userId], function (error, updaterole) {
                                if (error) {
                                    connection.rollback(function (err) {
                                        callback(err)
                                    });
                                }
                                else {
                                    callback(false, { success: true, updaterole })
                                }
                            })
                        }
                    })
                }
            });
    }


    module.UpdateStaff = (options, callback) => {
       
        connection.getConnection((err, connection) => {
            if (err) {
           
                callback(err)
            }
            connection.beginTransaction(function (err) {
                if (err) {
                 
                    callback(err)
                }
                connection.query('UPDATE users SET fname = ?, lname = ?, email = ?, phone = ?,gender=?,marital_status=?,emergency_contact_name=?,emergency_contact_number=?,blood_group=?,birth_date=?,anniversary_date=?,address_line_1=?,address_line_2=?,city_id=?,state_id=?,zip=?  WHERE id= ?',
                    [options.fname, options.lname, options.email, options.phone, options.gender, options.marital_status, options.emergency_contact_name, options.emergency_contact_number, options.blood_group, options.birth_date, options.anniversary_date, options.address1, options.address2, options.cityId, options.stateId, options.zip, options.userId], function (error, results) {
                      
                        if (error) {
                          
                            connection.rollback(function (err) {
                              
                                callback(err)
                            });
                        }
                    }),
                    connection.commit(function (err) {
                     
                        if (err) {
                            connection.rollback(function (err) {
                            
                                callback(err)
                            });
                        }
                        callback(false)
                    })
            });
        });
    }

    module.GetSuperAdmins = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.fname LIKE ${keyword} OR a.lname LIKE ${keyword} OR a.email LIKE ${keyword} OR a.phone LIKE ${keyword} OR a.id like ${keyword} OR f.name like ${keyword})`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    a.id, CONCAT(a.fname, " " ,a.lname) user_name,a.email, a.phone, c.verbose, b.roles_id,c.name as role_name, f.name as shop_name
FROM
    users AS a
    INNER JOIN user_roles AS b ON b.users_id = a.id
    INNER JOIN roles AS c ON c.id = b.roles_id
    left join brand_location_users as d on d.users_id = a.id
    left join brand_locations as e on e.id = d.brand_locations_id and e.is_deleted = 0
    left join brands as f on f.id = e.brands_id
WHERE
    c.name = 'super-admin' AND a.is_deleted = 0 ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, users) => {
            callback(err, { total: users[1][0].total, users: users[0] })
        })
    }




    module.AddSuperAdmin = (options, callback) => {
        connection.getConnection((err, connection) => {
            if (err) {
               
                callback(err)
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    callback(err)
                }

                const myPlaintextPassword = options.password;
                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(myPlaintextPassword, salt);

                connection.query('INSERT INTO users SET fname = ?, lname = ?, email = ?, password = ?, phone = ?, gender = ?, address_line_1 = ?, address_line_2 = ?, city_id = ?, state_id = ?, zip = ? , marital_status = ?,emergency_contact_name = ?,emergency_contact_number = ? , blood_group = ?', [options.fname, options.lname, options.email, hash, options.phone, options.gender, options.address1, options.address2, options.cityId, options.stateId, options.zip, options.marital_status, options.emergency_contact_name, options.emergency_contact_number, options.blood_group], function (error, results) {
                    if (error) {
                        connection.rollback(function (err) {
                            callback(err)
                        });
                    }
                    connection.query('INSERT INTO user_roles SET users_id = ?, roles_id = 1', [results.insertId], function (error) {
                        if (error) {
                            connection.rollback(function (err) {
                                callback(err)
                            });
                        }
                        connection.commit(function (err) {
                            if (err) {
                                connection.rollback(function (err) {
                                    callback(err)
                                });
                            }
                            callback(false, results.insertId)
                        });
                    });
                });
            });
        })
    }

    module.SearchUser = (options, callback) => {
        connection.query(`SELECT * 
            FROM users AS a 
                INNER JOIN user_roles AS b ON a.id = b.users_id 
            WHERE (a.fname LIKE ${connection.escape('%' + options.userName + '%')} OR a.lname LIKE ${connection.escape('%' + options.userName + '%')} ) `, [options.roleId], (err, users) => {
            if (err) {
                callback(err)
            } else {
                callback(false, users)
            }

        })
    }

    // module.UpdateExperience = (options, callback) => {
    //     connection.query(`UPDATE user_experience SET job_position = ?, employer_name = ?, job_description = ?, from_month = ?, to_month = ?, from_year = ?, to_year = ? WHERE id = ?`, [options.jobPosition, options.employerName, options.jobDescription, options.fromMonth, options.toMonth, options.fromYear, options.toYear, options.id], (err) => {
    //         callback(err)
    //     })
    // }

    // module.UpdateEducation = (options, callback) => {
    //     connection.query(`UPDATE user_education SET education_level = ?, institute = ?, description = ?, month = ?, year = ? WHERE id = ?`, [options.educationLevel, options.institute, options.description, options.month, options.year, options.id], (err) => {
    //         callback(err)
    //     })
    // }

    module.UpdateSalary = (options, callback) => {
       
        connection.query(`UPDATE  team_salary_log SET brand_locations_id = ?, users_id = ?, salary_type = ?, salary_amount = ?, department_id =?, designation_id = ?, is_promoted = ?;UPDATE user_profile SET department_id =?, designation_id=? WHERE users_id = ?`, [options.locationId, options.userId, options.salaryType, options.salaryAmount, options.department, options.designation, options.isPromoted, options.department, options.designation, options.userId], (err) => {
            callback(err);
        })
    }

    module.GetLocationUsers = (options, callback) => {
        connection.query(`SELECT 
    b.id,
    CONCAT(b.fname, ' ', b.lname) AS user_name,
    c.image_file, 
    CONCAT('/profile-img/',a.brand_locations_id,'/',c.image_file) AS profile_image, b.phone, b.email
FROM
    brand_location_users AS a
        INNER JOIN
    users AS b ON b.id = a.users_id
        LEFT JOIN 
    member_profile_images AS c ON c.users_id = b.id
WHERE a.brand_locations_id = ? AND b.is_deleted = 0 ORDER BY b.fname ASC `, [options.locationId], (err, users) => {
            if (err) {
                callback(err)
            } else {
                callback(false, users)
            }
        })
    }

    module.GetDietitians = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.fname LIKE ${keyword} OR a.lname LIKE ${keyword} OR a.email LIKE ${keyword} OR a.phone LIKE ${keyword} OR c.verbose LIKE ${keyword} )`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    a.id, CONCAT(a.fname, " " ,a.lname) user_name,a.email, a.phone, c.verbose, b.roles_id,c.name as role_name, a.gender
FROM
    users AS a
    INNER JOIN user_roles AS b ON b.users_id = a.id
    INNER JOIN roles AS c ON c.id = b.roles_id
WHERE
    c.name = 'dietitian' AND a.is_deleted = 0 ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, dietitians) => {
            callback(err, { total: dietitians[1][0].total, dietitians: dietitians[0] })
        })
    }

    module.AddDietitian = (options, callback) => {
        connection.getConnection((err, connection) => {
            if (err) {
            
                callback(err)
            }
            connection.beginTransaction(function (err) {
                if (err) {
                
                    callback(err)
                }

                const myPlaintextPassword = options.password;
                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(myPlaintextPassword, salt);

                connection.query('INSERT INTO users SET fname = ?, lname = ?, email = ?, password = ?, phone = ?', [options.fname, options.lname, options.email, hash, options.phone], function (err, results) {
                    if (err) {
                     
                        connection.rollback(function (err) {
                        
                            callback(err)
                        });
                    }
                    connection.query('INSERT INTO user_roles SET users_id = ?, roles_id = 8', [results.insertId], function (err) {
                        if (err) {
                            am
                         
                            connection.rollback(function (err) {
                           
                                callback(err)
                            });
                        }
                        connection.commit(function (err) {
                        
                            if (err) {
                                connection.rollback(function (err) {
                               
                                    callback(err)
                                });
                            }
                            callback(false, results.insertId)
                        });
                    });
                });
            });
        })
    }

    module.GetBrandUsers = (options, callback) => {
        var search = ``;
        var orderBy = ``;
     
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR b.email LIKE ${keyword} OR b.phone LIKE ${keyword} OR d.verbose LIKE ${keyword} OR f.designation LIKE ${keyword} OR g.department like ${keyword})`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if (!options.all) {
            search += ` AND a.brand_locations_id = ${options.locationId} `;
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.customer_name) {
                filterQuery+=`AND (b.lname= ${connection.escape(filter.customer_name)} OR b.fname= ${connection.escape(filter.customer_name)})`;
            }
            if(filter.email) {
                filterQuery+=`AND b.email= ${connection.escape(filter.email)}`;
            }
            if(filter.designation) {
                filterQuery+=`AND f.designation= ${connection.escape(filter.designation)}`;
            }
            if(filter.department) {
                filterQuery+=`AND g.department= ${connection.escape(filter.department)}`;
            }
            if(filter.phone_no) {
                filterQuery+=`AND b.phone= ${connection.escape(filter.phone_no)}`;
            }
        }
        var dateFilter = ``;
        if (options.startDate || options.endDate) {
            var date1 = moment(options.startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (options.startDate && options.endDate) {
                dateFilter = ` AND b.created_date BETWEEN '${date1}' AND '${date2}' `;
            } else if (options.startDate) {
                dateFilter = ` AND b.created_date >= '${date1}' `;
            } else if (options.endDate) {
                dateFilter = ` AND b.created_date <= '${date2}' `;
            }
        } else if (options.currentMonthOnly) {
            dateFilter = ` AND DATE_FORMAT(b.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        b.id, CONCAT(b.fname, " " ,b.lname) user_name,b.address_line_1,b.address_line_2,b.fname,b.lname,b.email,b.gender,b.marital_status,b.birth_date,b.anniversary_date,b.emergency_contact_name,b.emergency_contact_number,b.blood_group,b.city_id,b.state_id,b.country_id,b.zip, b.phone, d.verbose, f.designation,f.id as designation_id,g.id as department_id, g.department,c.roles_id,d.name as role_name, h.name AS brand_location_name, b.is_active,
        IF((count(i.id) AND count(j.id) AND (count(k.id) OR count(l.id)) ),1,0) AS completed
FROM
    brand_location_users AS a
    INNER JOIN users AS b ON b.id = a.users_id
    INNER JOIN user_roles AS c ON c.users_id = a.users_id
    INNER JOIN roles AS d ON d.id = c.roles_id
    LEFT JOIN user_profile AS e ON e.users_id = a.users_id
    LEFT JOIN m_designation AS f ON f.id = e.designation_id
    LEFT JOIN m_department AS g ON g.id = e.department_id
    INNER JOIN brand_locations AS h ON h.id = a.brand_locations_id
    LEFT JOIN user_experience AS i ON i.user_id = b.id
    LEFT JOIN user_education AS j ON j.user_id = b.id
    LEFT JOIN team_salary_log AS k ON k.users_id = b.id
    LEFT JOIN team_personal_training_pay_log AS l ON l.users_id = b.id
WHERE
    a.brand_locations_id=${options.locationId} AND d.name != 'member' AND b.is_deleted = 0 ${search} ${dateFilter} ${filterQuery} GROUP BY b.id
    ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, users) => {
          
            callback(err, { total: users[1][0].total, users: users[0], userdetails: users })
        })
    }


    module.GetBrandUsers1 = (options, callback) => {
    
        connection.query(`SELECT
        b.id, CONCAT(b.fname, " " ,b.lname) user_name,b.address_line_1,b.address_line_2,
        b.email,b.gender,b.marital_status,b.birth_date,b.anniversary_date,
        b.emergency_contact_name,b.emergency_contact_number,b.blood_group,b.city_id,b.state_id,b.country_id,b.zip, b.phone,
        d.verbose as role, f.designation,f.id as designation_id,g.id as department_id, g.department,c.roles_id,d.name as role_name,
        h.name AS brand_location_name, b.is_active,
        IF((count(i.id) AND count(j.id) AND (count(k.id) OR count(l.id)) ),1,0) AS completed
FROM
    brand_location_users AS a
    INNER JOIN users AS b ON b.id = a.users_id
    INNER JOIN user_roles AS c ON c.users_id = a.users_id
    INNER JOIN roles AS d ON d.id = c.roles_id
    LEFT JOIN user_profile AS e ON e.users_id = a.users_id
    LEFT JOIN team_designation AS f ON f.id = e.designation_id
    LEFT JOIN team_department AS g ON g.id = e.department_id
    INNER JOIN brand_locations AS h ON h.id = a.brand_locations_id
    LEFT JOIN user_experience AS i ON i.user_id = b.id
    LEFT JOIN user_education AS j ON j.user_id = b.id
    LEFT JOIN team_salary_log AS k ON k.users_id = b.id
    LEFT JOIN team_personal_training_pay_log AS l ON l.users_id = b.id
    
   WHERE
   a.brand_locations_id = ${options.locationId} AND    d.name != 'member' AND b.is_deleted = 0  GROUP BY b.id`, (err, users) => {
          if(err){
            callback(err)
          }
            callback(false, {success:true, users  })
        })
    }

    module.GetSelfDetails = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR b.email LIKE ${keyword} OR b.phone LIKE ${keyword} OR d.verbose LIKE ${keyword} OR f.designation LIKE ${keyword} OR g.department like ${keyword} )`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if (!options.all) {
            search += ` AND a.brand_locations_id = ${options.locationId} `;
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.email) {
                filterQuery += ` AND b.email IN (${options.filter.categories.join(',')}) `;
            }
        }
        var dateFilter = ``;
        if (options.startDate || options.endDate) {
            var date1 = moment(options.startDate + ' 00:00:00', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate + ' 23:59:59', 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if (options.startDate && options.endDate) {
                dateFilter = ` AND b.created_date BETWEEN '${date1}' AND '${date2}' `;
            } else if (options.startDate) {
                dateFilter = ` AND b.created_date >= '${date1}' `;
            } else if (options.endDate) {
                dateFilter = ` AND b.created_date <= '${date2}' `;
            }
        } else if (options.currentMonthOnly) {
            dateFilter = ` AND DATE_FORMAT(b.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        b.id, CONCAT(b.fname, " " ,b.lname) user_name,b.address_line_1,b.address_line_2,b.fname,b.lname,b.email,b.gender,b.marital_status,b.birth_date,b.anniversary_date,b.emergency_contact_name,b.emergency_contact_number,b.blood_group,b.city_id,b.state_id,b.country_id,b.zip, b.phone, d.verbose, f.designation,f.id as designation_id,g.id as department_id, g.department,c.roles_id,d.name as role_name, b.is_active,
        IF((count(i.id) AND count(j.id) AND (count(k.id) OR count(l.id)) ),1,0) AS completed
FROM
    brand_location_users AS a
    INNER JOIN users AS b ON b.id = a.users_id
    INNER JOIN user_roles AS c ON c.users_id = a.users_id
    INNER JOIN roles AS d ON d.id = c.roles_id
    LEFT JOIN user_profile AS e ON e.users_id = a.users_id
    LEFT JOIN team_designation AS f ON f.id = e.designation_id
    LEFT JOIN team_department AS g ON g.id = e.department_id
    INNER JOIN brand_locations AS h ON h.id = a.brand_locations_id
    LEFT JOIN user_experience AS i ON i.user_id = b.id
    LEFT JOIN user_education AS j ON j.user_id = b.id
    LEFT JOIN team_salary_log AS k ON k.users_id = b.id
    LEFT JOIN team_personal_training_pay_log AS l ON l.users_id = b.id
WHERE
    b.id=${options.userId} AND d.name != 'member' AND b.is_deleted = 0  GROUP BY b.id
    ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, users) => {
          
            callback(err, { total: users[1][0].total, users: users[0], userdetails: users })
        })
    }

    module.UpdateStatus = (options, callback) => {
        connection.query(`INSERT INTO user_status_log (user_id, reason_id, reason_text, is_active, resignation_type, resignation_reason, resignation_notice_period, resignation_notice_served) VALUES (?, ?, ?, ?, ?, ?, ? ,?); UPDATE users SET is_active =? WHERE id =?`, [options.userId, options.reasonId, options.reasonText, options.isActive, options.resignationType, options.resignationReason, options.resignationNoticePeriod, options.resignationNoticeServed, options.isActive, options.userId], (err) => {
            callback(err)
        })
    }

    module.GetStatusLogs = (options, callback) => {
        connection.query(`SELECT * FROM user_status_log WHERE user_id = ? ORDER BY created_date `, [options.userId], (err, statusLogs) => {
            callback(err, statusLogs)
        })
    }

    module.ChangePassword = (options, callback) => {
        connection.query(`SELECT * FROM users WHERE id = ? `, [options.userId], (err, users) => {
            if (users.length) {
                var user = users[0];
                const comparePass = bcrypt.compareSync(options.oldPassword, user.password);
                if (comparePass) {
                    const myPlaintextPassword = options.newPassword;
                    const salt = bcrypt.genSaltSync(saltRounds);
                    const hash = bcrypt.hashSync(myPlaintextPassword, salt);
                    connection.query(`UPDATE users SET password = ? WHERE id = ? `, [hash, options.userId], (err) => {
                        if (err) {
                          
                            callback(err)
                        } else {
                            callback(false, { isMatch: true })
                        }
                    })
                } else {
                    callback(false, { isMatch: false })
                }
            } else {
                callback(true, false);
            }
        })
    }

    module.MemberLogin = (options, callback) => {
        var search = ``;


        connection.query(`SELECT 
    a.id, a.fname, a.lname, a.email, a.password, c.id AS role_id, c.name AS role_name, d.brand_locations_id as location_id
FROM
    users AS a
    INNER JOIN user_roles AS b ON b.users_id = a.id
    INNER JOIN roles AS c ON c.id = b.roles_id
    INNER JOIN brand_location_users AS d ON d.users_id = a.id
WHERE
    a.phone = '${options.phone}' AND a.is_active = 1 ${search}
LIMIT 1`, (err, user) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                if (user.length === 0) {
                    callback(true)
                } else {
                    const comparePass = bcrypt.compareSync(options.password, user[0].password);
                    if (comparePass) {
                      
                        delete user[0].password;
                        callback(false, user[0])
                    } else {
                    
                        callback(true, false)
                    }
                }
            }
        })
    }

    module.AddProfile = (options, callback) => {
        connection.query(`INSERT INTO user_profile SET users_id = ?, department_id = ?, designation_id = ?`, [options.userId, options.department, options.designation], (err) => {
            callback(err);
        })
    }

    module.VerifyUserPhone = (options, callback) => {
        connection.query(`SELECT id, fname, lname, email FROM users WHERE phone = ?`, [options.phoneNo], (err, user) => {
            if (err) {
                callback(err)
            } else {
                callback(false, user.length > 0 ? user[0] : null)
            }
        })
    }

    module.GetBrandLocationEmployees = (options, callback) => {
        connection.query(`SELECT count(*) AS total_employees 
                            FROM users AS a 
                            INNER JOIN brand_location_users AS b On b.users_id = a.id
                            INNER JOIN user_roles AS c ON c.users_id = a.id
                            WHERE b.brand_locations_id = ? AND c.roles_id !=5 `, [options.locationId], (err, employees) => {
            if (err) {
                callback(err)
            } else {
                callback(false, employees.length > 0 ? employees[0].total_employees : 0)
            }
        })
    }

    module.GetBirthdays = (callback) => {
        connection.query(`SELECT a.*, c.brand_locations_id FROM users AS a 
                            INNER JOIN user_roles AS b ON a.id = b.users_id
                            INNER JOIN brand_location_users AS c ON c.users_id = a.id
                            WHERE b.roles_id = 5 
                                AND DATE_FORMAT(a.birth_date, '%d-%m') = DATE_FORMAT(NOW(),'%d-%m') 
                                `, (err, users) => {
            if (err) {
                callback(err)
            } else {
                callback(false, users)
            }
        })
    }

    module.GetAnniversaries = (callback) => {
        connection.query(`SELECT a.*, c.brand_locations_id FROM users AS a 
                            INNER JOIN user_roles AS b ON a.id = b.users_id
                            INNER JOIN brand_location_users AS c ON c.users_id = a.id
                            WHERE b.roles_id = 5 
                                AND DATE_FORMAT(a.anniversary_date, '%d-%m') = DATE_FORMAT(NOW(),'%d-%m') 
                                `, (err, users) => {
            if (err) {
                callback(err)
            } else {
                callback(false, users)
            }
        })
    }

    module.GetExpiredRenewals = (callback) => {
        connection.query(`SELECT  b.* , d.brand_locations_id, e.name AS package_name, 
                                DATE_FORMAT(a.expiry_date, '%d-%m-%Y') AS expiry_date
                            FROM membership_logs AS a
                                INNER JOIN users AS b ON b.id = a.member_id
                                INNER JOIN user_roles AS c ON c.users_id = b.id
                                INNER JOIN brand_location_users AS d ON d.users_id = b.id
                                INNER JOIN packages AS e ON e.id = a.package_id
                            WHERE DATE_FORMAT(a.expiry_date, '%d-%m-%Y') = DATE_FORMAT(SUBDATE(NOW(),1) ,'%d-%m-%Y') ;`, (err, users) => {
            if (err) {
                callback(err)
            } else {
                callback(false, users)
            }
        })
    }
    module.gettrainer = (options, callback) => {
        connection.query(`SELECT 
        a.id, a.fname, a.lname, a.email, a.password, c.id AS role_id, c.name AS role_name
    FROM
        users AS a
        INNER JOIN user_roles AS b ON b.users_id = a.id
        INNER JOIN roles AS c ON c.id = b.roles_id
    WHERE
        a.email = '${options.email}' AND a.is_active = 1
        LIMIT 1`,
            (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    callback(false, result)
                }
            })
    }

    module.getUserProfile = (options,callback)=>{
        connection.query(`select a.* ,c.name as role
        from users as a
        inner join user_roles as b on b.users_id =a.id
        inner join roles as c on c.id = b.roles_id
        where a.id = ${options}`,(err,profile)=>{
            if (err) {
                callback(err)
            } else {
                callback(false, profile);
            }
        })
    }

    module.registerAdmin = (options, callback) => {
       
       connection.getConnection((err, connection)=>{
        if (err) {
          
            callback(err)
        }
        connection.beginTransaction(function (err){
            if (err) {
             
                callback(err)
            }
            connection.query(`INSERT INTO users SET fname = ?, phone = ?`, [options.name, options.mobile], function (err, results){
                if (err) {
                
                    connection.rollback(function (err) {
                     
                        callback(err)
                    });
                }
              
                connection.query('INSERT INTO user_roles SET users_id = ?, roles_id = 2', [results.insertId],function (err, detail){
                    if (err) {
                      
                        connection.rollback(function (err) {
                           
                            callback(err)
                        });
                    }
                   connection.query(`INSERT INTO brands SET name=?, shop_services=?`, [options.shop_name, options.shop_service], function(err, brand){
                    if (err) {
                      
                        connection.rollback(function (err) {
                           
                            callback(err)
                        });
                    }
                
                    connection.query(`INSERT INTO brand_locations SET brands_id=?, name=?`, [brand.insertId, options.shop_adress], function(err, location){
                        if (err) {
                            
                            connection.rollback(function (err) {
                             
                                callback(err)
                            });
                        }
                        connection.query(`INSERT INTO brand_location_users SET users_id = ?, brand_locations_id = ?`, [results.insertId, location.insertId], function(err, locationData){
                            if (err) {
                             
                                connection.rollback(function (err) {
                              
                                    callback(err)
                                });
                            }
                        
                            connection.commit(function (err) {
                            
                                if (err) {
                                    connection.rollback(function (err) {
                                        
                                        
                                        callback(err)
                                    });
                                }
                                callback(false, results.insertId)
                            });
                        })
                       
                    })
                   })
                   
                })
            })
        })

       })
    }

    module.registerShop = (options, callback) => {
        const shopPlainTextPassword = options.password;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(shopPlainTextPassword, salt);
        connection.getConnection((err, connection)=>{
        if (err) {
            callback(err)
        }
        // connection.beginTransaction(function (err){
        //     if (err) {
        //         callback(err)
        //     } else {
                connection.query(`INSERT INTO users SET fname = ?, lname = ?, email = ?, password = ?, phone = ?, pan = ?, shopact = ?`, [options.fname, options.lname, options.email, hash, options.phone, options.panno, options.shopactno], (err, result) => {
                    if(err) {
                        logger.error.error(err)
                        callback(err)
                    } else {
                        connection.query(`INSERT INTO brands SET name = ?, is_active = ?`,[options.shopname,1], (err, brand) => {
                            if(err) {
                                logger.error.error(err)
                                callback(err)
                            } else {
                                connection.query(`INSERT INTO brand_locations SET brands_id = ?, name = ?`,[brand.insertId,options.shopname], (err, brand_location) => {
                                    if(err) {
                                        logger.error.error(err)
                                        callback(err)
                                    } else {
                                        connection.query('INSERT INTO brand_location_users SET users_id = ?, brand_locations_id = ?', [result.insertId, brand_location.insertId], function (err, brand_location){
                                            if(err){
                                                logger.error.error(err)
                                                callback(err)
                                            } else {
                                                connection.query('INSERT INTO user_roles SET users_id = ?, roles_id = ?',[result.insertId, options.roles_id],(err,user_roles)=>{
                                                    if (err) {
                                                        logger.error.error(err)
                                                        callback(err)
                                                    } else {
                                                        if(options.role_id == 2 || options.role_id == '2'){
                                                            connection.query('select a.*,b.brands_id as brandId from brand_location_users as a inner join brand_locations as b on b.id=a.brand_locations_id where a.users_id=?', [result.insertId], function (error, user_brand) {
                                                                if (error) {
                                                                    console.log(error)
                                                                } else {

                                                                    connection.query(`select * from shop_subsription where shop_id = ?`, [user_brand[0].brandId], (err, data)=>{
                                                                        if (error) {
                                                                            callback(true,error)
                                                                        }else{
                                                                            if(data.length){
                                                                                connection.query(`UPDATE shop_subsription SET users_id = ? where shop_id = ?`, [result.insertId, user_brand[0].brandId], (err)=>{
                                                                                    if(err){
                                                                                        callback(true,error)
                                                                                    }else{
                                                                                        callback(false, result)
                                                                                    }
                                                                                })
                                                                            }else{
                                                                                connection.query('INSERT INTO shop_subsription SET users_id = ?, shop_id = ?', [result.insertId, user_brand[0].brandId], function (error, user_subscription) {
                                                                                    if (error) {
                                                                                        callback(true,error)
                                                                                    }else{
                                                                                        callback(false, result)
                                                                                    }
                                                                                })
                                                                            }
                                                                        }
                                                                    })

                                                                    
                                                                }
                                                            })
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
                })
        //     }
        // })

       })
    }

    module.geteducation = (options, callback) =>{
        connection.query(`select * from user_education where id = ${options.id}`, (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }
    
    module.getexperience = (options, callback) =>{
        connection.query(`select * from user_experience where id = ${options.id}`, (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.getLocationCustomer = (options, callback) =>{
        connection.query(`SELECT 
        a.users_id
        FROM
        shop_orders AS a
        inner join shop_orders_products as c on c.order_id=a.id
        inner join shop_products as d on d.id=c.product_id
        where d.location_id = ${options.options.locationId} group by a.users_id `, (err, data) =>{
            if(err){
                callback(err)
            }else{
                // callback(false, data)
                var values =[]
                data.forEach((d) =>{
                    values.push([8,"Notification for promotion", options.options.senderId,d.users_id, d.users_id])
                })
                connection.query(`INSERT INTO Notifications (type_id, description, sender_id, user_id, receiver_id) VALUES ?`, [values], (err)=>{
                    if(err){
                        callback(err)
                    }else{
                        data.forEach((e) =>{
                            connection.query(`select device_token from fcm_token where user_id= ${e.users_id}`, (err, token) =>{
                                if(err){
                                    callback(err)
                                }else{
                                    token.forEach(token => {
                                        console.log("token", token.device_token)
                                        var message = {
                                            to: token.device_token,
                                            notification: {
                                            // title: 'notification',
                                                body: `Promotional Notication`,
                                                image : 'http://apps.tapsoft.in:3336'+options.image,
                                                // image: 'http://192.168.1.23:3336'+options.image,
                                            },   
                                            data: {
                                                screen: 'PromotionImage',
                                                PromotionImage: 'http://apps.tapsoft.in:3336'+options.image,
                                            },
                                            // Required for background/quit data-only messages on iOS
                                            contentAvailable: true,
                                            // Required for background/quit data-only messages on Android
                                            priority: 'high',
                                        };

                                        fcm1.send(message, function (err, response) {
                                            if (err) {
                                                console.log("Something has gone wrong!" + err);
                                            } else {
                                                console.log("Successfully sent with response: ", response);
                                            }
                                        });

                                        fcm.send(message, function (err, response) {
                                            if (err) {
                                                console.log("Something has gone wrong!" + err);
                                            } else {
                                                console.log("Successfully sent with response: ", response);
                                            }
                                        });
                                    })
                                }
                            })
                            // callback(false)

                        })
                    }
                })
            }
        })
    }

    module.addBrandPromotionImage =(options, callback) =>{
        var path = options.file + '.jpg'
        connection.query(`INSERT INTO brand_location_promotional_images SET location_id = ?, sender_id = ?, image = ?`, [options.options.locationId, options.options.senderId, path], (err)=>{
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    
    module.AddUserDocuments = (options, callback) =>{
        var pan_img = '/documents/' + options.images[0].fileName
        var gst_img = '/documents/' + options.images[1].fileName
        
        connection.query(`select * from user_upload_documents where users_id = ? and location_id = ?`,[options.userId, options.locationId], (err, data) =>{
            if(err){
                callback(err)
            }else{
                if(!data.length){
                    connection.query('INSERT INTO user_upload_documents SET users_id = ?, location_id = ?, pan_file = ?, gst_file = ?', [options.userId, options.locationId, pan_img, gst_img], (err) =>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false)
                        }
                     })
                }else{
                    connection.query(`UPDATE user_upload_documents SET pan_file = ?, gst_file = ? where users_id = ? and location_id = ?`, [pan_img, gst_img, options.userId, options.locationId], (err)=>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false)
                        }
                    })
                }
            }
        })
    }
   
    module.UpdateUserDocuments = (options, callback) =>{
        var col 
        var File
        var file
        if(options.File.pan_file){
            col = 'pan_file'
            File = options.File.pan_file
            file = options.File.pan_file.name
        }else if(options.File.gst_file){
            col = 'gst_file'
            File = options.File.gst_file
            file = options.File.gst_file.name
        }

        File.mv('./public/documents/' + file)
        var path = '/documents/' + file
        connection.query(`UPDATE user_upload_documents SET ${col} = '${path}' where id = ${options.rowId}`,  (err)=>{
            if(err){
                console.log(err)
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    module.DeleteDocuments = (options, callback) =>{
        var col 
        
        if(options.pan_file){
            col = 'pan_file'
        }else if(options.gst_file){
            col = 'gst_file'
        }

        connection.query(`UPDATE user_upload_documents SET ${col} = null where id = ${options.document_id}`,  (err)=>{
            if(err){
                console.log(err)
                callback(err)
            }else{
                callback(false)
            }
        })
    }


    module.Add1 = (options, callback) => {
        const myPlaintextPassword = options.password;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(myPlaintextPassword, salt);
        
        connection.query('INSERT INTO users SET fname = ?, lname = ?, email = ?, password = ?, phone = ?, gender = ?, address_line_1 = ?, address_line_2 = ?, city_id = ?, state_id = ?, zip = ? , marital_status = ?,emergency_contact_name = ?,emergency_contact_number = ? , blood_group = ?, birth_date = ?, anniversary_date = ?', [options.fname, options.lname, options.email, hash, options.phone, options.gender, options.address1, options.address2, options.cityId, options.stateId, options.zip, options.marital_status, options.emergency_contact_name, options.emergency_contact_number, options.blood_group, options.birth_date, options.anniversary_date], function (err, results) {
            if (err) {
                callback(err)
            }else{
                connection.query('INSERT INTO brand_location_users SET users_id = ?, brand_locations_id = ?', [results.insertId, options.locationId], function (err, brand_location) {
                    if (err) {
                        callback(err)
                    }else{
                        connection.query('INSERT INTO user_roles SET users_id = ?, roles_id = ?', [results.insertId, options.role_id], function (err, user_roles) {
                            if (err) {
                                    callback(err)
                            }else{
                                if(options.role_id == 2 || options.role_id == '2'){
                                    connection.query('select a.*,b.brands_id as brandId from brand_location_users as a inner join brand_locations as b on b.id=a.brand_locations_id where a.users_id=?', [results.insertId], function (err, user_brand) {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            connection.query(`select * from shop_subsription where shop_id = ?`, [options.locationId], (err, data)=>{
                                                if (err) {
                                                    callback(true,err)
                                                }else{
                                                    console.log(data, "kkkkkkkkkk")
                                                    if(data.length){
                                                        connection.query(`UPDATE shop_subsription SET users_id = ?, start_date = now(), end_date = DATE_ADD(now(), INTERVAL 1 month ) where shop_id = ?`, [results.insertId, options.locationId], (err)=>{
                                                            if(err){
                                                                callback(true,err)
                                                            }else{
                                                                callback(false, results.insertId)
                                                            }
                                                        })
                                                    }else{
                                                        connection.query('INSERT INTO shop_subsription SET users_id = ?, shop_id = ?, plan_id = ?, status = ?, start_date = now(), end_date = DATE_ADD(now(), INTERVAL 1 month )', [results.insertId, options.locationId, 1, 1], function (err, user_subscription) {
                                                            if (err) {
                                                                callback(true,err)
                                                            }else{
                                                                callback(false, results.insertId)
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    })
                                }else{
                                    callback(false, results.insertId)
                                }
                            } 
        
                        });
                    }
                    
                });
            }
            
        });
    }

    module.getExpiredPlan = (options, callback) =>{
        connection.query(`select * from shop_subsription where plan_id = 1 and users_id = ${options.userId} and shop_id = ${options.locantionId}`, (err, data)=>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.getActivePlan = (options, callback) =>{
        connection.query(`select * from shop_subsription where plan_id = 1 and users_id = ${options.userId} and shop_id = ${options.locantionId}`, (err, data)=>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    return module;
};

module.exports = Users