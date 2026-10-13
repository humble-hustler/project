/********************************************************/
/***** Sales Model *****/
/********************************************************/
const moment = require('moment-timezone');

const SmsEmail = (connection, logger) => {
    const module = {}

    module.StoreSMS = (options, callback) => {
        connection.query(`INSERT INTO sms_logs (message, phone, user_id, lead_id, brand_location_id) VALUES (?,?,?,?,?) `,[options.message, options.phoneNo, (options.sendToMember == 1 ? options.memberId : 0), (options.sendToMember == 0 ? options.memberId : 0), options.locationId], (err) => {
            if (err) {
              
                callback(err)
            } else {
                callback(false);
            }
        })
    }

     module.StoreEmail = (options, callback) => {
        connection.query(`INSERT INTO email_logs (message, email, user_id, lead_id, brand_location_id) VALUES (?,?,?,?,?) `,[options.message, options.email, (options.sendToMember == 1 ? options.memberId : 0), (options.sendToMember == 0 ? options.memberId : 0), options.locationId], (err) => {
            if (err) {
              
                callback(err)
            } else {
                callback(false);
            }
        })
    }

    module.GetLocationBasedSms = (options, callback) => {
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var search = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR b.phone LIKE ${keyword} OR a.message LIKE ${keyword})`
        }

        connection.query(`SELECT SQL_CALC_FOUND_ROWS
            a.id, a.message, a.created_date, a.phone,
            CONCAT(b.fname, ' ', b.lname) AS member_name
        FROM sms_logs AS a
        INNER JOIN users AS b ON b.id = a.user_id
        WHERE a.brand_location_id = ? ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`,[options.locationId], (err, sms) => {
            if (err) {
              
                callback(err)
            } else {
                callback(false, {total: sms[1][0].total, sms: sms[0]});
            }
        })
    }

    module.GetLocationBasedEmail = (options, callback) => {
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var search = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR b.email LIKE ${keyword} OR a.message LIKE ${keyword})`
        }

        connection.query(`SELECT SQL_CALC_FOUND_ROWS
            a.id, a.message, a.created_date, a.email,
            CONCAT(b.fname, ' ', b.lname) AS member_name
        FROM email_logs AS a
        INNER JOIN users AS b ON b.id = a.user_id
        WHERE a.brand_location_id = ? ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`,[options.locationId], (err, email) => {
            if (err) {
               
                callback(err)
            } else {
                callback(false, {total: email[1][0].total, email: email[0]});
            }
        })
    }

    module.GetSMSTemplates = (options, callback) => {
        connection.query(`SELECT a.id AS template_master_id, 
            IF(b.message IS NOT NULL, b.message, a.message) AS message,
            a.template_name, 
            a.page_name,
            a.variable_names,
            IF(b.template_master_id IS NOT NULL, b.is_active, a.is_active) AS is_active
            FROM sms_template_master AS a 
            LEFT JOIN sms_templates AS b ON b.template_master_id  = a.id AND b.brand_location_id = ? `,[options.locationId], (err, smsTemplates) => {
            if (err) {
              
                callback(err)
            } else {
                callback(false, smsTemplates);
            }
        })
    }

    module.GetEmailTemplates = (options, callback) => {
        connection.query(`SELECT a.id AS template_master_id, 
            IF(b.message IS NOT NULL, b.message, a.message) AS message,
            a.template_name, 
            a.page_name,
            a.variable_names,
            IF(b.template_master_id IS NOT NULL, b.is_active, a.is_active) AS is_active
            FROM email_template_master AS a 
            LEFT JOIN email_templates AS b ON b.template_master_id  = a.id AND b.brand_location_id = ?`,[options.locationId], (err, emailTemplates) => {
            if (err) {
               
                callback(err)
            } else {
                callback(false, emailTemplates);
            }
        })
    }

    module.UpdateSMSSettings = (options, callback) => {
        connection.query(`INSERT sms_templates SET message = ?, is_active = ? , template_master_id = ?, brand_location_id = ? ON DUPLICATE KEY UPDATE message = ? , is_active = ?`,[options.message, options.isActive, options.templateId, options.locationId, options.message, options.isActive], (err) => {
            if (err) {
               
                callback(err)
            } else {
                callback(false);
            }
        })   
    }

    module.UpdateEmailSettings = (options, callback) => {
        connection.query(`INSERT email_templates SET message = ?, is_active = ? , template_master_id = ?, brand_location_id = ? ON DUPLICATE KEY UPDATE message = ? , is_active = ?`,[options.message, options.isActive, options.templateId, options.locationId, options.message, options.isActive], (err) => {
            if (err) {
             
                callback(err)
            } else {
                callback(false);
            }
        })   
    }

    module.AddSMSTemplate = (options, callback) => {
        connection.query(`INSERT INTO sms_settings (page_name, text, brand_location_id, variable_names) VALUES (?, ?, ?, ?)`,[options.pageName, options.text, options.locationId, options.variableNames], (err) => {
            if (err) {
              
                callback(err)
            } else {
                callback(false);
            }
        })
    }

    module.AddEmailTemplate = (options, callback) => {
        connection.query(`INSERT INTO email_settings (page_name, text, brand_location_id, variable_names) VALUES (?, ?, ?, ?)`,[options.pageName, options.text, options.locationId, options.variableNames], (err) => {
            if (err) {
            
                callback(err)
            } else {
                callback(false);
            }
        })
    }
        
    module.GetSMSSingleTemplate = (options, callback) => {
        connection.query(`SELECT a.id AS template_master_id, 
            IF(b.message IS NOT NULL, b.message, a.message) AS message,
            a.template_name, 
            a.page_name
            FROM sms_template_master AS a 
            LEFT JOIN sms_templates AS b ON b.template_master_id  = a.id AND b.brand_location_id = ? 
            WHERE a.template_name = ?`,[options.locationId, options.templateName], (err, template) => {
            if (err) {
               
                callback(err)
            } else {
                callback(false, template[0]);
            }
        })
    }

    module.GetEmailSingleTemplate = (options, callback) => {
        connection.query(`SELECT a.id AS template_master_id, 
            IF(b.message IS NOT NULL, b.message, a.message) AS message,
            a.template_name, 
            a.page_name
            FROM email_template_master AS a 
            LEFT JOIN email_templates AS b ON b.template_master_id  = a.id AND b.brand_location_id = ? 
            WHERE a.template_name = ?`,[options.locationId, options.templateName], (err, template) => {
            if (err) {
             
                callback(err)
            } else {
                callback(false, template[0]);
            }
        })
    }
    return module;
};

module.exports = SmsEmail;