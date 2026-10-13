/********************************************************/
/***** Members Model *****/
/********************************************************/

const Members = (connection, logger) => {
    const module = {}
    const moment = require('moment');

    module.SearchByLocation = (options, callback) => {
        connection.query(`SELECT 
    c.id, c.fname, c.lname, c.email, c.phone
FROM
    user_roles AS a
        INNER JOIN
    brand_location_users AS b ON b.users_id = a.users_id
    INNER JOIN users AS c ON c.id = a.users_id
WHERE
    a.roles_id = 5
        AND b.brand_locations_id = ? AND c.is_active = 1 AND (c.fname LIKE ${connection.escape('%' + options.phone + '%')} OR c.lname LIKE ${connection.escape('%' + options.phone + '%')} OR c.phone LIKE ${connection.escape('%' + options.phone + '%')} OR CONCAT(c.fname, ' ', c.lname) like ${connection.escape('%' + options.phone + '%')} ) LIMIT 10;`, [options.locationId], (err, members) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, members)
            }
        })
    }

    module.GetById = (options, callback) => {
        connection.query(`SELECT 
    a.*, b.image_file, CONCAT('/profile-img/',c.brand_locations_id,'/',b.image_file) AS profile_image, c.brand_locations_id
FROM
    users AS a
    LEFT JOIN member_profile_images AS b ON b.users_id = a.id
    LEFT JOIN brand_location_users AS c ON c.users_id = a.id
WHERE
    a.id = ?`, [options.userId], (err, user) => {
            if (err) {
                callback(err)
            } else {
                delete user[0].password;
                delete user[0].sso_auth_key;
                callback(false, user[0])
            }
        })
    }

    module.GetMemberships = (options, callback) => {
        var active = ''
        if (options.active == 1) {
            active = 'AND DATE(NOW()) < DATE(a.expiry_date)'
        }
        connection.query(`SELECT 
    a.id, a.expiry_date, b.name,b.is_pt
FROM
    membership_logs AS a
        INNER JOIN
    packages AS b ON b.id = a.package_id
WHERE
    a.member_id = ? AND location_id = ? ${active} ORDER BY expiry_date DESC`, [options.memberId, options.locationId], (err, memberships) => {
            if (err) {
                callback(err)
            } else {
                callback(false, memberships)
            }
        })
    }

    module.GetMembershipLogByUserId = (options, callback) => {
        connection.query(`SELECT 
    a.*,
    b.name AS package_name,
    b.validity_days AS package_validity_days,
    c.fname AS trainer_fname,
    c.lname AS trainer_lname,
    CONCAT(d.fname, ' ', d.lname) AS transferred_to_member_name,
    CONCAT(f.fname, ' ', f.lname) AS transferred_from_member_name,
    e.completed,
    IF(CURDATE() between a.frozen_start_date AND a.frozen_end_date, 1, 0) AS is_frozen_period,
    (SELECT count(*) FROM membership_logs
        WHERE upgraded_sale_id = a.sale_id OR downgraded_sale_id = a.sale_id) AS is_upgraded_or_downgraded,
    IF((SELECT count(*) FROM packages WHERE price > b.price AND is_deleted = 0 AND is_pt = b.is_pt AND brand_locations_id = ${options.locationId}) > 0, 1, 0) AS is_upgradable,
    IF((SELECT count(*) FROM packages WHERE price < b.price AND is_deleted = 0 AND is_pt = b.is_pt AND brand_locations_id = ${options.locationId}) > 0, 1, 0) AS is_downgradable
FROM
    membership_logs AS a
    INNER JOIN packages AS b ON b.id = a.package_id AND b.brand_locations_id = a.location_id
    LEFT JOIN users AS c ON c.id = a.trainer_id
    LEFT JOIN users AS d ON d.id = a.transferred_to_member
    INNER JOIN sales AS e ON e.id = a.sale_id
    LEFT JOIN users AS f ON f.id = a.member_id
WHERE
    (a.member_id = ? OR a.transferred_to_member = ?) AND a.location_id = ?
ORDER BY expiry_date DESC`, [options.userId, options.userId, options.locationId], (err, membershipLogs) => {
            callback(err, membershipLogs)
        })
    }

    module.GetAttendanceByUserId = (options, callback) => {
        connection.query(`SELECT *, TIMEDIFF(out_time, in_time) AS session_duration FROM member_attendance WHERE member_id = ? AND brand_locations_id = ?`, [options.userId, options.locationId], (err, attendance) => {
            callback(err, attendance)
        })
    }

    module.GetActivePlanByUserId = (options, callback) => {
        connection.query(`SELECT a.*,
    IF(DATE(expiry_date) > DATE(NOW()),
        1,
        0) AS status,
        b.name AS package_name
FROM
    membership_logs AS a
    INNER JOIN packages AS b ON b.id = a.package_id AND b.brand_locations_id = a.location_id
WHERE
    a.member_id = ? AND a.location_id = ?
ORDER BY expiry_date DESC
LIMIT 1`, [options.userId, options.locationId], (err, plan) => {
            callback(err, plan[0])
        })
    }

    module.Update = (options, callback) => {
        connection.query(`UPDATE users SET ?? = ? WHERE id = ?`, [options.col, options.val, options.userId], (err) => {
            callback(err)
        })
    }

    module.GetExpiringPlansByLocation = (options, callback) => {
        var search = ` AND (bb.expiry_date BETWEEN CURDATE() AND date_add(CURDATE(),interval 15 day)  OR 
                        bb.expiry_date BETWEEN date_sub(CURDATE(),interval 15 day)  AND  CURDATE())`;
        
        if(options.startDate || options.endDate){
            var date1 = moment(options.startDate+' 00:00:00','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            var date2 = moment(options.endDate+' 23:59:59','DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            if(options.startDate && options.endDate){
                search = ` AND b.expiry_date BETWEEN '${date1}' AND '${date2}' `; 
            }else if(options.startDate){
                search = ` AND b.expiry_date >= '${date1}' AND DATEDIFF(b.expiry_date, '${date1}') < 15`; 
            }else if(options.endDate){
                search = ` AND b.expiry_date <= '${date2}' AND DATEDIFF(b.expiry_date, '${date2}') < 15`; 
            }  
        }
        
        connection.query(`SELECT 
    c.id AS user_id, c.fname, c.lname, c.phone, d.name AS package_name, DATEDIFF(b.expiry_date, NOW()) AS days_remaining
FROM
    brand_location_users AS a
        INNER JOIN
    membership_logs AS b ON b.id = (SELECT 
            bb.id
        FROM
            membership_logs AS bb
        WHERE
            bb.member_id = a.users_id 
            ${search}
        ORDER BY bb.expiry_date DESC
        LIMIT 1)
        INNER JOIN users AS c ON c.id = b.member_id
		INNER JOIN packages AS d ON d.id = b.package_id
WHERE
    a.brand_locations_id = ? `, [options.locationId], (err, expiringPlans) => {
            callback(err, expiringPlans)
        })
    }

    module.GetTodayEventByLocation = (options, callback) => {
        var dateFilter = '';
        if (options.startDate || options.endDate) {
            var date1 = moment(options.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
            var date2 = moment(options.endDate , 'DD-MM-YYYY').format('YYYY-MM-DD');
            if (options.startDate && options.endDate) {
                dateFilter = ` AND a.birth_date BETWEEN '${date1}' AND '${date2}' 
                            OR a.anniversary_date BETWEEN '${date1}' AND '${date2}'  `;
            }
        }
        connection.query(`SELECT a.fname,a.lname,a.phone,a.birth_date,a.anniversary_date
        FROM users AS a 
        JOIN brand_location_users  AS b ON a.id = b.users_id 
        WHERE
        b.brand_locations_id = ? ${dateFilter} `,[options.locationId], (err, eventLogs)=>{
            callback(err, eventLogs)
        })

    }
    module.UpdateProfileImage = (options, callback) => {
        connection.query(`INSERT member_profile_images SET users_id = ?, image_file = ? ON DUPLICATE KEY UPDATE image_file = ?`, [options.userId, options.filename, options.filename], (err) => {
            callback(err)
        })
    }

    module.GetBMI = (options, callback) => {
        connection.query(`SELECT * FROM member_profile WHERE member_id=?`, [options.userId], (err, bmi) => {
            callback(err, bmi)
        })
    }

    module.AddBMI = (options, callback) => {
        connection.query(`INSERT INTO member_profile (bmi_date,height,weight,chest,hips,waist,thigh_left,thigh_right,calf_left,
            calf_right,wrist_left,wrist_right,forearm_left,forearm_right,shoulder,neck_girth,knee_left,knee_right,triceps_left,
            triceps_right,biceps_left,biceps_right,suprailac,subscapular,thigh,pectoral,abdomen,midaxillary,calf,upper_body_left,
            upper_body_right,lower_body_left,lower_body_right,VO2max,duration,self_appraisal,bench_press,squat,notes,member_id) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, options, (err) => {
            callback(err)
        })
    }

    module.GetSMSPlanMembers = (options, callback) => {
        var filter = options.filter;
        var locationId = options.locationId;
        var search = ``;
        var searchLeads = ``;

        if(filter.gender && filter.gender != 'all'){
            search += ` AND a.gender = '${filter.gender}' `;
        }
        if(filter.status && filter.status != 'all'){
            if(filter.status == 1){
                search += ` AND (SELECT IF(id, 1, 0) AS status 
                            FROM membership_logs 
                            WHERE (member_id = a.id OR transferred_to_member = a.id) AND CURDATE() between start_date and expiry_date
                            AND ((is_frozen = 0) OR (CURDATE() NOT between frozen_start_date and frozen_end_date))
                            AND ((is_transferred = 0) OR (member_id != a.id))
                            LIMIT 1
                                ) = '${filter.status}' `;
            }else{
            search += ` AND (SELECT IF(id, 1, 0) AS status 
                            FROM membership_logs 
                            WHERE (member_id = a.id OR transferred_to_member = a.id) AND CURDATE() between start_date and expiry_date
                            AND ((is_frozen = 0) OR (CURDATE() NOT between frozen_start_date and frozen_end_date))
                            AND ((is_transferred = 0) OR (member_id != a.id))
                            LIMIT 1
                                ) IS NULL `;
            }
        }
        if(filter.plan ){
            search += ` AND c.package_id = '${filter.plan}' `;
        }
        if(filter.age && filter.age != 'none'){
            var todaysDate = moment().format('YYYY-MM-DD');
            var twentyFiveYearsEarlier = moment().subtract(25, 'years').format('YYYY-MM-DD')
            var thirtyFiveYearsEarlier = moment().subtract(35, 'years').format('YYYY-MM-DD')
            if(filter.age == 1){
                search += ` AND a.birth_date BETWEEN  '${twentyFiveYearsEarlier}' AND  '${todaysDate}'  `;
            }else if(filter.age == 2){
                search += ` AND a.birth_date BETWEEN  '${thirtyFiveYearsEarlier}' AND  '${twentyFiveYearsEarlier}' `;
            }else if(filter.age == 3){
                search += ` AND a.birth_date < ${thirtyFiveYearsEarlier} `;
            }
        }
        if(filter.member_list ){
            search += ` AND a.id IN (${filter.member_list}) `;
        }
        if(filter.renewal || filter.renewal_type){
            search += ` AND a.id IN (${filter.renewal}) `;
        }
        if(filter.outstanding ){
            search += ` AND a.id IN (${filter.outstanding}) `;
        }
        if(filter.gender && filter.gender != 'all'){
            searchLeads += ` AND a.gender = '${filter.gender}' `;
        }
        if(filter.status && filter.status != 'all'){
            searchLeads += ` AND a.is_active = '${filter.status}' `;
        }
        if(filter.enquiry_list ){
            searchLeads += ` AND a.id IN (${filter.enquiry_list}) `;
        }
        if(filter.trial){
            if(filter.trial == 1){
                searchLeads += ` AND a.trial_booked = 1 `;
            }else{
                searchLeads += ` AND (a.trial_booked IS NULL OR a.trial_booked = 0)`;
            }
        }

        var query =``;
        if(options.sendToMember!=0){
            query += `SELECT id, fname, lname, email, phone, 1 AS is_member from users WHERE id IN
            (SELECT DISTINCT(a.id) 
            FROM users AS a 
                INNER JOIN brand_location_users AS b ON b.users_id = a.id 
                LEFT JOIN membership_logs AS c ON c.member_id = a.id
                INNER JOIN user_roles AS d ON d.users_id = a.id
                INNER JOIN roles AS e ON e.id = d.roles_id  
            WHERE a.is_deleted = 0 AND e.name = 'member' AND b.brand_locations_id = ${options.locationId} ${search})`;
        }
        if(options.sendToMember!=0 && options.sendToLeads!= 0){
            query+= ` UNION `;
        }
        if(options.sendToLeads != 0){
            query += `SELECT id, fname, lname, email, phone, 0 AS is_member from leads AS a WHERE a.brand_locations_id = ${options.locationId} ${searchLeads}`;
        }
        connection.query(query, (err, members) => {
            if(err){
                callback(err)
            }else{
                callback(false, members)
            }
        })
    }

    module.GetOutsanding = (options, callback) => {
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
            a.id,
            a.created_date ,
            a.member_name,
            a.total_amount,
            a.amount_paid,
            a.comment,
            a.completed,
            a.member_id
            FROM (
                select a.id,
                    a.created_date,
                    a.total_amount,
                    CONCAT(c.fname,' ',c.lname) AS member_name,
                    ROUND(SUM(b.amount), 2) AS amount_paid,
                    a.comment,
                    a.completed,
                    a.member_id
                FROM
                    sales AS a
                        INNER JOIN
                    sales_payments AS b ON b.sale_id = a.id
                        INNER JOIN
                    users AS c ON c.id = a.member_id
                WHERE
                    a.brand_locations_id = ?   
                GROUP BY a.id ) AS a
            WHERE a.total_amount > a.amount_paid ; `, [options.locationId], (err, members) => {
            callback(false, members)
        })
    }

    module.GetRenewal  = (options, callback) => {
        var search = ``;
        if(options.renewalType == 1){
            search += ` AND a.expiry_date BETWEEN CURDATE() AND date_add(CURDATE(),interval 15 day)  `;
        }else if(options.renewalType == 2){
            search += ` AND a.expiry_date BETWEEN CURDATE() AND date_add(CURDATE(),interval 30 day)  `;
        }else if(options.renewalType == 3){
            search += ` AND a.expiry_date BETWEEN date_sub(CURDATE(),interval 15 day) AND CURDATE() `;
        }else if(options.renewalType == 4){
            search += ` AND a.expiry_date BETWEEN date_sub(CURDATE(),interval 30 day) AND CURDATE() `;
        }

        connection.query(`SELECT  
            b.id,
            CONCAT(b.fname,' ',b.lname) AS member_name, 
            c.name AS package_name
                FROM
            membership_logs AS a
                INNER JOIN 
            users AS b ON b.id = a.member_id 
                INNER JOIN 
            packages AS c ON c.id = a.package_id 
                INNER JOIN brand_location_users AS d ON d.users_id = b.id
            WHERE a.id IS NOT NULL ${search} AND d.brand_locations_id = ? `,[ options.locationId], (err, members) => {
            if (err) {
                callback(err)
            } else {
                callback(false, members );
            }
        })
    }

    module.TransferMembership = (options, callback) => {
        connection.query(` UPDATE membership_logs SET is_transferred = 1 , transferred_to_member = ?, transfer_relationship = ?, transfer_reason = ?, transfer_fees = ?, transfer_tax_id = ? WHERE id = ? `,[options.memberId, options.relationship, options.transferReason, options.transferFees, options.transferTax, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false);
            }
        })   
    }

    module.FreezeMembership = (options, callback) => {
        connection.query(` UPDATE membership_logs SET is_frozen = 1 , frozen_start_date = ?, expiry_date = ?, frozen_end_date = ?, frozen_by = ?, freeze_price = ? , freeze_reason = ? , freeze_tax_id = ? WHERE id = ? `,[options.startDate, options.expDate, options.endDate, options.frozenBy, options.freezePrice, options.freezeReason, options.freezeTaxId, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false);
            }
        })   
    }

    module.GetMembershipLogById = (options, callback) => {
        connection.query(` SELECT
            a.member_id ,
            a.id,
            CONCAT(b.fname,' ',b.lname) AS member_name,
            c.total_amount ,
            DATE_FORMAT(a.start_date,'%d-%m-%Y') AS start_date,
            DATE_FORMAT(a.expiry_date,'%d-%m-%Y') AS expiry_date,
            d.cost_price,
            d.selling_price,
            d.discount_percent,
            e.name AS package_name,
            a.package_id ,
            e.tax_included,
            (SELECT ROUND(SUM(amount), 2) FROM sales_payments
            WHERE sale_id = a.sale_id) AS amount_paid,
            (SELECT payment_method_id FROM sales_payments
            WHERE sale_id = a.sale_id LIMIt 1) AS payment_mode,
            (SELECT label FROM sales_payments
            INNER JOIN payment_methods_master ON payment_methods_master.id = sales_payments.payment_method_id
            WHERE sales_payments.sale_id = a.sale_id LIMIt 1) AS payment_method_name,
            f.rate AS tax_rate,
            f.label AS tax_name,
            c.brand_locations_id AS brand_locations_id,
            e.is_pt
                FROM membership_logs AS a
            INNER JOIN 
                users AS b ON b.id = a.member_id
            INNER JOIN 
                sales AS c ON c.id = a.sale_id
            INNER JOIN 
                sales_packages AS d ON d.sale_id = a.sale_id AND a.package_id = d.package_id
            INNER JOIN 
                packages AS e ON e.id = a.package_id
            LEFT JOIN 
                sales_packages_taxes AS f ON f.sale_id = a.sale_id AND f.package_id = a.package_id
            WHERE a.id = ?`,[options.membershipId], (err, membership) => {
            if (err) {
                callback(err)
            } else {
                callback(false, membership[0]);
            }
        })   
    }

    module.UpgradeMembership = (options, callback) => {
        connection.query(`UPDATE membership_logs SET is_upgraded = 1 , upgraded_sale_id = ? WHERE id = ?`,[options.saleId, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false);
            }
        }) 
    }

    module.DowngradeMembership = (options, callback) => {
        connection.query(`UPDATE membership_logs SET is_downgraded = 1 , downgraded_sale_id = ? WHERE id = ?`,[options.saleId, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false);
            }
        }) 
    }
    
    module.GetMembershipLogBySaleId = (options, callback) => {
        connection.query(` SELECT *
            FROM membership_logs AS a
            WHERE a.sale_id = ?`,[options.saleId], (err, membershipLog) => {
            if (err) {
                callback(err)
            } else {
                callback(false, membershipLog);
            }
        })   
    }

    module.GetEnrollmentDetails = (options, callback) => {
        connection.query(`SELECT * FROM member_enrollment_files WHERE member_id = ?`,[options.userId], (err, enrollmentDetails) => {
            if (err) {
                callback(err)
            } else {
                callback(false, enrollmentDetails);
            }
        })  
    }

    module.AddEnrollmentDetails = (options, callback) => {
        connection.query(`INSERT INTO member_enrollment_files (member_id, name, file_path) VALUES (?, ?, ?)`,[options.memberId, options.name, options.filename], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false);
            }
        })
    }

    module.UpdateAllDetails = (options, callback) => {
        connection.query(`UPDATE users SET fname=?, lname=?, phone=?, email=?, gender=?, marital_status=?, emergency_contact_name=?, emergency_contact_number=?, blood_group=?, birth_date=?, anniversary_date=?, address_line_1=?, address_line_2=?, state_id=?, city_id=?, zip=? WHERE id = ?`, [options.fName, options.lName, options.phone, options.email, options.gender, options.maritalStatus, options.emergencyContactName, options.emergencyContactNumber, options.bloodGroup, options.birthDate, options.anniversaryDate, options.addressLine1, options.addressLine2, options.stateId, options.cityId, options.zip, options.userId], (err) => {
            callback(err)
        })
    }

    module.GetSMS = (options, callback) => {
        var search = ``;
        var orderBy = ``;

        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.message LIKE ${keyword})`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }

        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        a.message, a.created_date
        FROM sms_logs AS a
        WHERE a.user_id =? 
        ${search} ${orderBy}  LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.userId], (err, smsLogs) => {
            if(err){
                callback(err)
            }else{
                callback(false, {total: smsLogs[1][0].total, sms: smsLogs[0]})
            }
        })
    }

    module.GetEmail = (options, callback) => {
        var search = ``;
        var orderBy = ``;

        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.message LIKE ${keyword})`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }

        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        a.message, a.created_date
        FROM email_logs AS a
        WHERE a.user_id =? 
        ${search} ${orderBy}  LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.userId], (err, emailLogs) => {
            if(err){
                callback(err)
            }else{
                callback(false, {total: emailLogs[1][0].total, email: emailLogs[0]})
            }
        })
    }

    module.ValidatePT = (options, callback) => {
        connection.query(`SELECT * FROM membership_logs AS a
            INNER JOIN packages AS b ON b.id = a.package_id
            WHERE a.member_id = ? AND (DATE('${options.startDate}') >= a.start_date AND a.expiry_date >= DATE('${options.startDate}')) 
            AND  (DATE('${options.endDate}') >= a.start_date AND a.expiry_date >= DATE('${options.endDate}'))
            AND b.is_pt = 0
            `,[options.memberId], (err, membership) => {
            if(err){
                callback(err)
            }else{
                callback(null, membership.length ? 1 : 0)
            }
        })
    }

    module.CheckIfUpgradable = (options, callback) => {
        connection.query(`SELECT b.price FROM membership_logs AS a
            INNER JOIN packages AS b ON b.id = a.package_id WHERE a.id = ?`, [options.membershipId], (err, package) => {
            if(err){
                callback(err)
            }else{
                var package = package[0];
                connection.query(`SELECT * FROM packages AS a WHERE price > ?`, [package.price], (err, isUpgradable) => {
                    if(err){
                        callback(err)
                    }else{
                        callback(null, isUpgradable.length ? 1 : 0)
                    }
                })
            }
        })
    }

    module.CheckIfDowngradable = (options, callback) => {
        connection.query(`SELECT b.price FROM membership_logs AS a
            INNER JOIN packages AS b ON b.id = a.package_id WHERE a.id = ?`, [options.membershipId], (err, package) => {
            if(err){
                callback(err)
            }else{
                var package = package[0];
                connection.query(`SELECT * FROM packages AS a
                    WHERE price < ?`, [package.price], (err, isDowngradable) => {
                    if(err){
                        callback(err)
                    }else{
                        callback(null, isDowngradable.length ? 1 : 0)
                    }
                })
            }
        })
    }


    module.Delete = (options, callback) => {
        connection.getConnection((err, connection) => {
            if (err) {
                callback(err)
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    callback(err)
                }
                connection.query(`DELETE FROM brand_location_users WHERE users_id = ?`, [options.memberId], (err) => {
                    if (err) {
                        connection.rollback(function () {
                            callback(err)
                        });
                    } else {
                        connection.query(`DELETE FROM member_attendance WHERE member_id = ?`, [options.memberId], (err) => {
                            if (err) {
                                connection.rollback(function () {
                                    callback(err)
                                });
                            } else {
                                connection.query(`DELETE FROM member_brand_location_change_log WHERE member_id = ?`, [options.memberId], (err) => {
                                    if (err) {
                                        connection.rollback(function () {
                                            callback(err)
                                        });
                                    } else {
                                        connection.query(`DELETE FROM member_enrollment_files WHERE member_id = ? `, [options.memberId], (err) => {
                                            if (err) {
                                                connection.rollback(function () {
                                                    callback(err)
                                                });
                                            } else {
                                                connection.query(`DELETE FROM member_profile WHERE member_id = ?`, [options.memberId], (err) => {
                                                    if (err) {
                                                        connection.rollback(function () {
                                                            callback(err)
                                                        });
                                                    } else {
                                                        connection.query(`DELETE FROM member_profile_images WHERE users_id = ?`, [options.memberId], (err) => {
                                                            if (err) {
                                                                connection.rollback(function () {
                                                                    callback(err)
                                                                });
                                                            } else {
                                                                connection.query(`DELETE FROM membership_logs WHERE member_id = ?`, [options.memberId], (err) => {
                                                                    if (err) {
                                                                        connection.rollback(function () {
                                                                            callback(err)
                                                                        });
                                                                    } else {
                                                                        var queries = `DELETE FROM sales_payments WHERE sale_id IN ( 
                                                                                SELECT id FROM sales WHERE member_id = ${options.memberId});
                                                                                DELETE  FROM sales_packages WHERE sale_id IN ( 
                                                                                SELECT id FROM sales WHERE member_id = ${options.memberId});
                                                                                DELETE  FROM sales_packages_taxes WHERE sale_id IN ( 
                                                                                SELECT id FROM sales WHERE member_id = ${options.memberId});
                                                                                DELETE  FROM sales WHERE member_id = '${options.memberId}';`;
                                                                        connection.query(queries, (err) => {
                                                                            if (err) {
                                                                                connection.rollback(function () {
                                                                                    callback(err)
                                                                                });
                                                                            } else {
                                                                                connection.query(`DELETE FROM user_roles WHERE users_id = ?`, [options.memberId], (err) => {
                                                                                    if (err) {
                                                                                        connection.rollback(function () {
                                                                                            callback(err)
                                                                                        });
                                                                                    } else {
                                                                                        connection.query(`DELETE FROM wo_member_schedule WHERE member_id = ?`, [options.memberId], (err) => {
                                                                                            if (err) {
                                                                                                connection.rollback(function () {
                                                                                                    callback(err)
                                                                                                });
                                                                                            } else {
                                                                                                connection.query(`DELETE FROM users WHERE id = ?`, [options.memberId], (err) => {
                                                                                                    if (err) {
                                                                                                        connection.rollback(function () {
                                                                                                            callback(err)
                                                                                                        });
                                                                                                    } else {
                                                                                                        connection.commit(function (err) {
                                                                                                            if (err) {
                                                                                                                connection.rollback(function () {
                                                                                                                    callback(err)
                                                                                                                });
                                                                                                            }
                                                                                                            callback(false)
                                                                                                        });
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
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            })
        })
    }

    module.CheckIfMember = (options, callback) => {
        connection.query(`SELECT * FROM
                            user_roles AS a
                            INNER JOIN brand_location_users AS b ON b.users_id = a.users_id
                            INNER JOIN users AS c ON c.id = a.users_id
                        WHERE
                        a.roles_id = 5
                        AND c.id = ?;`, [options.userId], (err, members) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, members.length > 0 ? 1 : 0)
            }
        })
    }

    module.GetFeedback = (options, callback) => {
        connection.query(`SELECT a.*, CONCAT(b.fname, " ", IF(b.lname IS NOT NULL , b.lname , "")) AS member_name FROM member_feedback AS a 
            INNER JOIN users AS b ON b.id = a.user_id
            WHERE a.member_id = ?`, [options.userId], (err, feedbacks) => {
            if(err){
                callback(err)
            }else{
                if(err){
                    callback(err)
                }else{
                    callback(null, feedbacks)
                }
            }
        })
    }

    module.GetBrandUsersForFeedback = (options, callback) => {
        brand_locations = [];
        connection.query(`SELECT brand_locations_id FROM brand_location_users WHERE users_id = ?`, [options.userId], (err, locations) => {
            if(err){
                callback(err)
            }else{
                if(err){
                    callback(err)
                }else{
                    if(locations.length>0){
                        brand_locations.push(locations[0].brand_locations_id);
                        connection.query(`SELECT location_id_from FROM member_brand_location_change_log WHERE member_id = ?`, [options.userId], (err, changedLocations) => {
                            if(err){
                                callback(err)
                            }else{
                                if(changedLocations.length>0){
                                    changedLocations.forEach(function(cl){
                                        brand_locations.push(cl.location_id_from);
                                    })
                                    connection.query(`SELECT b.id, CONCAT(b.fname, ' ', IF(b.lname, b.lname, '')) AS name, d.name AS brand_location_name  FROM brand_location_users AS a
                                        INNER JOIN users AS b ON b.id = a.users_id
                                        INNER JOIN user_roles AS c ON c.users_id = a.users_id 
                                        INNER JOIN brand_locations AS d ON d.id = a.brand_locations_id
                                        WHERE a.brand_locations_id IN ( ${brand_locations.join(',')} )
                                        AND c.roles_id != 5 AND c.roles_id != 1 AND c.roles_id != 8`, (err, users) => {
                                        if(err){
                                            callback(err)
                                        }else{
                                            callback(false, users)
                                        }
                                    })
                                }else{
                                    connection.query(`SELECT b.id, CONCAT(b.fname, ' ', IF(b.lname, b.lname, '')) AS name, d.name AS brand_location_name  FROM brand_location_users AS a
                                        INNER JOIN users AS b ON b.id = a.users_id
                                        INNER JOIN user_roles AS c ON c.users_id = a.users_id 
                                        INNER JOIN brand_locations AS d ON d.id = a.brand_locations_id
                                        WHERE a.brand_locations_id = ?
                                        AND c.roles_id != 5 AND c.roles_id != 1 AND c.roles_id != 8`, [locations[0].brand_locations_id], (err, users) => {
                                        if(err){
                                            callback(err)
                                        }else{
                                            callback(false, users)
                                        }
                                    })
                                }
                            }
                        })
                    }else{
                        callback(false, null)
                    }
                }
            }
        })   
    }

    module.AddFeedback = (options, callback) => {
        connection.query(`INSERT INTO member_feedback (feedback, user_id, member_id,star_rating) VALUES (?, ?, ?,?)`, [options.feedback, options.employeeId, options.userId,options.star_rating], (err) => {
            err ? callback(err) : callback(null)
        })
    }

    return module;
};

module.exports = Members;