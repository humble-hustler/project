/********************************************************/
/***** App dashboard Routes *****/
/********************************************************/
const moment = require('moment-timezone');
const _ = require('lodash');
const async = require('async');
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const http = require('http');
const AWS = require('aws-sdk');

/* Get Sales Page */
router.get('/', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    res.render('app/sales', {
        title: 'Exlshop - Sales',
        fw: true,
        menuActive: 'sales',
        submenuActive: '',
        styles: ['/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css', '/global/vendor/select2/select2.css', '/global/vendor/toastr/toastr.min.css'],
        scripts: ['/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/select2/select2.js', '/global/vendor/toastr/toastr.min.js', '/js/app/sales.js']
    });
})

/* Add items to cart */
router.post('/add-to-cart', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;

    models.Packages.GetSinglePackage({packageId: post.packageId, locationId}, (err, package) => {
        if (err) {
            res.send({success: false})
        } else {
            if(req.session.cart.memberId){
                models.Members.GetMemberships({locationId, memberId: req.session.cart.memberId}, (err, membership) =>{
                    if(err){
                        res.send({success: false})
                    }else{
                        package.discount = 0;
                        package.total = package.price;
                        package.subTotal = package.price - package.price * (package.discount / 100);
                        package.cost_price = package.price;

                        if(membership.length>0){
                            if(moment(membership[0].expiry_date) >= moment()){
                                package.start = moment(new Date(membership[0].expiry_date)).add(1,'days').format('YYYY-MM-DD');
                                package.expiry = moment(new Date(membership[0].expiry_date)).add(package.validity_days, 'days').format('YYYY-MM-DD');
                            }else{
                                package.start = moment().add(1,'days').format('YYYY-MM-DD');
                                package.expiry = moment().add(package.validity_days, 'days').format('YYYY-MM-DD');
                            }
                        }else{
                            package.start = moment(new Date()).format('YYYY-MM-DD');
                            package.expiry = moment(new Date()).add(package.validity_days, 'days').format('YYYY-MM-DD');
                        }
                        req.session.cart.line.push(package)
                        res.send({success: true})
                    }
                })
            }else{
                package.discount = 0;
                package.total = package.price;
                package.subTotal = package.price - package.price * (package.discount / 100);
                package.cost_price = package.price;
                package.start = moment(new Date()).format('YYYY-MM-DD');
                package.expiry = moment(new Date()).add(package.validity_days, 'days').format('YYYY-MM-DD');
                req.session.cart.line.push(package)
                res.send({success: true})
            }
        }
    })
})

router.post('/remove-package', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    var line = req.session.cart.line;
    _.remove(line, (l) => {
        return l.id == post.packageId && l.lineId == post.lineId
    })
    res.send({success: true})
})

/* Add member to cart */
router.post('/add-member-to-cart', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const locationId = req.session.user.currentLocation.id;

    models.Members.GetById({userId: post.memberId}, (err, member) => {
        if (err) {
            res.send({success: false})
        } else {
            req.session.cart.memberId = post.memberId;
            req.session.cart.memberDetails = member;
            //check members existing logs and update dates accordingly
            if(req.session.cart.line.length > 0){
                models.Members.GetMemberships({locationId, memberId: req.session.cart.memberId}, (err, membership) =>{
                    if(err){
                        res.send({success: false})
                    }else{
                        if(membership.length>0){
                            if(moment(membership[0].expiry_date) >= moment()){
                                req.session.cart.line[0].start = moment(new Date(membership[0].expiry_date)).add(1,'days').format('YYYY-MM-DD');
                                req.session.cart.line[0].expiry = moment(new Date(membership[0].expiry_date)).add(req.session.cart.line[0].validity_days, 'days').format('YYYY-MM-DD');
                            }
                            res.send({success: true})
                        }else{
                            res.send({success: true})
                        }
                    }
                })
            }else{
                res.send({success: true})
            }
        }
    })
})

/* Clear Cart */
router.post('/clear-cart', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    if (post.clear) {
        delete req.session.cart;
        res.send({success: true})
    } else {
        res.send({success: false})
    }
})

/* Detach Member */
router.post('/detach-member', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;

    if (post.detach) {
        req.session.cart.memberId = null;
        res.send({success: true})
    } else {
        res.send({success: false})
    }
})

