const Cart = (connection, logger) => {
    const module = {}
    module.UpdateUserCart = (options, callback) => {
        connection.query(`UPDATE  shop_user_saved_cart set cart='${options.cart}' where users_id=${options.userId}`, (err) => {
            callback(err)
        })
    }
    module.UpdateSaveforlater = (options, callback) => {
        connection.query(`UPDATE  saved_for_later set cart='${options.cart}' where users_id=${options.userId}`, [ options.cart,options.userId], (err, data) => {
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }
    module.SetUserCart = (options, callback) => {
        connection.query(`INSERT INTO shop_user_saved_cart(users_id, cart) VALUES(?, ?) ON DUPLICATE KEY UPDATE cart = ?`, [options.userId, options.cart, options.cart], (err) => {
            callback(err)
        })
    }
    module.SetSaveForLater = (options, callback) => { 
        connection.query(`INSERT INTO saved_for_later(users_id, cart) VALUES( ?, ?)  ON DUPLICATE KEY UPDATE cart = ?`,  [options.userId, options.cart, options.cart], (err, data) => {
            // callback(err)
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }
    module.GetUserSaveForLater = (options, callback) => {
        connection.query(`SELECT * FROM saved_for_later WHERE users_id = ? LIMIT 1`, [options.userId], (err, cart) => {            
            callback(err, cart.length ? cart[0] : null)
        })
    }
    module.GetUserCart = (options, callback) => {
        connection.query(`SELECT * FROM shop_user_saved_cart WHERE users_id = ? LIMIT 1`, [options.userId], (err, cart) => {            
            callback(err, cart.length ? cart[0] : null)
        })
    }
    module.DeleteUserCart = (options, callback) => {
        connection.query(`DELETE FROM shop_user_saved_cart WHERE users_id = ?`, [options.userId], (err, cart) => {
            callback(err, cart[0])
        })
    }
    return module;
};
module.exports = Cart;