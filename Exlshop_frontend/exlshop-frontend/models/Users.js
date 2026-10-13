const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const randtoken = require('rand-token');
const { options } = require('../routes');
const {SphericalUtil, PolyUtil} = require("node-geometry-library");
const { result } = require('lodash');
const saltRounds = 10;
const async = require("async");
const order = require('../routes/api/versions/v1/order');

const Users = (connection, logger) => {
    const module = {}
    module.SignIn = (options, callback) => {
        if(options.flag==1){
        var qwerr;
        qwerr = `SELECT * FROM users  WHERE email = '${options.email}' AND is_active = 1 LIMIT 1`;
        connection.query(qwerr, (err, user) => {
            if (err) {
                callback(err)
            } else {
                if (user.length == 0) {
                    callback(true)
                } else {
                    const comparePass = bcrypt.compareSync(options.password, user[0].password);
                    if (comparePass) {
                        delete user[0].password;
                        callback(false, user[0])
                    } else {
                        callback(true, false, user)
                    }
                }
            }
        })
        } else {
            var name = options.name;
            var email = options.email;
            connection.query(`select * from users as a where a.email='${email}' `, function (err, result) {
                if (err) {
                    callback(err)
                } else {
                    if (result.length == 0) {
                        callback(true, false)
                    } else {
                        callback(false, result[0])
                    }
                }
            });
        }
    }

    module.ResetPassword = (options, callback) => {
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
                            callback(false)
                        }
                    })
                } else {
                    message = 'Old and New Passwords dont match!';
                    callback(true, message)
                }
            } else {
                callback(true, false);
            }
        })
    }

    module.SignUpAdmin = (options, callback) => {
        const myPlaintextPassword = options.password;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(myPlaintextPassword, salt);
        connection.query(`INSERT INTO users SET fname = ?, lname = ?, email = ?, password = ?, phone = ?`, [options.fname, options.lname, options.email, hash, options.phone], (err, result) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } 
            else{
                connection.query('INSERT INTO brand_location_users SET users_id = ?, brand_locations_id = ?,delivery_option=?', [result.insertId, options.location_id,options.selected_delhiveryOption], function (err, brand_location){
                    if(err){
                        logger.error.error(err)
                        callback(err)
                    }
                    else{
                        connection.query('INSERT INTO user_roles SET users_id = ?, roles_id = ?',[result.insertId, options.role_id],(err,user_roles)=>{
                            if(err){
                                logger.error.error(err)
                                callback(err)
                            }
                            else{
                                if(options.role_id == 2 || options.role_id == '2'){
                                    connection.query('select a.*,b.brands_id as brandId from brand_location_users as a inner join brand_locations as b on b.id=a.brand_locations_id where a.users_id=?', [result.insertId], function (error, user_brand) {
                                        if (error) {
                                            callback(true,error)
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
                                                                callback(false)
                                                            }
                                                        })
                                                    }else{
                                                        connection.query('INSERT INTO shop_subsription SET users_id = ?, shop_id = ?', [result.insertId, user_brand[0].brandId], function (error, user_subscription) {
                                                            if (error) {
                                                                callback(true,error)
                                                            }else{
                                                                callback(false)
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

    module.SignUp = (options, callback) => {
        const myPlaintextPassword = options.password;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(myPlaintextPassword, salt);
        connection.query(`INSERT INTO users SET fname = ?, lname = ?, email = ?, password = ?, phone = ?`, [options.fname, options.lname, options.email, hash, options.phone], (err, user) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, user)
            }
        })
    }

    module.chatWithUs = (options, callback) =>{
        connection.query(`INSERT INTO chat_with_us SET users_id = ?, questions = ?`, [options.userId, options.question], (err, question) =>{
            if(err){
                callback(err)
            }else{
                callback(false, question)
            }
        })
    }

    module.SignUpShop = (options, callback) =>{
        const shopPlainTextPassword = options.password;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(shopPlainTextPassword, salt);
       
        connection.query(`INSERT INTO users SET fname = ?, lname = ?, email = ?, password = ?, phone = ?, pan = ?, shopact = ?, gst_number = ?`, [options.fname, options.lname, options.email, hash, options.phone, options.panno, options.shopactno, options.gstno], (err, result) => {
            if(err) {
                console.log(err)
                logger.error.error(err)
                callback(err)
            } else {
                connection.query(`INSERT INTO brands SET name = ?, is_active = ?`,[options.shopname,1], (err, brand) => {
                    if(err) {
                        console.log(err)
                        logger.error.error(err)
                        callback(err)
                    } else {
                        connection.query(`INSERT INTO brand_locations SET brands_id = ?, name = ?`,[brand.insertId,options.locationname], (err, brand_location) => {
                            if(err) {
                                logger.error.error(err)
                                callback(err)
                            } else {
                                var locationId = brand_location.insertId
                                connection.query('INSERT INTO brand_location_users SET users_id = ?, brand_locations_id = ?', [result.insertId, brand_location.insertId], function (err, brand_location){
                                    if(err){
                                        logger.error.error(err)
                                        callback(err)
                                    } else {
                                        connection.query('INSERT INTO user_roles SET users_id = ?, roles_id = ?',[result.insertId, 2],(err,user_roles)=>{
                                            if (err) {
                                                
                                                logger.error.error(err)
                                                callback(err)
                                            } else {
                                               
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
                                                                                callback(false, {result, locationId})
                                                                            }
                                                                        })
                                                                    }else{
                                                                        connection.query('INSERT INTO shop_subsription SET users_id = ?, shop_id = ?', [result.insertId, user_brand[0].brandId], function (error, user_subscription) {
                                                                            if (error) {
                                                                            
                                                                                callback(true,error)
                                                                            }else{
                                                                                callback(false, {result, locationId})
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
                    }
                })
               
            }
        })
    }

    module.AddUserDocuments = (options, callback) =>{
        var pan_img = '/documents/' + options.images[0].fileName
        var gst_img = '/documents/' + options.images[1].fileName
         connection.query('INSERT INTO user_upload_documents SET users_id = ?, location_id = ?, pan_file = ?, gst_file = ?', [options.userId, options.locationId, pan_img, gst_img], (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
         })
    }

    function sendEmail(email, token) {
        var email = email;
        var token = token;
        var mail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'akankshatapsoft@gmail.com', // Your email id
                pass: 'qylhmcfkjvacmovr' // Your password
            }
        });

        var mailOptions = {
            from: 'akankshatapsoft@gmail.com',
            to: email,
            subject: 'Reset Password Link ',
            html: '<p>You requested for reset password, kindly use this <a href="http://localhost:3331/Validate-user?email=' + email + '">link</a> to reset your password</p>'
        }; 
        
         mail.sendMail(mailOptions, function (error, info) {
            if (error) {
            } else {
            }
        });
    }
    
    module.ForgotPasswordEmail = (options, callback) => {
        const email = options.email
        connection.query("select * from users where email=?", email, (err, result) => {
            if (err) {
                callback(err)
            }
            var type=''
            var msg=''
            if (result.length) {
                var token = randtoken.generate(20);
               
                var mail = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'akankshatapsoft@gmail.com', // Your email id
                        pass: 'qylhmcfkjvacmovr' // Your password
                    }
                });
        
                var mailOptions = {
                    from: 'akankshatapsoft@gmail.com',//206.189.142.143/
                    to: email,
                    subject: 'Reset Password Link ',
                    html: '<p>You requested for reset password, kindly use this <a href="https://exlshop.com/Validate-user?token=' + token + '">link</a> to reset your password</p>'
                }; 

                mail.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        type = 'error';
                        msg = 'Something goes to wrong. Please try again';
                        callback(false, {type, msg})
                    } else {
                        var data = {
                            token: token
                        }
                        connection.query('UPDATE users SET ? WHERE email ="' + email + '"', data, function (err, result) {
                            if (err) throw err
                        })
                        type = 'success';
                        msg = 'The reset password link has been sent to your email address';
                        callback(false, {type, msg, token})
                    }
                });
            } else {
                type = 'error';
                msg = 'The Email is not registered with us';
                callback(false, {type, msg})
            }
        })
    }
    
    module.ValidateUser=(options, callback) => {
        var token = options.token;
       connection.query('SELECT * FROM users WHERE token ="' + token + '"', function(err, result) {
            if (err) throw err;
           callback(err,result)
        });
    }
    
    module.forgotPassword = (options, callback) => {
        var token = options.token;
        var password = options.confirm_password;
        connection.query('SELECT * FROM users WHERE token ="' + token + '"', function(err, result) {
            if(err){
                callback(err)
            }else{
                var type
                var msg
                if (result.length > 0) {
                    var saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        bcrypt.hash(password, salt, function(err, hash) {
                            var data = {
                                password: hash
                            }
                            connection.query('UPDATE users SET ? WHERE email ="' + result[0].email + '"', data, function(err, result) {
                                if(err) throw err
                            });
                        });
                    });
                    type = 'success';
                    msg = 'Your password has been updated successfully';
                } else {
                        type = 'success';
                        msg = 'Invalid link; please try again';
                }
            }
            callback(false, {type, msg})
        });   
    }

    module.editProfile = (options, callback) => {
        const email = options.email
        const fname = options.fname
        const lname = options.lname
        const phone = options.phone
        const gender = options.gender
        const dob = options.dob
        const id = options.id
        connection.query("update users SET fname=?,lname=?,email=?,phone=?,gender=?,birth_date=? where id=?", [email, fname, lname, phone, gender, dob, id], (err, data) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }
    module.IsEmailValid = (options, callback) => {
        connection.query("SELECT id FROM users WHERE email = ?", [options.email], (err, user) => {
            if (err) {
                callback(err)
            } else {
                callback(false, user.length == 0 ? false : true)
            }
        })
    }
    module.IsPhoneValid = (options, callback) => {
        connection.query("SELECT id FROM users WHERE phone = ?", [options.phone], (err, user) => {
            if (err) {
                callback(err)
            } else {
                callback(false, user.length == 0 ? false : true)
            }
        })
    }

    module.getAddressDetails = (options, callback) => {
        connection.query(` select a.*, b.name as country, c.name as state, d.name as city from shop_user_shipping_address as a 
        inner join countries as b on  b.id = a.country_id
          INNER JOIN states AS c ON c.id = a.state_id 
            INNER JOIN cities AS d ON d.id = a.city_id where a.id = ?`, [options.order_Id], (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.updateAddressDetails = (options, callback) => {
        if(!options.lat == ''){
        connection.query(`UPDATE shop_user_shipping_address SET label = '${options.label}', name = '${options.name}', address_line_1 = '${options.addressLine1}', address_line_2 = '${options.addressLine2}', state_id = '${options.state}', city_id = '${options.city}', zip = '${options.zip}', phone = '${options.phone}', lat = '${options.lat}', lng = '${options.lng}' WHERE id = '${options.shipping_Id}'`, (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }else{
        connection.query(`UPDATE shop_user_shipping_address SET label = '${options.label}', name = '${options.name}', address_line_1 = '${options.addressLine1}', address_line_2 = '${options.addressLine2}', state_id = '${options.state}', city_id = '${options.city}', zip = '${options.zip}', phone = '${options.phone}' WHERE id = '${options.shipping_Id}'`, (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }
    }

    module.AddShippingAddress = (options, callback) => { 
         if(!options.post.lat == ''){
            connection.query(`INSERT INTO shop_user_shipping_address SET label = ?, name = ?, users_id = ?, address_line_1 = ?, address_line_2 = ?, country_id = ?, state_id = ?, city_id = ?, phone = ?, zip = ?, lat = ?, lng = ?`,
            [options.post.label, options.post.name, options.userId, options.post.addressLine1, options.post.addressLine2, 101, options.post.stateId, options.post.cityId, options.post.phone, options.post.zip, options.post.lat, options.post.long], (err, data) => {
              if(err){
                console.log(err)
              }else{
                callback(false, data)
              }
            })
         }else{
            connection.query(`INSERT INTO shop_user_shipping_address SET label = ?, name = ?, users_id = ?, address_line_1 = ?, address_line_2 = ?, country_id = ?, state_id = ?, city_id = ?, phone = ?, zip = ?`,
            [options.post.label, options.post.name, options.userId, options.post.addressLine1, options.post.addressLine2, 101, options.post.stateId, options.post.cityId, options.post.phone, options.post.zip], (err, data) => {
              if(err){
                console.log(err)
              }else{
                callback(false, data)
              }
            })
         }
    }

    module.AddShippingAddress1 = (options, callback) => { 
         if(!options.lat == ''){
            connection.query(`INSERT INTO shop_user_shipping_address SET label = ?, name = ?, users_id = ?, address_line_1 = ?, address_line_2 = ?, country_id = ?, state_id = ?, city_id = ?, phone = ?, zip = ?, lat = ?, lng = ?`,
            [options.label, options.name, options.userId, options.addressLine1, options.addressLine2, 101, options.stateId, options.cityId, options.phone, options.zip, options.lat, options.long], (err, data) => {
              if(err){
                console.log(err)
              }else{
                callback(false, data)
              }
            })
         }else{
            connection.query(`INSERT INTO shop_user_shipping_address SET label = ?, name = ?, users_id = ?, address_line_1 = ?, address_line_2 = ?, country_id = ?, state_id = ?, city_id = ?, phone = ?, zip = ?`,
            [options.label, options.name, options.userId, options.addressLine1, options.addressLine2, 101, options.stateId, options.cityId, options.phone, options.zip], (err, data) => {
              if(err){
                console.log(err)
              }else{
                callback(false, data)
              }
            })
         }
    }

    module.GetShippingAddress = (options, callback) => {
        connection.query(`SELECT a.*, b.name AS state_name, c.name AS city_name FROM
    shop_user_shipping_address AS a
    INNER JOIN states AS b ON b.id = a.state_id 
    INNER JOIN cities AS c ON c.id = a.city_id
    WHERE a.users_id = ? and a.isdeleted = 0`, [options.userId], (err, address) => {
            callback(err, address)
        })
    }
    module.Update = (options, callback) => {
        connection.getConnection((err, connection) => {
            if (err) {
                callback(err)
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    callback(err)
                }
                connection.query('UPDATE users SET fname = ?, lname = ?, email = ?, phone = ? WHERE id= ?', [options.options.fname, options.options.lname, options.options.email, options.options.phone, options.options.id], function (error, results) {
                    if (error) {
                        connection.rollback(function (err) {
                            callback(err)
                        });
                    }
                    else {
                       
                    }
                    connection.commit(function (err) {
                        if (err) {
                            connection.rollback(function (err) {
                                callback(err)
                            });
                        }
                        callback(false)
                    });
                });
            });
        })
    }
    module.GetSingle = (options, callback) => {
        connection.query(`SELECT a.*, b.name AS city_name FROM users AS a 
                        LEFT JOIN cities AS b ON b.id = a.city_id
                        WHERE a.id = ?`, [options.userId], (err, user) => {
            callback(err, user[0]);
        })
    }

    module.UpdateShippingAddress = (options, callback) => {
        connection.query(`UPDATE shop_user_shipping_address SET label = ?, name = ?, address_line_1 = ?, address_line_2 = ?, country_id = ?, state_id = ?, city_id = ?, phone = ?, zip = ? WHERE id = ? `, [options.label, options.name, options.addressLine1, options.addressLine2, 101, options.stateId, options.cityId, options.phone, options.zip, options.id], (err) => {
            callback(err)
        })
    }

    module.deleteAddressDetails = (options, callback) => {
        connection.query(`UPDATE shop_user_shipping_address SET isdeleted = 1 where id = ?`, [options.shipping_Id], (err, data) =>{
            if(err) {
                callback(err)
            } else {
                callback(false, data)
            }
        })
    }

    module.GetAllChats = (options, callback) => {
        connection.query(`SELECT * FROM chats WHERE from_user = ? OR to_user = ?`, [options.userId, options.userId], (err, chats) => {
            if (err) {
                callback(err)
            } else {
                callback(false, chats)
            }
        })
    }

    module.GetUserAllocatedDietitians = (options, callback) => {
        connection.query(`SELECT a.id, a.fname, a.lname, b.image_file
            FROM users AS a
                LEFT JOIN member_profile_images AS b ON b.users_id = a.id
            WHERE a.id IN (
                SELECT d.dietitian_id 
                FROM users AS a 
                INNER JOIN 
                    shop_orders AS b ON b.users_id = a.id
                INNER JOIN 
                    shop_orders_products AS c On c.order_id = b.id
                INNER JOIN 
                    shop_orders_products_dietitians AS d ON d.shop_orders_products_id = c.id
                WHERE a.id = ?
            )`, [options.userId], (err, dietitians) => {
            if (err) {
                callback(err)
            } else {
                callback(false, dietitians)
            }
        })
    }

    module.GetFitnessDetails = (options, callback) => {
        connection.query(`SELECT * FROM user_fitness WHERE user_id = ?`, [options.userId], (err, fitnessDetails) => {
            if (err) {
                callback(err)
            } else {
                callback(false, fitnessDetails.length > 0 ? fitnessDetails[0] : null)
            }
        })
    }

    module.UpdateFitnessDetails = (options, callback) => {
        connection.query(`INSERT user_fitness SET user_id = ? ,height = ? , weight = ? ON DUPLICATE KEY UPDATE height = ? , weight = ?`, [options.userId, options.height, options.weight, options.height, options.weight], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.getUserProfile = (options,callback)=>{
        connection.query('select * from users where id=?',options,(err,profile)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,profile);
            }
        })
    }

    module.UpdateUserProfile = (options,callback)=>{
        connection.query('UPDATE users SET fname = ?,lname=?,email=?,phone=?,address_line_1  =?,address_line_2=?,zip=? WHERE id = ?',
            [options.fname,options.lname,options.email,options.phone,options.address_line_1,options.address_line_2,
            options.zip,options.id],
                (err,profile)=>{
                    if (err) {
                        callback(err)
                    } else {
                        callback(false,profile);
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
    module.GetAllLocation = (callback) => {
        connection.query(`SELECT a.*, b.name AS brand_name ,b.id AS brand_id FROM  brand_locations AS a
        INNER JOIN brands AS b ON b.id = a.brands_id `, (err,brandLocations) => {
            if (err) {
                callback(err)
            } else {
                callback(false,brandLocations);
            }
        })
    }
    
    module.GetLocation = (options,callback) => {
        connection.query(`SELECT a.*, b.name AS brand_name ,b.id AS brand_id, c.name as city_name, d.name as state_name, e.name as country_name FROM brand_locations AS a
        INNER JOIN brands AS b ON b.id = a.brands_id
        left JOIN cities AS c ON c.id = a.city_id
        left JOIN states AS d ON d.id = a.state_id
        left JOIN countries AS e ON e.id = a.country_id
         where a.brands_id=? and a.id = ?`,[options.brand_id,options.location_id], (err,brandLocations) => {
            if (err) {
                callback(err)
            } else {
                callback(false,brandLocations);
            }
        })
    }
    module.Getbrand= (options,callback) => {
        connection.query(`SELECT * from brands where brands.id=?`,options.brand_id, (err,brand) => {
            if (err) {
                callback(err)
            } else {
                callback(false,brand[0]);
            }
        })
    }

    module.wishlistShop = (options, callback) =>{
        connection.query(`select * from user_shop_wishlist where users_id = ?`, [options.userId], (err, wishlistShop) =>{
            if(err){
                callback(err)
            }else{
                callback(false, wishlistShop)
            }
        })
    }

    module.addShopWishlist = (options, callback) =>{
        connection.query(`INSERT INTO user_shop_wishlist SET users_id = ?, brand_id =?, brand_location_id = ?`, [options.userId, options.post.brand_id, options.post.brand_location_id], (err, wishlist) =>{
            if(err){
                callback(err)
            }else{
                callback(false, wishlist)
            }
        })
    }

    module.addShopWishlist1 = (options, callback) =>{
        connection.query(`select * from user_shop_wishlist where users_id = ? and  brand_location_id = ?`, [options.userId, options.brand_location_id], (err, result) =>{
            if(err){
                callback(err)
            }else{
                if(!result.length){
                    connection.query(`INSERT INTO user_shop_wishlist SET users_id = ?,  brand_location_id = ?`, [options.userId, options.brand_location_id], (err, wishlist) =>{
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
   
    module.Getshops= (options,callback) => {
        if(options.s_data == 'all' || options.s_data == 'category' || options.s_data == 'subcategory' || options.s_data == 'shops'){
            if (options.search_data) {
                var search = '';
                search += 'where a.name LIKE "%' + options.search_data + '%" ';
            }

       

            connection.query(`select  a.name AS brands_name,
            a.id as brands_id,
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
            ${search} AND b.is_active = 1 AND c.is_available = '1' GROUP BY(c.location_id)`, (err,shops) => {
                if (err) {
                    callback(err)
                } else {
                    async.eachSeries(shops, (s, cb) =>{
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
                            callback(false, shops)
                        }
                    })
                }
            })
        }
    }

    module.Getshops1= (options,callback) => {
        if(options.s_data == 'all' || options.s_data == 'category' || options.s_data == 'subcategory' || options.s_data == 'shops'){
            if (options.search_data) {
                var search = '';
                search += 'where a.name LIKE "%' + options.search_data + '%" ';
            }
            connection.query(`select  a.name AS brands_name,
            a.id as brands_id,
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
            ${search} AND c.is_available = '1' GROUP BY(c.location_id)`, (err,shops) => {
                if (err) {
                    callback(err)
                } else {
                   callback(false,shops)
                }
            })
        }
    }

    module.Getshops2= (options,callback) => {
            if (options.s_loc) {
                var search = '';
                search += 'where (b.address_line_1 LIKE "%' + options.s_loc + '%" OR b.address_line_2 LIKE "%' + options.s_loc + '%" OR b.name LIKE "%' + options.s_loc + '%")';
            }
     
            connection.query(`SET SQL_SAFE_UPDATES=0; DELETE FROM User_Searched_Shops;
            SET SQL_SAFE_UPDATES=1;
            INSERT INTO User_Searched_Shops(SELECT a.id as id, a.name AS brands_name,
            a.id as brands_id,b.brand_logo,b.id as location_id,b.name as location_name,
            CONCAT(b.lat, ',' ,b.lng) AS latlong,COUNT(c.location_id) as count,CONCAT(b.address_line_1, ', ' ,b.address_line_2) AS address,
            b.operating_hour_end as closetime,
            round(AVG(f.stars),1) as stars,
            '0' as Distance,group_concat(distinct c.user_id) as user_id, group_concat(distinct l.phone) as admin_phone
            from brands as a
            inner join brand_locations as b on b.brands_id = a.id
            inner join shop_products as c on c.location_id = b.id
            inner join shop_product_categories as d on d.product_id = c.id
            inner join shop_categories as e on e.id = d.category_id
            left join shop_rate as f on f.shop_id = b.id
            inner join users as l on l.id = c.user_id
            ${search} AND c.is_available = '1' GROUP BY(c.location_id));
            
            SELECT * FROM User_Searched_Shops`, [1,2,3,4,5], (err,shops) => {
                if (err) {
                    callback(err)
                } else {
                            var shopsList = shops[4];
                            var shopdistances = [];
                            var shopid = [];
                            for (let j=0;j<shops[4].length;j++){
                                var shopdestination = []
                                shopdestination.push((shopsList[j].latlong).split(',')[0])
                                shopdestination.push((shopsList[j].latlong).split(',')[1])
                                var distance =SphericalUtil.computeLength([{'lat': options.myLocation[0], 'lng': options.myLocation[1]}, {'lat': shopdestination[0], 'lng': shopdestination[1]}]);
                                connection.query(`SET SQL_SAFE_UPDATES=0; UPDATE User_Searched_Shops SET Distance=${(distance/1000).toFixed(1)} WHERE location_id=${shopsList[j].location_id}; SET SQL_SAFE_UPDATES=1;`, (err,shops) => {
                                    if(err) {
                                        console.log("Adding Distance Error",err)
                                    } else {
                                        //callback(false,shops1[1])
                                    }
                                })
                                }
                                connection.query(`SELECT * FROM User_Searched_Shops;`, (err,shops) => {
                                    if(err) {
                                      console.log(err)
                                        //callback(err)
                                    } else {
                                        // callback(false,shops)
                                        async.eachSeries(shops, (s, cb) =>{
                                            connection.query(`select group_concat(a.name) as brand_name, b.id, b.name, group_concat( c.users_id) as users from brands as a 
                                            left join brand_locations as b on b.brands_id = a.id
                                            left join brand_location_users as c on c.brand_locations_id = b.id
                                            left join user_roles as d on d.users_id = c.users_id and d.roles_id = 2
                                            left join users as e on e.id = c.users_id and e.is_active = 1 and e.is_deleted = 0
                                            where b.id = ${s.location_id} group by b.id`, (err, users1) =>{
                                                if(err){
                                                    cb(err)
                                                }else{
                                                    if(users1){
                                                        s.users = users1[0].users 
                                                    }else{
                                                        s.users = 0
                                                    }
                                                    cb()
                                                }
                                            })
                                        }, (err, result) =>{
                                            if(err){
                                                console.log(err)
                                            }else{
                                                callback(false, shops)
                                            }
                                        })
                                    }
                                })
                        }
                    })
                }

    module.Getcount = (options,callback)=>{
        if (options.search_data) {
            var search = '';
            search += 'where c.name LIKE "%' + options.search_data + '%" ';
        }
        connection.query(`SELECT 
        a.name AS location_name,
        count(c.location_id)
    FROM
        brand_locations AS a
            INNER JOIN brands AS b ON b.id = a.brands_id
            inner join shop_products as c on c.location_id = a.id
            where b.name like 'h.m'
        group by(c.location_id) `, (err,count) => {
            if (err) {
                callback(err)
            } else {
                callback(false,count);
            }
        })
    }

    module.AutoComplete =(options,callback)=>{
        connection.query(`SELECT name FROM shop_products 
        WHERE name LIKE "%' + req.query.term + '%"`,
            function (err, rows, fields) {
                if (err) {
                    callback(err)
                }else{
                    if(data.length!=0){
                        var data = [];
                        for (i = 0; i < rows.length; i++) {
                            data.push(rows[i].name);
                        }
                        callback(false,data);
                    }else{
                        connection.query(`SELECT name FROM brands 
                        WHERE name LIKE "%' + req.query.term + '%"`,
                            function (err, rows, fields) {
                                if (err) {
                                    callback(err)
                                }else{
                                    var data = [];
                                    for (i = 0; i < rows.length; i++) {
                                        data.push(rows[i].name);
                                    }
                                    callback(false,data);
                                }
                    })
                }
                   
                }          
            });
    }

    module.AddWishlistProduct = (options,callback)=>{
        connection.query(`INSERT INTO user_wishlist(users_id, product_id,product_name,brand_location_id) VALUES(?,?,?,?) `,
        [options.userId,options.productId,options.productName,options.locationId],(err,product)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,product);
            }
        })
    }
    module.ViewWishlist = (options,callback)=>{
        connection.query(`select a.* from user_wishlist as a where a.users_id = ? and a.product_id = ?`,
        [options.userId,options.productId],(err,wislist)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,wislist);
            }
        })
    }

    module.ViewShopWishlist1 = (options,callback)=>{
        connection.query(`select a.* from user_shop_wishlist as a where a.users_id = ? and a.brand_id = ? and a.brand_location_id = ?`,
        [options.userId,options.brandId, options.brandLocationId],(err,wishlist)=>{
            if (err) {
                callback(err)
            } else {
                callback(false, wishlist);
            }
        })
    }

    module.getUserProductWishlist = (options,callback)=>{
        connection.query(`select a.* ,b.product_type,
        b.name as product_name,
        c.file_name,
        b.regular_price, f.lat, f.lng, f.maximum_order_distance,
        e.slug
        FROM
        user_wishlist as a
        inner join shop_products as b on a.product_id = b.id
        inner JOIN shop_product_images AS c ON c.product_id = b.id
        inner JOIN shop_product_categories AS d ON d.product_id = b.globalproduct_id
        inner JOIN shop_categories AS e ON e.id = d.category_id
        left join brand_locations as f on f.id = a.brand_location_id
        where a.users_id = ? AND c.is_featured = 1`,options.userId,(err,userProductWishlist)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,userProductWishlist);
            }
        })
    }

    module.getUserShopWishlist= (options,callback)=>{
        connection.query(`select a.*,
            b.name as location_name,
            CONCAT(b.address_line_1, ', ' ,b.address_line_2) AS address,
            b.brand_logo
            from 
            user_shop_wishlist as a
            inner join brand_locations as b on b.id = a.brand_location_id
            where  a.users_id = ?`,options.userId,(err,userShopWishlist)=>{
                if (err) {
                    callback(err)
                } else {
                    callback(false,userShopWishlist);
                }
            })
    }

    module.shopOrderLocation = (options, callback) => {
        connection.query(`select   c.location_id from shop_orders as a 
        inner join shop_orders_products as b on b.order_id = a.id
        inner join shop_products as c on c.id = b.product_id where a.users_id = ? group by c.location_id`, [options.userId], (err, order) =>{
            if(err){
                callback(err)
            }else{
                callback(false, order)
            }
        })
    }

    module.shopOrderLocation2 = (callback) =>{
        connection.query(`select   d.*, e.name as brand_name, substring_index( c.users_id, ',',1)  as users_id from  
        brand_locations as d 
        inner join brands as e on e.id = d.brands_id
        left join (select a.brand_locations_id,  group_concat(a.users_id)  as users_id from
					brand_location_users as a 
                    inner join users as b on b.id = a.users_id 
                    inner join user_roles as c on c.users_id = b.id
                    where c.roles_id = 2 group by a.brand_locations_id) as c on d.id = c.brand_locations_id`, (err, order) =>{
                        if(err){
                            callback(err)
                        }else{
                            callback(false, order)
                        }
                    })
    }


    module.shopOrderLocation1 = (callback) => {
        connection.query(`select   d.*, e.name as brand_name from  
        brand_locations as d 
        inner join brands as e on e.id = d.brands_id`, (err, order) =>{
            if(err){
                callback(err)
            }else{
                async.eachSeries(order, (o, cb) =>{
                    connection.query(`select  a.users_id from brand_location_users as a 
                    inner join users as b on b.id = a.users_id 
                    inner join user_roles as c on c.users_id = b.id
                    where c.roles_id = 2 and a.brand_locations_id = ?`,[o.id], (err, user)=>{
                        if(err){
                            cb(err)
                        }else{
                           if(user){
                            var arr = []

                            user.forEach((u) =>{
                                arr.push(u.users_id)
                            })
                            o.users = arr ? arr : 0
                            // cb()

                           }else{
                            o.users = 0
                            // cb()
                            }
                        cb()
                        }
                    })
                },(err, result) =>{
                    if(err){
                        console.log(err)
                    }else{
                        callback(false, order)
                    }
                })
            }
        })
    }

    module.getSubSubCategoryName = (options, callback) =>{
        connection.query(`select * from shop_categories where id = ?`, [options], (err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }
    

    module.getSubCategoryName = (options, callback) =>{
        connection.query(`select * from shop_categories where id = ?`, [options.CId], (err, data) =>{
            if(err){
                callback(err)
            }else{
                connection.query(`select * from shop_categories where id = ?`, [data[0].parent_id], (err, data) =>{
                    if(err){
                        callback(err)
                    }else{
                        callback(false, data)
                    }
                })
            }
        })
    }

    module.getCity = (options,callback)=>{
        connection.query(`SELECT name FROM cities where id= ?`,options.cityId,(err,city)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,city);
            }
        })
    }

    module.CheckZipCode = (options,callback)=>{
        connection.query(`select a.location_id ,b.zip 
            from shop_products as a 
            inner join brand_locations as b on b.id = a.location_id
            where a.id = ? and b.zip = ?`,
       [ options.productId,options.zip],(err,data)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,data);
            }
        })
    }
    module.RemoveWishlistProduct = (options,callback)=>{
        connection.query(`DELETE from user_wishlist 
        where users_id = ? and product_id = ?`,
       [options.userId, options.productId],(err,data)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,data);
            }
        })
    }

    module.RemoveWishlistShop = (options,callback)=>{
        connection.query(`DELETE from user_shop_wishlist 
        where users_id = ? and brand_location_id = ?`,
       [options.userId, options.brandLocationId],(err,data)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,data);
            }
        })
    }

    module.AddShopWishlist = (options,callback)=>{
        connection.query(`INSERT INTO user_shop_wishlist(users_id, brand_id, brand_name, brand_location_id) VALUES(?,?,?,?)`,
        [options.userId,options.brand_id,options.brand_name,options.brand_location_id],(err,data)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,data);
            }
        })
    }

    module.ViewShopWishlist =(options,callback)=>{
        connection.query(`select a.* from user_shop_wishlist as a where a.users_id = ? and a.brand_id = ?`,
        [options.userId,options.brand_id],(err,shopWishlist)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,shopWishlist);
            }
        })
    }
    module.RemoveShopWishlist = (options,callback)=>{
        connection.query(`DELETE from user_shop_wishlist 
        where user_shop_wishlist.users_id = ? and user_shop_wishlist.brand_location_id = ?`,
       [options.userId,options.brandLocationId],(err,data)=>{
            if (err) {
                callback(err)
            } else {
                callback(false,data);
            }
        })
    }

    module.FcmToken = (options, callback) =>{
        connection.query(`select * from fcm_token where device_token = '${options.device_token}'`, (err, token) =>{
            if(err){
                callback(err)
            }else{
                if(token.length == 0){
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

    module.getPromotionImages = (callback) =>{
        connection.query(`select a.location_id, a.image, b.name as location_name, c.name as brand_name from brand_location_promotional_images as a
        left join brand_locations as b on b.id =a.location_id 
        left join brands as c on c.id = b.brands_id`, (err, images) =>{
            if(err){
                callback(err)
            }else{
                // images.imageUrl = 'http://apps.tapsoft.in:3336/upload/' + images.image
                callback(false, images)
            }
        })
        
    }
    
    return module;
}; 

module.exports = Users;