/* Set Discount to cart item */
router.post('/set-discount', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const discount = parseInt(post.discount);
    const packageId = parseInt(post.packageId)
    const lineId = parseInt(post.lineId)
    const line = req.session.cart.line;
    const lineItem = _.find(line, {id: packageId, lineId: lineId});
    lineItem.discount = discount;
    res.send({success: true})
})

/* Set Membership period */
router.post('/set-membership-period', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const date = post.date;
    const periodType = post.periodType;
    const packageId = parseInt(post.packageId)
    const lineId = parseInt(post.lineId)
    const line = req.session.cart.line;
    const lineItem = _.find(line, {id: packageId, lineId: lineId});
    lineItem[periodType] = date;
    if (periodType == 'start') {
        lineItem.expiry = moment(date, 'YYYY-MM-DD').add(lineItem.validity_days, 'days').format('YYYY-MM-DD');
    }
    res.send({success: true})
})

/* Set Membership period */
router.post('/set-sold-by', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const userId = post.userId;
    const packageId = parseInt(post.packageId)
    const lineId = parseInt(post.lineId)
    const line = req.session.cart.line;
    const lineItem = _.find(line, {id: packageId, lineId: lineId});
    lineItem.soldBy = userId;
    res.send({success: true})
})

/* Set Price */
router.post('/set-price', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const price = parseInt(post.price);
    const packageId = parseInt(post.packageId)
    const lineId = parseInt(post.lineId)
    const line = req.session.cart.line;
    const lineItem = _.find(line, {id: packageId, lineId: lineId});
    lineItem.price = price;
    res.send({success: true})
})

/* Set Trainer for PT Products */
router.post('/set-trainer', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const discount = parseInt(post.discount);
    const packageId = parseInt(post.packageId)
    const lineId = parseInt(post.lineId)
    const line = req.session.cart.line;
    const lineItem = _.find(line, {id: packageId, lineId: lineId});
    lineItem.trainer_id = post.trainerId;
    res.send({success: true})
})

/* Set Time Slot */
router.post('/set-slot-id', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const packageId = parseInt(post.packageId)
    const lineId = parseInt(post.lineId)
    const line = req.session.cart.line;
    const lineItem = _.find(line, {id: packageId, lineId: lineId});
    lineItem.slotId = post.slotId;
    res.send({success: true})
})

/* Set Sale Date */
router.post('/set-sale-date', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const saleDate = post.saleDate;
    req.session.cart.saleDate = saleDate;
    res.send({success: true})
})

/* Set Sale Date */
router.post('/set-sale-comment', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const comment = post.comment;
    req.session.cart.comment = comment;
    res.send({success: true})
})

/* Add Payment Lines */
router.post('/add-payment', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    var paymentLines = req.session.cart.paymentLines;
    paymentLines.push({
        id: post.id,
        amount: parseFloat(post.amount),
        method: post.method ,
        cardType: post.cardType ? post.cardType : null,
        cardNo: post.cardNo ? post.cardNo : null,
        cardPhone: post.cardPhone ? post.cardPhone :null,
        chequeNo: post.chequeNo ? post.chequeNo : null,
        chequeDate: post.chequeDate ? post.chequeDate : null,
        bankName: post.bankName ? post.bankName : null,
        neftDate: post.neftDate ? post.neftDate : null,
        refNo: post.refNo ? post.refNo : null,
        razorpayTransactionId: post.razorpayTransactionId ? post.razorpayTransactionId : null
    });
    var helper = {};
    var groupedPaymentLines = paymentLines.reduce(function (r, o) {
        var key = o.id + '-' + o.method;

        if (!helper[key]) {
            helper[key] = Object.assign({}, o); // create a copy of o
            r.push(helper[key]);
        } else {
            helper[key].amount += o.amount;
        }

        return r;
    }, []);
    req.session.cart.paymentLines = groupedPaymentLines;
    res.send({success: true})
})

/* Remove Payment Line */
router.post('/remove-payment', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    var paymentLines = req.session.cart.paymentLines;
    _.remove(paymentLines, (n) => {
        return n.id == post.paymentId
    })
    res.send({success: true})
})

