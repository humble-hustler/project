/********************************************************/
/***** Team Model *****/
/********************************************************/

const Team = (connection, logger) => {
    const module = {}

    module.GetTeam = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR b.email LIKE ${keyword} OR b.phone LIKE ${keyword} OR d.verbose LIKE ${keyword} OR f.designation LIKE ${keyword} OR g.department OR b.id LIKE ${keyword} )`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        if(!options.all){
            search += ` AND a.brand_locations_id = ${options.locationId} `;
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    b.id, CONCAT(b.fname, " " ,b.lname) user_name,b.email, b.phone, d.verbose, f.designation, g.department,c.roles_id,d.name as role_name, h.name AS brand_location_name, b.is_active
FROM
    brand_location_users AS a
    INNER JOIN users AS b ON b.id = a.users_id
    INNER JOIN user_roles AS c ON c.users_id = a.users_id
    INNER JOIN roles AS d ON d.id = c.roles_id
    LEFT JOIN user_profile AS e ON e.users_id = a.users_id
    LEFT JOIN team_designation AS f ON f.id = e.designation_id
    LEFT JOIN team_department AS g ON g.id = e.department_id
    INNER JOIN brand_locations AS h ON h.id = a.brand_locations_id
WHERE
    d.name != 'member' AND b.is_deleted = 0 ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, users) => {            
            callback(err, {total: users[1][0].total, users: users[0]})
        })
    }

    module.GetTrainers = (options, callback) => {
        connection.query(`SELECT 
    b.id, b.fname, b.lname, b.email, b.phone, d.verbose
FROM
    brand_location_users AS a
    INNER JOIN users AS b ON b.id = a.users_id
    INNER JOIN user_roles AS c ON c.users_id = a.users_id
    INNER JOIN roles AS d ON d.id = c.roles_id
WHERE
    a.brand_locations_id = ? AND d.name = 'trainer'`, [options.locationId], (err, users) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, users)
            }
        })
    }

    module.GetTimeSlots = (options, callback) => {
        connection.query(`SELECT a.id, a.slot_id,
            TIME_FORMAT(b.start_time, "%h:%i %p") AS start_time,
            TIME_FORMAT(b.end_time, "%h:%i %p") AS end_time,
            b.week_days
            FROM trainer_time_slots AS a
            INNER JOIN brand_location_timing_slots AS b ON b.id = a.slot_id 
            WHERE b.brand_location_id = ? AND b.is_deleted = 0 AND a.is_deleted = 0 AND a.trainer_id IN( ? )`,[options.locationId, options.userId], (err, timeSlots) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, timeSlots)
            }
        })
    }

    module.AddTimeSlot = (options, callback) => {
        connection.query(`INSERT INTO trainer_time_slots (trainer_id, slot_id) VALUES (?, ?)`,[options.userId, options.timeSlotId], (err) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteTimeSlot = (options, callback) => {
        connection.query(`UPDATE trainer_time_slots SET is_deleted = 1 WHERE id = ?`,[options.timeSlotId], (err) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.GetBookedSlots = (options, callback) => {
        connection.query(`SELECT a.slot_id, a.member_id,
            IF(a.is_transferred, CONCAT(d.fname, ' ', d.lname), CONCAT(c.fname,' ',c.lname)) AS member_name,
            a.start_date, a.expiry_date
            FROM membership_logs AS a
            INNER JOIN brand_location_timing_slots AS b ON b.id = a.slot_id
            LEFT JOIN users AS c ON c.id = a.member_id
            LEFT JOIN users AS d ON d.id = a.transferred_to_member 
            WHERE a.trainer_id IN (?) AND a.slot_id IS NOT NULL 
            AND DATE(a.expiry_date) > DATE(NOW()) AND b.is_deleted = 0 `,[options.trainerId], (err, bookedSlots) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, bookedSlots)
            }
        })
    }

    module.GetShifts = (options, callback) => {
        connection.query(`SELECT a.* ,TIME_FORMAT(b.start_time, "%h:%i %p") AS start_time,
            b.shift_name,
            TIME_FORMAT(b.end_time, "%h:%i %p") AS end_time,
            TIMEDIFF(b.end_time, b.start_time) AS duration
        FROM user_shifts AS a 
        INNER JOIN brand_location_shift AS b ON b.id = a.shift_id
        WHERE a.user_id = ? `,[options.userId], (err, shifts) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, shifts)
            }
        })
    }

    module.AddShift = (options, callback) => {
        connection.query(`UPDATE user_shifts SET end_date = NOW() WHERE user_id = ? AND end_date IS NULL;INSERT INTO user_shifts (user_id, shift_id) VALUES (?, ?) `,[options.userId,options.userId, options.shiftId], (err) => {
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

module.exports = Team