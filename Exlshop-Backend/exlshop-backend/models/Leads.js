/********************************************************/
/***** Leads Model *****/
/********************************************************/

const { options } = require('../routes/app/leads');

const Leads = (connection, logger) => {
    const module = {}
    const moment = require('moment');
    module.GetLocations=(options,callback)=>{
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.brand_locations_id LIKE ${keyword}  OR b.name LIKE ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY b.${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.operating_hour_from ) {
                filterQuery+=`AND b.operating_hour_start= ${connection.escape(filter.operating_hour_from)} `;
            }
            if(filter.operating_hour_to){
                filterQuery+=`AND b.operating_hour_end=${connection.escape(filter.operating_hour_to)}`; 
            }
            if (filter.location_name) {
                filterQuery+=`AND b.name= ${connection.escape(filter.location_name)}`;
            }
            if (filter.email) {
                filterQuery+=`AND b.email= ${connection.escape(filter.email)}`;
            }
            if (filter.phone_no) {
                filterQuery+=`AND b.phone= ${connection.escape(filter.phone_no)}`;
            }
        }

        connection.query(
        `SELECT SQL_CALC_FOUND_ROWS
        a.users_id as id,
        a.brand_locations_id,
        b.name as lname,
        b.address_line_1 as add1,
        b.address_line_2 as add2,
        b.city_id as cityid,
        b.state_id as stateid,
        b.country_id as countryid,
        b.zip as zip,
        b.phone as phone,
        b.email as email,
        b.is_active as status,
        b.operating_hour_start as operatinghrstart,
        b.operating_hour_end as operatinghourend,
        b.udyog_no as udyog_no,
        b.pan_no as pan_no,
        b.gst_no as gst_no,
        c.pan_file,
        c.gst_file
        FROM brand_location_users as a 
        left join brand_locations as b on b.id=a.brand_locations_id
        left join user_upload_documents as c on c.location_id = b.id
        WHERE a.users_id = ? AND b.is_deleted=0 ${search} ${filterQuery} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total`, [options.userId], (err, locations) => {
        if(err){console.log("error is",err)}
        console.log(locations[1])
            callback(err, {total: locations[1][0].total,locations:locations[0]})
        })
    }
    module.GetAll = (options, callback) => {
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.created_date) BETWEEN DATE(${connection.escape(moment(filter.from, 'DD-MM-YYYY').format('YYYY-MM-DD'))}) AND DATE(${connection.escape(moment(filter.to, 'DD-MM-YYYY').format('YYYY-MM-DD'))}) `
            }
            if (filter.gender) {
                filterQuery += ` AND a.gender = ${connection.escape(filter.gender)} `
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
        var dateFilter = ``;
        if(options.startDate || options.endDate){
            var date1 = moment(options.startDate+' 00:00:00','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate+' 23:59:59','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if(options.startDate && options.endDate){
                dateFilter = ` AND a.created_date BETWEEN '${date1}' AND '${date2}' `; 
            }else if(options.startDate){
                dateFilter = ` AND a.created_date >= '${date1}' `; 
            }else if(options.endDate){
                dateFilter = ` AND a.created_date <= '${date2}' `; 
            }  
        }else if(options.currentMonthOnly){
            dateFilter = ` AND DATE_FORMAT(a.created_date, "%m-%Y") = "${moment().format('MM-YYYY')}" `;
        }
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.fname LIKE ${keyword} OR a.lname LIKE ${keyword} OR a.phone LIKE ${keyword} OR b.status LIKE ${keyword} OR c.source LIKE ${keyword} OR d.fname LIKE ${keyword} OR d.lname LIKE ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }

        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    a.id,
    CONCAT(a.fname, ' ', a.lname) AS lead_name,
    a.phone,
    a.gender,
    (SELECT 
            GROUP_CONCAT(name
                    SEPARATOR ', ')
        FROM
            packages
        WHERE
            FIND_IN_SET(id, a.package_ids)) AS package_interested,
    a.created_date,
    b.status,
    c.source,
    CONCAT(d.fname, ' ', d.lname) AS owner_name,
    (SELECT 
            f.followup_date_time
        FROM
            lead_followup AS f
        WHERE
            f.lead_id = a.id
        ORDER BY f.created_date DESC
        LIMIT 1) AS followup_date_time,
    a.converted_to_member
FROM
    leads AS a
        INNER JOIN
    lead_status AS b ON b.id = a.status_id
        INNER JOIN
    lead_source AS c ON c.id = a.source_id
        INNER JOIN
    users AS d ON d.id = a.owner_id        
WHERE
    a.brand_locations_id = ? AND a.is_deleted = 0 ${search} ${filterQuery} ${dateFilter} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, leads) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: leads[1][0].total, leads: leads[0]})
            }
        })
    }

    module.Add = (options, callback) => {
        connection.query(`INSERT INTO brand_locations SET brands_id = ?, name = ? , address_line_1 =?, address_line_2=?, city_id=?, state_id=?, country_id=?, zip=?, phone=?, email=?, lat =? , lng=?, operating_hour_start=?, operating_hour_end=? ,udyog_no=?,pan_no=?,gst_no=?`,
         [options.brandId, options.locationname,options.addressline1,options.addressline2,options.city,options.state,101,options.pincode,options.phone,options.email,options.lat, options.lng, options.operatinghrfrom,options.operatinghrto,options.udyogcard_no,options.pancard_no,options.gst_number], (err, data) => {
            if(err){
                callback(err)
            }else{
                connection.query(`INSERT INTO brand_location_users SET brand_locations_id = ?, users_id = ?`, [data.insertId, options.userId], (err, data1) => {
                    callback(false, data.insertId)
                })
            }
        })
    }

    module.AddLocationDocuments = (options, callback) =>{
        var pan_img = '/documents/' + options.images[0].filename
        var gst_img = '/documents/' + options.images[1].filename

        connection.query('INSERT INTO user_upload_documents SET users_id = ?, location_id = ?, pan_file = ?, gst_file = ?', [options.userId, options.locationId, pan_img, gst_img], (err) =>{
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    module.Update = (options, callback) => {
        connection.query(`UPDATE brand_locations SET  name=?, address_line_1=?, address_line_2=?, city_id=?, state_id=?, country_id=101, zip=?, phone=?, email=?,is_active=? WHERE id = ?`, [ options.name,options.address_line_1,options.address_line_2,options.city_id,options.state_id,options.zip,options.phone,options.email,options.active, options.locationId], (err, location) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, location[0])
            }
        })
    }

    module.UpdateStatus = (options, callback) => {
        connection.query(`UPDATE brand_locations SET  is_active=? WHERE id = ?`, [ options.status, options.locationId], (err, location) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, location[0])
            }
        })
    }

    module.DeleteLocation= (options, callback) => {
        connection.query(`UPDATE brand_locations SET is_deleted = 1 WHERE id =?`, [options.locationId]  , (err, location) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, location[0])
            }
        })
    }
    module.Update_Location = (options,callback)=>{
        connection.query(`UPDATE brand_locations SET name = ? ,address_line_1=?,address_line_2=?,city_id=?,state_id=?,zip=?,phone=?,email=?,operating_hour_start=?,operating_hour_end=? ,udyog_no=?,pan_no=?,gst_no=? where id=?`,
         [options.location_name,options.address_line11,options.address_line22,options.city_id1,options.state_id1,options.pincode_id1,options.phone1,options.email1,options.operatinghr_from1,options.operatinghr_to1,options.udyog_card_no,options.pan_card_no,options.gst_no, options.locationId], 
         (err,data) => {
            callback(err,data)
        })
    }

    module.GetStatuses = (options, callback) => {
        connection.query(`SELECT * FROM lead_status WHERE brand_locations_id = ? AND is_deleted = 0`, [options.locationId], (err, status) => {
            callback(err, status)
        })
    }

    module.GetSources = (options, callback) => {
        connection.query(`SELECT * FROM lead_source WHERE brand_locations_id = ? AND is_deleted = 0`, [options.locationId], (err, source) => {
            callback(err, source)
        })
    }

    module.GetSingle = (options, callback) => {
        connection.query(`SELECT * FROM leads WHERE id = ?`, [options.leadId], (err, leads) => {
            callback(err, leads[0])
        })
    }

    module.GetFollowup = (options, callback) => {
        connection.query(`SELECT a.*, b.fname, b.lname FROM
    lead_followup AS a
    INNER JOIN users AS b ON b.id = a.author_id WHERE a.lead_id = ?`, [options.leadId], (err, followup) => {
            callback(err, followup)
        })
    }

    module.AddFollowup = (options, callback) => {
        connection.query(`INSERT INTO lead_followup (lead_id,text,author_id,followup_date_time) VALUES (?,?,?,?)`, [options.leadId, options.text, options.authorId, moment(options.followupDateTime, 'DD-MM-YYYY hh:mm:ss a').format('YYYY-MM-DD HH:mm:ss')], (err) => {
            callback(err)
        })
    }

    module.UpdateFollowup = (options, callback) => {
        connection.query(`UPDATE lead_followup SET lead_id=?,text=?,author_id=?,followup_date_time=? WHERE id=?`, [options.leadId, options.text, options.authorId, options.followupDateTime, options.id], (err) => {
            callback(err)
        })
    }

    module.SearchByLocation = (options, callback) => {
        connection.query(`SELECT id, fname, lname FROM leads AS a
            WHERE a.brand_locations_id = ? AND (a.fname LIKE ${connection.escape('%' + options.text + '%')} OR a.lname LIKE ${connection.escape('%' + options.text + '%')} OR a.phone LIKE ${connection.escape('%' + options.text + '%')}) `, [options.locationId], (err, leads) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, leads)
            }
        })
    }

    module.GetCountByStatus = (options, callback) => {
        connection.query(`SELECT a.id, a.status, count(b.id) AS total
        FROM lead_status AS a
        LEFT JOIN leads AS b ON b.status_id = a.id AND b.converted_to_member = 0
        WHERE a.brand_locations_id = ? GROUP BY a.id`, [options.locationId], (err, leadCount) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, leadCount)
            }
        })
    }

    module.Delete = (options, callback) => {
        connection.query(`UPDATE leads SET is_deleted = 1 WHERE id =?`, [options.leadId], (err) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.ConvertToMember = (options, callback) => {
        connection.query(`UPDATE leads SET converted_to_member = 1 WHERE id =?`, [options.leadId], (err) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    return module;
};
module.exports = Leads;