/* Refresh full cart layout */
router.post('/refresh-cart', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    /* Initialize blank session if req.session.cart not present */
    if (!_.has(req.session, 'cart')) {
        req.session.cart = {
            line: [],
            memberId: null,
            memberDetails: {},
            taxTotal: 0.00,
            taxTotalAmount: 0.00,
            totalAmount: 0.00,
            dueAmount: 0.00,
            paymentAmount: 0.00,
            paymentLines: []
        }
    }
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    const userId = req.session.cart.memberId;
    
    if (req.session.cart && req.session.cart.line.length > 0) {
        var cart = req.session.cart.line;
        var trainer_id = [];
        cart.forEach((c, i) => {
            if(c.trainer_id){
                trainer_id.push(c.trainer_id)
            }
        })
        async.auto({
            calculateTotals: (callback) => {
                var paymentAmount = req.session.cart.paymentAmount;
                models.Locations.GetLocationTax({locationId}, (err, taxes) => {
                    if (err) {
                        callback(err)
                    } else {
                        var taxTotalArr = [];
                        var idx = 1;
                        cart.forEach((c, i) => {
                            var taxArr = [];
                            var taxAmount = 0;
                            var totalTax = 0;
                            c.subTotal = c.price - c.price * (c.discount / 100);
                            var price = c.subTotal;
                            if (c.tax_included) {
                                var taxSum = _.sumBy(taxes, 'rate');
                                price = price / ((100 + taxSum) / 100);
                                c.priceExludingTax = price;
                                c.subTotal = price - price * (c.discount / 100);
                            }
                            taxes.forEach((t, i) => {
                                taxAmount = price * (t.rate / 100);
                                totalTax += parseFloat(taxAmount);
                                taxObj = {
                                    id: t.id,
                                    label: `${t.label} ${t.rate}%`,
                                    rate: t.rate,
                                    amount: parseFloat(taxAmount)
                                }
                                taxArr.push(taxObj)
                                taxTotalArr.push(taxObj)
                            })
                            c.total = price + totalTax;
                            c.tax = taxArr;
                            c.lineId = idx++;
                        })

                        var taxLineTotal = _(taxTotalArr)
                                .groupBy('label')
                                .map((platform, label) => ({
                                        label: label,
                                        amount: _.sumBy(platform, 'amount')
                                    }))
                                .value()
                        var taxTotalAmount = _.sumBy(taxTotalArr, 'amount')

                        var cartSubTotal = _.sumBy(cart, 'subTotal');
                        var totalAmount = cartSubTotal + taxTotalAmount;
                        var paymentLineTotal = 0;
                        if (req.session.cart.paymentLines.length === 0) {
                            var dueAmount = totalAmount - paymentAmount;
                        } else {
                            paymentLineTotal = _.sumBy(req.session.cart.paymentLines, 'amount')
                            var dueAmount = totalAmount - paymentLineTotal;
                        }
                        callback(null, {cartSubTotal, taxLineTotal, taxTotalAmount, totalAmount, dueAmount, paymentLineTotal})
                    }
                })
            },
            getPaymentMethods: (callback) => {
                models.Locations.GetPaymentMethods({locationId}, (err, paymentMethods) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, paymentMethods)
                    }
                })
            },
            states: (callback) => {
                models.Common.GetStates({countryId: 101}, (err, states) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, states)
                    }
                })
            },
            cities: (callback) => {
                models.Common.GetCities(null, (err, states) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, states)
                    }
                })
            },
            trainers: (callback) => {
                models.Team.GetTrainers({locationId}, (err, trainers) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, trainers)
                    }
                })
            },
            timeSlots: (callback) => {
                models.Locations.GetTimeSlots({locationId, offset:0, limit:100}, (err, timeSlots) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, timeSlots.timeSlots)
                    }
                })
            },
            team: (callback) => {
                models.Team.GetTeam({locationId, offset: 0, limit: 100}, (err, team) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, team.users)
                    }
                })
            },
            membershipLogs:  (callback) => {
                models.Members.GetMembershipLogByUserId({locationId, userId}, (err, membershipLogs) => {
                    callback(err ? err : null, membershipLogs)
                })
            },
            ptPackagesAllowed: ['membershipLogs',(result,callback) => {
                if(userId){
                    if(result.membershipLogs.length){
                        callback(null,1);
                    }else{
                        callback(null,0);
                    }
                }else{
                    callback(null,1);    
                }
            }],
            ptTimeSlots: (callback) => {
                models.Team.GetTimeSlots({userId: trainer_id.join(), locationId}, (err, timeSlots) => {
                    callback(err ? err : null, timeSlots);
                })
            },
            trainerSlotBookingLog: ['membershipLogs', function(result, callback){
                models.Team.GetBookedSlots({trainerId: trainer_id.join()}, (err, bookingLog) => {
                    callback(err ? err : null, bookingLog);
                })
            }],
        }, (err, result) => {
            if (err) {
                res.send({success: false})
            } else {
                req.session.cart.subTotal = parseFloat(result.calculateTotals.cartSubTotal.toFixed(2)); /* FLOAT - Cart Sub Total */
                req.session.cart.taxLineTotal = result.calculateTotals.taxLineTotal; /* Array - Tax lines and amount for each item in cart */
                req.session.cart.taxTotalAmount = parseFloat(result.calculateTotals.taxTotalAmount.toFixed(2)); /* FLOAT - Total tax amount */
                req.session.cart.totalAmount = parseFloat(result.calculateTotals.totalAmount.toFixed(2)); /* FLOAT - Total cart amount */
                req.session.cart.dueAmount = parseFloat(result.calculateTotals.dueAmount.toFixed(2)); /* FLOAT - Total Dus Amount */
                req.session.cart.paymentLineTotal = parseFloat(result.calculateTotals.paymentLineTotal.toFixed(2)); /* FLOAT - Total Dus Amount */
                res.render('app/partials/cart', {
                    cart: true,
                    paymentMethods: result.getPaymentMethods,
                    states: result.states,
                    cities: result.cities,
                    trainers: result.trainers,
                    team: result.team,
                    timeSlots: result.timeSlots,
                    membershipLogs : result.membershipLogs,
                    ptPackagesAllowed: result.ptPackagesAllowed,
                    ptTimeSlots: result.ptTimeSlots,
                    trainerBookingLog: result.trainerSlotBookingLog,
                    minDate: (result.membershipLogs.length)?(moment(result.membershipLogs[0].expiry_date).format('YYYY-MM-DD')):(moment().format('YYYY-MM-DD'))
                })
            }
        })
    } else {
        async.parallel({
            states: (callback) => {
                models.Common.GetStates({countryId: 101}, (err, states) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, states)
                    }
                })
            },
            membershipLogs:  (callback) => {
                models.Members.GetMembershipLogByUserId({locationId, userId}, (err, membershipLogs) => {
                    callback(err ? err : null, membershipLogs)
                })
            },
            getPaymentMethods: (callback) => {
                models.Locations.GetPaymentMethods({locationId}, (err, paymentMethods) => {
                    if (err) {
                        callback(err)
                    } else {
                        callback(null, paymentMethods)
                    }
                })
            }
        }, (err, result) => {
            res.render('app/partials/cart', {
                cart: false,
                states: result.states,
                membershipLogs: result.membershipLogs,
                paymentMethods: result.getPaymentMethods,
                ptTimeSlots: [],
                minDate: moment().format('YYYY-MM-DD')
            })
        })
    }
})

