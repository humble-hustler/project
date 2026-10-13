/********************************************************/
/***** Event Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const async = require('async');

router.get('/', auth.checkPermission(['super-admin']), (req, res) => {
	const models = req.Core.Models;

	models.Events.GetTypes( (err, types) => {
		if(err){
			res.redirect('/404');
		}else{
			res.render('super-admin/events', {
		        title: 'FitBiz - Events',
				menuActive: '',
        		submenuActive: '',
		        types: types,
		        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css'],
		        scripts: ['/js/page-level/events.js','/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
		    });
		}
	})
})

router.post('/view-all', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['a.id','a.name','event_type_name','a.start_date','a.end_date','a.held_by','a.charges'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;

    models.Events.GetAll({offset, limit, search, orderByColumn, orderByValue}, (err, events) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: events.total, recordsFiltered: events.total, data: events.events})
        }
    })
})

router.post('/add', auth.checkPermission(['super-admin']), (req, res) => {
	const models = req.Core.Models;
	const files = req.files;
	const post = req.body;

	var options = {
		eventName: post.event_name,
		eventType: post.event_type,
		startDate: post.start_date,
		endDate: post.end_date,
		heldBy: post.held_by,
		description: post.description,
		charges: post.charges,
		createdBy: req.session.user.id
	};
	var filename = (files.banner_img)?(`${moment().unix()}-${files.banner_img.name}`):(null);
    var imgDir = `${require('path').resolve()}/public/event-img/${filename}`;
    
    if(filename){
    	files.banner_img.mv(imgDir, (err) => {
	        if (err) {
	        	res.redirect('/404')
	        } else {
	        	options.filename = filename;
	 			models.Events.Add(options, (err) => {
					if(err){
						res.redirect('/404');
					}else{
						res.redirect('back');
					}
				})        	   
	        }
	    })
    }else{
    	options.filename=null;
    	models.Events.Add(options, (err) => {
			if(err){
				res.redirect('/404');
			}else{
				res.redirect('back');
			}
		})
    }
})

router.get('/:id', auth.checkPermission(['super-admin']), (req,res) => {
	const models = req.Core.Models;
	const eventId = req.params.id;

	async.auto({
		eventData: (callback) => {
			models.Events.GetSingle({eventId}, (err, event) => {
				if(err){
					callback(err)
				}else{
					callback(null,event)
				}
			})
		},
		eventTypes: (callback) => {
			models.Events.GetTypes( (err, types) => {
				if(err){
					callback(err)
				}else{
					callback(null,types)
				}
			})
		}
	},function(err, result){
		if(err){
			res.redirect('/404');
		}else{
			res.render('super-admin/single-event', {
		        title: 'FitBiz - Events',
		        eventData: result.eventData,
				menuActive: '',
        		submenuActive: '',
		        eventTypes: result.eventTypes,
		        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css'],
		        scripts: ['/js/page-level/single-event.js','/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js']
		    });
		}
	})
})

router.post('/update', auth.checkPermission(['super-admin']), (req,res) => {
	const models = req.Core.Models;
	const post = req.body;

	var options = {
		eventName: post.event_name,
		eventType: post.event_type,
		startDate: post.start_date,
		endDate: post.end_date,
		heldBy: post.held_by,
		description: post.description,
		charges: post.charges,
		id: post.event_id
	};

	models.Events.Update(options, (err) => {
		if(err){
			res.redirect('/404');
		}else{
			res.redirect('back');
		}
	})
})

router.post('/registrations/view-all', auth.checkPermission(['super-admin']), (req,res) => {
	const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['a.id','b.fname','a.is_approved','a.fees_paid'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const eventId = req.body.eventId;

    models.Events.GetAllRegistrations({eventId, offset, limit, search, orderByColumn, orderByValue}, (err, eventUsers) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: eventUsers.total, recordsFiltered: eventUsers.total, data: eventUsers.eventUsers})
        }
    })
})

module.exports = router;