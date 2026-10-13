/********************************************************/
/***** Reports Model *****/
/********************************************************/

const Reports = (connection, logger) => {
    const module = {}
    const moment = require('moment');

    module.Sales = (options, callback) => {
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.created_date) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            }
            if (filter.gender) {
                filterQuery += ` AND c.gender = ${connection.escape(filter.gender)} `
            }
            if (filter.paymentStatus) {
                filterQuery += ` AND a.completed = ${connection.escape(filter.paymentStatus)} `
            }
        }

        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (c.fname LIKE ${keyword} OR c.lname LIKE ${keyword} OR a.comment LIKE ${keyword} OR a.total_amount LIKE ${keyword} OR b.amount LIKE ${keyword})`
        }
        var orderBy=``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    a.id,
    a.sale_location_id,
    a.created_date,
    a.completed,
    a.total_amount,
    ROUND(SUM(b.amount), 2) AS amount_paid,
    c.fname,
    c.lname,
    a.comment,
    a.deleted,
    a.invoice_date
FROM
    sales AS a
        INNER JOIN
    sales_payments AS b ON b.sale_id = a.id
        INNER JOIN
    users AS c ON c.id = a.member_id
WHERE
    a.brand_locations_id = ? ${search} ${filterQuery} 
GROUP BY a.id  ${orderBy}  LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, sales) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: sales[1][0].total, sales: sales[0]})
            }
        })
    }

    module.SingleSale = (options, callback) => {
        connection.query(`SELECT 
    a.line_id,
    b.name,
    ROUND(a.cost_price,2) AS cost_price,
    ROUND(a.discount_percent,2) AS discount_percent,
    ROUND(a.selling_price,2) AS selling_price,
    SUM(c.rate) AS tax_rate,
    ROUND(SUM(c.rate) * (a.selling_price / 100),2) AS tax_amount,
    ROUND(a.selling_price + SUM(c.rate) * (a.selling_price / 100),2) AS total
FROM
    sales_packages AS a
        INNER JOIN
    packages AS b ON b.id = a.package_id
        INNER JOIN
    sales_packages_taxes AS c ON c.sale_id = a.sale_id
        AND c.package_id = a.package_id
WHERE
    a.sale_id = ?
