/********************************************************/
/***** Packages Model *****/
/********************************************************/

const Packages = (connection, logger) => {
    const module = {}

    module.GetLocationPackages = (options, callback) => {
        var search = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (name LIKE ${keyword} OR validity_days LIKE ${keyword} OR price LIKE ${keyword})`
        }
        var orderBy=``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS * FROM packages WHERE brand_locations_id = ? AND is_deleted = 0 ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, packages) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, {total: packages[1][0].total, packages: packages[0]})
            }
        })
    }

    module.Add = (options, callback) => {
        connection.query("INSERT INTO packages SET brand_locations_id = ?, name = ?, validity_days = ?, price = ?, tax_included = 0, is_pt = ?", [options.locationId, options.name, options.validity, options.price, options.isPt], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.SearchLocationPackage = (options, callback) => {
        connection.query(`SELECT * FROM packages WHERE brand_locations_id = ? AND is_active = 1 AND name LIKE ${connection.escape('%' + options.keywords + '%')}`, [options.locationId], (err, packages) => {
            if (err) {
                callback(err)
            } else {
                callback(false, packages)
            }
        })
    }

    module.GetSinglePackage = (options, callback) => {
        connection.query(`SELECT * FROM packages WHERE id = ? AND brand_locations_id = ?`, [options.packageId, options.locationId], (err, package) => {
            if (err) {
                callback(err)
            } else {
                callback(false, package[0])
            }
        })
    }

    module.UpdateData = (options, callback) => {
        connection.query(`UPDATE packages SET ?? = ? WHERE id = ?`, [options.col, options.val, options.packageId], (err) => {
            callback(err)
        })
    }

    module.GetUpgradePackages = (options, callback) => {
        connection.query(`SELECT price , is_pt FROM packages WHERE id=?`, [options.packageId], (err, package) => {
            if (err) {
                callback(err)
            } else {
                var package = package[0];
                connection.query(`SELECT *
                FROM packages AS a 
                WHERE a.price > ${package.price} AND a.brand_locations_id = ? AND is_pt = ? AND a.is_deleted = 0`, [options.locationId, package.is_pt], (err, packages) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(false, packages)
                    }
                }) 
            }
        }) 
          
    }

    module.GetDowngradePackages = (options, callback) => {
        connection.query(`SELECT price , is_pt FROM packages WHERE id=?`, [options.packageId], (err, package) => {
            if (err) {
                callback(err)
            } else {
                var package = package[0];
                connection.query(`SELECT *
                FROM packages AS a 
                WHERE a.price < ${package.price} AND a.brand_locations_id = ? AND is_pt = ? AND a.is_deleted = 0`, [options.locationId, package.is_pt], (err, packages) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(false, packages)
                    }
                }) 
            }
        })  
    }

    module.Delete = (options, callback) => {
        connection.query(`UPDATE packages SET is_deleted = 1 WHERE id = ?`, [options.packageId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }
    return module;
};

module.exports = Packages;