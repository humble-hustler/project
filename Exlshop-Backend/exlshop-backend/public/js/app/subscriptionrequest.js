
var SUBSCRIPTION_REQUEST = SUBSCRIPTION_REQUEST || (function () {
    return {
        init: function (Args) {
            var _args = Args;
            var _csrf = _args._csrf
            var flash = _args.flash
            var subscription_details = (_args.subscription_details)
            var subscription_plans = JSON.parse(_args.subscription_plans)
            var session = JSON.parse(_args.session)
          
            $(document).ready(function () {
                if (flash) {
                    toastr.error(flash)
                }   

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url':'/app/subscriptionrequest/subscription-details',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                     "dataSrc": "",
                    'columns': [
                        {'data':'plan_name'},
                        {'data':'amount'},
                        {'data':'created_at'},
                        {'data':'end_date'},
                        {'data':'status'},
                        // {
                        //     'render': function (data, type, row, meta) {
                        //         if(row.status == 1) {
                        //             data = '<a href="#" data-toggle="modal" data-target="#update-subscription" class="update-subscription-btn">\n\
                        //                 <i  class="fa fa-pencil" aria-hidden="true" id="update_btn" > </i></a>&nbsp;&nbsp;\n\
                        //                 <a href="#" data-toggle="modal" data-target="#cancel-subscription" class="cancel-subscription-btn">\n\
                        //                 <i  class="fa fa-trash" aria-hidden="true" id="cancel_btn" > </i></a>&nbsp;&nbsp;\n\
                        //                 ';

                        //         return data;
                        //         }
                        //     }
                        // },
                        
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center'
                    },
                    {
                        "targets": 1,
                        "render": function (data, type, row) {
                            if(data == null){
                                return `₹ 0`
                            }else{
                                return `₹ ${data}`
                            }
                        }
                    },
                    {
                        "targets": 2,
                        "render": function (data, type, row) {
                            return `${moment(data).format('Do MMM YYYY hh:mm A')}`
                        }
                    },
                    {
                        "targets": 3,
                        "render": function (data, type, row) {
                            return `${moment(data).format('Do MMM YYYY hh:mm A')}`
                        }
                    },
                    {
                        "targets": 4,
                        "render": function (data, type, row) {
                            let endDate = new Date(row.end_date)
                            endDate.setDate(endDate.getDate() + 1)
                            if(data == 1 && new Date().toISOString() < endDate.toISOString()) {
                                return `<span class="badge badge-success">Active</span>`;
                            } else {
                                return `<span class="badge badge-danger">Inactive</span>`;
                            }
                        }
                    },                 
                    ],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('razorpay_payment_id', data.razorpay_payment_id);
                        $(row).attr('razorpay_order_id', data.razorpay_order_id);
                        $(row).attr('plan_id', data.plan_id);
                    },
                    'order': [[0, 'asc']]
                };
                var table = $('#subscription-list').DataTable(dataTableOpt);

                $(document).on('change','#addplanName', function() {
                    $("#addplanValidity").val('')
                    $("#addallowedProducts").val('')
                    $("#addallowedFeatures").val('')
                    
                    subscription_plans.forEach((p) => {
                        if($("#addplanName").val()==p.id){
                            $("#addplanId").val(p.id)
                            $("#addplanAmount").val(p.amount)
                            $("#addallowedProducts option").filter(function() {
                                return this.text == p.allowed_products
                            }).attr('selected', true);
                            $("#addaddProReq").val(p.add_product_req)
                            $("#addnoofreq").val(p.no_of_req)
                            if(p.allowed_features){
                                var featArr = p.allowed_features.split(',');
                                $("#addallowedFeatures").val(featArr)
                            } else {
                                $("#addallowedFeatures").val('')
                            }
                            if(p.period == 'yearly'){
                                $("#addplanValidity").val(12)
                            } else if (p.period == 'monthly') {
                                $("#addplanValidity").val(p.plan_interval)
                            }
                        }
                    });
                })

                $(document).on('click','#add-plan-btn', function() {
                    var planName = $("#addplanName").val()
                    var planId = $("#addplanId").val()
                    var amount = $("#addplanAmount").val()
                    var planPeriod = $("#addplanValidity option:selected").attr('data-period')
                    var interval = $("#addplanValidity").val()

                    if (!$("#addplanName").val()) {
                        toastr.error('Please Select Plan');
                        return;
                    }
                    if (!$("#addplanAmount").val()) {
                        toastr.error('Please Add Amount');
                        return;
                    }
                    $.ajax({
                        url: "/app/subscriptionrequest/registrationCheckout",
                        data: {
                            _csrf:  _csrf,
                            amount: amount,
                            planName:planName,
                            planId:planId,
                            planPeriod:planPeriod,
                            interval:interval,
                            purpose : 'For subscription',
                            redirect_url: location.origin + '/app/subscriptionrequest/confirm',
                        },
    
                        method: 'POST',
                        success: function (data) {
                            var options = {
                                                "key": data.key,
                                                "name": "Exlshop",
                                                "amount": amount*100,
                                                "description": "",
                                                "image": "/images/logo.png",
                                                "handler": function (response) {
                                                    $.ajax({
                                                        url: '/app/subscriptionrequest/confirm',
                                                        method: 'POST',
                                                        dataType: 'json',
                                                        data: {
                                                            _csrf,
                                                            subscriptionId:data.subscriptionId,
                                                            amount: amount,
                                                            paymentResponse: response,
                                                            planId:planId,
                                                            planPeriod:planPeriod,
                                                            interval:interval,
                                                            old_subscriptionId: session.user.currentLocation.plan_id ? session.user.currentLocation.plan_id : null
                                                        },
                                                        success: function (data) {
                                                            if (data) {
                                                                toastr.success('Successfull')
                                                                location.href = '/app/subscriptionrequest/subscription'
                                                            } else {
                                                                toastr.error('Some error occurred. Please contact support')
                                                            }
                                                        }
                                                    })
                                                }
                                            };
                                            // var rzp = new Razorpay(options);
                                            // rzp.open();
                                            const longurl = data.payment_request.longurl;
                                            window.location.href = longurl;
                           
                        },
                        error: function (data, status, error) {
                            console.log(error)
                        }
                    });
                })
                $(document).on('click','.update-subscription-btn', function () {
                    var text1 = $(this).closest('tr').attr('plan_id')
                    $("#planId").attr('order_id',$(this).closest('tr').attr('razorpay_order_id'))
                    $("#planName option").filter(function() {
                        return $(this).val() == text1
                    }).attr('selected', true);
                    subscription_plans.forEach((p) => {
                        if($("#planName").val()==p.id){
                            $("#planId").val(p.id)
                            $("#planAmount").val(p.amount)
                            $("#allowedProducts option").filter(function() {
                                return this.text == p.allowed_products
                            }).attr('selected', true);
                            $("#addProReq").val(p.add_product_req)
                            $("#noofreq").val(p.no_of_req)
                            var featArr = p.allowed_features.split(',');
                            $("#allowedFeatures").val(featArr)
                            if(p.period == 'yearly'){
                                $("#planValidity").val(12)
                            } else if (p.period == 'monthly') {
                                $("#planValidity").val(p.plan_interval)
                            }
                        }
                    });
                });

                $(document).on('change','#planName', function() {
                    $("#allowedProducts option").attr('selected', false);
                    subscription_plans.forEach((p) => {
                        if($("#planName").val()==p.id){
                            $("#planId").val(p.id?p.id:'')
                            $("#planAmount").val(p.amount?p.amount:'')
                            $("#allowedProducts option").filter(function() {
                                return this.text == p.allowed_products
                            }).attr('selected', true)
                           
                            $("#addProReq").val(p.add_product_req?p.add_product_req:'')
                            $("#noofreq").val(p.no_of_req?p.no_of_req:'')
                            if(p.allowed_features){
                                var featArr = p.allowed_features.split(',');
                                $("#allowedFeatures").val(featArr)
                            } else {
                                $("#allowedFeatures").val('')
                            }
                            if(p.period == 'yearly'){
                                $("#planValidity").val(12)
                            } else if (p.period == 'monthly') {
                                $("#planValidity").val(p.plan_interval)
                            }
                        }
                    });
                })

                $(document).on('click',".cancel-subscription-btn", function() {
                    var val = $(this).closest('tr').attr('razorpay_payment_id')
                    var val1 = $(this).closest('tr').attr('razorpay_order_id')
                    $("#current_subsciption").attr('value',val)
                    $("#current_subsciption").attr('order_id',val1)
                })
           
                // $('#update-existing-plan-btn').on('click',function (e) {
                //     var planName = $("#planName").val()
                //     var planId = $("#planId").val()
                //     var amount = $("#planAmount").val()
                //     var planPeriod = $("#planValidity option:selected").attr('data-period')
                //     var interval = $("#planValidity").val()
                //     var old_subscriptionId = $("#planId").attr('order_id')
                    
                //     $.ajax({
                //         //   url:'/api/v1/index1/login',
                //         url: "/app/subscriptionrequest/registrationCheckout",
                //         data: {
                //             _csrf:  _csrf,
                //             id:old_subscriptionId,
                //             amount: amount,
                //             planName:planName,
                //             planId:planId,
                //             planPeriod:planPeriod,
                //             interval:interval,
                //             purpose : 'For subscription',
                //             redirect_url: location.origin + '/app/subscriptionrequest/confirm',
                //         },
    
                //         method: 'POST',
                //         success: function (data) {
                //             var options = {
                //                                 "key": data.key,
                //                                 "amount": amount*100,
                //                                 "name": "Exlshop",
                //                                 "description": "",
                //                                 "image": "/images/logo.png",
                //                                 "handler": function (response) {
                //                                     $.ajax({
                //                                         url: '/app/subscriptionrequest/confirm',
                //                                         method: 'POST',
                //                                         dataType: 'json',
                //                                         data: {
                //                                             _csrf,
                //                                             subscriptionId:data.subscriptionId,
                //                                             amount: amount,
                //                                             paymentResponse: response,
                //                                             planId:planId,
                //                                             planPeriod:planPeriod,
                //                                             interval:interval,
                //                                             old_subscriptionId:old_subscriptionId
                //                                         },
                //                                         success: function (data) {
                //                                             if (data) {
                //                                                 toastr.success('Successfull')
                //                                                 location.href = '/app/subscriptionrequest/subscription'
                //                                             } else {
                //                                                 toastr.error('Some error occurred. Please contact support')
                //                                             }
                //                                         }
                //                                     })
                //                                 }
                //                             };
                //                             // var rzp = new Razorpay(options);
                //                             // rzp.open();
                //                             const longurl = data.payment_request.longurl;
                //                             window.location.href = longurl;
                           
                //         },
                //         error: function (data, status, error) {
                //             console.log(error)
                //         }
                //     });
                //  });

                 $("#current_subsciption").hide()

                 $("#cancel_plan").on('click',()=>{
                   var razorpay_order_id=$("#current_subsciption").attr('order_id')
                   var razorpay_payment_id=$("#current_subsciption").val()
                    $.ajax({
                        //   url:'/api/v1/index1/login',
                        url: "/app/subscriptionrequest/cancel_subscription",
                        data: {
                            _csrf:  _csrf,
                            razorpay_order_id:razorpay_order_id,
                            razorpay_payment_id:razorpay_payment_id
                        },
    
                        method: 'POST',
                        success: function (data1) {
                            window.location.href='/app/subscriptionrequest/subscription'
                        },
                        error: function (data, status, error) {
                            console.log(error)
                        }
                    });
                 })
           
            });

        }
    }
}());