/* Complete Sale */
router.post('/complete', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const cart = req.session.cart;
    const cartClone = _.clone(cart);
    const locationId = req.session.user.currentLocation.id;
    const userId = req.session.user.id;
    const models = req.Core.Models;
    const smsLoginId=req.smsConfig.loginId;
    const smsPassword=req.smsConfig.password;
    const SESConfig = {
                    apiVersion:req.awsSESConfig.apiVersion,
                    accessKeyId:req.awsSESConfig.accessKeyId,
                    secretAccessKey:req.awsSESConfig.secretAccessKey,
                    region:req.awsSESConfig.region
                };

    const options = {
        locationId,
        memberId: cart.memberId,
        userId,
        comment: post.comment ? post.comment : null,
        packages: cartClone.line,
        payments: cartClone.paymentLines,
        isComplete: cartClone.dueAmount > 0 ? 0 : 1,
        totalAmount: cartClone.totalAmount,
        changeSale: post.changeSale,
        receivedBy: userId
    }
    async.auto({
        sale: (cb) => {
            models.Sales.Add(options, (err, saleId) => {
                if (err) {
                    cb(err)
                } else {
                    req.session.cart.complete = true;
                    cb(null, saleId)
                }
            })
        },
        saleLine : ['sale', (result, cb) => {
            models.Sales.GetSaleLine({saleId: result.sale}, (err,saleLine) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, saleLine)
                }
            })
        }],
        member : (cb) => {
            models.Members.GetById({userId: options.memberId}, (err,member) => {
                if (err) {
                    cb(err)
                } else {
                    cb(null, member)
                }
            })
        },
        sendSMS : ['member','saleLine', (result, cb) => {
            models.SmsEmail.GetSMSSingleTemplate({templateName:'sale-purchase', locationId}, (err, template) => {
                if (err) {
                    cb(err)
                } else {
                    models.Locations.GetById({locationId}, (err, brandLocation) => {
                        if (err) {
                            cb(err)
                        } else {
                            var packageNames = '', invoiceId='', startDate='', expiryDate='';
                            result.saleLine.forEach(function(sl){
                                packageNames += sl.name;
                                invoiceId = sl.sale_id;
                                startDate = sl.start_date;
                                expiryDate = sl.expiry_date;
                            })
                            var message = template.message;
                            
                            var formatted_message = message.replace('{title}', 'Hi')
                                                    .replace('{first_name}', result.member.fname)
                                                    .replace('{last_name}', result.member.lname)
                                                    .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                    .replace('{phone_no}', brandLocation.phone)
                                                    .replace('{plan_code}', packageNames)
                                                    .replace('{invoice_no}','#'+invoiceId)
                                                    .replace('{invoice_amount}',options.totalAmount)
                                                    .replace('{start_date}', startDate)
                                                    .replace('{end_date}', expiryDate)
                                                    .replace('{phone_no1}', brandLocation.phone)
                                                    .replace(/{(.*?)}/g, '')
                                                    .replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                                    // .replace('{term}', brandLocation.invoice_footer_notes);
                         
                            var url = 'http://198.15.103.106/API/pushsms.aspx?loginID='+smsLoginId+'&password='+smsPassword+'&mobile='+result.member.phone+'&text='+formatted_message+'&senderid=SHRIND&route_id=1&Unicode=0';
                            
                            http.get(url, (resp) => {
                                models.SmsEmail.StoreSMS({locationId, sendToMember: 1, sendToLeads: 0, message: formatted_message, phoneNo: result.member.phone, memberId: result.member.id }, (err) => {
                                    cb(err ? err : null)
                                })
                            }).on("error", (err) => {
                                cb(err);
                            });
                        }
                    })
                }
            })
        }],
        sendEmail : ['member','saleLine', (result, cb) => {
            models.SmsEmail.GetEmailSingleTemplate({templateName:'sale-purchase', locationId}, (err, template) => {
                if (err) {
                    cb(err)
                } else {
                    models.Locations.GetById({locationId}, (err, brandLocation) => {
                        if (err) {
                            cb(err)
                        } else {
                            var packageNames = '', invoiceId='', startDate='', expiryDate='';
                            result.saleLine.forEach(function(sl){
                                packageNames += sl.name;
                                invoiceId = sl.sale_id;
                                startDate = sl.start_date;
                                expiryDate = sl.expiry_date;
                            })
                            var message = template.message;
                            var paid_amount = _.sumBy(options.payments, 'amount');
                            var pending_amount = (options.totalAmount -  _.sumBy(options.payments, 'amount'));
                            var formatted_message = message.replace('{title}', 'Hii ').replace('{first_name}', result.member.fname)
                                                    .replace('{last_name}', result.member.lname)
                                                    .replace('{gym_name}', brandLocation.brand_name+', '+brandLocation.name)
                                                    .replace('{phone_no}', brandLocation.phone).replace('{plan_code}', packageNames)
                                                    .replace('{invoice_no}','#'+invoiceId)
                                                    .replace('{invoice_amount}',options.totalAmount)
                                                    .replace('{paid_amount}',  paid_amount)
                                                    .replace('{pending_amount}', pending_amount)
                                                    .replace('{start_date}', startDate)
                                                    .replace('{end_date}', expiryDate)
                                                    .replace('{phone_no1}', brandLocation.phone)
                                                    .replace(/{(.*?)}/g, '')
                                                    .replace(/(^[,\s]+)|([,\s]+$)/g, '');
                                                    // .replace('{term}', brandLocation.invoice_footer_notes);
                         
                            var params = {
                                Source:'sidhi.volvoiker@tapsoft.in',
                                Destination:{
                                    ToAddresses:[
                                        result.member.email
                                    ]
                                },
                                ReplyToAddresses:[
                                    'sidhi.volvoiker@tapsoft.in'
                                ],
                                Message:{
                                    Body:{
                                        Html:{
                                        Charset:"UTF-8",
                                        Data:formatted_message
                                      }
                                    },
                                    Subject:{
                                        Charset:'UTF-8',
                                        Data:'Exlshop'
                                    }
                                }
                            };
                            new AWS.SES(SESConfig).sendEmail(params,function(err, data) {
                                if (err) {
                                    cb1(err);
                                }else{
                                    models.SmsEmail.StoreEmail({locationId, sendToMember: 1, sendToLeads: 0, message: formatted_message, email: result.member.email, memberId: result.member.id }, (err) => {
                                        cb(err ? err : null)
                                    })
                                }          
                            })
                        }
                    })
                }
            })
        }]
    },function(err, result){
        if(err){
            res.send({success: false})
        }else{
            delete req.session.cart;
            res.send({success: true, saleId: result.sale})
        }
    })
})

