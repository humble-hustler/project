const { options } = require('../routes');

const Subscription = (connection, logger) => {
    const module = {}
    const moment = require('moment');
 
    module.subscription_details = (options, callback) => {
        console.log(options, "kkkkkkkkkkkkkkkk")
        var search = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (d.name LIKE ${keyword} OR c.fname LIKE ${keyword} OR c.lname LIKE ${keyword} OR a.amount LIKE ${keyword} OR a.created_date LIKE ${keyword} )`
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        a.*, concat(c.fname,' ',c.lname) as username, d.name as plan_name, d.allowed_products,
                d.add_product_req
        from shop_subsription as a
        left join shop_subscription_request as b on b.instamojo_payment_request_id  = a.instamojo_payment_request_id
        inner join users as c on a.users_id=c.id
        LEFT JOIN shop_subscription_plan AS d ON d.id = a.plan_id
        where a.users_id=${options.userId} AND a.shop_id = ${options.locationId} and a.is_deleted=0 ${search} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total; `,[options.userId],(err, subscription_details) => {
            console.log(err, subscription_details)
            callback(err, subscription_details)
        })
    }
    module.addSubscriptionPlans=(options,callback)=>{
      connection.query(`INSERT INTO shop_subscription_plan(name, period, plan_interval, amount,
        allowed_products,add_product_req, no_of_req, allowed_features) values('${options.planName}','${options.planPeriod}',${options.planInterval},
        ${options.planAmount},'${options.allowedProducts}','${options.addProReq}','${options.noofreq}','${options.allowedFeatures}')`,(err,data)=>{
       if(err){
           callback(err)
       }else{
         
           callback(false)
       }
      })
    }

    module.updateSubscriptionPlans=(options,callback)=>{
        connection.query(`UPDATE shop_subscription_plan SET name=?, period=?, plan_interval=?, amount=?,
          allowed_products=?,add_product_req=?, no_of_req=?, allowed_features='${options.allowedFeatures}' WHERE id = ?`,[options.planName,options.planPeriod,options.planInterval,
          options.planAmount,options.allowedProducts,options.addProReq,options.noofreq,options.planId],(err,data)=>{
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    module.deleteSubscriptionPlans=(options,callback)=>{
        connection.query(`UPDATE shop_subscription_plan SET is_deleted=1 WHERE id = ?`,[options.planId],(err,data)=>{
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    module.getSubscriptionPlans=(callback)=>{
        connection.query(`SELECT * FROM shop_subscription_plan WHERE is_deleted = 0`,(err,data)=>{
            if(err){
                callback(err)
            }else{
                callback(err,data)
            }
        })
    }
    module.getsubscribed_details=(options,callback)=>{
        connection.query(`SELECT 
        b.id,
        b.brands_id,
        b.name,
        d.name as plan_name,
        c.plan_id,
        d.period,
        d.plan_interval,
        c.instamojo_payment_request_id,
        c.razorpay_signature,
        c.instamojo_payment_id,
        c.shop_id,
        c.amount,
        d.allowed_products,
        d.add_product_req,
        d.no_of_req,
        d.allowed_features,
        c.start_date,
        c.end_date,
        c.status,
        c.is_deleted,
        DATEDIFF(c.end_date, NOW()) as remaining_days
    FROM
        brand_location_users AS a
        INNER JOIN brand_locations AS b ON b.id = a.brand_locations_id
        LEFT JOIN shop_subsription as c ON c.shop_id = b.id AND c.users_id = a.users_id
        LEFT JOIN shop_subscription_plan as d ON d.id = c.plan_id
    WHERE
        a.users_id = ${options.userId} AND b.id = ${options.locationId} AND  c.is_deleted = 0 AND b.is_deleted=0`,(err,data)=>{
            if(err){
                callback(err)
            }else{
                if(data.length){
                    data[0].start_date = moment(data[0].start_date).format('DD-MM-YYYY')
                    data[0].end_date = moment(data[0].end_date).format('DD-MM-YYYY')
                }
                callback(err,data)
            }
           })
    }
    module.Cancel_Subscription=(options,callback)=>{
        connection.query(`UPDATE shop_subscription_request as a SET a.is_deleted=1 WHERE a.instamojo_payment_request_id='${options.razorpay_order_id}'`,(err,data)=>{
            if(err) {
                callback(err)
            } else {
                connection.query(`UPDATE shop_subsription as a SET a.status = 1, a.is_deleted=1 WHERE a.instamojo_payment_request_id='${options.razorpay_order_id}' AND a.instamojo_payment_id='${options.razorpay_payment_id}'`,(err,data)=>{
                    if(err) {
                        callback(err)
                    } else {
                        callback(false,data)
                    }
                })
            }
        })
    }

    module.deactivatePlan=(options,callback)=>{
        connection.query(`UPDATE shop_subscription_request as a SET a.is_deleted=1 WHERE a.instamojo_payment_request_id='${options.razorpay_order_id}' AND users_id = ? AND shop_id = ?`,[options.userId, options.locationId], (err,data)=>{
            if(err) {
                callback(err)
            } else {
                connection.query(`UPDATE shop_subsription as a SET a.status=1, a.is_deleted = 1 WHERE a.instamojo_payment_request_id='${options.razorpay_order_id}' AND a.instamojo_payment_id=${options.razorpay_payment_id} AND users_id = ? AND shop_id = ?`,[options.userId, options.locationId],(err,data)=>{
                    if(err) {
                        callback(err)
                    } else {
                        callback(false,data)
                    }
                })
            }
        })
    }
    return module;
};

module.exports = Subscription;