const dbConnect = require('../dbConnect');
const logger = require('../logger');
module.exports = {
    Users: require('./Users')(dbConnect, logger),
    ShopProducts: require('./ShopProducts')(dbConnect, logger),
    Cart: require('./Cart')(dbConnect, logger),
    Common: require('./Common')(dbConnect, logger),
    Orders: require('./Orders')(dbConnect, logger),
    Event: require('./Event')(dbConnect, logger),
    Chat: require('./Chat')(dbConnect, logger),
    Buy: require('./Buy')(dbConnect, logger),
    Products: require('./Product')(dbConnect, logger)
}