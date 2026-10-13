/********************************************************/
/***** App dashboard Routes *****/
/********************************************************/
const async = require('async');
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const http = require('http');
const AWS = require('aws-sdk');
const { constants } = require('crypto');
const { result } = require('lodash');

router.get('/', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;

    async.auto({
        locationInfo: (callback) => {
            models.Locations.GetById({locationId}, (err, location) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, location)
                }
            })
        },
        states: (callback) => {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, states)
                }
            })
        },
        cities: ['locationInfo', (result, callback) => {
                models.Common.GetCities({stateId: result.locationInfo.state_id}, (err, states) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, states)
                    }
                })
            }],
        roles: (callback) => {
            models.Users.GetRoles({all: false}, (err, roles) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, roles)
                }
            })
        },        
        taxes: (callback) => {
            models.Locations.GetLocationTax({locationId}, (err, taxes) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, taxes)
                }
            })
        },
        bankDetails : (callback) => {
            models.Locations.GetBankDetails({locationId}, (err, bankDetails) => {
                if(err) {
                    callback(err)
                } else {
                    callback(null, bankDetails)
                }
            })
        },
        paymentMethods: (callback) => {
            models.Payments.GetMethods(null, (err, methods) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, methods)
                }
            })
        },
        workoutLevels: (callback) => {
            models.Locations.GetWorkoutLevels({locationId}, (err, workoutLevels) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, workoutLevels)
                }
            })
        },
        fitnessGoals: (callback) => {
            models.Locations.GetFitnessGoals({locationId}, (err, fitnessGoals) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, fitnessGoals)
                }
            })
        },
        exerciseTypes: (callback) => {
            models.Locations.GetExerciseType({locationId}, (err, exerciseTypes) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, exerciseTypes)
                }
            })
        },
        muscleTargets: (callback) => {
            models.Locations.GetMuscleTarget({locationId}, (err, muscleTargets) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, muscleTargets)
                }
            })
        },
        sources: (callback) => {
            models.Leads.GetSources({locationId}, (err, sources) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, sources)
                }
            })
        },
        statuses: (callback) => {
            models.Leads.GetStatuses({locationId}, (err, statuses) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, statuses)
                }
            })
        },
        departments: (callback) => {
            models.Locations.GetDepartments({locationId}, (err, departments) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, departments)
                }
            })
        },
        designations: (callback) => {
            models.Locations.GetDesignation({locationId}, (err, designations) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, designations)
                }
            })
        },
        uploadedDocuments: (callback) => {
            models.Locations.getDocuments({locationId}, (err, documents) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, documents)
                }
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('app/settings', {
                title: 'Exlshop - Settings',
                fw: false,
                menuActive: 'settings',
                submenuActive: '',
                locationInfo: result.locationInfo,
                states: result.states,
                cities: result.cities,
                roles: result.roles,
                team: result.team,
                taxes: result.taxes,
                bankDetails: result.bankDetails,
                paymentMethods: result.paymentMethods,
                workoutLevels: result.workoutLevels,
                fitnessGoals: result.fitnessGoals,
                exerciseTypes: result.exerciseTypes,
                muscleTargets: result.muscleTargets,
                sources: result.sources,
                statuses: result.statuses,
                departments: result.departments,
                designations: result.designations,
                documents: result.uploadedDocuments,
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css', '/global/vendor/select2/select2.css','/global/vendor/toastr/toastr.min.css'],
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/select2/select2.js', '/js/app/settings.js', '/global/vendor/toastr/toastr.min.js']
            });
        }
    })
})

router.post('/add-tax', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const options = {
        locationId,
        label: post.label,
        rate: post.rate
    }

    models.Locations.AddTax(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later');
        } else {
            req.flash('success', 'Tax rate added successfully!');
        }
        res.redirect('back');
    })

});

router.post('/add/exercise-type', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        exerciseType: post.exerciseType
    }

    models.Locations.AddExerciseType(options, (err,id) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true,id: id})
        }
    })
});

router.post('/search/exercise-type', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        exerciseType: post.exerciseType
    }

    models.Locations.SearchExerciseType(options, (err, exerciseTypes) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, exerciseTypes})
        }
    })
});

