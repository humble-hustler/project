const ErrorCodes = require('../../../../errorCodes');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const { response } = require('express');
const { options } = require('../..');

module.exports = {
    'myproduct': function (model, request, method, cb) {
        if (method === 'GET') {
        model.ShopProducts.GetProducts1({all:true},(err,products1) =>{
            if (err) {
                cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
            } else {
                cb(false, {success:true, products1:products1});
            }
        })
    } else {
        cb(true, {error: ErrorCodes[002], code: '002'})
    }
   },
   'myproduct1': function (model, request, method, cb) {
    if (method === 'POST') {
    model.ShopProducts.GetProducts1({all:true},(err,products1) =>{
        if (err) {
            cb(true, {success: false, error: err.error, code: err.code, errorMessages: err.errorMessages});
        } else {
            cb(false, {success: true});
        }
    })
} else {
    cb(true, {error: ErrorCodes[002], code: '002'})
}
},

'settings': function(model, req, method, cb){
    if(method === "POST"){
        const locationId = req.locationId

        async.auto({
            locationInfo: (callback) => {
                model.Locations.GetById({locationId}, (err, location) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, location)
                    }
                })
            },
            states: (callback) => {
                model.Common.GetStates({countryId: 101}, (err, states) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, states)
                    }
                })
            },
            cities: ['locationInfo', (result, callback) => {
                    model.Common.GetCities({stateId: result.locationInfo.state_id}, (err, states) => {
                        if (err) {
                            callback(err)
                        } else {
                            callback(null, states)
                        }
                    })
                }],
            roles: (callback) => {
                model.Users.GetRoles({all: false}, (err, roles) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, roles)
                    }
                })
            },        
            taxes: (callback) => {
                model.Locations.GetLocationTax({locationId}, (err, taxes) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, taxes)
                    }
                })
            },
            bankDetails : (callback) => {
                model.Locations.GetBankDetails({locationId}, (err, bankDetails) => {
                    if(err) {
                        callback(err)
                    } else {
                        callback(null, bankDetails)
                    }
                })
            },
            paymentMethods: (callback) => {
                model.Payments.GetMethods(null, (err, methods) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, methods)
                    }
                })
            },
            workoutLevels: (callback) => {
                model.Locations.GetWorkoutLevels({locationId}, (err, workoutLevels) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, workoutLevels)
                    }
                })
            },
            fitnessGoals: (callback) => {
                model.Locations.GetFitnessGoals({locationId}, (err, fitnessGoals) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, fitnessGoals)
                    }
                })
            },
            exerciseTypes: (callback) => {
                model.Locations.GetExerciseType({locationId}, (err, exerciseTypes) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, exerciseTypes)
                    }
                })
            },
            muscleTargets: (callback) => {
                model.Locations.GetMuscleTarget({locationId}, (err, muscleTargets) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, muscleTargets)
                    }
                })
            },
            sources: (callback) => {
                model.Leads.GetSources({locationId}, (err, sources) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, sources)
                    }
                })
            },
            statuses: (callback) => {
                model.Leads.GetStatuses({locationId}, (err, statuses) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, statuses)
                    }
                })
            },
            departments: (callback) => {
                model.Locations.GetDepartments({locationId}, (err, departments) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, departments)
                    }
                })
            },
            designations: (callback) => {
                model.Locations.GetDesignation({locationId}, (err, designations) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, designations)
                    }
                })
            },
            uploadedDocuments: (callback) => {
                model.Locations.getDocuments({locationId}, (err, documents) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, documents)
                    }
                })
            }
        }, (err, result) => {
            if (err) {
              cb(true,{success:false})
            } else {
                cb(false, {
                    success:true,
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
                });
            }
        })
    }
},

'updateShopProfile': function(model, req, method, cb){
    if(method === "POST"){
        const options = {
            name: req.name,
            address1: req.address_line_1,
            address2: req.address_line_2,
            cityId: req.cityId,
            stateId: req.stateId,
            zip: req.zip,
            phone: req.phone,
            email: req.email,
            gstin: req.gstin,
            invoiceFooterNotes: req.invoiceFooterNotes.invoiceFooterNotes(/(?:\r\n|\r|\n)/g, '<br />'),
            locationId : req.locationId,
            startTime: req.startTime,
            endTime: req.endTime
        }
        model.Locations.UpdateGeneralFields(options, (err) => {
            if (err) {
                cb(true, err)
            }else{
                cb(false, {success: true})
            }
        })
    }
},