//not used currently as we are redirecting from the view itself.
router.get('/complete', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    var cart = req.session.cart;
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;
    if (cart && typeof cart.complete !== 'undefined') {
        const cartClone = _.clone(cart);
        delete req.session.cart;
        models.Locations.GetById({locationId}, (err, locationInfo) => {
            if (err) {
                res.redirect('/404')
            } else {
                res.render('app/invoice', {
                    title: 'Exlshop - Invoice',
                    fw: true,
                    locationInfo,
                    cart: cartClone,
                    scripts: ['/js/app/invoice.js']
                })
            }
        })
    } else {
        res.redirect('/app/sales')
    }
})

router.get('/invoice/:saleId', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const saleId = req.params.saleId;
    const locationId = req.session.user.currentLocation.id;
    const models = req.Core.Models;

    async.auto({
        locationInfo: (cb) => {
            models.Locations.GetById({locationId}, (err, locationInfo) => {
                cb(err ? err : null, locationInfo)
            })
        },
        saleData: (cb) => {
            models.Sales.GetSaleData({saleId}, (err, sale) => {
                cb(err ? err : null, sale)
            })
        },
        memberDetails: ['saleData', (result, cb) => {
                var sale = result.saleData;
                models.Members.GetById({userId: sale.member_id}, (err, locationInfo) => {
                    cb(err ? err : null, locationInfo)
                })
            }],
        saleLine: (cb) => {
            models.Sales.GetSaleLine({saleId}, (err, cart) => {
                cb(err ? err : null, cart)
            })
        },
        saleTaxes: (cb) => {
            models.Sales.GetSaleTaxes({saleId}, (err, taxes) => {
                cb(err ? err : null, taxes)
            })
        },
        salePayments: (cb) => {
            models.Sales.GetSalePayments({saleId}, (err, payments) => {
                cb(err ? err : null, payments)
            })
        },
        membershipLogs:['saleData', (result, callback) => {
            var sale = result.saleData;
            models.Members.GetMembershipLogByUserId({locationId, userId: sale.member_id}, (err, membershipLogs) => {
                callback(err ? err : null, membershipLogs)
            })
        }],
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            var saleLine = result.saleLine;
            var saleTaxes = result.saleTaxes;
            var subTotal = 0;
            var taxTotalArr = [];
            saleLine.forEach((s) => {
                var membership_transferred = 0;
                var transferred_member_name = '';
                var price = s.selling_price;
                subTotal += price;
                if (s.tax_included) {
                    var taxSum = _.sumBy(taxes, 'rate');
                    price = price / ((100 + taxSum) / 100);
                }
                var taxArr = [];
                var taxAmount = 0;
                var totalTax = 0;
                var taxes = _.filter(saleTaxes, {package_id: s.id});
                taxes.forEach((t, i) => {
                    taxAmount = price * (t.rate / 100);
                    totalTax += parseFloat(taxAmount);
                    taxObj = {
                        label: `${t.label}`,
                        rate: t.rate,
                        amount: parseFloat(taxAmount)
                    }
                    taxArr.push(taxObj)
                    taxTotalArr.push(taxObj)
                })
                s.total_amount = s.selling_price + totalTax;
                s.taxes = taxArr;
                result.membershipLogs.forEach((m, i) => {
                    if(m.package_id == s.package_id && m.sale_id == s.sale_id && m.is_transferred == 1){
                        membership_transferred = 1;
                        transferred_member_name = m.transferred_to_member_name;
                    }
                })
                s.membership_transferred = membership_transferred;
                s.transferred_member_name = transferred_member_name;
            })
            var taxLineTotal = _(taxTotalArr)
                    .groupBy('label')
                    .map((platform, label) => ({
                            label: label,
                            amount: _.sumBy(platform, 'amount')
                        }))
                    .value()
            var taxTotalAmount = _.sumBy(taxTotalArr, 'amount')
            var totalAmount = subTotal + taxTotalAmount;

            res.render('app/invoice-print', {
                title: 'Exlshop - Invoice',
                fw: true,
                locationInfo: result.locationInfo,
                saleData: result.saleData,
                memberDetails: {
                    fname: result.memberDetails.fname,
                    lname: result.memberDetails.lname,
                    phone: result.memberDetails.phone,
                },
                saleLine,
                saleTaxes,
                subTotal,
                taxLineTotal,
                taxTotalAmount,
                totalAmount,
                salePayments: result.salePayments,
                amountDue: totalAmount.toFixed(2) -  _.sumBy(result.salePayments, 'amount').toFixed(2) ,
                scripts: ['/js/app/invoice.js']
            })
        }
    })
})