router.post('/add/equipment', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        equipmentName: post.equipmentName,
        category: post.category
    }

    models.Locations.AddEquipment(options, (err,id) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, id:id})
        }
    })
});

router.post('/add/lead-status', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        status: post.status
    }

    models.Locations.AddLeadStatus(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/add/lead-source', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        source: post.source
    }

    models.Locations.AddLeadSource(options, (err,id) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true,id: id})
        }
    })
});

router.post('/add/department', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        department: post.department
    }

    models.Locations.AddDepartment(options, (err,id) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true,id: id})
        }
    })
});

router.post('/add/designation', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        designation: post.designation
    }

    models.Locations.AddDesignation(options, (err,id) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true,id: id})
        }
    })
});

router.post('/search/equipment', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        equipmentName: post.equipmentName
    }

    models.Locations.SearchEquipment(options, (err, equipments) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, equipments})
        }
    })
});

router.post('/add/exercise', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        exerciseText: post.exerciseName,
        exercuseTypeId: post.exerciseType,
        muscleTargetId: post.muscleType,
        equipmentId: post.equipment
    }

    models.Locations.AddExercise(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/get/exercise', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const orderByArr = ['a.name','b.name','c.name','d.name'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const search = req.body.search.value;

    const options = {
        locationId,
        offset,
        limit,
        orderByColumn,
        orderByValue,
        search
    }

    models.Locations.GetExercise(options, (err, exercises) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: exercises.total, recordsFiltered: exercises.total, data: exercises.exercises})
        }
    })
});

router.post('/search/exercise', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        exercise: post.exercise
    }

    models.Locations.SearchExercise(options, (err, exercises) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, exercises})
        }
    })
});

router.post('/search/workout', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        workoutText: post.workoutText
    }

    models.Locations.SearchWorkout(options, (err, workouts) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, workouts})
        }
    })
});

router.post('/add/muscle-target', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        muscleTarget: post.muscleTarget
    }

    models.Locations.AddMuscleTarget(options, (err,id) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true,id:id})
        }
    })
});

router.post('/search/muscle-target', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        muscleTarget: post.muscleTarget
    }

    models.Locations.SearchMuscleTarget(options, (err, muscleTargets) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, muscleTargets})
        }
    })
});

router.post('/add/intensity', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        intensity: post.intensity
    }

    models.Locations.AddIntensity(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/search/intensity', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        intensity: post.intensity
    }

    models.Locations.SearchIntensity(options, (err, intensities) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, intensities})
        }
    })
});

router.post('/add/weight', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        weight: post.weight
    }

    models.Locations.AddWeight(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/search/weight', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        weight: post.weight
    }

    models.Locations.SearchWeight(options, (err, weights) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, weights})
        }
    })
});

router.post('/add/workout-level', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        workoutLevel: post.workoutLevel
    }

    models.Locations.AddWorkoutLevel(options, (err,id) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, id:id})
        }
    })
});

router.post('/search/workout-level', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        workoutLevels: post.workoutLevels
    }

    models.Locations.SearchWorkoutLevels(options, (err, levels) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, levels})
        }
    })
});

router.post('/add/fitness-goals', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        fitnessGoals: post.fitnessGoals
    }

    models.Locations.AddFitnessGoals(options, (err,id) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, id: id})
        }
    })
});

router.post('/search/fitness-goals', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        fitnessGoals: post.fitnessGoals
    }

    models.Locations.SearchFitnessGoals(options, (err, fitnessGoals) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, fitnessGoals})
        }
    })
});

router.post('/update', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        name: post.name,
        address1: post.address_line_1,
        address2: post.address_line_2,
        cityId: post.city_id,
        stateId: post.state_id,
        zip: post.zip,
        phone: post.phone,
        email: post.email,
        gstin: post.gstin,
        invoiceFooterNotes: post.footer_notes.replace(/(?:\r\n|\r|\n)/g, '<br />'),
        locationId,
        startTime: post.operating_hour_start,
        endTime: post.operating_hour_end,
        lat:post.lat,
        lng:post.lng
    }

    models.Locations.UpdateGeneralFields(options, (err) => {
        if (err) {
            console.log(err)
        }
        res.redirect('back')
    })
})

