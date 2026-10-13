/********************************************************/
/***** Chat Routes *****/
/********************************************************/
const auth = require('../auth');
const async = require('async');
const express = require('express');
const router = express.Router();

router.get('/dietitian-messenger', auth.checkPermission(['dietitian']), (req, res) => {
    const models = req.Core.Models;
    const userId = req.params.id;

    res.render('super-admin/dietitian-messenger', {
        title: 'FitBiz - Dietitian',
        fw: true,
        menuActive: 'chat',
        submenuActive: '',
        pageClass: 'page-aside-fixed page-aside-right',
        scripts: ['/js/page-level/dietitian-messenger.js','/global/js/Plugin/asscrollable.js','/assets/examples/js/advanced/scrollable.js'],
        styles: ['/global/vendor/asscrollable/asScrollable.css','/assets/examples/css/advanced/scrollable.css']
     });
});

router.post('/dietitian-add-chat', auth.checkPermission(['dietitian']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        message: post.message,
        fromUser: post.fromUser,
        toUser: post.toUser
    }

    models.Chat.Add(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/get-chats',auth.checkPermission(['dietitian']), (req, res) => {
    const models = req.Core.Models;
    const options = {
        fromUser: req.body.fromUser,
        toUser: req.body.toUser
    }

    async.auto({
        chats: (cb) => {
            models.Chat.GetUserChats(options, (err, chats) => {
                if(err){
                    cb(err)
                }else{
                    cb(null, chats);
                }
            })
        },
        userDetails: (cb) => {
            models.Users.GetSingle({userId: options.toUser}, (err, user) => {
                if(err){
                    cb(err)
                }else{
                    cb(null, user);
                }
            })
        }
    },function(err, result){
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true, chats: result.chats, userDetails: result.userDetails})
        }
    })
    
})

router.post('/get-diet-subscribers',auth.checkPermission(['dietitian']), (req, res) => {
    const models = req.Core.Models;
    const options = {
        dietitianId: req.body.dietitianId
    }

    models.Chat.GetDietSubscribers(options, (err, users) => {
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true, users: users})
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