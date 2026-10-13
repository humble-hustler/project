/********************************************************/
/***** API Index Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const models = require('../../models');


router.post('/fitness-details', (req, res) => {
    const post = req.body;
    const options = {
        userId: post.userId
    }
    models.Users.GetFitnessDetails(options, (err, fitnessDetails) => {
        if (err) {
          
            res.send({success: false});
        } else {
            res.send({success: true, fitnessDetails});
        }
    })
})

router.post('/update-fitness-details', (req, res) => {
    const post = req.body;
    const options = {
        userId: post.userId,
        height: post.height,
        weight: post.weight
    }
    
    models.Users.UpdateFitnessDetails(options, (err) => {
        if (err) {
          
            res.send({success: false});
        } else {
            res.send({success: true});
        }
    })
})

module.exports = router;