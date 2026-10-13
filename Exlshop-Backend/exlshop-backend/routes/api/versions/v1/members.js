const ErrorCodes = require('../../../../errorCodes');
const jwt = require('jsonwebtoken');
let config = require('../../../../config');
const auth = require('../../../auth');
const async = require('async');

module.exports = {
    'get-time-slots': function(model, request, method, cb){
        if (method === 'POST') {
            model.Locations.GetDateWiseTimeSlots(request, (err, timeSlots) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                } else {
                    cb(false, {success: true, timeSlots});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'slot-booking': function(model, request, method, cb){
        if (method === 'POST') {
            model.Locations.BookSlot(request, (err) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                } else {
                    cb(false, {success: true});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'slot-validation': function(model, request, method, cb){
        if (method === 'POST') {
            model.Locations.ValidateSlot(request, (err, slotCount) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                } else {
                    cb(false, {success: true, isAllowed: (slotCount.count)?(1):(0)});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'details': function(model, request, method, cb){
        if (method === 'POST') {
            var userId = request.memberId;
            var locationId = request.locationId;

            model.Members.CheckIfMember({userId}, (err, isMember) => {
                if(err){
                    cb(err)
                }else{
                    if(isMember){
                        async.auto({
                            memberData: (cb1) => {
                                model.Members.GetById({userId}, (err, user) => {
                                    cb1(err ? err : null, user)
                                })
                            },
                            workoutProgram: ['memberData', (result, cb1) => {
                                var workoutId = result.memberData.workout_program_id;
                                if(workoutId){
                                    model.Schedule.GetSingleWorkoutProgramChart({workoutProgramId: workoutId}, (err, workoutData) => {
                                        cb1(err ? err : null, workoutData)
                                    })
                                }else{
                                    cb1(null, null);
                                }
                            }],
                            brand: (cb1)=> {
                                model.Brands.GetByMemberId({userId}, (err, brand) => {
                                    if(err){
                                        cb1(err)
                                    }else{
                                        cb1(null,brand)
                                    }
                                })
                            },
                            memberlocation: (cb1)=> {
                                model.Locations.GetByMemberId({userId}, (err, location) => {
                                    if(err){
                                        cb1(err)
                                    }else{
                                        cb1(null,location)
                                    }
                                })
                            },
                        }, function(err, result){
                            if(err){
                                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                            }else{
                                cb(false, {success: true, 
                                    memberData: result.memberData, 
                                    workoutProgram: result.workoutProgram,
                                    brand: result.brand,
                                    memberlocation: result.memberlocation,
                                    isMember: 1
                                });   
                            }
                        })
                    }else{
                        cb(false, {success:true, isMember: 0, msg:'To explore the gym profile section you need to be any gym member. Also the gym should be using FITBIZ as their prime accessing software'})
                    }
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'profile-details': function(model, request, method, cb){
        if (method === 'POST') {
            var userId = request.memberId;
            var locationId = request.locationId;  
            var detailType = request.detailType;
            
            switch(detailType){
                case 1: async.auto({
                            memberData: (cb1) => {
                                model.Members.GetById({userId}, (err, user) => {
                                    cb1(err ? err : null, user)
                                })
                            },
                            states: (cb1) => {
                                model.Common.GetStates({countryId: 101}, (err, states) => {
                                    cb1(err ? err : null, states)
                                })
                            },
                            cities: ['memberData', (result, cb1) => {
                                model.Common.GetCities({stateId: result.memberData.state_id}, (err, cities) => {
                                    cb1(err ? err : null, cities)
                                })
                            }],
                        },function(err, result){
                            if(err){
                                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                            }else{
                                cb(false, {success: true, 
                                    memberData: result.memberData,
                                    states: result.states,
                                    cities: result.cities
                                });
                            }
                        })
                        break;
                case 2: model.Members.GetBMI({userId, offset: 0, limit: 100}, (err, bmi) => {
                            if(err){
                                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                            }else{
                                cb(false, {success: true, 
                                    bmi
                                });
                            }
                        })
                        break;
                case 3: model.Members.GetMembershipLogByUserId({locationId, userId}, (err, membershipLogs) => {
                            if(err){
                                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                            }else{
                                cb(false, {success: true, membershipLogs});
                            }
                        })
                        break;
                case 4: model.Payments.GetByUserId({userId, locationId}, (err, paymentLogs) => {
                            if(err){
                                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                            }else{
                                cb(false, {success: true, 
                                    paymentLogs
                                });
                            }
                        })
                        break;
                case 5: model.Members.GetAttendanceByUserId({userId, locationId}, (err, attendanceLogs) => {
                            if(err){
                                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                            }else{
                                cb(false, {success: true, 
                                    attendanceLogs
                                });
                            }
                        })
                        break;
                case 6: model.Members.GetEnrollmentDetails({userId}, (err, enrollment) => {
                            if(err){
                                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                            }else{
                                cb(false, {success: true, 
                                    enrollment
                                });
                            }
                        })
                        break;
                default: cb(false, {success: true, err_message:'No Profile Detail Type Selected!' });
            }
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'profile-update': function(model, request, method, cb){
        if (method === 'POST') {
            model.Members.UpdateAllDetails(request, (err, user) => {
                if(err){
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                }else{
                    cb(false, {success: true});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'add-bmi': function(model, request, method, cb){
        if (method === 'POST') {
            const post = request;
            const options = [
                (post.bmiDate)?(post.bmiDate):(null),
                (post.height)?(post.height):(null),
                (post.weight)?(post.weight):(null),
                (post.chest)?(post.chest):(null),
                (post.hips)?(post.hips):(null),
                (post.waist)?(post.waist):(null),
                (post.thighLeft)?(post.thighLeft):(null),
                (post.thighRight)?(post.thighRight):(null),
                (post.calfLeft)?(post.calfLeft):(null),
                (post.calfRight)?(post.calfRight):(null),
                (post.wristLeft)?(post.wristLeft):(null),
                (post.wristRight)?(post.wristRight):(null),
                (post.forearmLeft)?(post.forearmLeft):(null),
                (post.forearmRight)?(post.forearmRight):(null),
                (post.shoulder)?(post.shoulder):(null),
                (post.neckGirth)?(post.neckGirth):(null),
                (post.kneeLeft)?(post.kneeLeft):(null),
                (post.kneeRight)?(post.kneeRight):(null),
                (post.tricepsLeft)?(post.tricepsLeft):(null),
                (post.tricepsRight)?(post.tricepsRight):(null),
                (post.bicepsLeft)?(post.bicepsLeft):(null),
                (post.bicepsRight)?(post.bicepsRight):(null),
                (post.suprailac)?(post.suprailac):(null),
                (post.subscapular)?(post.subscapular):(null),
                (post.thigh)?(post.thigh):(null),
                (post.pectoral)?(post.pectoral):(null),
                (post.abdomen)?(post.abdomen):(null),
                (post.midaxillary)?(post.midaxillary):(null),
                (post.calf)?(post.calf):(null),
                (post.upperBodyLeft)?(post.upperBodyLeft):(null),
                (post.upperBodyRight)?(post.upperBodyRight):(null),
                (post.lowerBodyLeft)?(post.lowerBodyLeft):(null),
                (post.lowerBodyRight)?(post.lowerBodyRight):(null),
                (post.VO2max)?(post.VO2max):(null),
                (post.duration)?(post.duration):(null),
                (post.selfAppraisal)?(post.selfAppraisal):(null),
                (post.benchPress)?(post.benchPress):(null),
                (post.squat)?(post.squat):(null),
                (post.notes)?(post.notes):(null),
                (post.userId)?(post.userId):(null)
            ]

            model.Members.AddBMI(options, (err) => {
                if (err) {
                    (true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                }else{
                    cb(false, {success: true});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'feedback-list': function(model, request, method, cb){
        if (method === 'POST') {
            model.Members.GetFeedback(request, (err, feedback) => {
                if(err){
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                }else{
                    cb(false, {success: true, feedback});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'feedback-employee-list': function(model, request, method, cb){
        if (method === 'POST') {
            model.Members.GetBrandUsersForFeedback(request, (err, users) => {
                if(err){
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                }else{
                    cb(false, {success: true, users});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'add-feedback': function(model, request, method, cb){
        if (method === 'POST') {
            model.Members.AddFeedback(request, (err) => {
                if(err){
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                }else{
                    cb(false, {success: true});
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    } 
}