router.post('/update/add-payment', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        saleId: post.saleId,
        paymentMethodId: post.paymentMethodId,
        amount: post.paymentLineAmount,
        cardType: post.cardType ? post.cardType : null,
        cardNo: post.cardNo ? post.cardNo : null,
        cardPhone: post.cardPhone ? post.cardPhone :null,
        chequeNo: post.chequeNo ? post.chequeNo : null,
        chequeDate: post.chequeDate ? post.chequeDate : null,
        bankName: post.bankName ? post.bankName : null,
        neftDate: post.neftDate ? post.neftDate : null,
        refNo: post.refNo ? post.refNo : null,
        razorpayTransactionId: post.razorpayTransactionId ? post.razorpayTransactionId : null
    }

    models.Sales.AddPayment(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/get/payment-logs', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    models.Sales.GetSalePayments({saleId: post.saleId}, (err, payments) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, payments})
        }
    })
})

router.get('/update/:id', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const models = req.Core.Models;
    const saleId = req.params.id;

    res.render('app/sale-update', {
        title: 'Exlshop - Sale Update',
        fw: true,
        menuActive: 'accounting-sales',
        submenuActive: '',
        saleId,
        styles: ['/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css', '/global/vendor/select2/select2.css', '/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css'],
        scripts: ['/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/select2/select2.js', '/global/vendor/toastr/toastr.min.js', '/js/app/sale-edit.js']
    });
}) 

