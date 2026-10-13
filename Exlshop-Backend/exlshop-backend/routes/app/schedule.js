/********************************************************/
/***** App dashboard Routes *****/
/********************************************************/
const _ = require('lodash');
const auth = require('../auth');
const express = require('express');
const router = express.Router();

router.get('/personal-training', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id

    models.Schedule.GetPersonalTraining({locationId}, (err, schedule) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Team.GetTrainers({locationId: req.session.user.currentLocation.id}, (err, trainers) => {
                if (err) {
                    res.redirect('/404')
                }else{
                    models.Locations.GetById({locationId}, (err, location) => {
                        if (err) {
                            res.redirect('/404')
                        } else {
                            res.render('app/schedule', {
                                title: 'FitBiz | Schedule',
                                fw: true,
                                menuActive: 'schedule',
                                submenuActive: 'pt',
                                schedule,
                                trainers,
                                location,
                                scripts: ['/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/fullcalendar/fullcalendar.min.js', '/global/vendor/select2/select2.min.js', '/js/app/dashboard.js', '/js/app/schedule.js'],
                                styles: ['/css/calendar.min.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css', '/global/vendor/select2/select2.min.css', '/global/vendor/fullcalendar/fullcalendar.min.css']
                            })   
                        }
                    })
                }
            })
        }
    })
});

router.get('/workout-program', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const models = req.Core.Models;

    models.Common.GetAgeGroup(null, (err, ageGroups) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('app/workout-program', {
                title: 'FitBiz | Schedule',
                fw: false,
                ageGroups,
                menuActive: 'schedule',
                submenuActive: 'workout',
                scripts: ['/global/vendor/select2/select2.js', '/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/app/workout-program.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/select2/select2.css']
            })
        }
    })
});

router.post('/workout-program/view-all', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['program_name','workout_level_name','fitness_goal_name','age_group_label','a.gender'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;

    models.Schedule.GetAllWorkoutPrograms({locationId: req.session.user.currentLocation.id, offset, limit, search, orderByColumn, orderByValue}, (err, programs) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: programs.total, recordsFiltered: programs.total, data: programs.programs})
        }
    })
});

router.post('/add/workout-program', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const locationId = req.session.user.currentLocation.id
    const models = req.Core.Models;

    const options = {
        locationId,
        programName: post.programName,
        workoutLevelId: post.workoutLevelId,
        fitnessGoalId: post.fitnessGoalId,
        ageGroupId: post.ageGroupId,
        gender: post.gender
    }

    models.Schedule.AddWorkoutProgram(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.get('/workout-program/:id', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const workoutId = req.params.id;
    const locationId = req.session.user.currentLocation.id
    const models = req.Core.Models;

    models.Schedule.GetSingleWorkoutProgramData({locationId, workoutId}, (err, workoutData) => {
        if (err) {
            res.redirect('/404')
        } else {
            models.Schedule.GetSingleWorkoutProgramChart({workoutProgramId: workoutId}, (err, chart) => {
                if (err) {
                    res.redirect('/404')
                } else {
                    res.render('app/single-workout-program', {
                        title: 'FitBiz | Workout Program',
                        fw: false,
                        workoutData,
                        chart: _.groupBy(chart, 'day_name'),
                        scripts: ['/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/fullcalendar/fullcalendar.min.js', '/global/vendor/select2/select2.min.js', '/js/app/dashboard.js', '/js/app/single-workout-program.js', '/global/vendor/toastr/toastr.min.js'],
                        styles: ['/css/calendar.min.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css', '/global/vendor/select2/select2.min.css', '/global/vendor/fullcalendar/fullcalendar.min.css','/global/vendor/toastr/toastr.min.css']
                    })
                }
            })
        }
    })
});

router.post('/add/workout-exercise', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const locationId = req.session.user.currentLocation.id
    const models = req.Core.Models;

    const options = {
        locationId,
        workoutProgramId: post.workoutProgramId,
        exerciseId: post.exerciseId,
        days: post.days.split(','),
        sets: post.sets,
        repetition: post.repetition,
        weight: post.weight,
        time: post.time,
        distance: post.distance
    }

    models.Schedule.AddWorkoutExercise(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/get-trainer-slots', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const locationId = req.session.user.currentLocation.id
    const models = req.Core.Models;

    models.Schedule.GetPersonalTraining({trainerId: post.trainerId, locationId}, (err, schedule) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, schedule: schedule})
        }
    })
});

router.post('/delete-workout-excercise', auth.checkPermission(['brand-admin', 'manager', 'trainer']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    models.Schedule.DeleteWorkoutExcercise({id: post.delete_wo_excercise_id}, (err) => {
        if (err) {
            res.redirect('/404');
        } else {
            res.redirect('back');
        }
    })
});

router.post('/update-workout-excercise', auth.checkPermission(['brand-admin', 'manager', 'trainer']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        id: post.update_wo_excercise_id,
        woExcerciseId: post.update_exercise_id,
        day: post.update_days,
        sets: post.update_sets,
        repetition: post.update_repetition,
        weight:post.update_weight,
        time: post.update_time,
        distance: post.update_distance
    }
    models.Schedule.UpdateWorkoutExcercise(options, (err) => {
        if (err) {
            res.redirect('/404');
        } else {
            res.redirect('back');
        }
    })
});

router.post('/get-single-wo-excercise', auth.checkPermission(['brand-admin', 'manager', 'trainer']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        id: post.id
    }

    models.Schedule.GetSingleWOExcercise(options, (err, excercise) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, excercise: excercise});
        }
    })
});

router.post('/workout-program/delete', auth.checkPermission(['brand-admin', 'manager', 'trainer']), (req, res) => {
    const workoutId = req.body.workout_id;
    const models = req.Core.Models;

    models.Schedule.DeleteWorkoutProgram({workoutId}, (err) => {
        if (err) {
            res.redirect('/404');
        } else {
            res.redirect('/app/schedule/workout-program');
        }
    })
});
module.exports = router;