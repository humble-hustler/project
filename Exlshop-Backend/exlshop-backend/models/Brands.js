/********************************************************/
/***** Brands Model *****/
/********************************************************/

const { options } = require("../routes/super-admin/dashboard");

const Brands = (connection, logger) => {
    const module = {}

    module.UpdateBrandLogo = (options,callback)=>{
        var location_id = options.location_id;
        filename = "/images/" + options.filename
        connection.query(`UPDATE brand_locations SET brand_logo = ? WHERE id = ?`, [filename,location_id], (err, data) => {
            if (err) {
                callback(err);
            } else {
                callback(false);
            }
        })
    }

    module.GetAll = (options, callback) => {
        var activeFilter = ''
        if (!options.all) {
            activeFilter = `WHERE a.is_active = 1`
        }
        var search = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` WHERE (a.id LIKE ${keyword} OR a.name LIKE ${keyword} )`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    a.*,
    (SELECT COUNT(id) FROM brand_locations WHERE brands_id = a.id) AS location_count
FROM
    brands AS a ${activeFilter} ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, brands) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, { total: brands[1][0].total, brands: brands[0] })
            }
        })
    }

    module.Add = (options, callback) => {
        connection.query(`INSERT INTO brands SET name = ?, is_active = ?`, [options.name, options.active], (err, brands) => {
            if (err) {
                logger.error.error("erroris", err)
                callback(err)
            } else {
                callback(false, brands)
            }
        })
    }

    module.GetById = (options, callback) => {
        connection.query(`SELECT * FROM brands WHERE id = ?`, [options.id], (err, brand) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, brand[0])
            }
        })
    }

    module.GetByMemberId = (options, callback) => {
        connection.query(`SELECT d.id AS brand_id, d.name AS brand_name
            FROM users AS a
                INNER JOIN 
            brand_location_users AS b ON b.users_id = a.id 
                INNER JOIN 
            brand_locations AS c ON c.id = b.brand_locations_id
                INNER JOIN 
            brands AS d ON d.id = c.brands_id WHERE a.id = ? `, [options.userId], (err, brand) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, brand[0])
            }
        })
    }

    module.updateShopDetails = (options, callback) => {
        connection.query(`UPDATE brand_locations SET address_line_1 = ?,
        address_line_2 = ?, city_id = ?, state_id = ?, country_id= ?,
        zip = ?, lat = ?, lng = ?, phone = ?, email = ?, gstin = ?  
        WHERE id = ?`, [options.address1, options.address2, options.cityId,
        options.stateId, options.countryId, options.zip, options.lat, 
    options.lng, options.phoneno, options.emailId, options.gstin, options.locationId], (err, data) => {
        if(err) {
            callback(err)
        } else {
            callback(false, data)
        }
        })
    }

    module.getLocations = (callback) =>{
        connection.query(`select * from brand_locations where is_deleted = 0`, (err, location) =>{
            if(err) {
                callback(err)
            } else {
                callback(false, location)
            }
        })
    }

    module.Search = (options, callback) => {
        connection.query(`SELECT * FROM brands WHERE name LIKE ${connection.escape('%' + options.text + '%')} `, (err, brands) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, brands)
            }
        })
    }

    module.UpdateBrand = (options, callback) => {
        connection.query(`UPDATE brands SET name=?,is_active = ? WHERE id = ?`, [options.name,options.stat, options.id], (err) => {
            callback(err)
        })
    }
    module.DeleteBrandLogo = (options,callback)=>{
        connection.query(`UPDATE brand_locations SET brand_logo ='null' WHERE id = ?`, [options.location_id], (err) => {
           if(err){
            callback(err)
           }else{
            callback(false)
           }
        })
    }

    module.GetTotalOrders=(options,callback)=>{
        connection.query(`SELECT * FROM admin_exlshop.shop_orders;SELECT FOUND_ROWS() AS total`, (err,data) => {
            if(err)callback(err)
            else{
                callback(false,data[1][0].total)
            }
        })
    }

    module.GetTotalShops=(callback)=>{
        connection.query(`SELECT * FROM admin_exlshop.brands where is_active = 1;SELECT FOUND_ROWS() AS total`, (err,data) => {
            if(err)callback(err)
            else{
                callback(false,data[1][0].total)
            }
        })
    }

    module.GetTotalCustomers=(callback)=>{
        connection.query(`SELECT distinct(a.email) from users as a
        inner join user_roles as b on a.id=b.users_id 
        inner join brand_location_users c on a.id = c.users_id
        INNER JOIN brand_locations AS h ON h.id = c.brand_locations_id
        where b.roles_id != 5 AND a.is_deleted = 0; SELECT FOUND_ROWS() AS total`, (err,data) => {
            if(err)callback(err)
            else{
                callback(false,data[1][0].total)
            }
        })  
    }

    module.GetTotalSales=(callback)=>{
        connection.query(`SELECT IFNULL(SUM(e.amount),0) as total_amount  from shop_payment_request as e where e.amount IN( 
            SELECT (d.amount) as total_amount
                    FROM  shop_products AS a
                    INNER JOIN shop_orders_products AS b
                    ON a.id=b.product_id
                    INNER JOIN shop_orders AS c
                    ON c.id=b.order_id
                    INNER JOIN shop_payment_request AS d
                    ON (d.instamojo_payment_request_id=c.instamojo_payment_request_id OR d.order_id=c.id)
                     group by d.amount )`, (err,data) => {
            if(err){
                callback(err)
            }else{
                callback(false,data[0].total_amount)
            }
        })   
    }

    module.totalSubscription=(callback)=>{
        connection.query(`SELECT *FROM admin_exlshop.shop_subsription where is_deleted = 0;SELECT FOUND_ROWS() AS total`, (err,data) => {
            if(err)callback(err)
            else{
                callback(false,data[1][0].total)
            }
        })     
    }

    module.updateOrderDetails = (options, callback) =>{
        connection.query(`update brand_locations SET minimum_order_amount = ?, maximum_order_distance = ? where id = ?`, [options.minimum_order_amount, options.maximum_order_distance, options.brandLocationId],(err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    return module;
};
module.exports = Brands;