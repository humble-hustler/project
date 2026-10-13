/********************************************************/
/***** Leads Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');

router.post('/view-all', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['a.created_date','a.created_date','a.brand_name','c.source','b.status','owner_name','followup_date_time','followup_date_time'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;

    models.SuLeads.GetAll({offset, limit, search, filter, orderByColumn, orderByValue}, (err, leads) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: leads.total, recordsFiltered: leads.total, data: leads.leads})
        }
    })
})


router.post('/add', auth.checkPermission(['super-admin']), (req,res) => {
    const models = req.Core.Models;
    const options = {
        brandName: req.body.brand_name,
        ownerId: req.body.owner_id,
        statusId: req.body.lead_status,
        sourceId: req.body.lead_source,
        isActive:1
    }
    models.SuLeads.Add(options, (err, leads) => {
        if (err) {
            res.redirect('/403');
        } else {
            res.redirect('back');
        }
    })
})

router.get('/:id', auth.checkPermission(['super-admin']), (req,res) => {
    const models = req.Core.Models;
    const options = {
        leadId: req.params.id
    }

    async.parallel({
        statuses: (callback) => {
            models.SuLeads.Getstatuses((err, statuses) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null,statuses);
                }
            })
        },
        sources: (callback) => {
            models.SuLeads.GetSources( (err, sources) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, sources)
                }
            })
        },
        followup: (callback) => {
            models.SuLeads.GetFollowup(options, (err, sources) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, sources)
                }
            })
        },
        leadData: (callback) => {
            models.SuLeads.GetSingle(options, (err, leadData) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, leadData)
                }
            })
        },
        leadContacts: (callback) => {
            models.SuLeads.GetContacts(options, (err, leadContacts) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, leadContacts)
                }
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/single-lead', {
                title: 'FitBiz - Leads',
                status: result.statuses,
                menuActive: '',
        		submenuActive: '',
                sources: result.sources,
                followup: result.followup,
                leadData: result.leadData,
                leadContacts: result.leadContacts,
                scripts: ['/global/vendor/toastr/toastr.min.js', '/js/app/dashboard.js', '/js/page-level/single-lead.js', '/global/vendor/select2/select2.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']                                                 
            });
        }
    })
})

router.post('/update', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        col: post.col,
        val: post.val,
        leadId: post.leadId
    }

    models.SuLeads.Update(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/add/followup', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        text: post.text,
        followupDateTime: post.followup_date_time,
        leadId: post.leadId,
        authorId: post.followup_user
    }
    models.SuLeads.AddFollowup(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.redirect('back');
        }
    })
})

router.post('/add/contact', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        leadId: post.lead_id,
        fname: post.fname,
        lname: post.lname,
        email: post.email,
        phone: post.phone,
        designation: post.designation,
        address: post.address
    }
    models.SuLeads.AddContact(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.redirect('back');
        }
    })
})


router.post('/update/contact', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        id: post.lead_contact_id,
        fname: post.fname,
        lname: post.lname,
        email: post.email,
        phone: post.phone,
        designation: post.designation,
        address: post.address
    }
    models.SuLeads.UpdateContact(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.redirect('back');
        }
    })
})
module.exports = router;