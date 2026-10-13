var VIEW_SUBSCRIPTION_PLAN = VIEW_SUBSCRIPTION_PLAN || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            _csrf = _args._csrf

            $(document).ready(function () {
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                       'url': '/super-admin/shop/subscription_plan/view-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data':'id'},
                        {'data':'name'},
                        {'data':'period'},
                        {'data':'plan_interval'},
                        {'data':'amount'},
                        {
                            'render': function (data, type, row, meta) {
                                data = '<a href="#" data-toggle="modal" data-target="#delete-plan" class="delete-plan-btn">\n\
                                        <i class="fa fa-trash" aria-hidden="true" id="delete-btn-plan"></i>\n\
                                    </a>';
                                return data;
                            }
                        }
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },
                    {
                        "targets": 4,
                        "render": function (data, type, row) {
                            return `₹ ${data}`
                        }
                    },],
                    'createdRow': function(row, data, dataIndex) {
                        $(row).attr('plan_id', data.id);
                        $(row).attr('plan_name', data.name);
                        $(row).attr('plan_period', data.period);
                        $(row).attr('plan_interval', data.plan_interval);
                        $(row).attr('plan_amount', data.amount);
                        $(row).attr('allowed_products', data.allowed_products);
                        $(row).attr('allowed_req', data.add_product_req);
                        $(row).attr('no_of_req', data.no_of_req);
                        $(row).attr('allowed_features', data.allowed_features);
                    },
                    order:[[0,'desc']]
                };

                var table = $('#subscription-plan-list').DataTable(dataTableOpt);

                table.on('click', 'tr td:not(:last-child)', function () {
                    $("#planName").prop('disabled',true)
                    $("#planName").val($(this).closest('tr').attr('plan_name'))
                    $("#planId").prop('disabled',true)
                    $("#planId").val($(this).closest('tr').attr('plan_id'))
                    $("#planAmount").prop('disabled',true)
                    $("#planAmount").val($(this).closest('tr').attr('plan_amount'))
                    $("#planValidity").prop('disabled',true)
                    if($(this).attr('plan_period')=='monthly') {
                        $("#planValidity").val($(this).closest('tr').attr('plan_interval'))
                    } else if($(this).attr('plan_period')=='yearly') {
                        $("#planValidity").val(12)
                    }
                    var text1 = $(this).closest('tr').attr('allowed_products')
                    $("#allowedProducts option").filter(function() {
                        return this.text == text1; 
                    }).attr('selected', true);
                    $("#addProReq").val($(this).closest('tr').attr('allowed_req'))
                    if($(this).attr('allowed_req')==1){
                        $("#noofreq").prop('disabled',false)
                    } else {
                        $("#noofreq").prop('disabled',true)
                    }
                    $("#noofreq").val($(this).closest('tr').attr('no_of_req'))
                    var featArr = $(this).closest('tr').attr('allowed_features').split(',');
                    $("#allowedFeatures").val(featArr)
                    $("#view-edit-plan").modal('toggle')
                    $("#add-new-plan-btn").hide()
                    $("#update-existing-plan-btn").show()
                });

                $("#update-existing-plan-btn").on('click', function() {
                    var planId = $("#planId").val()
                    var planName = $("#planName").val()
                    var planAmount = $("#planAmount").val()
                    var allowedProducts = $("#allowedProducts option:selected").text()
                    var addProReq = $("#addProReq").val()
                    var noofreq = $("#noofreq").val()
                    var allowedFeatures = $("#allowedFeatures").val()
                    var planInterval = $("#planValidity").val()
                    var planPeriod = $("#planValidity option:selected").attr('data-period')
                    $.ajax({
                        url: "/super-admin/shop/update_subscription_plan",
                         data:{
                             planId,
                             planName,
                             planPeriod,
                             planAmount,
                             allowedProducts,
                             addProReq,
                             noofreq,
                             allowedFeatures,
                             planInterval,
                             _csrf: _csrf
                         },	
                         method: 'POST',					
                         success: function(data) {
                             toastr.success('Shop Subscription Plan Created Successfully!');
                             window.location = "/super-admin/shop/subscription_plan";
                         },
                         error: function(data,status,error) {
                             toastr.error('Some error occurred')
                         }
                     });
                })
                $("#add-new-plan").on('click', function() {
                    $("#update-existing-plan-btn").hide()
                    $("#add-new-plan-btn").show()
                    $("#planId").prop('disabled',true)
                    $("#addProReq").on('change', function() {
                        if($("#addProReq").val() == 1) {
                            $("#noofreq").prop('disabled', false)
                        }
                    }) 
                    $("#add-new-plan-btn").on('click', function() {
                        var planName = $("#planName").val()
                        var planAmount = $("#planAmount").val()
                        var allowedProducts = $("#allowedProducts option:selected").text()
                        var addProReq = $("#addProReq").val()
                        var noofreq = $("#noofreq").val()
                        var allowedFeatures = $("#allowedFeatures").val()
                        var planInterval = $("#planValidity").val()
                        var planPeriod = $("#planValidity option:selected").attr('data-period')
                        $.ajax({
                           url: "/super-admin/shop/add_subscription_plan",
                            data:{
                                planName,
                                planPeriod,
                                planAmount,
                                allowedProducts,
                                addProReq,
                                noofreq,
                                allowedFeatures,
                                planInterval,
                                _csrf: _csrf
                            },	
                            method: 'POST',					
                            success: function(data) {
                                toastr.success('Shop Subscription Plan Created Successfully!');
                                window.location = "/super-admin/shop/subscription_plan";
                            },
                            error: function(data,status,error) {
                                toastr.error('Some error occurred')
                            }
                        });
                    })
                })

                $(document).on('click','.delete-plan-btn', function () {
                    $('#plan-id').val($(this).closest('tr').attr('plan_id'));
                });

                $("#delete-plan-btn").on('click',function (e) {
                    var plan_id = $('#plan-id').val();
                    $.ajax({
                        url: '/super-admin/shop/delete_subscription_plan',
                        data:{
                            planId:plan_id,
                            _csrf: _csrf
                        },
                        method: 'POST',
                        success: function(data) {
                            toastr.success('Shop Subscription Plan Deleted Successfully!');
                            window.location = "/super-admin/shop/subscription_plan";
                        },
                        error: function(data,status,error) {
                            toastr.error('Some error occurred')
                        }
                    });
                });


                table.on('click', 'tr .user-name', function () {
                    var user_id = $(this).closest('tr').attr('user_id');
                    window.location.href=`/super-admin/shop/view/user-orders/${user_id}`;
                });

                $('#add-new-team-member-btn').on('click',()=>{
                    var planName=$('#plan_name').val()
                    var planPeriod=$('#plan_period').val()
                    var amount=$('#plan_amount').val()
                    $.ajax({
                        //   url :"/api/v1/brands/UpdateBrand",
                       url: "/super-admin/shop/add_subscription_plan",
                        data:{
                            planName,
                            planPeriod,
                            amount,
                              _csrf: _csrf},	
                              method: 'POST',					
                              success: function(data) {
                              toastr.success('Shop subscription plan created  successfully!');
                               window.location = "/super-admin/shop/subscription_plan";
                               },
                              error: function(data,status,error) {
                              toastr.error('Some error occurred')
                               }
                    });	
                })
            });
        }
    };
}());