router.post('/addBank', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        name: post.accName,
        bankName: post.bankName,
        accNo: post.accNumber,
        ifscCode: post.ifscCode,
        branchName: post.branchName,
        locationId,
        userId
    }

    models.Locations.AddBankDetails(options, (err) => {
        if (err) {
            console.log(err)
        }
        res.redirect('back')
    })
})

router.post('/updateBank', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        name: post.accName,
        bankName: post.bankName,
        accNo: post.accNumber,
        ifscCode: post.ifscCode,
        branchName: post.branchName,
        locationId,
        userId
    }

    models.Locations.UpdateBankDetails(options, (err) => {
        if (err) {
            console.log(err)
        }
        res.redirect('back')
    })
})

router.post('/deleteBankDetails', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        bankDetailsId : parseInt(post.bankDetails_id)
    }

    models.Locations.DeleteBankDetails(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later');
        } else {
            req.flash('success', 'Bank Details Deleted successfully!');
        }
        res.redirect('back');
    })

});

router.post('/delete-tax', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        taxId : post.tax_id
    }

    models.Locations.DeleteTax(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later');
        } else {
            req.flash('success', 'Tax Rate Deleted successfully!');
        }
        res.redirect('back');
    })

});

router.post('/update-tax', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        taxId : post.tax_id,
        label: post.label,
        rate: post.rate
    }

    models.Locations.UpdateTax(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later');
        } else {
            req.flash('success', 'Tax rate Updated successfully!');
        }
        res.redirect('back');
    })
});

router.post('/update-payment-method', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const options = {
        col: 'payment_methods',
        value: post.payment_methods.join(),
        locationId
    }

    models.Locations.Update(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later');
        } else {
            req.flash('success', 'Payment Method Updated successfully!');
        }
        res.redirect('back');
    })
});

router.post('/update/designation', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        designation: post.designation,
        id: post.id
    }

    models.Locations.UpdateDesignation(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/update/department', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        department: post.department,
        id: post.id
    }

    models.Locations.UpdateDepartment(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/update/lead/source', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        leadSource: post.leadSource,
        id: post.id
    }

    models.Locations.UpdateLeadSource(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/update/lead/status', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id:post.id,
        leadStatus: post.leadStatus
    }

    models.Locations.UpdateLeadStatus(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/update/equipment', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id,
        equipmentName: post.equipmentName,
        category: post.category
    }
    models.Locations.UpdateEquipment(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/update/muscle-target', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id,
        muscleTarget: post.muscleTarget
    }

    models.Locations.UpdateMuscleTarget(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/update/fitness-goals', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id,
        fitnessGoals: post.fitnessGoals
    }

    models.Locations.UpdateFitnessGoals(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/update/workout-level', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id,
        workoutLevel: post.workoutLevel
    }

    models.Locations.UpdateWorkoutLevel(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/update/exercise-type', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id,
        exerciseType: post.exerciseType
    }

    models.Locations.UpdateExerciseType(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.post('/get-single-exercise', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id
    }

    models.Locations.GetSingleExercise(options, (err, exercise) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true,exercise: exercise})
        }
    })
});

router.post('/update/exercise', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id,
        exerciseText: post.exerciseName,
        exercuseTypeId: post.exerciseType,
        muscleTargetId: post.muscleTarget,
        equipmentId: post.equipment
    }

    models.Locations.UpdateExercise(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});


router.post('/add/vendor', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        vendorName: post.vendorName,
        vendorGST: post.vendorGST,
        locationId
    }

    models.Locations.AddVendor(options, (err,id) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true,vendorId: id})
        }
    })
});

router.post('/search/vendor', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    const options = {
        locationId,
        vendorName: post.vendorName
    }

    models.Locations.SearchVendor(options, (err, vendors) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, vendors})
        }
    })
});

router.post('/get/vendors', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const orderByArr = ['vendor.vendor_name','vendor.vendor_gst'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const search = req.body.search.value;

    const options = {
        locationId,
        offset,
        limit,
        orderByColumn,
        orderByValue,
        search
    }

    models.Locations.GetVendors(options, (err, vendors) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: vendors.total, recordsFiltered: vendors.total, data: vendors.vendors})
        }
    })
});

router.post('/get-single-vendor', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id
    }

    models.Locations.GetSingleVendor(options, (err, vendor) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true,vendor: vendor})
        }
    })
});

