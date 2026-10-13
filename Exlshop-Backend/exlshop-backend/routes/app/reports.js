/********************************************************/
/***** App dashboard Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');
const moment = require('moment');

router.get('/sales', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;
    models.Team.GetTeam({locationId, offset: 0, limit: 100}, (err, team) => {
        if (err) {
            callback(err)
        } else {
            res.render('app/reports/sales', {
                menuActive: 'reports',
                submenuActive: 'sales',
                users: team.users,
                title: 'FitBiz | Sales Reports',
                scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/reports/sales.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
            })
        }
    })
})

router.post('/sales', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const filter = req.body.filter ? req.body.filter : false;
    const orderByArr = ['a.created_date','a.sale_location_id','c.fname','a.total_amount','amount_paid','a.comment','a.completed'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;

    models.Reports.Sales({locationId, offset, limit, search, filter, orderByColumn, orderByValue}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: report.total, recordsFiltered: report.total, data: report.sales})
        }
    })
})

router.post('/sales/:id', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const saleId = req.params.id;
    const post = req.body;

    models.Reports.SingleSale({saleId}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, report})
        }
    })
})

router.get('/renewal-expired', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    res.render('app/reports/renewal-expired', {
        menuActive: 'reports',
        submenuActive: 'renewal-expired',
        title: 'FitBiz | Renewal Expired Reports',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/app/reports/renewal-expired.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
    })
})

router.post('/renewal-expired/get-all', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['member_name','package_name','package_start_date','package_expiry_date'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const locationId = req.session.user.currentLocation.id;
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.RenewalExpired({offset, limit, search, orderByColumn, orderByValue, locationId, filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: report.total, recordsFiltered: report.total, data: report.report})
        }
    })    
})

router.get('/outstanding', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    res.render('app/reports/outstanding', {
        menuActive: 'reports',
        submenuActive: 'outstanding',
        title: 'FitBiz | Outstanding Reports',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/app/reports/outstanding.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
    })
})

router.post('/outstanding', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['a.created_date','a.member_name','a.total_amount','a.amount_paid','a.comment'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.Outstanding({locationId, offset, limit, search, orderByColumn, orderByValue, filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: report.total, recordsFiltered: report.total, data: report.outstanding})
        }
    })
})

router.post('/export', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    
    const locationId = req.session.user.currentLocation.id;
    const offset = 0;
    const limit = 10000;
    const search = req.body.searchValue ? req.body.searchValue : false;
    const orderByArr = ['a.created_date','a.member_name','a.total_amount','a.amount_paid','a.comment'];
    const orderByColumn = orderByArr[req.body.orderBy[0][0]];
    const orderByValue = req.body.orderBy[0][1];
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.Outstanding({locationId, offset, limit, search, orderByColumn, orderByValue, filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            var fs = require('fs');
            var fileDir = `${require('path').resolve()}/public/reports/outstanding/`;
            var filename = `outstanding-report-${moment().unix()}.xls`;
            var writeStream = fs.createWriteStream(fileDir+filename);

            var header="Sr No"+"\t"+"Member name"+"\t"+"Mobile No"+"\t"+"Plan Name"+"\t"+"Start Date"+"\t"+"Outstanding days"+"\t"+"Amount Paid"+"\t"+"Amount Pending"+"\t"+"Sold By"+"\t"+"Trainer Name"+"\n";

            writeStream.write(header,function(err){
                if(err){
                    res.send({success: false})
                }else{
                    var sr_no = 0;
                    async.map(report.outstanding, (r, cb1) => {
                        var row = (++sr_no)+"\t"+(r.member_name)+"\t"+((r.phone)?(r.phone):(''))+"\t"+((r.package_names)?(r.package_names):(''))+"\t"+r.start_date+"\t"+r.ageing+"\t"+r.amount_paid+"\t"+(r.total_amount-r.amount_paid)+"\t"+((r.sold_by_user)?(r.sold_by_user):('-'))+"\t"+((r.trainer_name)?(r.trainer_name):('-'))+"\n";
                        writeStream.write(row,function(err){
                            cb1(err ? err : null)
                        })
                    }, (err, result) => {
                        writeStream.close(function(err){
                            if(err){
                                res.send({success: false})
                            }else{
                                res.send({success: true, filename: filename})
                            }
                        });
                    })
                }
            });
        }
    })
})

router.post('/renewal-export', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;

    const locationId = req.session.user.currentLocation.id;
    const offset = 0;
    const limit = 10000;
    const search = req.body.searchValue ? req.body.searchValue : false;
    const orderByArr = ['member_name','package_name','package_start_date','package_expiry_date'];
    const orderByColumn = orderByArr[req.body.orderBy[0][0]];
    const orderByValue = req.body.orderBy[0][1];
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.RenewalExport({locationId, offset, limit, search, orderByColumn, orderByValue , filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            var fs = require('fs');
            var fileDir = `${require('path').resolve()}/public/reports/renewal/`;
            var filename = `renewal-report-${moment().unix()}.xls`;
            var writeStream = fs.createWriteStream(fileDir+filename);
            var header="S No."+"\t"+"Name"+"\t"+"Mobile"+"\t"+"Email ID"+"\t"+"Gender"+"\t"+"Plan"+"\t"+"Start Date"+"\t"+"End Date"+"\t"+"Status"+"\n";
            
            writeStream.write(header,function(err){
                if(err){
                    res.send({success: false})
                }else{
                    var i=0;
                    async.map(report, (r, cb1) => {
                        var row = (++i)+"\t"+r.member_name+"\t"+r.phone+"\t"+(r.email ? r.email : '')+"\t"+(r.gender ? r.gender : '')+"\t"+r.package_name+"\t"+((r.package_start_date)?(moment(r.package_start_date).format('DD/MM/YYYY')):('-'))+"\t"+((r.package_expiry_date)?(moment(r.package_expiry_date).format('DD/MM/YYYY')):('-'))+"\t"+((r.is_renewed == 0)?('Not Renewed'):('Renewed'))+"\n";
                        writeStream.write(row,function(err){
                            cb1(err ? err : null)
                        })
                    }, (err, result) => {
                        writeStream.close(function(err){
                            if(err){
                                res.send({success: false})
                            }else{
                                res.send({success: true, filename: filename })
                            }
                        });
                    })
                }
            });
        }
    })
})

router.post('/sales-export', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;
    const offset = 0;
    const limit = 10000;
    const search = req.body.searchValue ? req.body.searchValue : false;
    const orderByArr =['a.created_date','a.sale_location_id','c.fname','a.total_amount','amount_paid','a.comment','a.completed'];
    const orderByColumn = orderByArr[req.body.orderBy[0][0]];
    const orderByValue = req.body.orderBy[0][1];
    const filter = req.body.filter ? req.body.filter : false;
    var fs = require('fs');

    models.Reports.SalesExport({locationId, offset, limit, search, orderByColumn, orderByValue, filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            var fileDir = `${require('path').resolve()}/public/reports/sales/`;
            var filename = `sales-report-${moment().unix()}.xls`;
            var writeStream = fs.createWriteStream(fileDir+filename);

            var header="S No."+"\t"+" Sale ID"+"\t"+" Invoice Date"+"\t"+"Inv.No."+"\t"+"Member Name"+"\t"+" Mobile no. "+"\t"+" Address "+"\t"+"Member Id "+"\t"+" Plan Type "+"\t"+" Member Type "+"\t"+" Price "+"\t"+" Discount Price "+"\t"+" Tax %age "+"\t"+"Tax Amount "+"\t"+" Sale Price "+"\t"+" Received Amount "+"\t"+" Pending Amount "+"\t"+" Payment Mode "+"\t"+" Sold By "+"\t"+" Received By "+"\t"+" Trainer Name "+"\t"+" Start Date "+"\t"+" End Date "+"\n";
            
            writeStream.write(header,function(err){
                if(err){
                    res.send({success: false})
                }else{
                    var i = 0;
                    async.map(report, (r, cb1) => {
                        var row = (++i)+
                        "\t"+'#'+r.sale_location_id+
                        "\t"+((r.invoice_date)?(moment(r.created_date).format('DD/MM/YYYY')):('-'))+
                        "\t"+'#'+r.sale_location_id+
                        "\t"+r.member_name+
                        "\t"+r.phone+
                        "\t"+((r.address_line_1)?(r.address_line_1):(''))+
                        "\t"+r.member_id+
                        "\t"+r.package_names+
                        "\t"+((r.renewed == 0)?('New Member'):('Renewed'))+
                        "\t"+r.total_amount+
                        "\t"+(r.price - r.total_amount)+
                        "\t"+r.tax_rate+
                        "\t"+((r.total_amount*r.tax_rate/100))+
                        "\t"+r.selling_price+
                        "\t"+r.amount_paid+
                        "\t"+(r.total_amount - r.amount_paid)+
                        "\t"+(r.payment_mode)+
                        "\t"+((r.sold_by_user_name)?(r.sold_by_user_name):('-'))+
                        "\t"+((r.received_by_user_name)?(r.received_by_user_name):('-'))+
                        "\t"+((r.trainer_name)?(r.trainer_name):('-'))+
                        "\t"+((r.start_date)?(r.start_date):('-'))+
                        "\t"+(r.end_date)+
                        "\n";
                        writeStream.write(row,function(err){
                            cb1(err ? err : null)
                        })
                    }, (err, result) => {
                        writeStream.close(function(err){
                            if(err){
                                res.send({success: false})
                            }else{
                                res.send({success: true, filename: filename })
                            }
                        });
                    })
                }
            });
        }
    })
})

router.get('/workout-chart', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    res.render('app/reports/workout-chart', {
        menuActive: 'reports',
        submenuActive: 'workout-chart',
        title: 'FitBiz | Workout-Chart',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/reports/workout-chart.js'],
        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
    })
})

router.get('/attendance', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    res.render('app/reports/attendance', {
        menuActive: 'reports',
        submenuActive: 'attendance',
        title: 'FitBiz | Attendance',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/reports/attendance.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js','/global/vendor/select2/select2.js'],
        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css','/global/vendor/select2/select2.css']
    })
})

router.post('/attendance', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['a.created_date','a.sale_location_id','c.fname','a.total_amount','amount_paid','a.comment','a.completed'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.Attendance({locationId, offset, limit, search, orderByColumn, orderByValue, filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: report.total, recordsFiltered: report.total, data: report.attendance})
        }
    })
})

router.post('/attendance-export', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;

    const locationId = req.session.user.currentLocation.id;
    const offset = 0;
    const limit = 10000;
    const search = req.body.searchValue ? req.body.searchValue : false;
    const orderByArr = ['member_name','package_name','package_start_date','package_expiry_date'];
    const orderByColumn = orderByArr[req.body.orderBy[0][0]];
    const orderByValue = req.body.orderBy[0][1];
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.Attendance({locationId, offset, limit, search, orderByColumn, orderByValue}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            var fs = require('fs');
            var fileDir = `${require('path').resolve()}/public/reports/attendance/`;
            var filename = `attendance-report-${moment().unix()}.xls`;
            var writeStream = fs.createWriteStream(fileDir+`attendance-report-${moment().unix()}.xls`);

            var header="Date"+"\t"+"Member Name"+"\t"+"Mobile"+"\t"+"In Time"+"\t"+"In Time Facial Expression"+"\t"+"Out Time"+"\t"+"Out Time Facial Expression"+"\t"+"Time Spent"+"\n";
            
            writeStream.write(header,function(err){
                if(err){
                    res.send({success: false})
                }else{
                    var i=0;
                    async.map(report.attendance, (r, cb1) => {
                        var row = moment(r.in_time).format('Do MMM YYYY')+"\t"+r.member_name+"\t"+r.phone+"\t"+moment(r.in_time).format('hh:mm a')+"\t"+'-'+"\t"+moment(r.out_time).format('hh:mm a')+"\t"+'-'+"\t"+moment(moment(r.out_time,'YYYY-MM-DD HH:mm:ss').diff( moment(r.in_time, 'YYYY-MM-DD HH:mm:ss'))).format("hh:mm:ss")+"\n";
                       
                        writeStream.write(row,function(err){
                            cb1(err ? err : null)
                        })
                    }, (err, result) => {
                        writeStream.close(function(err){
                            if(err){
                                res.send({success: false})
                            }else{
                                res.send({success: true, filename: filename })
                            }
                        });
                    })
                }
            });
        }
    })
})

router.get('/member-status', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    res.render('app/reports/member-status', {
        menuActive: 'reports',
        submenuActive: 'member-status',
        title: 'FitBiz | Member Status',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/reports/member-status.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
    })
})

router.post('/member-status', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['a.fname','a.gender','a.address_line_1','a.birth_date','a.created_date','a.package_name','a.expiry_date'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.MemberStatus({locationId, offset, limit, search, orderByColumn, orderByValue, filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: report.total, recordsFiltered: report.total, data: report.report})
        }
    })
})

router.post('/member-status-export', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;

    const locationId = req.session.user.currentLocation.id;
    const offset = 0;
    const limit = 10000;
    const search = req.body.searchValue ? req.body.searchValue : false;
    const orderByArr = ['a.fname','a.gender','a.address_line_1','a.birth_date','a.created_date','a.package_name','a.expiry_date'];
    const orderByColumn = orderByArr[req.body.orderBy[0][0]];
    const orderByValue = req.body.orderBy[0][1];
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.MemberStatus({locationId, offset:0, limit:1000, search, orderByColumn, orderByValue, filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            var fs = require('fs');
            var fileDir = `${require('path').resolve()}/public/reports/member_status/`;
            var filename = `member-status-report-${moment().unix()}.xls`;
            var writeStream = fs.createWriteStream(fileDir+`member-status-report-${moment().unix()}.xls`);

            var header="Sr No."+"\t"+"Name"+"\t"+"Mobile"+"\t"+"Email ID"+"\t"+"Gender "+"\t"+"Address"+"\t"+"DOB"+"\t"+" DOJ "+"\t"+"Plan "+"\t"+"Expiry Date"+"\t"+"Status"+"\n";
            
            writeStream.write(header,function(err){
                if(err){
                    res.send({success: false})
                }else{
                    var i=0;
                    async.map(report.report, (r, cb1) => {
                        var row = (++i)
                                    +"\t"+r.member_name
                                    +"\t"+r.phone
                                    +"\t"+(r.email ? r.email : '')
                                    +"\t"+(r.gender ? r.gender : '')
                                    +"\t"+(r.address_line_1 ? r.address_line_1 : '')
                                    +"\t"+((r.birth_date)?(moment(r.birth_date).format('DD/MM/YYYY')):('-'))
                                    +"\t"+moment(r.created_date).format('DD/MM/YYYY')
                                    +"\t"+((r.package_name)?(r.package_name):(' - '))
                                    +"\t"+((r.expiry_date)?(moment(r.expiry_date).format('DD/MM/YYYY')):('-'))
                                    +"\t"+((moment(r.expiry_date) < moment() || !r.package_name)?('In Active'):('Active'))
                                    +"\n";
                       
                        writeStream.write(row,function(err){
                            cb1(err ? err : null)
                        })
                    }, (err, result) => {
                        writeStream.close(function(err){
                            if(err){
                                res.send({success: false})
                            }else{
                                res.send({success: true, filename: filename })
                            }
                        });
                    })
                }
            });
        }
    })
})

router.get('/enquiry', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    res.render('app/reports/enquiry', {
        menuActive: 'reports',
        submenuActive: 'enquiry',
        title: 'FitBiz | Enquiy Report',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/global/vendor/toastr/toastr.min.js', '/js/app/reports/enquiry.js','/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js'],
        styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']
    })
})

router.post('/enquiry', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = [];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.Enquiry({locationId, offset, limit, search, orderByColumn, orderByValue, filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({draw: req.query.draw, recordsTotal: report.total, recordsFiltered: report.total, data: report.report})
        }
    })
})

router.post('/enquiry-export', auth.checkPermission(['brand-admin', 'manager']), (req, res) => {
    const models = req.Core.Models;
    const post = req.body;

    const locationId = req.session.user.currentLocation.id;
    const offset = 0;
    const limit = 10000;
    const search = req.body.searchValue ? req.body.searchValue : false;
    const orderByArr = [];
    const orderByColumn = orderByArr[req.body.orderBy[0][0]];
    const orderByValue = req.body.orderBy[0][1];
    const filter = req.body.filter ? req.body.filter : false;

    models.Reports.Enquiry({locationId, offset:0, limit:1000, search, orderByColumn, orderByValue, filter}, (err, report) => {
        if (err) {
            res.send({success: false})
        } else {
            var fs = require('fs');
            var fileDir = `${require('path').resolve()}/public/reports/enquiry/`;
            var filename = `enquiry-report-${moment().unix()}.xls`;
            var writeStream = fs.createWriteStream(fileDir+`enquiry-report-${moment().unix()}.xls`);

            var header="Sr No."+"\t"+"Date"+"\t"+"Member Name"+"\t"+"Gender"+"\t"+"Mobile No."+"\t"+"Email ID"+"\t"+"Source"+"\t"+"Fitness Goal"+"\t"+" Interested In "+"\t"+"Enquiry Status "+"\t"+"Handled By"+"\n";
            
            writeStream.write(header,function(err){
                if(err){
                    res.send({success: false})
                }else{
                    var i=0;
                    async.map(report.report, (r, cb1) => {
                        var row =   (++i)
                                    +"\t"+moment(r.created_date).format('DD/MM/YYYY')
                                    +"\t"+(r.fname+' '+r.lname)
                                    +"\t"+((r.gender)?(r.gender):(''))
                                    +"\t"+r.phone
                                    +"\t"+r.email
                                    +"\t"+r.source
                                    +"\t"+((r.fitness_goal)?(r.fitness_goal):(''))
                                    +"\t"+((r.package_names)?(r.package_names):(''))
                                    +"\t"+r.status
                                    +"\t"+r.owner_name
                                    +"\n";
                       
                        writeStream.write(row,function(err){
                            cb1(err ? err : null)
                        })
                    }, (err, result) => {
                        writeStream.close(function(err){
                            if(err){
                                res.send({success: false})
                            }else{
                                res.send({success: true, filename: filename })
                            }
                        });
                    })
                }
            });
        }
    })
})
module.exports = router;