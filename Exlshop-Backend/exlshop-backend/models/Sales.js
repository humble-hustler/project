/********************************************************/
/***** Sales Model *****/
/********************************************************/
const moment = require('moment-timezone');
const _ = require('lodash');
const { options } = require('../routes/super-admin/settings');

const Sales = (connection, logger) => {
    const module = {}



module.GetSales1= (options,callback)=>{
    var search = ``
    if (options.search) {
        var keyword = connection.escape(`%${options.search}%`);
        search = ` where (d.name LIKE ${keyword} OR a.amount LIKE ${keyword})`
    }

    connection.query(`select distinct(d.name),(a.amount),(f.name) as shop_name from shop_payment_request as a
    inner join 
    shop_orders as b on a.order_id = b.id
    inner join shop_orders_products as c on c.order_id=b.id
    inner join shop_products as d on d.id= c.product_id
    left join brand_locations as e on e.id = d.location_id
    left join brands as f on f.id = e.brands_id
 ${search} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, sales) => {
       if(err){
        console.log(err)
        callback(err)
       }else{
        callback(false, {total: sales[1][0].total, sales: sales[0]})
       }
    })
}

module.GetSales= (options,callback)=>{

    connection.query(`select distinct(d.name),(a.amount) from shop_payment_request as a
    inner join 
    shop_orders as b on a.instamojo_payment_request_id= b.instamojo_payment_request_id
    inner join shop_orders_products as c on c.order_id=b.id
    inner join shop_products as d on d.id= c.product_id`, (err, sales) => {
       if(err){
        console.log(err)
        callback(err)
       }else{
        callback(false, sales)
       }
    })
}

    module.Add = (options, callback) => {
        const {locationId, memberId, userId, comment, packages, payments, isComplete, totalAmount, receivedBy} = options;
        const changeSale = options.changeSale != 'false' ? connection.escape(options.changeSale) : 'CURRENT_TIMESTAMP'

        /* Get Connection from Pool for Transaction */
        connection.getConnection((err, connection) => {
            if (err) {
                callback(err)
            }

            /* Begin Transaction */
            connection.beginTransaction(function (err) {
                if (err) {
                    callback(err)
                }

                /* Get New Sale Location Id */
                connection.query(`SELECT sale_location_id + 1 AS new_sale_location_id FROM sales WHERE brand_locations_id = ? ORDER BY sale_location_id DESC `, [locationId], (err, locationSale) => {
                    if (err) {
                        connection.rollback(function () {
                            callback(err)
                        });
                    } else {
                        /* Insert Sale */
                        connection.query(`INSERT INTO sales (invoice_date, sale_location_id, brand_locations_id, member_id, sold_by_user_id, total_amount, comment, completed, received_by) VALUES (${changeSale}, ?, ?, ?, ?, ?, ?, ?, ?)`, [locationSale[0].new_sale_location_id, locationId, memberId, userId, totalAmount, comment, isComplete, receivedBy], (err, sale) => {
                            if (err) {
                                connection.rollback(function () {
                                    callback(err)
                                });
                            } else {

                                /* Insert Sale Packages */
                                var values = []
                                packages.forEach((p) => {
                                    if (p.tax_included) {
                                        var price = p.priceExludingTax;
                                    } else {
                                        var price = p.price;
                                    }
                                    values.push([sale.insertId, p.id, p.lineId, p.cost_price, p.subTotal, p.discount])
                                })
                                connection.query(`INSERT INTO sales_packages (sale_id, package_id, line_id, cost_price, selling_price, discount_percent) VALUES ?`, [values], (err) => {
                                    if (err) {
                                        connection.rollback(function () {
                                            callback(err)
                                        });
                                    } else {

                                        /* Insert Sale Payments */
                                        var values = []
                                        if (payments.length !== 0) {
                                            payments.forEach((p) => {
                                                values.push([sale.insertId, 
                                                                p.id, 
                                                                p.amount,
                                                                p.cardType ? p.cardType : null,
                                                                p.cardNo ? p.cardNo : null,
                                                                p.cardPhone ? p.cardPhone : null,
                                                                p.chequeNo ? p.chequeNo : null,
                                                                p.chequeDate ? p.chequeDate: null,
                                                                p.bankName ? p.bankName : null,
                                                                p.neftDate ? p.neftDate : null,
                                                                p.refNo ? p.refNo : null,
                                                                p.razorpayTransactionId ? p.razorpayTransactionId: null])
                                            })
                                        } else {
                                            values.push([sale.insertId, 4, 0, null, null, null, null, null, null, null, null, null])
                                        }
                                        connection.query(`INSERT INTO sales_payments (sale_id, payment_method_id, amount, card_type, card_no, card_phone, cheque_no, cheque_date, bank_name, neft_date, ref_no, razorpay_transaction_id) VALUES ? `, [values], (err) => {
                                            if (err) {
                                                connection.rollback(function () {
                                                    callback(err)
                                                });
                                            } else {

                                                /* Insert Sale Package Taxes */
                                                var values = [];
                                                packages.forEach((p) => {
                                                    if (p.tax.length === 0) {
                                                        values.push([sale.insertId, p.id, p.lineId, 'NA', 0])
                                                    } else {
                                                        p.tax.forEach((t) => {
                                                            values.push([sale.insertId, p.id, p.lineId, t.label, t.rate])
                                                        })
                                                    }
                                                })
                                                connection.query(`INSERT INTO sales_packages_taxes (sale_id, package_id, line, label, rate) VALUES ?`, [values], (err) => {
                                                    if (err) {
                                                        connection.rollback(function () {
                                                            callback(err)
                                                        });
                                                    } else {

                                                        /* Insert Membership Logs */
                                                        var values = [];
                                                        packages.forEach((p) => {
                                                            values.push([locationId, memberId, p.id, sale.insertId, p.start, p.expiry, p.soldBy, p.trainer_id, p.slotId])
                                                        })
                                                        connection.query(`INSERT INTO membership_logs (location_id, member_id, package_id, sale_id, start_date, expiry_date, sold_by, trainer_id, slot_id) VALUES ?`, [values], (err) => {
                                                            if (err) {
                                                                connection.rollback(function () {
                                                                    callback(err)
                                                                });
                                                            } else {
                                                                /* Commit Transaction */
                                                                connection.commit(function (err) {
                                                                    if (err) {
                                                                        connection.rollback(function () {
                                                                            callback(err)
                                                                        });
                                                                    }
                                                                    callback(false, sale.insertId)
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
            })
        })
    }

    module.AddPayment = (options, callback) => {
        connection.query(`INSERT INTO sales_payments SET sale_id = ?, payment_method_id = ?, amount = ?, card_type=?, card_no = ?, card_phone = ?, cheque_no = ?, cheque_date = ?, bank_name =?, neft_date = ?, ref_no = ?, razorpay_transaction_id = ?`, [options.saleId, options.paymentMethodId, options.amount, options.cardType, options.cardNo, options.cardPhone, options.chequeNo, options.chequeDate, options.bankName, options.neftDate, options.refNo, options.razorpayTransactionId], (err) => {
            if (err) {
                callback(err)
            } else {
                connection.query(`SELECT 
    a.id, IF(a.total_amount = SUM(b.amount), 1, 0) AS complete
FROM
    sales AS a
        INNER JOIN
    sales_payments AS b ON b.sale_id = a.id
    WHERE a.id = ?
GROUP BY a.id LIMIT 1`, [options.saleId], (err, completeStatus) => {
                    var sale = completeStatus[0]
                    connection.query(`UPDATE sales SET completed = ? WHERE id = ?`, [sale.complete, sale.id], (err) => {
                        callback(err)
                    })
                })
            }
        })
    }

    module.GetSaleData = (options, callback) => {
        connection.query(`SELECT * FROM sales WHERE id = ?`, [options.saleId], (err, sale) => {
            callback(err, sale[0])
        })
    }

    module.GetSaleLine = (options, callback) => {
        connection.query(`SELECT 
    b.*, a.*, DATE_FORMAT(c.start_date, "%d-%m-%Y") AS start_date, DATE_FORMAT(c.expiry_date, "%d-%m-%Y") AS expiry_date,
    d.sale_location_id AS sale_id
FROM
    sales_packages AS a
        INNER JOIN
    packages AS b ON b.id = a.package_id
        INNER JOIN 
    membership_logs AS c ON c.package_id = a.package_id AND a.sale_id = c.sale_id
        INNER JOIN 
    sales AS d ON d.id = a.sale_id
WHERE
    a.sale_id = ?`, [options.saleId], (err, line) => {
            callback(err, line)
        })
    }

    module.GetSaleTaxes = (options, callback) => {
        connection.query(`SELECT * FROM sales_packages_taxes WHERE sale_id = ?`, [options.saleId], (err, taxes) => {
            callback(err, taxes)
        })
    }

    module.GetSalePayments = (options, callback) => {
        connection.query(`SELECT 
    a.id, b.label, a.amount, a.created_date
FROM
    sales_payments AS a
    INNER JOIN payment_methods_master AS b ON b.id = a.payment_method_id
WHERE
    a.sale_id = ?`, [options.saleId], (err, payments) => {
            callback(err, payments)
        })
    }

    module.GetInvoices = (options, callback) => {
        var search = ``
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (c.fname LIKE ${keyword} OR c.lname LIKE ${keyword} OR a.id LIKE ${keyword} OR e.name LIKE ${keyword} OR a.total_amount LIKE ${keyword})`
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
    CONCAT(c.fname,' ',IF(c.lname IS NOT NULL, c.lname, '')) AS member_name,
    a.comment,
    a.deleted,
    a.invoice_date,
    GROUP_CONCAT(e.name) AS packages
FROM
    sales AS a
        INNER JOIN
    sales_payments AS b ON b.sale_id = a.id
        INNER JOIN
    users AS c ON c.id = a.member_id
        INNER JOIN 
    sales_packages AS d ON d.sale_id = a.id
        INNER JOIN 
    packages AS e ON e.id = d.package_id
WHERE
    a.brand_locations_id = ? ${search}
GROUP BY a.id ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, invoices) => {
            callback(false, {total: invoices[1][0].total, invoices: invoices[0]})
        })
    }

    module.UpdateInvoice = (options, callback) => {
        connection.query(`UPDATE sales SET invoice_date = ? , comment = ? , total_amount= ? WHERE id = ?`,[options.invoiceDate, options.notes, options.totalAmount, options.invoiceId],function(err){
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    module.updateSaleItems = (options, callback) => {
        connection.query(`UPDATE sales_packages SET selling_price = ? WHERE sale_id = ? AND package_id = ?`,[options.line.price, options.invoiceId, options.line.packageId],function(err){
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    module.UpdateDetails = (options, callback) => {
        connection.query(`UPDATE sales SET comment = ? , invoice_date = ? WHERE id = ?`,[options.comment, options.saleDate, options.saleId],function(err){
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }

    module.UpdateMembership = (options, callback) => {
        const query = `UPDATE membership_logs 
                    SET slot_id = ? , sold_by = ? ,
                    start_date = ? , expiry_date = ?
                    WHERE sale_id = ? AND package_id = ?`;
        connection.query(`SELECT validity_days FROM packages where id = ?`,[options.packageId],function(err, packages){
            if(err){
                callback(err);
            }else{
                var p = packages[0];
                connection.query(query,[options.slotId, options.soldBy, options.startDate, moment(options.startDate).add(p.validity_days, 'days').format('YYYY-MM-DD'), options.saleId, options.packageId],function(err){
                    if(err){
                        callback(err)
                    }else{
                        callback(false)
                    }
                })
            }
        })
            
    }

    module.UpdatePrice = (options, callback) => {
        const query = `UPDATE sales_packages SET selling_price = ?
                    WHERE sale_id = ? AND package_id = ?`;
        connection.query(query,[options.price, options.saleId, options.packageId],function(err){
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    } 

    module.UpdatePackage = (options, callback) => {
        connection.getConnection((err, connection) => {
            if (err) {
                callback(err)
            }

            /* Begin Transaction */
            connection.beginTransaction(function (err) {
                if (err) {
                    callback(err)
                }
                /* Get the package details*/
                connection.query(`SELECT * FROM packages WHERE id = ? LIMIT 1`, [options.newPackageId], (err, packages) => {
                    if (err) {
                        connection.rollback(function () {
                            callback(err)
                        });
                    } else {
                        var price;
                        var package = packages[0];
                        if (package.tax_included) {
                            var taxSum = _.sumBy(options.taxes, 'rate');
                            price = package.price / ((100 + taxSum) / 100);
                        } else {
                            price = package.price;
                        }
                        connection.query(`UPDATE sales_packages SET package_id = ${options.newPackageId}, cost_price = ${price}, selling_price = ${price} WHERE sale_id = ${options.saleId} AND package_id = ${options.oldPackageId}`,  (err) => {
                            if (err) {
                                connection.rollback(function () {
                                    callback(err)
                                });
                            } else {
                                var values = [];
                                if (options.taxes.length === 0) {
                                    values.push([saleId, options.newPackageId, 1, 'NA', 0])
                                } else {
                                    options.taxes.forEach((t, i) => {
                                        values.push([options.saleId, options.newPackageId, i, t.label, t.rate])
                                    })
                                }
                                connection.query(`DELETE FROM sales_packages_taxes WHERE sale_id = ${options.saleId} AND package_id = ${options.oldPackageId}; 
                                    INSERT INTO sales_packages_taxes (sale_id, package_id, line, label, rate) VALUES ?`, [values], (err) => {
                                    if (err) {
                                        connection.rollback(function () {
                                            callback(err)
                                        });
                                    } else {
                                        connection.query(`UPDATE membership_logs SET package_id = ?, expiry_date = DATE_ADD(start_date, INTERVAL ${package.validity_days} DAY) WHERE sale_id = ? AND package_id = ?`, [options.newPackageId, options.saleId, options.oldPackageId], (err) => {
                                            if (err) {
                                                connection.rollback(function () {
                                                    callback(err)
                                                });
                                            } else {
                                                //update sale total amount
                                                connection.query(`SELECT * FROM sales_packages WHERE sale_id = ?;
                                                    SELECT * FROM sales_packages_taxes WHERE sale_id = ?`, [options.saleId, options.saleId], (err, data) => {
                                                    if (err) {
                                                        connection.rollback(function () {
                                                            callback(err)
                                                        });
                                                    } else {
                                                        var salePackages = data[0];
                                                        var saleTaxes = data[1];
                                                        var totalSaleAmount = 0;
                                                        salePackages.forEach(function(sp){
                                                            var taxAmount = 0;
                                                            saleTaxes.forEach(function(st){
                                                                if(st.package_id == sp.package_id ){
                                                                    taxAmount += sp.selling_price * st.rate/100; 
                                                                }
                                                            })
                                                            totalSaleAmount += sp.selling_price + taxAmount;
                                                        })
                                                        connection.query(`UPDATE sales SET total_amount = ? WHERE id = ?`, [totalSaleAmount, options.saleId], (err, data) => {
                                                            if (err) {
                                                                connection.rollback(function () {
                                                                    callback(err)
                                                                });
                                                            } else {
                                                                connection.query(`SELECT 
                                                                    a.id, IF(a.total_amount = SUM(b.amount), 1, 0) AS complete
                                                                FROM
                                                                    sales AS a
                                                                        INNER JOIN
                                                                    sales_payments AS b ON b.sale_id = a.id
                                                                    WHERE a.id = ?
                                                                GROUP BY a.id LIMIT 1`, [options.saleId], (err, completeStatus) => {
                                                                    var sale = completeStatus[0]
                                                                    connection.query(`UPDATE sales SET completed = ? WHERE id = ?`, [sale.complete, sale.id], (err) => {
                                                                        if(err){
                                                                            connection.rollback(function () {
                                                                                callback(err)
                                                                            });
                                                                        }else{
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

    module.UpdateTrainer = (options, callback) => {
        connection.query(`UPDATE membership_logs SET trainer_id = ? , slot_id = NULL WHERE sale_id = ? AND package_id = ?`,[options.trainerId, options.saleId, options.packageId], function(err){
            if(err){
                callback(err)
            }else{
                callback(false)
            }
        })
    }


    module.Delete = (options, callback) => {
        
        /* Get Connection from Pool for Transaction */
        connection.getConnection((err, connection) => {
            if (err) {
                callback(err)
            }

            /* Begin Transaction */
            connection.beginTransaction(function (err) {
                if (err) {
                    callback(err)
                }

                /* Delete Membership Logs */
                connection.query(`DELETE FROM membership_logs WHERE sale_id = ?`, [options.saleId], (err) => {
                    if (err) {
                        connection.rollback(function () {
                            callback(err)
                        });
                    } else {
                        /* Delte Sale Payments*/
                        connection.query(`DELETE FROM sales_payments WHERE sale_id = ?`, [options.saleId], (err) => {
                            if (err) {
                                connection.rollback(function () {
                                    callback(err)
                                });
                            } else {
                                /* Delete from Sale Packges Taxes*/
                                connection.query(`DELETE FROM sales_packages_taxes WHERE sale_id = ?`, [options.saleId], (err) => {
                                    if (err) {
                                        connection.rollback(function () {
                                            callback(err)
                                        });
                                    } else {
                                        /* Delete from Sale Packges */
                                        connection.query(`DELETE FROM sales_packages WHERE sale_id = ? `, [options.saleId], (err) => {
                                            if (err) {
                                                connection.rollback(function () {
                                                    callback(err)
                                                });
                                            } else {

                                                /* Delete from Sale table */
                                                connection.query(`DELETE FROM sales WHERE id = ?`, [options.saleId], (err) => {
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
            })
        })
    }

    return module;
};

module.exports = Sales;