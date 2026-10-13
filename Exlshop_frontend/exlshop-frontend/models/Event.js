const Event = (connection, logger) => {
    const module = {}
    module.GetAll = (options, callback) => { 
        connection.query(`SELECT SQL_CALC_FOUND_ROWS  
            a.*, b.type as event_type_name
        FROM
        events AS a
        INNER JOIN
        event_type AS b ON b.id = a.event_type
        WHERE a.event_type != 1  LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, events) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, {total: events[1][0].total, events: events[0]});
            }
        })
    }
    module.GetSingle = (options, callback) => {
        connection.query(`SELECT a.* ,b.type AS event_type_name
            FROM events AS a
                INNER JOIN event_type AS b ON b.id = a.event_type
            WHERE a.id = ?`,[options.eventId], (err,event) => {
            callback(err,event[0]);
        })
    }
    module.Register = (options, callback) => {
        connection.query(`INSERT INTO event_registrations SET user_id=?, event_id = ?, name = ? , email = ?, gender = ?, city = ?, country = ?, contact_no = ?, pincode=  ?, state = ?, address = ?, tshirt_size = ?, is_payed = ?, payment_id = ?, payment_amount = ?, event_variant_id = ?`,[options.userId, options.eventId, options.name, options.email, options.gender, options.city,  options.country, options.contactNo, options.pincode, options.state, options.address, options.tshirtSize, options.isPayed, options.paymentId, options.paymentAmount, options.eventVariant], (err) => {  
            callback(err);
        })
    }
    module.GetPurchasedMarathons = (options, callback) => {
        connection.query(`SELECT a.*, b.name AS event_name
            FROM event_registrations AS a
            INNER JOIN events AS b ON b.id = a.event_id
            AND b.event_type = 1 AND a.user_id = ?`,[options.userId], (err, marathons) => {
            callback(err, marathons);
        })
    }
    module.GetUserMarathons = (options, callback) => {
        connection.query(`SELECT a.*,
            b.name AS event_name
            FROM user_marathons AS a 
            INNER JOIN events AS b ON b.id = a.event_id 
            WHERE a.users_id = ?`,[options.userId], (err,marathons) => {
            if(err){
                callback(err)
            }else{
                callback(null, marathons)
            }
        })
    }
    module.GetUserBestPerformance = (options, callback) => {
        connection.query(`SELECT (a.distance/DATEDIFF(a.end_datetime,a.start_datetime)) AS d,
            b.name AS event_name, a.distance, DATEDIFF(a.end_datetime,a.start_datetime) AS time_span
            FROM user_marathons AS a 
            INNER JOIN events AS b ON b.id = a.event_id 
            WHERE a.users_id = ? ORDER BY d DESC LIMIT 1`,[options.userId], (err,marathons) => {
            if(err){
                callback(err)
            }else{
                callback(null, marathons[0])
            }
        })
    }
    module.StartMarathon = (options, callback) => {
        connection.query(`INSERT INTO user_marathons SET event_id = ?, start_datetime = ?, users_id = ?, marathon_registration_id = ?, start_point = ?, path = ?`,[options.eventId, options.startDateTime, options.userId, options.marathonRegistrationId, options.startPoint, options.path], (err,data) => {
            if(err){
                callback(err)
            }else{
                callback(null, data.insertId)
            }
        })   
    }
    module.UpdateUserMarathonDetails = (options, callback) => {
        connection.query(`UPDATE user_marathons SET steps =?, distance = ?, calories=?, path=?, end_point=?, end_datetime=? WHERE id = ?`,[options.steps, options.distance, options.calories, options.path, options.endPoint, options.endDateTime, options.id], (err) => {
            if(err){
                callback(err)
            }else{
                callback(null)
            }
        })
    }
    module.GetPurchased = (options, callback) => {
        connection.query(`SELECT b.* FROM 
            event_registrations AS a
            INNER JOIN events AS b ON b.id = a.event_id
            WHERE a.user_id = ? AND a.is_payed = 1`,[options.userId], (err, events) => {
            if(err){
                callback(err)
            }else{
                callback(null, events)
            }
        })
    }
    module.GetVariants = (options, callback) => {
        connection.query(`SELECT * FROM event_variants WHERE event_id = ?`,[options.eventId], (err, variants) => {
            if(err){
                callback(err)
            }else{
                callback(null, variants)
            }
        })
    }
    module.IsPurchased = (options, callback) => {
        connection.query(`SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?`,[options.eventId, options.userId], (err, registrations) => {
            if(err){
                callback(err)
            }else{
                callback(null, registrations.length >0 ? 1 : 0);
            }
        })   
    }
    module.MarathonHeld = (options, callback) => {
        connection.query(`SELECT * FROM user_marathons WHERE users_id = ? AND 
            (DATE_FORMAT(start_datetime, "%d-%m-%Y") = DATE_FORMAT(NOW(), "%d-%m-%Y") 
                OR DATE_FORMAT(end_datetime, "%d-%m-%Y") = DATE_FORMAT(NOW(), "%d-%m-%Y"))`,[options.userId], (err, marathons) => {
            if(err){
                callback(err)
            }else{
                callback(null, marathons.length > 0 ? true : false);
            }
        })      
    }
    return module;
};
module.exports = Event;