GROUP BY a.line_id , b.name , a.cost_price , a.discount_percent , a.selling_price
ORDER BY a.line_id`, [options.saleId], (err, sale) => {
            if (err) {
                callback(err)
            } else {
                callback(false, sale)
            }
        })
    }

    module.RenewalExpired = (options, callback) => {
        var search = ``;
        var filterQuery = ``

        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.expiry_date) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            }
        }
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR c.name LIKE ${keyword})`
        }
        var orderBy=``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS 
            CONCAT(b.fname,' ',IF(b.lname IS NOT NULL, b.lname, '')) AS member_name, 
            b.phone,
            b.email,
            b.gender,
            c.name AS package_name, 
            a.start_date AS package_start_date, 
            a.expiry_date AS package_expiry_date,
            IF(a.id IN (
                SELECT  aa.id
                FROM membership_logs AS aa
                INNER JOIN membership_logs AS b ON b.member_id = aa.member_id AND aa.package_id = b.package_id
                WHERE aa.expiry_date < b.expiry_date
            ),1,0) AS is_renewed
                FROM
            membership_logs AS a
                INNER JOIN 
            users AS b ON b.id = a.member_id 
                INNER JOIN 
            packages AS c ON c.id = a.package_id 
                INNER JOIN 
            brand_location_users AS d ON d.users_id = b.id
            WHERE a.expiry_date <= ? AND d.brand_locations_id = ? ${search} ${filterQuery} ${orderBy}  LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total; `,[moment().format('YYYY-MM-DD'), options.locationId], (err, report) => {
            if (err) {
                callback(err)
            } else {
                callback(false,  {total: report[1][0].total, report: report[0]})
            }
        })
    }

    module.RenewalExport = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (b.fname LIKE ${keyword} OR b.lname LIKE ${keyword} OR c.name LIKE ${keyword})`
        }
        var orderBy=``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        var filterQuery = ``

        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.expiry_date) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            }
        }
        connection.query(`SELECT  
            CONCAT(b.fname,' ',IF(b.lname IS NOT NULL, b.lname, '')) AS member_name, 
            b.phone,
            b.email,
            b.gender,
            c.name AS package_name, 
            a.start_date AS package_start_date, 
            a.expiry_date AS package_expiry_date,
            (SELECT count(*) FROM membership_logs
                WHERE expiry_date >= a.expiry_date AND id != a.id 
                    AND package_id = a.package_id AND member_id = a.member_id) AS is_renewed
                FROM
            membership_logs AS a
                INNER JOIN 
            users AS b ON b.id = a.member_id 
                INNER JOIN 
            packages AS c ON c.id = a.package_id 
                INNER JOIN 
            brand_location_users AS d ON d.users_id = b.id
            WHERE (a.expiry_date >= now()-interval 3 month AND a.expiry_date <= now()+interval 3 month) AND d.brand_locations_id = ? ${search} ${filterQuery} ${orderBy}`,[ options.locationId], (err, report) => {
            if (err) {
                callback(err)
            } else {
                callback(false, report)
            }
        })
    }

    module.Outstanding = (options, callback) => {
        var search = ``
        var filterQuery = ``

        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.created_date) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            }
        }
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.member_name LIKE ${keyword} OR a.total_amount LIKE ${keyword} OR a.amount_paid LIKE ${keyword})`
        }
        var orderBy=``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
            a.id,
            a.sale_location_id,
            a.created_date ,
            a.member_name,
            a.total_amount,
            a.amount_paid,
            a.comment,
            a.completed,
            a.package_names,
            a.phone,
            a.start_date,
            a.outstanding_days,
            a.sold_by_user,
            a.trainer_name,
            a.expiry_date,
            a.ageing
            FROM (
                select a.id,
                a.sale_location_id,
                    a.created_date,
                    a.total_amount,
                    CONCAT(c.fname,' ',IF(c.lname IS NOT NULL, c.lname, '')) AS member_name,
                    a.comment,
                    a.completed,
                    e.name AS package_names,
                    c.phone,
                    DATE_FORMAT(f.start_date,'%d/%m/%Y') AS start_date,
                    f.expiry_date,
                    CONCAT(datediff(f.expiry_date, NOW()),' Days') AS outstanding_days,
                    CONCAT(g.fname, ' ', g.lname) AS sold_by_user,
                    CONCAT(h.fname, ' ', h.lname) AS trainer_name,
                    (SELECT ROUND(SUM(amount), 2) FROM sales_payments
                        WHERE sale_id = a.id) AS amount_paid,
                    DATEDIFF(NOW(), a.created_date) AS ageing
                FROM
                    sales AS a
                        INNER JOIN
                    users AS c ON c.id = a.member_id
                        INNER JOIN 
                    sales_packages AS d ON d.sale_id = a.id
                        INNER JOIN 
                    packages AS e ON e.id = d.package_id
                        INNER JOIN
                    membership_logs AS f ON f.sale_id = a.id AND f.package_id = d.package_id
                        LEFT JOIN 
                    users AS g ON g.id = f.sold_by
                        LEFT JOIN
                    users AS h ON h.id = f.trainer_id
                WHERE
                    a.brand_locations_id = ?   
                 ) AS a
            WHERE a.total_amount > a.amount_paid ${search} ${filterQuery} ${orderBy} LIMIT ${options.offset}, ${options.limit}; SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, outstanding) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: outstanding[1][0].total, outstanding: outstanding[0]})
            }
        })
    }

    module.SalesExport = (options, callback) => {
        var filterQuery = ``

        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.created_date) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            }
            if (filter.gender) {
                filterQuery += ` AND c.gender = ${connection.escape(filter.gender)} `
            }
            if (filter.paymentStatus) {
                filterQuery += ` AND a.completed = ${connection.escape(filter.paymentStatus)} `
            }
        }

        var search = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (c.fname LIKE ${keyword} OR c.lname LIKE ${keyword} OR a.comment LIKE ${keyword} OR a.total_amount LIKE ${keyword} )`
        }
        var orderBy=``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT 
    a.id,
    a.invoice_date,
    a.sale_location_id,
    a.created_date,
    a.completed,
    a.total_amount,
    CONCAT(c.fname,' ',IF(c.lname IS NOT NULL, c.lname, '')) AS member_name,
    a.comment,
    a.deleted,
    c.phone,
    c.address_line_1,
    c.id AS member_id,
    d.cost_price*(d.discount_percent/100) AS total_discount,
    d.selling_price AS selling_price,
    e.name AS package_names,
    e.price,
    DATE_FORMAT(f.start_date,'%d/%m/%Y') AS start_date,
    DATE_FORMAT(f.expiry_date,'%d/%m/%Y') AS end_date,
    CONCAT(g.fname, ' ', g.lname) AS trainer_name,
    CONCAT(h.fname, ' ', h.lname) AS sold_by_user_name,
    CONCAT(i.fname, ' ', i.lname) AS received_by_user_name,
    (SELECT ROUND(SUM(amount), 2) FROM sales_payments
        WHERE sale_id = a.id) AS amount_paid,
    (SELECT GROUP_CONCAT(DISTINCT(i.label)) AS payment_mode FROM sales_payments
        INNER JOIN payment_methods_master AS i ON i.id = sales_payments.payment_method_id 
        WHERE sales_payments.sale_id = a.id GROUP BY sales_payments.sale_id) AS payment_mode,
    (SELECT rate FROM sales_packages_taxes 
        WHERE sale_id  = a.id AND package_id = d.package_id LIMIT 1  ) AS tax_rate,
    (SELECT label FROM sales_packages_taxes 
        WHERE sale_id  = a.id AND package_id = d.package_id LIMIT 1  ) AS tax_name,
    (SELECT count(*) FROM membership_logs
        WHERE expiry_date >= f.expiry_date AND id != f.id 
            AND package_id = f.package_id AND member_id = f.member_id) AS renewed