router.post('/refresh', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const saleId = post.saleId;
    const locationId = req.session.user.currentLocation.id;

    async.auto({
        sale: (callback) => {
            models.Sales.GetSaleData({saleId}, (err, sale) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, sale);
                }
            })
        },
        salePackages: (callback) => {
            models.Sales.GetSaleLine({saleId}, (err, line) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, line);
                }
            })
        },
        salePackageTaxes: (callback) => {
            models.Sales.GetSaleTaxes({saleId}, (err, taxes) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, taxes);
                }
            })
        },
        salePayments: (callback) => {
            models.Sales.GetSalePayments({saleId}, (err, payments) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, payments);
                }
            })
        },
        membershipLogs: (callback) => {
            models.Members.GetMembershipLogBySaleId({saleId}, (err, membershipLogs) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, membershipLogs);
                }
            })
        },
        trainers: (callback) => {
            models.Team.GetTrainers({locationId}, (err, trainers) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, trainers)
                }
            })
        },
        team: (callback) => {
            models.Team.GetTeam({locationId, offset: 0, limit: 100}, (err, team) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, team.users)
                }
            })
        },
        timeSlots: (callback) => {
            models.Locations.GetTimeSlots({locationId, offset:0, limit:100}, (err, timeSlots) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, timeSlots.timeSlots)
                }
            })
        },
        ptTimeSlots: ['membershipLogs', function(result, callback){
            var trainer_id = [];
            result.membershipLogs.forEach(function(ml){
                trainer_id.push(ml.trainer_id);
            })
            models.Team.GetTimeSlots({userId: trainer_id.join(), locationId}, (err, timeSlots) => {
                callback(err ? err : null, timeSlots);
            })
        }],
        memberDetails: ['sale', function(result, callback){
            models.Members.GetById({userId: result.sale.member_id}, (err, member) => {
                callback(err ? err : null, member);
            })
        }],
        allMembershipLogs:  ['sale', function(result, callback){
            models.Members.GetMembershipLogByUserId({locationId, userId: result.sale.member_id}, (err, membershipLogs) => {
                callback(err ? err : null, membershipLogs)
            })
        }],
        paymentMethods: (callback) => {
            models.Locations.GetPaymentMethods({locationId}, (err, paymentMethods) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, paymentMethods)
                }
            })
        },
        trainerSlotBookingLog: ['membershipLogs', function(result, callback){
            var trainer_id = [];
            result.membershipLogs.forEach(function(ml){
                trainer_id.push(ml.trainer_id);
            })
            models.Team.GetBookedSlots({trainerId: trainer_id.join()}, (err, bookingLog) => {
                callback(err ? err : null, bookingLog);
            })
        }],
    }, function(err, result){
        if(err){
            res.render('/404');
        }else{
            res.render('app/partials/sale',{
                sale: result.sale,
                salePackages: result.salePackages,
                salePackageTaxes: result.salePackageTaxes,
                salePayments: result.salePayments,
                membershipLogs: result.membershipLogs,
                trainers: result.trainers,
                team: result.team,
                timeSlots: result.timeSlots,
                ptTimeSlots: result.ptTimeSlots,
                memberDetails: result.memberDetails,
                allMembershipLogs: result.allMembershipLogs,
                paymentMethods: result.paymentMethods,
                trainerBookingLog: result.trainerSlotBookingLog
            });
        }   
    })
})

