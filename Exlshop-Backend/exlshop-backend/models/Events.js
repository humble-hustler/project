/********************************************************/
/***** Events Model *****/
/********************************************************/

const Events = (connection, logger) => {
    const module = {}
    const moment = require('moment');
    
    module.GetAll = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.name LIKE ${keyword} OR b.type LIKE ${keyword} OR a.held_by LIKE ${keyword} OR a.charges LIKE ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
            a.*, 
            b.type as event_type_name
        FROM
        events AS a
            INNER JOIN
        event_type AS b ON b.id = a.event_type
        WHERE a.id IS NOT NULL ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, events) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, {total: events[1][0].total, events: events[0]});
            }
        })
    }

    module.GetTypes = (callback) => {
        connection.query('SELECT * FROM event_type ',(err,types) => {
            if(err){
                callback(err);
            }else{
                callback(null,types);
            }
        })
    }

    module.Add = (options, callback) => {
        connection.query('INSERT INTO events SET name=?, start_date=?, end_date=?, event_type=?, held_by=?, description=?, banner_img=?, charges=?, created_by=?',[options.eventName, moment(options.startDate,'DD-MM-YYYY hh:mm:ss a').format('YYYY-MM-DD HH:mm:ss'), moment(options.endDate,'DD-MM-YYYY hh:mm:ss a').format('YYYY-MM-DD HH:mm:ss'), options.eventType, options.heldBy, options.description, options.filename, options.charges, options.createdBy],(err) =>{
            if(err){
                callback(err)
            }else{
                callback(null);
            }
        })
    }

    module.GetSingle = (options, callback) => {
        connection.query(`SELECT * FROM events WHERE id = ?`, [options.eventId], (err,event) => {
            if(err){
                callback(err)
            }else{
                callback(null,event[0])
            }
        })
    }

    module.Update = (options, callback) => {
        connection.query('UPDATE events SET name=?, start_date=?, end_date=?, event_type=?, held_by=?, description=?, charges=? WHERE id=? ',[options.eventName, moment(options.startDate,'DD-MM-YYYY hh:mm:ss a').format('YYYY-MM-DD HH:mm:ss'), moment(options.endDate,'DD-MM-YYYY hh:mm:ss a').format('YYYY-MM-DD HH:mm:ss'), options.eventType, options.heldBy, options.description, options.charges, options.id],(err) =>{
            if(err){
                callback(err)
            }else{
                callback(null);
            }
        })
    }

    module.GetAllRegistrations = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.id LIKE ${keyword} OR b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} )`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
            a.*, 
            b.fname, b.lname
        FROM
        event_registrations AS a
            INNER JOIN
        users AS b ON b.id = a.user_id
        WHERE a.event_id = ? ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.eventId], (err, eventUsers) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, {total: eventUsers[1][0].total, eventUsers: eventUsers[0]});
            }
        })
    }

    return module;
};

module.exports = Events;