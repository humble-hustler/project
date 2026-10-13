const Buy = (connection, logger) => {
    const module = {}
    module.UpdateUserBuy = (options, callback) => {
        connection.query(`UPDATE  shop_user_buy set buy='${options.buy}' where users_id=${options.userId}`, [ options.Buy,options.userId], (err) => {
            callback(err)
        })
    }
    module.SetUserBuy = (options, callback) => {
        connection.query(`INSERT INTO shop_user_buy(users_id, buy) VALUES(?, ?) ON DUPLICATE KEY UPDATE buy = ?`, [options.userId, options.buy, options.buy], (err) => {
            callback(err)
        })
    }
    module.GetUserBuy = (options, callback) => {
        connection.query(`SELECT * FROM shop_user_buy WHERE users_id = ? LIMIT 1`, [options.userId], (err, buy) => {            
            callback(err, Buy.length ? buy[0] : null)
        })
    }
    module.DeleteUserBuy = (options, callback) => {
        connection.query(`DELETE FROM shop_user_buy WHERE users_id = ?`, [options.userId], (err, buy) => {
            callback(err, buy[0])
        })
    }
    return module;
};
module.exports = Buy;