router.post('/update/details', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        saleId: post.saleId,
        saleDate: post.saleDate,
        comment: post.comment
    }

    models.Sales.UpdateDetails(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/update/membership', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        saleId: post.saleId,
        saleId: post.saleId,
        packageId: post.packageId,
        soldBy: post.soldBy ? post.soldBy : 0,
        slotId: post.slotId,
        startDate: post.startDate
    }

    models.Sales.UpdateMembership(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/update/price', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        saleId: post.saleId,
        packageId: post.packageId,
        price: post.price,
    }

    models.Sales.UpdatePrice(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})

router.post('/update/package', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        saleId: post.saleId,
        newPackageId: post.newPackageId,
        oldPackageId: post.oldPackageId,
    }
    const locationId = req.session.user.currentLocation.id;
    models.Locations.GetLocationTax({locationId}, (err, taxes) => {
        if(err){
            res.send({success: false})
        }else{
            options.taxes = taxes;
            models.Sales.UpdatePackage(options, (err) => {
                if (err) {
                    res.send({success: false})
                } else {
                    res.send({success: true})
                }
            })
        }
    })
})

router.post('/update/trainer', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        saleId: post.saleId,
        trainerId: post.trainerId,
        packageId: post.packageId
    }
    const locationId = req.session.user.currentLocation.id;
    models.Sales.UpdateTrainer(options, (err) => {
        if(err){
            res.send({success: false})
        }else{
            res.send({success: true})
        }
    })
})

router.post('/delete', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        saleId: post.sale_id,
        locationId : req.session.user.currentLocation.id
    }

    models.Sales.Delete(options, (err) => {
        if(err){
            res.redirect('/404');
        }else{
            res.redirect('back')
        }
    })
})

router.post('/validate-sale-dates', auth.checkPermission(['brand-admin', 'manager', 'operator']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const packages = req.session.cart.line;
    const startDate = packages ? packages[0].start : null;
    const expiryDate = packages ? packages[0].expiry : null;
    const isPT = packages ? packages[0].is_pt : null;
    const memberId = req.session.cart.memberId;
    var isValid = 1;
    const locationId = req.session.user.currentLocation.id;
    models.Members.GetMemberships({memberId, active:1, locationId}, (err, memberships) => {
        if(err){
            res.send({success: false});
        }else{
            if(memberships.length==0){
                res.send({success: true, isValid: 1});
            }else{
                memberships.forEach(function(m){
                    if(moment(m.expiry_date).format('YYYY-MM-DD') > startDate && isPT == m.is_pt){
                        isValid = 0;
                    }
                })
                res.send({success: true, isValid})
            }
        }
    })
})

module.exports = router;