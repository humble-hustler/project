/********************************************************/
/***** Chat Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const models = require('../models');

router.post('/get-dietitian-details', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const dietitianId = req.body.dietitianId;
    const userId = req.body.userId;

    async.auto({
        dietitanDetails: (cb) => {
            models.Users.GetSingle({userId: dietitianId}, (err, dietitian) => {
                cb(err ? err : null, dietitian)
            })
        },
        chats: (cb) => {
            models.Chat.GetBetweenUsers({user1: userId, user2: dietitianId}, (err, chats) => {
                cb(err ? err : null, chats)
            })
        }
    }, function (err, result){
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true, dietitian: result.dietitanDetails, chats: result.chats})
        }
    })   
})

router.post('/add', (req, res) => {
    console.log("444444444444444444",req.body)
    const post = req.body;
    const models = req.Core.Models;
    const message = post.message;
    const options = {
        message: post.message,
        fromUser: req.session.user.id,
        toUser: post.location_user,
        LocId : post.LocId
    }
    models.Chat.Add(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/get-message', (req, res) =>{
    const options = {
        locId : req.body.locId,
        userId : req.session.user.id,
        loc_user_id : req.body.loc_user_id,
        LocId : req.body.LocId
    }
    models.Chat.getmessage(options, (err, data) =>{
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, data})
        }
    })
})

router.post('/get-dietitians', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        userId: post.userId
    }
    models.Users.GetUserAllocatedDietitians(options, (err, dietitians) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, dietitians: dietitians})
        }
    })
})

router.post('/get-unread-messages', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        userId: post.userId
    }
    models.Chat.GetUnreadMessages(options, (err, chats) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, chats: chats})
        }
    })
})

router.post('/mark-read', (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        sender: post.sender,
        receiver: post.receiver
    }
    models.Chat.MessageRead(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

module.exports = router;