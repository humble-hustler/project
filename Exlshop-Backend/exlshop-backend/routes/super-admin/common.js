/********************************************************/
/***** Index Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();

router.post('/get-cities', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    models.Common.GetCities({stateId: post.stateId}, (err, cities) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, cities})
        }
    })
})

module.exports = router;