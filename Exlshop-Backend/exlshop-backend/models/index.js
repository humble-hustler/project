/********************************************************/
/***** Model Initi *****/
/********************************************************/
const dbConnect = require('../dbConnect');
const logger = require('../logger');

module.exports = {
    Users: require('./Users')(dbConnect, logger),
    Brands: require('./Brands')(dbConnect, logger),
    Sales: require('./Sales')(dbConnect, logger),
    Locations: require('./Locations')(dbConnect, logger),
    Common: require('./Common')(dbConnect, logger),
    Team: require('./Team')(dbConnect, logger),
    Packages: require('./Packages')(dbConnect, logger),
    Payments: require('./Payments')(dbConnect, logger),
    Members: require('./Members')(dbConnect, logger),
    Reports: require('./Reports')(dbConnect, logger),
    Schedule: require('./Schedule')(dbConnect, logger),
    Leads: require('./Leads')(dbConnect, logger),
    Assets: require('./Assets')(dbConnect, logger),
    ShopProducts: require('./ShopProducts')(dbConnect, logger),
    Orders: require('./Orders')(dbConnect, logger),
    custmor : require('./custmor')(dbConnect,logger),
    SuLeads: require('./SuLeads')(dbConnect, logger),
    custmor : require('./custmor')(dbConnect,logger),
    Events: require('./Events')(dbConnect, logger),
    Chat: require('./Chat')(dbConnect, logger),
    SmsEmail: require('./SmsEmail')(dbConnect, logger),
    GroupOrders:require('./GroupOrders')(dbConnect,logger),
    Subscription:require('./Subscription')(dbConnect,logger),
}