router.post('/update/vendor', auth.checkPermission(['brand-admin', 'manager', 'trainer', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id,
        vendorName: post.vendorName,
        vendorGST: post.vendorGST
    }

    models.Locations.UpdateVendor(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
});

router.get('/email-sms', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const options = {
        locationId: req.session.user.currentLocation.id
    }

    async.auto({
        smsTemplates : (cb) => {
            models.SmsEmail.GetSMSTemplates(options, (err, smsTemplates) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, smsTemplates);
                }
            })
        },
        emailTemplates : (cb) => {
            models.SmsEmail.GetEmailTemplates(options, (err, emailTemplates) => {
                if (err) {
                    cb(err);
                } else {
                    cb(null, emailTemplates);
                }
            })
        }
    }, function(err, result){
        if(err){
            res.redirect('/404');
        }else{
            res.render('app/email-sms-setting', {
                title: 'FitBiz - Settings',
                fw: true,
                menuActive: 'settings',
                submenuActive: '',
                smsTemplates: result.smsTemplates,
                emailTemplates: result.emailTemplates,
                scripts: ['/js/app/sms-setting.js','/global/vendor/select2/select2.js','/global/vendor/summernote/summernote.min.js','/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js','/global/vendor/switchery/switchery.js','/global/vendor/toastr/toastr.min.js'],
                styles: ['/global/vendor/select2/select2.css','/global/vendor/toastr/toastr.min.css','/global/vendor/summernote/summernote.min.css','/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/switchery/switchery.css']
           });
        }
    })
})

router.post('/send-sms', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const filter = post.filter;
    const locationId = req.session.user.currentLocation.id;
    const loginId=req.smsConfig.loginId;
    const password=req.smsConfig.password;
    const message=req.body.message;

    async.map(post.memberArray, (m, cb1) => {
        var phoneNo=m.phone;
        var url = 'http://198.15.103.106/API/pushsms.aspx?loginID='+loginId+'&password='+password+'&mobile='+phoneNo+'&text='+message+'&senderid=SHRIND&route_id=1&Unicode=0';
        http.get(url, (resp) => {
            models.SmsEmail.StoreSMS({locationId, sendToMember: post.send_to_member, sendToLeads: post.send_to_enquiry, message, phoneNo, memberId: m.id }, (err) => {
                cb1(err ? err : null)
            })
        }).on("error", (err) => {
            cb1(err);
        });
    }, (err, result) => {
       if(err){
            res.send({success: false});
       }else{
            res.send({success: true});
       }
    })
})

router.post('/get-plan-members', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const filter = post.filter;
    const locationId = req.session.user.currentLocation.id;

    models.Members.GetSMSPlanMembers({filter, locationId, sendToMember: post.send_to_member, sendToLeads: post.send_to_enquiry}, (err, members) => {
        if (err) {
            res.send({success : false})
        } else {
            res.send({success: true, members: members})
        }
    })
})

router.post('/send-email', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const filter = post.filter;
    const locationId = req.session.user.currentLocation.id;

    var message=post.message;
    const SESConfig = {
                apiVersion:req.awsSESConfig.apiVersion,
                accessKeyId:req.awsSESConfig.accessKeyId,
                secretAccessKey:req.awsSESConfig.secretAccessKey,
                region:req.awsSESConfig.region
            };
    async.map(post.memberArray, (m, cb1) => {
        //aws ses code
        var params = {
            Source:'sidhi.volvoiker@tapsoft.in',
            Destination:{
                ToAddresses:[
                    m.email
                ]
            },
            ReplyToAddresses:[
                'sidhi.volvoiker@tapsoft.in'
            ],
            Message:{
                Body:{
                    Html:{
                    Charset:"UTF-8",
                    Data:message
                  }
                },
                Subject:{
                    Charset:'UTF-8',
                    Data:'FitBiz'
                }
            }
        };
        new AWS.SES(SESConfig).sendEmail(params,function(err, data) {
            if (err) {
                cb1(err);
            }else{
                models.SmsEmail.StoreEmail({locationId, sendToMember: post.send_to_member, sendToLeads: post.send_to_enquiry, message, email: m.email, memberId: m.id }, (err) => {
                    cb1(err ? err : null)
                })
            }          
        })
    }, (err, result) => {
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true})
        }
    })
})

