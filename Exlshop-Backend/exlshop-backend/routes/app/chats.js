/********************************************************/
/***** Index Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const async = require('async');
const router = express.Router();

router.get('/', auth.checkPermission(['brand-admin', 'manager', 'operator', 'staff']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

	async.auto({
		locationUsers: (cb) => {
            models.Users.GetLocationUsers({locationId}, (err, users) => {
                cb(err ? err : null, users)
            })
        }
	}, (err, result) => {
		if(err){
            res.redirect('/404')
		}else{
			res.render('app/chat',{
		        title: 'ExlShop | Chats',
		        fw: true,
		        pageClass: 'page-aside-fixed page-aside-right',
		        menuActive: 'messenger',
		        submenuActive: '',
				customerchat:0,
		        users: result.locationUsers,
		        scripts: ['/js/app/chat.js','/global/js/Plugin/asscrollable.js','/assets/examples/js/advanced/scrollable.js'],
		        styles: ['/global/vendor/asscrollable/asScrollable.css','/assets/examples/css/advanced/scrollable.css']
		    })
		}
	})
})


router.post('/single-user',auth.checkPermission(['brand-admin', 'manager', 'operator', 'staff']), (req, res) => {
	const models = req.Core.Models;
	const options = {
		fromUser: req.body.fromUser,
		toUser: req.body.toUser
	}
	models.Chat.GetUserChats(options, (err, chats) => {
    	if(err){
    		res.send({success: false})
    	}else{
    		res.send({success: true, chats: chats})
    	}
    })
})

router.get('/customer', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
	async.auto({
		locationCustomer: (cb) => {
            models.custmor.GetLocationCustomer({locationId}, (err, users) => {
                cb(err ? err : null, users)
            })
        }
	}, (err, result) => {
		if(err){
            res.redirect('/404')
		}else{
			res.render('app/chat',{
		        title: 'ExlShop | Chats',
		        fw: true,
		        pageClass: 'page-aside-fixed page-aside-right',
		        menuActive: 'custmess',
		        submenuActive: '',
				customerchat:1,
		        users: result.locationCustomer,
		        scripts: ['/js/app/chat.js','/global/js/Plugin/asscrollable.js','/assets/examples/js/advanced/scrollable.js'],
		        styles: ['/global/vendor/asscrollable/asScrollable.css','/assets/examples/css/advanced/scrollable.css']
		    })
		}
	})
})

// router.post('/customer-chat',auth.checkPermission(['brand-admin', 'manager', 'operator', 'staff']), (req, res) =>{
// 	console.log(req.body)
// 	var customer_Id = req.body.customer_Id;
// 	res.redirect('/app/chats/customer')
// })
module.exports = router;


