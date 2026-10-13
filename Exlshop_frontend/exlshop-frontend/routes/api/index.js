/********************************************************/
/***** API Index Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const models = require('../../models');
const jwt = require('jsonwebtoken');


router.post('/sign-in', (req, res) => {
    const post = req.body;
    const loginOpts = {
        email: post.email,
        password: post.password,
        method:1
    }
    models.Users.SignIn(loginOpts, (err, user) => {
        if (err) {
          
            res.send({success: false});
        } else {
            
            res.send({success: true, user: user});
        }
    })
})

router.post('/sign-up', (req, res) => {
    const post = req.body;

    const registerOpts = {
        fname: post.fname,
        lname: post.lname,
        email: post.email,
        phone: post.phone,
        password: post.password
    }

    models.Users.SignUp(registerOpts, (err) => {
        if (err) {
          
            res.send({success: false, message: "Error Signing Up"});
        } else {
            const loginOpts = {
                phone: post.phone,
                password: post.password,
                method:2
            }
            models.Users.SignIn(loginOpts,(err, user) => {
                if (err) {
                  
                    res.send({success: false, message: "Signed up sucessfully but there was a problem logging in"});
                } else {
                    
                    // return the JWT token for the future API calls
                    res.send({success: true, user: user});
                }
            })
        }
    })
});

router.post('/reset-password', (req, res) => {
    const post = req.body;
    const options = {
        oldPassword: post.oldPassword,
        newPassword: post.newPassword,
        userId: post.userId
    }
    models.Users.ResetPassword(options, (err, message) => {
        if (err) {
           
            res.send({success: false});
        } else {
            res.send({success: true, message});
        }
    })
})



module.exports = router;