router.post('/outstanding', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        locationId : req.session.user.currentLocation.id
    }
    models.Members.GetOutsanding(options, (err, members) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: false, members})
        }
    })
})

router.post('/renewal', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        locationId : req.session.user.currentLocation.id,
        renewalType: post.renewalType
    }
    models.Members.GetRenewal(options, (err, members) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, members})
        }
    })
})

router.post('/sms', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const orderByArr = ['member_name','phone','message','created_date'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const search = req.body.search.value;

    const options = {
        locationId,
        offset,
        limit,
        orderByColumn,
        orderByValue,
        search
    }
    models.SmsEmail.GetLocationBasedSms(options, (err, sms) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: sms.total, recordsFiltered: sms.total, data: sms.sms})
        }
    })
})

router.post('/email', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const orderByArr = ['member_name','email','message','created_date'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const search = req.body.search.value;

    const options = {
        locationId,
        offset,
        limit,
        orderByColumn,
        orderByValue,
        search
    }
    models.SmsEmail.GetLocationBasedEmail(options, (err, email) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: email.total, recordsFiltered: email.total, data: email.email})
        }
    })
})

router.post('/update-sms-setting', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    async.map(post.sms_settings, (s, cb1) => {
        models.SmsEmail.UpdateSMSSettings({templateId: s.template_id, message: s.message, isActive: s.is_active, locationId}, (err) => {
            if (err) {
                cb1(err);
            } else {
                cb1(null);
            }
        })
    }, (err, result) => {
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true})
        }
    })
})

router.post('/update-email-setting', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    
    async.map(post.email_settings, (s, cb1) => {
        models.SmsEmail.UpdateEmailSettings({templateId: s.template_id, message: s.message, isActive: s.is_active, locationId}, (err) => {
            if (err) {
                cb1(err);
            } else {
                cb1(null);
            }
        })
    }, (err, result) => {
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true})
        }
    })
})

router.post('/add-sms-settings', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        pageName: post.page_name,
        text: post.sms_template,
        variableNames: post.sms_variable_names,
        locationId: req.session.user.currentLocation.id
    }

    models.SmsEmail.AddSMSTemplate(options, (err) => {
        if (err) {
            res.redirect('/404');
        } else {
            res.redirect('back');
        }
    })
})

router.post('/add-email-settings', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        pageName: post.page_name,
        text: post.email_template,
        variableNames: post.email_variable_names,
        locationId: req.session.user.currentLocation.id
    }

    models.SmsEmail.AddEmailTemplate(options, (err) => {
        if (err) {
            res.redirect('/404');
        } else {
            res.redirect('back');
        }
    })
})

router.post('/add-time-slot', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        startTime: post.startTime,
        endTime: post.endTime,
        weekDays: post.weekDays,
        locationId: req.session.user.currentLocation.id
    }

    models.Locations.AddTimeSlot(options, (err, vendors) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/time-slots', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id
    const offset = req.body.start;
    const limit = req.body.length;
    const orderByArr = ['a.start_time','b.end_time','a.start_time','a.week_days'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const search = req.body.search.value;

    const options = {
        locationId,
        offset,
        limit,
        orderByColumn,
        orderByValue,
        search
    }
    models.Locations.GetTimeSlots(options, (err,timeSlots ) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: timeSlots.total, recordsFiltered: timeSlots.total, data: timeSlots.timeSlots});
        }
    })
})

router.post('/add/shift', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id

    const options = {
        locationId,
        name: post.name,
        startTime: post.startTime,
        endTime: post.endTime
    }
    models.Locations.AddShift(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true});
        }
    })
})

router.post('/get/shifts', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id
    const offset = req.body.start;
    const limit = req.body.length;
    const orderByArr = ['a.shift_name','a.start_time','a.end_time'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const search = req.body.search.value;

    const options = {
        locationId,
        offset,
        limit,
        orderByColumn,
        orderByValue,
        search
    }
    models.Locations.GetShifts(options, (err,shifts ) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: shifts.total, recordsFiltered: shifts.total, data: shifts.shifts});
        }
    })
})

router.post('/single/shift', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id

    const options = {
        shiftId: post.shiftId
    }
    models.Locations.GetSingleShift(options, (err, shift) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, shift: shift});
        }
    })
})

