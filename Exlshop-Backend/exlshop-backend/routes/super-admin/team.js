const auth = require('../auth');
const express = require('express');
const router = express.Router();

router.post('/add-new-member', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        fname: post.fname,
        lname: post.lname,
        email: post.email,
        phone: post.phone,
        password: post.password,
        role_id: post.role,
        locationId: post.lid,
        gender : null,
        address1 : null,
        address2: null,
        cityId : null, 
        stateId : null, 
        zip : null, 
        marital_status : null, 
        emergency_contact_name : null, 
        emergency_contact_number : null, 
        blood_group : null, 
        birth_date : null, 
        anniversary_date : null
    }
    models.Users.Add1(options, (err) => { 
        if (err) {
            console.log(err)
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/delete-team-member', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        teamMemberId: post.team_member_id
    }
    models.Users.Delete(options, (err) => {
        if (err) {
            res.redirect('back')
        } else {
            res.redirect('back')
        }
    })
})

router.post('/update-team-member', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const options = {      
        id :req.body.update_team_member_id,
        fname: req.body.user_fname,
        lname: req.body.user_lname,
        email: req.body.user_email,
        phone: req.body.user_phone,
        roleId: req.body.role_id,
        location:req.body.location_id
    }
    models.Users.Update_member(options, (err) => {
        if (err) {
            res.redirect('back')
        } else {
            res.redirect('back');
        }
    })
})

router.post('/get-team', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = post.locationId;
    models.Team.GetTeam({locationId, offset: 0, limit: 15,search: post.search.value}, (err, users) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: users.total, recordsFiltered: users.total, data: users.users})
        }
    })
})

router.post('/get-single-member', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = post.userId;
    models.Users.GetSingle({userId}, (err, user) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success:true , user:user})
        }
    })
})

router.post('/view-all', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['b.id','user_name','b.email','b.phone','role_name','brand_location_name'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    models.Team.GetTeam({all: true, offset, limit, search, orderByColumn, orderByValue}, (err, team) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: team.total, recordsFiltered: team.total, data: team.users})
        }
    })
})
module.exports = router;