FROM
    sales AS a
        INNER JOIN
    users AS c ON c.id = a.member_id
        LEFT JOIN 
    sales_packages AS d On d.sale_id = a.id
        LEFT JOIN
    packages AS e ON e.id = d.package_id
        LEFT JOIN 
    membership_logs AS f ON f.sale_id = a.id AND f.package_id = d.package_id
        LEFT JOIN 
    users AS g ON g.id = f.trainer_id
        LEFT JOIN 
    users AS h ON h.id = f.sold_by
        LEFT JOIN 
    users AS i ON i.id = a.received_by
WHERE
    a.brand_locations_id = ? ${search} ${filterQuery} 
${orderBy}  `, [options.locationId], (err, sales) => {
            if (err) {
                callback(err)
            } else {
                callback(false, sales)
            }
        })
    }

    module.Attendance = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            // search = ` AND (a.member_name LIKE ${keyword} OR a.total_amount LIKE ${keyword} OR a.amount_paid LIKE ${keyword})`
        }
        var orderBy=``;
        if (options.orderByColumn) {
            // orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }

        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.in_time) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            }
            if (filter.member) {
                filterQuery += ` AND b.id = ${connection.escape(filter.member)} `
            }
        }
        connection.query(`SELECT 
            a.id,
            CONCAT(b.fname, b.lname) AS member_name,
            b.phone,
            a.in_time,
            a.out_time
            FROM member_attendance AS a 
                INNER JOIN 
            users AS b ON b.id = a.member_id
                WHERE  a.brand_locations_id = ?
            ${search} ${filterQuery} ${orderBy} LIMIT ${options.offset}, ${options.limit}; SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, attendance) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: attendance[1][0].total, attendance: attendance[0]})
            }
        })
    }

    module.MemberStatus = (options, callback) => {
        var search = ``;
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.created_date) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            }
            // if (filter.expiryFrom && filter.expiryTo) {
            //     filterQuery += ` AND DATE(expiry_date) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            // }
        }
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.fname LIKE ${keyword} OR a.lname LIKE ${keyword} OR a.email LIKE ${keyword} OR a.phone LIKE ${keyword} OR a.address_line_1 LIKE ${keyword} )`
        }
        var orderBy=``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
            a.id, 
            CONCAT(a.fname,' ', IF(a.lname IS NOT NULL, a.lname, '')) AS member_name, a.email, a.phone, a.gender, a.address_line_1, a.birth_date,
            a.created_date,
            (SELECT 
                packages.name
                FROM membership_logs 
                INNER JOIN packages ON membership_logs.package_id = packages.id
                WHERE membership_logs.member_id = a.id
                ORDER BY membership_logs.start_date DESC 
                LIMIT 1
            ) AS package_name,
            (SELECT 
                membership_logs.expiry_date
                FROM membership_logs 
                WHERE membership_logs.member_id = a.id
                ORDER BY membership_logs.start_date DESC 
                LIMIT 1
            ) AS expiry_date
            FROM users AS a
                INNER JOIN user_roles AS b ON b.users_id = a.id
                INNER JOIN roles AS c ON c.id = b.roles_id 
                INNER JOIN brand_location_users AS d ON d.users_id = a.id
            WHERE c.name = 'member' AND d.brand_locations_id = ? ${search} ${filterQuery} ${orderBy} LIMIT ${options.offset}, ${options.limit}; SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, report) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: report[1][0].total, report: report[0]})
            }
        })
    }

    module.Enquiry = (options, callback) => {
        var search = ``;
        var filterQuery = ``
        if (options.filter) {
            var filter = options.filter;
            if (filter.from && filter.to) {
                filterQuery += ` AND DATE(a.created_date) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            }
            // if (filter.expiryFrom && filter.expiryTo) {
            //     filterQuery += ` AND DATE(expiry_date) BETWEEN DATE(${connection.escape(filter.from)}) AND DATE(${connection.escape(filter.to)}) `
            // }
        }
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            // search = ` AND (a.fname LIKE ${keyword} OR a.lname LIKE ${keyword} OR a.email LIKE ${keyword} OR a.phone LIKE ${keyword} OR a.address_line_1 LIKE ${keyword} )`
        }
        var orderBy=``;
        if (options.orderByColumn) {
            // orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT a.*, b.source, c.status,
            CONCAT(d.fname, ' ', IF(d.lname IS NOT NULL, d.lname, '')) AS owner_name,
            GROUP_CONCAT(e.name ORDER BY e.id) AS package_names,
            f.name AS fitness_goal
            FROM leads AS a
            INNER JOIN lead_source AS b ON b.id = a.source_id
            INNER JOIN lead_status AS c ON c.id = a.status_id
            LEFT JOIN users AS d ON d.id = a.owner_id
            LEFT JOIN packages AS e 
                ON FIND_IN_SET(e.id, a.package_ids) 
            LEFT JOIN wo_fitness_goal AS f ON f.id = a.wo_fitness_goal_id
            WHERE a.brand_locations_id = ? ${search} ${filterQuery} ${orderBy} 
            GROUP BY a.id LIMIT ${options.offset}, ${options.limit}; SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, report) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: report[1][0].total, report: report[0]})
            }
        })
    }

    return module;
};

module.exports = Reports;