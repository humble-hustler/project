/********************************************************/
/***** Schedule Model *****/
/********************************************************/

const Schedule = (connection, logger) => {
    const module = {}

    module.GetAllWorkoutPrograms = (options, callback) => {
        var search = ``;
        if (options.search) {
            var keyword = connection.escape(`%${options.search}%`);
            search = ` AND (a.name LIKE ${keyword} OR b.name LIKE ${keyword} OR c.name LIKE ${keyword} OR d.label LIKE ${keyword} OR a.gender LIKE ${keyword})`
        }
        var orderBy = ``;
        if (options.orderByColumn) {
            orderBy = ` ORDER BY ${options.orderByColumn} ${options.orderByValue} `
        }
        connection.query(`SELECT SQL_CALC_FOUND_ROWS
    a.id, a.name AS program_name, b.name AS workout_level_name, c.name AS fitness_goal_name, d.label AS age_group_label, a.gender
FROM
    wo_program AS a
    INNER JOIN wo_level AS b ON b.id = a.workout_level_id
    INNER JOIN wo_fitness_goal AS c ON c.id = a.fitness_goal_id
    INNER JOIN wo_age_group AS d ON d.id = a.wo_age_group_id
WHERE
    a.brand_locations_id = ? AND a.is_deleted = 0 ${search} ${orderBy} LIMIT ${options.offset}, ${options.limit};SELECT FOUND_ROWS() AS total;`, [options.locationId], (err, programs) => {
            if (err) {
                callback(err)
            } else {
                callback(false, {total: programs[1][0].total, programs: programs[0]})
            }
        })
    }

    module.AddWorkoutProgram = (options, callback) => {
        connection.query(`INSERT INTO wo_program SET name = ?, workout_level_id = ?, fitness_goal_id = ?, wo_age_group_id = ?, gender = ?, brand_locations_id = ?`, [options.programName, options.workoutLevelId, options.fitnessGoalId, options.ageGroupId, options.gender, options.locationId], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(false)
            }
        })
    }

    module.GetSingleWorkoutProgramData = (options, callback) => {
        connection.query(`SELECT
    a.id, a.name AS program_name, b.name AS workout_level_name, c.name AS fitness_goal_name, d.label AS age_group_label, a.gender
FROM
    wo_program AS a
    INNER JOIN wo_level AS b ON b.id = a.workout_level_id
    INNER JOIN wo_fitness_goal AS c ON c.id = a.fitness_goal_id
    INNER JOIN wo_age_group AS d ON d.id = a.wo_age_group_id
WHERE
    a.brand_locations_id = ? AND a.id = ?`, [options.locationId, options.workoutId], (err, workoutData) => {
            callback(err, workoutData[0])
        })
    }

    module.AddWorkoutExercise = (options, callback) => {

        var values = []
        options.days.forEach((d) => {
            values.push([options.workoutProgramId, options.exerciseId, d, options.sets, options.repetition, options.weight, options.time, options.distance])
        })

        connection.query(`INSERT INTO wo_program_exercise (wo_program_id, wo_exercise_id, day, sets, repetition, weight, time, distance) VALUES ?`, [values], (err) => {
            callback(err)
        })
    }

    module.GetSingleWorkoutProgramChart = (options, callback) => {
        connection.query(`SELECT 
    a.id,
    a.wo_program_id,
    b.name AS exercise_name,
    a.day,
    DAYNAME(CONCAT("1970-09-2", a.day)) AS day_name,
    a.sets,
    a.repetition,
    a.weight,
    c.name AS equipment,
    d.name AS muscle,
    a.time,
    a.distance
FROM
    wo_program_exercise AS a
        INNER JOIN
    wo_exercise AS b ON b.id = a.wo_exercise_id
    INNER JOIN wo_equipment_master AS c ON c.id = b.wo_equipment_master_id
    INNER JOIN wo_muscle_type AS d ON d.id = b.wo_muscle_type_id
    WHERE wo_program_id = ? AND a.is_deleted = 0 ORDER BY a.day`, [options.workoutProgramId], (err, chart) => {
            callback(err, chart)
        })
    }

    module.GetPersonalTraining = (options, callback) => {
        var search = ``;
        if (options.trainerId) {
            search = ` AND a.trainer_id = ? `;
        }
        connection.query(`SELECT 
    a.*, d.created_date AS sale_date, b.fname AS trainer_fname, b.lname AS trainer_lname, c.fname AS member_fname, c.lname AS member_lname,
    e.start_time, e.end_time, e.week_days
FROM
    membership_logs AS a
    INNER JOIN users AS b ON b.id = a.trainer_id
    INNER JOIN users AS c ON c.id = a.member_id
    INNER JOIN sales AS d ON d.id = a.sale_id
    INNER JOIN brand_location_timing_slots AS e ON e.id = a.slot_id
    WHERE a.location_id = ? AND DATE(expiry_date) > DATE(NOW()) ${search}`, [options.locationId, options.trainerId], (err, schedule) => {
            callback(err, schedule)
        })
    }

    module.DeleteWorkoutExcercise = (options, callback) => {
        connection.query(`UPDATE wo_program_exercise SET is_deleted = 1 WHERE id = ?`, [options.id], (err) => {
            callback(err)
        })
    }

    module.UpdateWorkoutExcercise = (options, callback) => {
        connection.query(`UPDATE wo_program_exercise SET wo_exercise_id = ?, day = ?, sets = ?, repetition = ?, weight = ?, time = ?, distance = ? WHERE id = ?`, [options.woExcerciseId, options.day, options.sets, options.repetition, options.weight, options.time, options.distance, options.id], (err) => {
            callback(err)
        })
    }

    module.GetSingleWOExcercise = (options, callback) => {
        connection.query(`SELECT a.*, DAYNAME(CONCAT("1970-09-2", a.day)) AS day_name, b.name AS excercise_name
            FROM wo_program_exercise AS a
            INNER JOIN
    wo_exercise AS b ON b.id = a.wo_exercise_id  WHERE a.id = ?`, [options.id], (err, excercise) => {
            callback(err, excercise[0])
        })
    }

    module.DeleteWorkoutProgram = (options, callback) => {
        connection.query(`UPDATE wo_program SET is_deleted = 1 WHERE id = ?`, [options.workoutId], (err) => {
            callback(err)
        })
    }

    module.GetTeamSchedule = (options, callback) => {
        connection.query(`SELECT count(*) AS total FROM membership_logs AS a 
            WHERE trainer_id = ? 
            AND (DATE(NOW()) >= a.start_date AND a.expiry_date >= DATE(NOW()))`, [options.userId], (err, schedules) => {
            callback(err, schedules[0].total)
        })   
    }

    module.GetTeamWorkoutPlans = (options, callback) => {
        connection.query(`SELECT count(*) AS total FROM wo_member_schedule AS a
            WHERE trainer_id = ?`, [options.userId], (err, workouts) => {
            callback(err, workouts[0].total)
        })   
    }

    return module;
};

module.exports = Schedule;