router.post('/update/shift', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        id: post.id,
        name: post.name,
        startTime: post.startTime,
        endTime: post.endTime
    }
    models.Locations.UpdateShift(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true});
        }
    })
})

router.post('/get/equipments', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id
    const offset = req.body.start;
    const limit = req.body.length;
    const orderByArr = ['a.name','a.type'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const search = req.body.search.value;

    const options = {
        locationId,
        offset,
        limit,
        orderByColumn,
        orderByValue,
        search
    }
    models.Locations.GetEquipments(options, (err,equipments ) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: equipments.total, recordsFiltered: equipments.total, data: equipments.equipments});
        }
    })
})

router.post('/delete-master-setting', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const id = post.id;
    const type = post.type;
    
    if(type == 'exercise-master'){
        models.Locations.DeleteExerciseMaster({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'exercise-type'){
        models.Locations.DeleteExerciseType({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'target-muscle'){
        models.Locations.DeleteTargetMuscle({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'equipment'){
        models.Locations.DeleteEquipment({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'exercise-level'){
        models.Locations.DeleteExerciseLevel({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'fitness-goal'){
        models.Locations.DeleteFitnessGoal({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'lead-status'){
        models.Locations.DeleteLeadStatus({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'lead-source'){
        models.Locations.DeleteLeadSource({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'department'){
        models.Locations.DeleteDepartment({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'designation'){
        models.Locations.DeleteDesignation({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'vendor'){
        models.Locations.DeleteVendor({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'time-slots'){
        models.Locations.DeleteTimingSlot({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else if(type == 'shifts'){
        models.Locations.DeleteShift({id}, (err) => {
            if (err) {
                res.send({success: false})
            } else {
                res.send({success: true});
            }
        })
    }else{
        res.send({success: true});
    }
    
})
router.post('/delete-logo',(req,res)=>{
    var location_id = req.body.location_id;
    const models = req.Core.Models;
    models.Brands.DeleteBrandLogo({location_id}, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true});
        }
    })
})

router.post('/update-brand-logo', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const files = req.files;
    const location_id = post.location_id;
    const filename = files.brand_logo.name;
    const brand_logo = files.brand_logo;
    var imgDir = `${require('path').resolve()}/public/images/${filename}`;
    brand_logo.mv(imgDir, (err,callback) => {
            if (err) {
                callback(err)
            } else {
                models.Brands.UpdateBrandLogo({location_id, filename}, (err) => {
                    if (err) {
                       return false;
                    } else {
                        return res.redirect('back');
                    }
                })
            }
        })

})

router.post('/add-documents', auth.checkPermission(['brand-admin', 'manager']), (req, res) =>{
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    console.log(req.files)

    var files = req.files;
    var imgArr = []
    imgArr.push(files.pan_file, files.gst_file)

    async.map(imgArr, (i, callback) =>{
        var filename = `${moment().unix()}-${i.name}`;
        var imgDir = `${require('path').resolve()}/public/documents/${filename}`;
        i.mv(imgDir, (err) => {
            if (err) {
                callback(err)
            } else {
                callback(null, {fileName: filename })
            }
        })
    }, (err, result) =>{
        if(err){
            res.send({ success: false })
        }else{
            models.Users.AddUserDocuments({userId, locationId, images:result}, (err, data) => {
                if(err){
                    res.redirect('/404')
                }else{
                    res.redirect("back")
                }
            })
        }
    })
})

router.post('/edit-documents', auth.checkPermission(['brand-admin', 'manager']), (req,res) =>{
    const models = req.Core.Models;
    const userId = req.session.user.id;
    const locationId = req.session.user.currentLocation.id;
    const rowId = req.body.document_id
    const File = req.files
    models.Users.UpdateUserDocuments({userId, File, locationId, rowId}, (err, data) =>{
        if(err){
            res.redirect('/404')
        }else{
            res.redirect("back")
        }
    })
})


router.post('/delete-documents', auth.checkPermission(['brand-admin', 'manager']), (req,res) =>{
    const models = req.Core.Models;
    console.log(req.body)
    models.Users.DeleteDocuments(req.body, (err, data) =>{
        if(err){
            res.redirect('/404')
        }else{
            res.redirect("back")
        }
    })
})

module.exports = router;