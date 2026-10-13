const { options } = require('../..');
const brandd = require("../../../super-admin/brands")
const url = require('url');
const { default: axios } = require('axios');
const params = new url.URLSearchParams();
const moment = require('moment');
const async = require('async');
module.exports = {
    'view-all': function (model, req, method, cb) {
        if (method === 'POST') {
            const offset = 0;
            const limit = 1000;
            const search = false;
            const orderByColumn = '';
            const orderByValue = 'asc';
            const filter = '';
            const userId = req.user_id;
            model.Leads.GetLocations({userId, offset, limit, search, filter, orderByColumn, orderByValue}, (err, leads) => {
                if (err) {
                    cb(true, {success: false});
                } else {
                    cb(false, {success: true, recordsTotal: leads.total, recordsFiltered: leads.total, data: leads})
                }
            })
        }
    },

    'addLocation': function (model, req, method, cb) {
        if (method === 'POST') {
            const userId = req.user_id;
            const options = {
                userId: req.user_id,
                brandId: req.brandId,
                locationname: req.locationname,
                addressline1:req.addressline1,
                addressline2:req.addressline2,
                state:req.state,
                city:req.city,
                pincode:req.pincode,
                phone:req.phone,
                email:req.email,
                lat:req.lat,
                lng:req.lng,
                operatinghrfrom:req.operatinghrfrom,
                operatinghrto:req.operatinghrto,
                udyogcard_no:req.udyogcard_no,
                pancard_no:req.pancard_no,
                gst_number:req.gst_number
            }
            var files = req.files.files;
            var imgArr = []
            imgArr.push(files[0], files[1])
            async.map(imgArr, (i, callback) => {
                var filename = `${moment().unix()}-${i.name}`;
                var imgDir = `${require('path').resolve()}/public/documents/${filename}`;
                i.mv(imgDir, (err) => {
                    if(err) {
                        callback(err)
                    } else {
                        callback(null, { filename : filename})
                    }
                })
            }, (err, result) => {
                if(err) {
                    cb(err)
                } else {
                    model.Leads.Add(options, (err,location) => {
                        if (err) {
                            cb(err)
                        }else{
                            var locationId = location
                            model.Leads.AddLocationDocuments({locationId, userId, images:result}, (err, data) => {
                                if(err){
                                    cb(err);
                                }else{
                                    cb(false,{success:true} )
                                }
                            })
                        }
                    })
                }
            })
        }
    },
    
    'update-location': function (model, req, method, cb) {
        if (method === 'POST') {
            const locationId = req.location_id;
            const userId = req.user_id;
            const brandId = req.brand_id;
            const name=req.name;
            const address_line_1=req.address_line_1?req.address_line_1:null;
            const address_line_2=req.address_line_2?req.address_line_2:null;
            const city_id=req.city_id;
            const state_id=req.state_id;
            const zip=req.zip;
            const phone=req.phone;
            const email=req.email;
            const active=req.active;
            const options = {
                locationId,
                userId,
                brandId,
                name,
                address_line_1,
                address_line_2,
                city_id,
                state_id,
                zip,
                phone,
                email,
                active
            }
            model.Leads.Update(options, (err, location) => {
                if (err) {
                    cb(err)
                } else {
                    cb(false,{success:true,data:location} )
                }
            })
        }
    },

    'delete-location':function (model, req, method, cb) {
        if (method === 'POST') {
            const locationId = req.user_locationId;
            const userId = req.user_id;
            const brandId = 1;
            const options = {
                locationId,
                userId,
                brandId
            }
            model.Leads.DeleteLocation(options, (err, location) => {
                if (err) {
                    cb(err)
                } else {
                    cb(false,{success:true,data:location} )
                }
            })
        }
    },

    'getState':function (model, req, method, cb) {
        if (method === 'POST') {
            const countryId = req.country_id;
            const options = {
                countryId
            }
            model.Common.GetStates(options, (err, states) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, {success:true, data:states} )
                }
            })
        }
    },

    'getCity':function (model, req, method, cb) {
        if (method === 'POST') {
            const stateId = req.state_id;
            const options = {
                stateId
            }
            model.Common.GetCities(options, (err, city) => {
                if (err) {
                    cb(true, { success: false });
                } else {
                    cb(false, {success:true, data:city} )
                }
            })
        }
    },

    'getPromotionImage': function(model, req, method, cb){
        if(method === "GET"){
            model.Common.getPromotionImage((err, PromotionImage)=>{
                if(err){
                    cb(true, {success: false})
                }else{
                    cb(false, {success: true, PromotionImage})
                }
            })
        }
    }
} 