const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');

module.exports = {
    // 'login': function (model, request, method, cb) {
    //     if (method === 'POST') {
    //         const {email, password} = request;

    //         model.Users.Login({email, password}, (err, user) => {
    //             if (err) {
    //                 cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
    //             } else {
    //                 model.Users.GetAssignedLocations({userId: user.id}, (err, locations) => {
    //                     if (err) {
    //                         cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
    //                     } else {
    //                         cb(false, {success: true, locations, user})
    //                     }
    //                 })
    //             }
    //         })
    //     } else {
    //         cb(true, {error: ErrorCodes[002], code: '002'})
    //     }
    // },
 
  
    'login': function (model, request, method, cb) {
        if (method === 'POST') {
            const {phoneNo} = request;

            model.Users.VerifyUserPhone({phoneNo}, (err, user) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                } else {
                    cb(false, {success: true, userPresent :user ? 1 : 0, userDetails: user})
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },

    'get-user-locations': function (model, request, method, cb) {
        if (method === 'POST') {
            const {userId} = request;

            model.Users.GetAssignedLocations({userId}, (err, locations) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                } else {
                    cb(false, {success: true, locations})
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },

    'get-all-employees': function (model, request, method, cb) {
        if (method === 'POST') {
            const locationId = request.locationId;

            model.Users.GetBrandUsers1({locationId}, (err, users) => {
                if (err) {
                    cb(true, {success: false, error: err})
                } else {
                    cb(false, {success: true, employees: users.users})
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },

    'profile' : function (model, request, method, cb) {
    
        if (method == 'POST') {
            const userId = request.userId;
            model.Users.getUserProfile({userId},(err, profile)=>{
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, { success: true, profile: profile });
                }
            })
        }

    },

    'getsingle': function(model,req,method,cb){
        if(method=="POST"){
            var userId=req.userId;
            model.Users.GetSingle({userId}, (err,users) => {
                if (err) {
                    cb(true, { success: false, error: err.error, code: err.code, errorMessages: err.errorMessages });
                } else {
                    cb(false, { success:true, user:users});
                }
            })
        }
    },

    'get-employee-details': function (model, request, method, cb) {
        if (method === 'POST') {
            const userId = request.userId;
            const locationId = request.locationId;
            async.auto({
                userData: (cb1) => {
                    model.Users.GetSingle({userId}, (err, user) => {
                        cb1(err ? err : null, user)
                    })
                },
                roles: (cb1) => {
                    model.Users.GetRoles({all: false}, (err, roles) => {
                        cb1(err ? err : null, roles)
                    })
                },
                attendanceLogs: ['userData', (result, cb1) => {
                    model.Members.GetAttendanceByUserId({userId, locationId}, (err, attendanceLogs) => {
                        cb1(err ? err : null, attendanceLogs)
                    })
                }],
                feedbacks: (cb1) => {
                    model.Members.GetFeedback({userId}, (err, feedbacks) => {
                        cb1(err ? err : null, feedbacks);
                    })
                },
            }, (err, result) => {
                if (err) {
                    cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages})
                } else {
                    cb(false, {success:true ,
                        userData: result.userData,
                        attendanceLogs: result.attendanceLogs,
                        feedbacks: result.feedbacks
                    })
                }
            })
        } else {
            cb(true, {error: ErrorCodes[002], code: '002'})
        }
    },
    'getallroles': function(model, req, method, cb){
        if(method === "GET"){
            model.Common.GetRoles((err, roles) =>{
                if(err){
                    cb(err)
                }else{
                    cb(false, {success:true, roles})
                }
            })
        }
    },

    'sendPromotionNotification' : function(model, req, method, cb){
        if(method === "POST"){
            const options = {
                locationId: req.locationId,
                senderId: req.userId,
            }
            console.log("rrrrrrrrrrrrrrrrr",req)
            console.log(req.files.PromotionImage)
            var File = req.files.PromotionImage
            var file =   req.files.PromotionImage.name
            File.mv('./public/upload/' + file + '.jpg')
            model.Users.addBrandPromotionImage({options, file},(err, data) =>{
                if(err){
                    cb(err)
                }else{
                    var image = '/upload/' + file + '.jpg'
                    model.Users.getLocationCustomer({options, image}, (err, data) =>{
                        if(err){
                            console.log(err)
                            cb(err)
                        }else{
                            cb(false, {success:true, data})
                        }
                    })
                }
            })
           
        }
    },

   
}
