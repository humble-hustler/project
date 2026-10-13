/********************************************************/
/***** Super Admin Leads Model *****/
/********************************************************/

const SuLeads = (connection, logger) => {
    const module = {}
    const moment = require('moment');

    module.GetAll = (options, callback) => {
        var filterQuery = ``

        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.created_date) BETWEEN DATE(${connection.escape(moment(filter.from, 'DD-MM-YYYY').format('YYYY-MM-DD'))}) AND DATE(${connection.escape(moment(filter.to, 'DD-MM-YYYY').format('YYYY-MM-DD'))}) `
            }
            if (filter.source) {
                filterQuery += ` AND c.id = ${connection.escape(filter.source)} `
            }
            if (filter.status) {
                filterQuery += ` AND b.id = ${connection.escape(filter.status)} `
            }
            if (filter.leadOwner) {
                filterQuery += ` AND d.id = ${connection.escape(filter.leadOwner)} `
            }
        }

        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` WHERE (a.brand_name LIKE ${keyword} OR b.status LIKE ${keyword} OR c.source LIKE ${keyword} OR d.fname LIKE ${keyword} OR d.lname LIKE ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
            a.id,
            a.brand_name,
            a.created_date,
            b.status,
            c.source,
            CONCAT(d.fname, ' ', d.lname) AS owner_name,
            (SELECT 
                    f.followup_date_time
                FROM
                    su_lead_followup AS f
                WHERE
                    f.su_lead_id = a.id
                ORDER BY f.created_date DESC
                LIMIT 1) AS followup_date_time        
        FROM
            su_leads AS a
                INNER JOIN
            su_lead_status AS b ON b.id = a.status_id
                INNER JOIN
            su_lead_source AS c ON c.id = a.source_id
                INNER JOIN
            users AS d ON d.id = a.owner_id        
            ${search} ${filterQuery}  ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, leads) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: leads[1][0].total, leads: leads[0]})
            }
        })
    }

    module.Getstatuses = (callback) => {
        connection.query('SELECT * FROM su_lead_status', (err, statuses) => {
            if (err) {
               
                callback(err)
            } else {
                callback(false, statuses)
            }
        })
    }
    
    module.GetSources = (callback) => {
        connection.query('SELECT * FROM su_lead_source', (err, sources) => {
            if (err) {
               
                callback(err)
            } else {
                callback(false, sources)
            }
        })
    }

    module.Add = (options,callback) => {
        connection.query(`INSERT INTO su_leads SET brand_name = ?, owner_id = ?, status_id = ?, source_id=?, is_active = ?`,[options.brandName, options.ownerId, options.statusId, options.sourceId, options.isActive],(err) => {
           
            callback(err)
        })
    }

    module.GetFollowup = (options,callback) => {
        connection.query('SELECT a.* ,b.fname,b.lname FROM su_lead_followup AS a \n\
            LEFT JOIN users AS b ON b.id = a.author_id WHERE a.su_lead_id = ? ',[options.leadId], (err, followup) => {
            if (err) {
               
                callback(err)
            } else {
              
                callback(false, followup)
            }
        })
    }

    module.GetSingle = (options, callback) => {
        connection.query(`SELECT * FROM su_leads WHERE id = ?`, [options.leadId], (err, leads) => {
            callback(err, leads[0])
        })
    }

    module.Update = (options, callback) => {
        connection.query(`UPDATE su_leads SET ?? = ? WHERE id = ?`, [options.col, options.val, options.leadId], (err) => {
            callback(err)
        })
    }

    module.AddFollowup = (options, callback) => {
        connection.query(`INSERT INTO su_lead_followup (su_lead_id,text,author_id,followup_date_time) VALUES (?,?,?,?)`, [options.leadId, options.text, options.authorId, moment(options.followupDateTime, 'DD-MM-YYYY hh:mm:ss').format('YYYY-MM-DD HH:mm:ss')], (err) => {
            callback(err)
        })
    }
    
    module.GetContacts = (options, callback) => {
        connection.query(`SELECT * FROM su_lead_contacts WHERE su_lead_id = ?`, [options.leadId], (err,contacts) => {
            callback(err,contacts)
        })
    }

    module.AddContact = (options, callback) => {
        connection.query(`INSERT INTO su_lead_contacts (su_lead_id,fname,lname,email,phone,designation,address) VALUES (?,?,?,?,?,?,?)`, [options.leadId, options.fname, options.lname, options.email, options.phone, options.designation, options.address], (err) => {
            callback(err)
        })
    }

    module.UpdateContact = (options, callback) => {
        connection.query(` UPDATE su_lead_contacts SET fname =?, lname=?, email=?, phone=?, designation=?, address=? WHERE id=? `, [options.fname, options.lname, options.email, options.phone, options.designation, options.address, options.id], (err) => {
            callback(err)
        })
    }

    return module;
};

module.exports = SuLeads