'addBankDetails': function(model, req, method, cb){
    if(method === "POST"){
        const options = {
            name: req.accName,
            bankName: req.bankName,
            accNo: req.accNumber,
            ifscCode: req.ifscCode,
            branchName: req.branchName,
            locationId: req.locationId,
            userId: req.userId
        }

        model.Locations.AddBankDetails(options, (err) => {
            if (err) {
                cb(true, err)
            }else{
                cb(false, {success: true})
            }
        })
    }
},

"updateBankDetails" : function(model, req, method, cb){
    if(method === "POST"){
        const options = {
            name: req.accName,
            bankName: req.bankName,
            accNo: req.accNumber,
            ifscCode: req.ifscCode,
            branchName: req.branchName,
            locationId: req.locationId,
            userId: req.userId
        }
    
        model.Locations.UpdateBankDetails(options, (err) => {
            if (err) {
                cb(true, err)
            }else{
                cb(false, {success: true})
            }
        })
    }
},

"deleteBankDetails": function(model, req, method, cb){
    if(method === "POST"){
        const options = {
            bankDetailsId : req.bankDetailsId
        }
    
        model.Locations.DeleteBankDetails(options, (err) => {
            if (err) {
                cb(true, err)
            }else{
                cb(false, {success: true})
            }
        })
    }
},

'getBankDetails': function(model, req, method, cb){
    if(method === "POST"){
        model.Locations.GetBankDetails({locationId: req.locationId}, (err, bankDetails) => {
            if(err) {
                cb(err)
            } else {
                cb(false, {success:true, bankDetails})
            }
        })
    }
},

'add-tax': function(model, req, method, cb){
    const options = {
        locationId: req.locationId,
        label: req.label,
        rate: req.rate
    }

    model.Locations.AddTax(options, (err) => {
        if (err) {
            cb(true, err)
        }else{
            cb(false, {success: true})
        }
    })
},

'update-tax' : function(model, req, method, cb){
    if(method === "POST"){
        const options = {
            taxId : req.taxId,
            label: req.label,
            rate: req.rate
        }
    
        model.Locations.UpdateTax(options, (err) => {
            if (err) {
                cb(true, err)
            }else{
                cb(false, {success: true})
            }
        })
    }
},

'delete-tax': function(model, req, method, cb){
    if(method === "POST"){
        const options = {
            taxId : req.taxId
        }
    
        model.Locations.DeleteTax(options, (err) => {
            if (err) {
                cb(true, err)
            }else{
                cb(false, {success: true})
            }
        })
    }
},

'update-payment-method': function(model, req, method, cb){
    if(method === "POST"){
        const options = {
            col: 'payment_methods',
            value: req.payment_methods.join(),
            locationId: req.locationId
        }
    
        model.Locations.Update(options, (err) => {
            if (err) {
                cb(true, err)
            }else{
                cb(false, {success: true})
            }
        })
    }
},


'getbrand' :function(model, req, method, cb){
    if(method === "POST"){
        const options = {
            locationId:req.locationId
        }
        model.ShopProducts.getbrand(options, (err, data) =>{
            if(err){
                cb(true,{success: false})
            }else{
                cb(false,{success:true, data})
            }
        })
    }
},

'uploadUserDocuments' : function(model, req, method, cb) {
    if(method === "POST"){
        const userId = req.userId
        const locationId = req.locationId
    
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
                model.Users.AddUserDocuments({userId, locationId, images:result}, (err, data) => {
                    if(err){
                        cb(true,{success: false})
                    }else{
                        cb(false,{success:true, data})
                    }
                })
            }
        })
    }
},

'updateDocuments' : function(model, req, method, cb){
    if(method === "POST"){
        const rowId = req.rowId 
        const File = req.files
        model.Users.UpdateUserDocuments({ File, rowId}, (err, data) =>{
            if(err){
                cb(true,{success: false})
            }else{
                cb(false,{success:true, data})
            }
        })
    }
},

'deleteUploadedDocuments' : function(model, req, method, cb){
    if(method === "POST"){
        const options = {
            document_id : req.document_id,
            pan_file : req.pan_file ? req.pan_file : null,
            gst_file : req.gst_file ? req.gst_file : null
        }
        model.Users.DeleteDocuments(options, (err, data) =>{
            if(err){
                cb(true,{success: false})
            }else{
                cb(false,{success:true, data})
            }
        })
    }
}

}
