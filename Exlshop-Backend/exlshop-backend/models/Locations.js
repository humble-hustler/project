/********************************************************/
/***** Locations Model *****/
/********************************************************/

const { options } = require('toastr');

const Locations = (connection, logger) => {
    const module = {}
    const moment = require('moment');

    module.GetLocByBrandId = (options, callback) => {
        connection.query(`SELECT
        *
    FROM
        brand_locations WHERE brands_id = ?`, [options.brandId], (err, locations) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, locations)
            }
        })
    }

    module.GetByBrandId = (options, callback) => {
        connection.query(`SELECT
        a.*, b.instamojo_payment_request_id, b.users_id, b.shop_id, b.amount,
        CASE b.status WHEN 0 THEN 'Pending' ELSE 'Subscribed' END as  subcriptionStatus
    FROM
        brand_locations AS a
        left join shop_subsription as b on b.shop_id = a.brands_id  WHERE a.brands_id = ?`, [options.brandId], (err, locations) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, locations)
            }
        })
    }

    module.GetByBrandId1 = (options, callback) => {
        console.log(options, "oppppppppppp")
        var search = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND a.name LIKE ${keyword} `
        }

        connection.query(`SELECT SQL_CALC_FOUND_ROWS
        a.*, b.instamojo_payment_request_id, b.users_id, b.shop_id, b.amount,
        CASE b.status WHEN 0 THEN 'Un-Subscribed' ELSE 'Subscribed' END as  subcriptionStatus
    FROM
        brand_locations AS a
        left join shop_subsription as b on b.shop_id = a.id  WHERE a.brands_id = ${options.brandId} ${search} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, (err, locations) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, { total: locations[1][0].total, locations: locations[0] })
            }
        })
    }

    module.Add = (options, callback) => {
        connection.query(`INSERT INTO brand_locations SET brands_id = ?, name = ?`, [options.brandId, options.name], (err, location) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, location.insertId)
            }
        })
    }

    module.getDocuments = (options, callback) =>{
        connection.query(`select * from user_upload_documents where location_id = ?`, [options.locationId], (err, documents) =>{
            if(err){
                callback(err)
            }else{
                callback(false, documents)
            }
        })
    }


    module.GetById = (options, callback) => {
        connection.query(`SELECT 
    a.*, b.name AS city, c.name AS state, d.name AS country, e.name AS brand_name
FROM
    brand_locations AS a
        LEFT JOIN
    cities AS b ON b.id = a.city_id
        LEFT JOIN
    states AS c ON c.id = a.state_id
        LEFT JOIN
    countries AS d ON d.id = a.country_id
        LEFT JOIN 
    brands AS e ON e.id = a.brands_id
WHERE
    a.id = ?`, [options.locationId], (err, location) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                
                callback(false, location[0])
                
            }
        })
    }

    module.Update = (options, callback) => {
        connection.query(`UPDATE brand_locations SET ?? = ? WHERE id = ?`, [options.col, options.value, options.locationId], (err, location) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, location[0])
            }
        })
    }

    module.updateActiveStatus = (options, callback) =>{
        connection.query(`UPDATE brand_locations SET is_active = ? where id = ?`, [options.changeStatus, options.locationId], (err, location) => {
            if(err){
                callback(err)
            }else{
                callback(false, location[0])
            }
        })
    }

    module.AddBankDetails = (options, callback) => {
        connection.query(`select * from brand_location_bank_details where user_id = ${options.userId} and location_id = ${options.locationId}`,(err, details)=> {
            if(err){
                callback(err)
            }else{
                if(details.length == 0){
                    connection.query(`INSERT INTO brand_location_bank_details SET name = ?,
                    bank_name = ?, acc_num = ?, branch = ?, ifsc_code = ?, location_id = ?, user_id = ?;`,
                    [options.name, options.bankName, options.accNo, options.branchName,
                        options.ifscCode, options.locationId, options.userId], (err, location) => {
                        if (err) {
                            logger.error.error(err)
                            callback(err)
                        } else {
                            callback(false, location[0])
                        }
                    })
                }else{
                    connection.query(`UPDATE brand_location_bank_details SET name = ?,
                    bank_name = ?, acc_num = ?, branch = ?, ifsc_code = ?, user_id = ?, is_deleted = 0 WHERE location_id = ?;`,
                    [options.name, options.bankName, options.accNo, options.branchName,
                        options.ifscCode, options.userId, options.locationId], (err, location) => {
                        if (err) {
                            logger.error.error(err)
                            callback(err)
                        } else {
                            callback(false, location[0])
                        }
                    })
                }
            }
        })
    }

    module.GetOrderOptions = (options, callback) => {
        connection.query(`SELECT a.*, b.name as brand_name FROM brand_locations as a inner join brands as b on b.id = a.brands_id WHERE a.id = ? and a.is_deleted = 0;`,
        [options.locationId], (err, location) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, location)
            }
        })
    }

    module.GetBankDetails = (options, callback) => {
        connection.query(`SELECT * FROM brand_location_bank_details WHERE location_id = ? and is_deleted = 0;`,
        [options.locationId], (err, location) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, location)
            }
        })
    }

    module.UpdateBankDetails = (options, callback) => {
        connection.query(`UPDATE brand_location_bank_details SET name = ?,
        bank_name = ?, acc_num = ?, branch = ?, ifsc_code = ?, user_id = ? WHERE location_id = ?;`,
        [options.name, options.bankName, options.accNo, options.branchName,
            options.ifscCode, options.userId, options.locationId], (err, location) => {
            if (err) {
                logger.error.error(err)
                callback(err)
            } else {
                callback(false, location[0])
            }
        })
    }

    module.DeleteBankDetails = (options, callback) => {
        connection.query("UPDATE brand_location_bank_details SET is_deleted = 1 WHERE id = ?", [options.bankDetailsId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateGeneralFields = (options, callback) => {
        connection.query(`UPDATE brand_locations SET name = ?, address_line_1 = ?, address_line_2 = ?, city_id = ?, state_id = ?, zip = ?, phone = ?, email = ?, gstin = ?, invoice_footer_notes = ?, operating_hour_start = ?, operating_hour_end = ?, lat = ?, lng = ? WHERE id = ?`, [options.name, options.address1, options.address2, options.cityId, options.stateId, options.zip, options.phone, options.email, options.gstin, options.invoiceFooterNotes, options.startTime, options.endTime, options.lat, options.lng, options.locationId], (err) => {
            callback(err)
        })
    }

    module.AddTax = (options, callback) => {
        connection.query("INSERT INTO taxes SET brand_locations_id = ?, label = ?, rate = ?", [options.locationId, options.label, options.rate], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.GetLocationTax = (options, callback) => {
        connection.query("SELECT * FROM taxes WHERE brand_locations_id = ? AND is_deleted = 0", [options.locationId], (err, taxes) => {
            if (err) {
                callback(err)
            } else {
                callback(false, taxes)
            }
        })
    }

    module.GetPaymentMethods = (options, callback) => {
        connection.query(`SELECT b.* FROM brand_locations AS a
        LEFT JOIN payment_methods_master AS b ON FIND_IN_SET(b.id, a.payment_methods)
        WHERE a.id = ?`, [options.locationId], (err, paymentMethods) => {
            if (err) {
                callback(err)
            } else {
                callback(false, paymentMethods)
            }
        })
    }

    module.AddExerciseType = (options, callback) => {
        connection.query(`INSERT INTO wo_exercise_type SET name = ?, brand_locations_id = ?`, [options.exerciseType, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }

    module.SearchExerciseType = (options, callback) => {
        connection.query(`SELECT * FROM wo_exercise_type WHERE name LIKE ${connection.escape('%' + options.exerciseType + '%')} AND brand_locations_id = ?`, [options.locationId], (err, exerciseTypes) => {
            if (err) {
                callback(err)
            } else {
                callback(false, exerciseTypes)
            }

        })
    }

    module.GetExerciseType = (options, callback) => {
        connection.query(`SELECT * FROM wo_exercise_type WHERE brand_locations_id = ?`, [options.locationId], (err, workoutTypes) => {
            if (err) {
                callback(err)
            } else {
                callback(false, workoutTypes)
            }
        })
    }

    module.AddEquipment = (options, callback) => {
        connection.query(`INSERT INTO wo_equipment_master SET name = ?, type = ? , brand_locations_id = ?`, [options.equipmentName, options.category, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }

    module.SearchEquipment = (options, callback) => {
        connection.query(`SELECT * FROM wo_equipment_master WHERE name LIKE ${connection.escape('%' + options.equipmentName + '%')} AND brand_locations_id = ?`, [options.locationId], (err, equipments) => {
            if (err) {
                callback(err)
            } else {
                callback(false, equipments)
            }
        })
    }

   module.GetEquipments = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND a.name LIKE ${keyword} `
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS a.* 
            FROM wo_equipment_master AS a WHERE a.brand_locations_id = ? AND is_deleted = 0
            ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};
            SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, equipments) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: equipments[1][0].total, equipments: equipments[0]});
            }

        })
    }

    module.AddExercise = (options, callback) => {
        connection.query(`INSERT INTO wo_exercise SET name = ?, wo_exercise_type_id = ?, wo_muscle_type_id = ?, wo_equipment_master_id = ?, brand_locations_id = ?`, [options.exerciseText, options.exercuseTypeId, options.muscleTargetId, options.equipmentId, options.locationId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.GetExercise = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.name LIKE ${keyword} OR b.name LIKE ${keyword} OR c.name LIKE ${keyword} OR d.name LIKE ${keyword})`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    a.id, a.name AS exercise_name, b.name AS exercise_type, c.name AS muscle_target, d.name AS equipment_name
FROM
    wo_exercise AS a
    INNER JOIN wo_exercise_type AS b ON b.id = a.wo_exercise_type_id
    INNER JOIN wo_muscle_type AS c ON c.id = a.wo_muscle_type_id
    INNER JOIN wo_equipment_master AS d ON d.id = a.wo_equipment_master_id
    WHERE a.brand_locations_id = ? AND a.is_deleted = 0 ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, exercises) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: exercises[1][0].total, exercises: exercises[0]})
            }
        })
    }

    module.SearchExercise = (options, callback) => {
        connection.query(`SELECT * FROM wo_exercise WHERE name LIKE ${connection.escape('%' + options.exercise + '%')} AND brand_locations_id = ?`, [options.locationId], (err, exercise) => {
            if (err) {
                callback(err)
            } else {
                callback(false, exercise)
            }
        })
    }

    module.AddMuscleTarget = (options, callback) => {
        connection.query(`INSERT INTO wo_muscle_type SET name = ?, brand_locations_id = ?`, [options.muscleTarget, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }

    module.SearchMuscleTarget = (options, callback) => {
        connection.query(`SELECT * FROM wo_muscle_type WHERE name LIKE ${connection.escape('%' + options.muscleTarget + '%')} AND brand_locations_id = ?`, [options.locationId], (err, muscleTargets) => {
            if (err) {
                callback(err)
            } else {
                callback(false, muscleTargets)
            }
        })
    }

    module.GetMuscleTarget = (options, callback) => {
        connection.query(`SELECT * FROM wo_muscle_type WHERE brand_locations_id = ? AND is_deleted = 0`, [options.locationId], (err, muscleTargets) => {
            if (err) {
                callback(err)
            } else {
                callback(false, muscleTargets)
            }
        })
    }

    module.AddIntensity = (options, callback) => {
        connection.query(`INSERT INTO wo_intensity SET name = ?, brand_locations_id = ?`, [options.intensity, options.locationId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.SearchIntensity = (options, callback) => {
        connection.query(`SELECT * FROM wo_intensity WHERE name LIKE ${connection.escape('%' + options.intensity + '%')} AND brand_locations_id = ?`, [options.locationId], (err, intensities) => {
            if (err) {
                callback(err)
            } else {
                callback(false, intensities)
            }
        })
    }

    module.AddWeight = (options, callback) => {
        connection.query(`INSERT INTO wo_weight_master SET name = ?, brand_locations_id = ?`, [options.weight, options.locationId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.SearchWeight = (options, callback) => {
        connection.query(`SELECT * FROM wo_weight_master WHERE name LIKE ${connection.escape('%' + options.weight + '%')} AND brand_locations_id = ?`, [options.locationId], (err, intensities) => {
            if (err) {
                callback(err)
            } else {
                callback(false, intensities)
            }
        })
    }

    module.AddWorkoutLevel = (options, callback) => {
        connection.query(`INSERT INTO wo_level SET name = ?, brand_locations_id = ?`, [options.workoutLevel, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }

    module.GetWorkoutLevels = (options, callback) => {
        connection.query(`SELECT * FROM wo_level WHERE brand_locations_id = ? AND is_deleted = 0`, [options.locationId], (err, workoutLevels) => {
            if (err) {
                callback(err)
            } else {
                callback(false, workoutLevels)
            }
        })
    }

    module.SearchWorkoutLevels = (options, callback) => {
        connection.query(`SELECT * FROM wo_level WHERE name LIKE ${connection.escape('%' + options.workoutLevels + '%')} AND brand_locations_id = ?`, [options.locationId], (err, workoutLevels) => {
            if (err) {
                callback(err)
            } else {
                callback(false, workoutLevels)
            }
        })
    }

    module.AddFitnessGoals = (options, callback) => {
        connection.query(`INSERT INTO wo_fitness_goal SET name = ?, brand_locations_id = ?`, [options.fitnessGoals, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }
    
    module.AddLeadStatus = (options, callback) => {
        connection.query(`INSERT INTO lead_status SET status = ?, brand_locations_id = ?`, [options.status, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }
    
    module.AddLeadSource = (options, callback) => {
        connection.query(`INSERT INTO lead_source SET source = ?, brand_locations_id = ?`, [options.source, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }
    
    module.AddDepartment = (options, callback) => {
        connection.query(`INSERT INTO team_department SET department = ?, brand_locations_id = ?`, [options.department, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }
    
    module.AddDesignation = (options, callback) => {
        connection.query(`INSERT INTO team_designation SET designation = ?, brand_locations_id = ?`, [options.designation, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }

    module.SearchFitnessGoals = (options, callback) => {
        connection.query(`SELECT * FROM wo_fitness_goal WHERE name LIKE ${connection.escape('%' + options.fitnessGoals + '%')} AND brand_locations_id = ?`, [options.locationId], (err, fitnessGoals) => {
            if (err) {
                callback(err)
            } else {
                callback(false, fitnessGoals)
            }
        })
    }

    module.GetFitnessGoals = (options, callback) => {
        connection.query(`SELECT * FROM wo_fitness_goal WHERE brand_locations_id = ? AND is_deleted = 0`, [options.locationId], (err, fitnessGoals) => {
            if (err) {
                callback(err)
            } else {
                callback(false, fitnessGoals)
            }
        })
    }
    
    module.GetDepartments = (options, callback) => {
        connection.query(`SELECT * FROM m_department`, (err, department) => {
            if (err) {
                callback(err)
            } else {
                callback(false, department)
            }
        })
    }
    
    module.GetDesignation = (options, callback) => {
        connection.query(`SELECT * FROM m_designation`, (err, fitnessGoals) => {
            if (err) {
                callback(err)
            } else {
                callback(false, fitnessGoals)
            }
        })
    }

    module.DeleteTax = (options, callback) => {
        connection.query("UPDATE taxes SET is_deleted = 1 WHERE id = ?", [options.taxId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateTax = (options, callback) => {
        connection.query("UPDATE taxes SET label = ?, rate= ? WHERE id = ?", [options.label,options.rate,options.taxId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateDesignation = (options, callback) => {
        connection.query(`UPDATE team_designation SET designation = ? WHERE id = ?`, [options.designation, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateDepartment = (options, callback) => {
        connection.query(`UPDATE team_department SET department = ? WHERE id = ?`, [options.department, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }
    
    module.UpdateLeadSource = (options, callback) => {
        connection.query(`UPDATE lead_source SET source = ? WHERE id = ?`, [options.leadSource, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateLeadStatus = (options, callback) => {
        connection.query(`UPDATE lead_status SET status = ? WHERE id = ?`, [options.leadStatus, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateEquipment = (options, callback) => {
        connection.query(`UPDATE wo_equipment_master SET name = ?, type = ? WHERE id = ?`, [options.equipmentName, options.category, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateMuscleTarget = (options, callback) => {
        connection.query(`UPDATE wo_muscle_type SET name = ? WHERE id = ?`, [options.muscleTarget, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateFitnessGoals = (options, callback) => {
        connection.query(`UPDATE wo_fitness_goal SET name = ? WHERE id = ?`, [options.fitnessGoals, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateWorkoutLevel = (options, callback) => {
        connection.query(`UPDATE  wo_level SET name = ? WHERE id = ?`, [options.workoutLevel, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateExerciseType = (options, callback) => {
        connection.query(`UPDATE wo_exercise_type SET name = ? WHERE id = ?`, [options.exerciseType, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.GetSingleExercise = (options, callback) => {
        connection.query(`SELECT 
    a.id, a.name AS exercise_name, b.name AS exercise_type, b.id as exercise_type_id, c.name AS muscle_target ,c.id as muscle_target_id, d.name AS equipment_name, d.id as equipment_id
FROM
    wo_exercise AS a
    INNER JOIN wo_exercise_type AS b ON b.id = a.wo_exercise_type_id
    INNER JOIN wo_muscle_type AS c ON c.id = a.wo_muscle_type_id
    INNER JOIN wo_equipment_master AS d ON d.id = a.wo_equipment_master_id
    WHERE a.id = ? `, [options.id], (err, exercise) => {
            if (err) {
                callback(err)
            } else {
                callback(false, exercise[0])
            }
        })
    }

    module.UpdateExercise = (options, callback) => {
        connection.query(`UPDATE wo_exercise SET name = ?, wo_exercise_type_id = ?, wo_muscle_type_id = ?, wo_equipment_master_id = ? WHERE id = ?`, [options.exerciseText, options.exercuseTypeId, options.muscleTargetId, options.equipmentId, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.AddVendor = (options, callback) => {
        connection.query(`INSERT INTO vendor (vendor_name,vendor_gst,brand_locations_id) VALUES (?,?,?)`, [options.vendorName, options.vendorGST, options.locationId], (err,data) => {
            if (err) {
                callback(err)
            } else {
                callback(false,data.insertId)
            }
        })
    }

    module.SearchVendor = (options, callback) => {
        connection.query(`SELECT * FROM vendor WHERE vendor_name LIKE ${connection.escape('%' + options.vendorName + '%')} AND brand_locations_id = ?`, [options.locationId], (err, vendors) => {
            if (err) {
                callback(err)
            } else {
                callback(false, vendors)
            }

        })
    }

    module.GetVendors = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (vendor.vendor_name LIKE ${keyword} OR vendor.vendor_gst LIKE ${keyword} )`
        }
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS * FROM vendor
    WHERE brand_locations_id = ? AND is_deleted=0 ${search} ${orderBy}  LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, vendors) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: vendors[1][0].total, vendors: vendors[0]})
            }
        })
    }

    module.GetSingleVendor = (options, callback) => {
        connection.query(`SELECT * FROM vendor WHERE id = ? `, [options.id], (err, vendor) => {
            if (err) {
                callback(err)
            } else {
                callback(false, vendor[0])
            }
        })
    }

    module.UpdateVendor = (options, callback) => {
        connection.query(`UPDATE vendor SET vendor_name = ? , vendor_gst = ? WHERE id = ?`, [options.vendorName, options.vendorGST,options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.GetAll = (callback) => {
        connection.query(`SELECT a.*, b.name AS brand_name 
        FROM 
            brand_locations AS a
        INNER JOIN brands AS b ON b.id = a.brands_id `, (err,brandLocations) => {
            if (err) {
                callback(err)
            } else {
                callback(false,brandLocations);
            }
        })
    }
    
    module.SearchLocation = (options, callback) => {
        connection.query(`SELECT a.id , a.name AS location_name , b.name AS brand_name 
        FROM brand_locations AS a 
            INNER JOIN 
            brands AS b ON b.id = a.brands_id
        WHERE (a.name LIKE ${connection.escape('%' + options.text + '%')} OR  b.name LIKE ${connection.escape('%' + options.text + '%')})`, (err, locations) => {
            if (err) {
                callback(err)
            } else {
                callback(false, locations)
            }
        })
    }

    module.GetByMemberId = (options, callback) => {
        connection.query(`SELECT c.* 
            FROM users AS a 
                INNER JOIN 
            brand_location_users AS b ON b.users_id = a.id 
                INNER JOIN 
            brand_locations AS c ON c.id = b.brand_locations_id
            WHERE a.id = ? `,[options.userId], (err, locations) => {
            if (err) {
                callback(err)
            } else {
                callback(false, locations[0])
            }
        })
    }

    module.GetLocationsByMemberId = (options, callback) => {
        connection.query(`SELECT * FROM brand_locations WHERE brands_id IN (SELECT c.brands_id
            FROM users AS a 
                INNER JOIN 
            brand_location_users AS b ON b.users_id = a.id 
                INNER JOIN 
            brand_locations AS c ON c.id = b.brand_locations_id
            WHERE a.id = ? )`,[options.userId], (err, locations) => {
            if (err) {
                callback(err)
            } else {
                callback(false, locations)
            }
        })
    }

    module.UpdateMemberLocation = (options, callback) => {
        connection.query(`UPDATE brand_location_users SET brand_locations_id = ? WHERE users_id = ?`,[options.locationId, options.memberId], (err) => {
            if (err) {
                callback(err)
            } else {
                connection.query(`INSERT INTO member_brand_location_change_log (member_id, location_id_from, location_id_to) VALUES (?, ?, ?)`,[options.memberId, options.currentLocationId, options.locationId], (err) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(false)
                    }
                })
            }
        })
    }
        
    module.AddTimeSlot = (options, callback) => {
        connection.query("INSERT INTO brand_location_timing_slots (brand_location_id, start_time, end_time, week_days) VALUES (?, ?, ?, ?)", [options.locationId, options.startTime, options.endTime, options.weekDays], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.GetTimeSlots = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        connection.query(`SELECT SQL_CALC_FOUND_ROWS a.id ,TIME_FORMAT(a.start_time, "%h:%i %p") AS start_time,
            TIME_FORMAT(a.end_time, "%h:%i %p") AS end_time,
            TIMEDIFF(a.end_time, a.start_time) AS duration,
            a.week_days
            FROM brand_location_timing_slots AS a
            WHERE a.brand_location_id = ? AND a.is_deleted = 0 ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, timeSlots) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: timeSlots[1][0].total, timeSlots: timeSlots[0]})
            }
        })
    }

    module.GetDateWiseTimeSlots = (options, callback) => {
        var day = moment(options.date, 'DD-MM-YYYY').day();
        connection.query(`SELECT * FROM brand_location_timing_slots 
            WHERE brand_location_id = ? AND is_deleted = 0 AND (week_days like '%${day}%' OR week_days = 'all')`, [options.locationId], (err, timeSlots) => {
            if (err) {
                callback(err)
            } else {
                callback(false, timeSlots)
            }
        })
    }

    module.BookSlot = (options, callback) => {
        connection.query(`INSERT INTO brand_location_time_slot_booking (member_id, slot_id, date) VALUES (?, ?, ?)`, [options.memberId, options.slotId, moment(options.date, 'DD-MM-YYYY').format('YYYY-MM-DD')], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })   
    }

    module.ValidateSlot = (options, callback) => {
        connection.query(`SELECT count(*) AS count
            FROM brand_location_time_slot_booking AS a
            INNER JOIN brand_location_timing_slots AS b ON a.slot_id = b.id
            WHERE a.member_id = ? AND DATE_FORMAT(NOW(),'%H:%i:s') >= b.start_time AND DATE_FORMAT(NOW(),'%H:%i:s') <= b.end_time  `, [options.memberId], (err, slotCount) => {
            if (err) {
                callback(err)
            } else {
                callback(false, slotCount[0])
            }
        }) 
    }

    module.AddShift = (options, callback) => {
        connection.query(`INSERT INTO brand_location_shift (shift_name, start_time, end_time, brand_location_id) VALUES (?, ?, ?, ?) `, [options.name, options.startTime, options.endTime, options.locationId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        }) 
    }

    module.GetShifts = (options, callback) => {
        var search = ``;
        var orderBy = ``;
        connection.query(`SELECT SQL_CALC_FOUND_ROWS 
            a.id ,TIME_FORMAT(a.start_time, "%h:%i %p") AS start_time,
            a.shift_name,
            TIME_FORMAT(a.end_time, "%h:%i %p") AS end_time,
            TIMEDIFF(a.end_time, a.start_time) AS duration
            FROM brand_location_shift AS a
            WHERE a.brand_location_id = ? AND a.is_deleted = 0 ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, shifts) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: shifts[1][0].total, shifts: shifts[0]})
            }
        })
    }

    module.GetSingleShift = (options, callback) => {
        connection.query(`SELECT * FROM brand_location_shift WHERE id = ?`, [options.shiftId], (err, shift) => {
            if (err) {
                callback(err)
            } else {
                callback(false, shift[0])
            }
        })
    }

    module.UpdateShift = (options, callback) => {
        connection.query(`UPDATE brand_location_shift  SET shift_name = ?, start_time = ?, end_time = ? WHERE id = ? `, [options.name, options.startTime, options.endTime, options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        }) 
    }

    module.DeleteExerciseMaster = (options, callback) => {
        connection.query(`UPDATE wo_exercise SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteVendor = (options, callback) => {
        connection.query(`UPDATE vendor SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteTimingSlot = (options, callback) => {
        connection.query(`UPDATE brand_location_timing_slots SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteShift = (options, callback) => {
        connection.query(`UPDATE brand_location_shift SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }
    
    module.DeleteTargetMuscle = (options, callback) => {
        connection.query(`UPDATE wo_muscle_type SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteExerciseLevel = (options, callback) => {
        connection.query(`UPDATE wo_level SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteFitnessGoal = (options, callback) => {
        connection.query(`UPDATE wo_fitness_goal SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteLeadStatus = (options, callback) => {
        connection.query(`UPDATE lead_status SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteLeadSource = (options, callback) => {
        connection.query(`UPDATE lead_source SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }
    
    module.DeleteDepartment = (options, callback) => {
        connection.query(`UPDATE team_department SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteDesignation = (options, callback) => {
        connection.query(`UPDATE team_designation SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }
    
    module.DeleteExerciseType = (options, callback) => {
        connection.query(`UPDATE wo_exercise_type SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.DeleteEquipment = (options, callback) => {
        connection.query(`UPDATE wo_equipment_master SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.UpdateBrandLogo = (options, callback) => {
        connection.query(`UPDATE brand_locations SET brand_logo = ? WHERE id = ?`, [options.filename, options.brandLocationId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }
    return module;
};
module.exports = Locations;