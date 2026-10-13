var VIEW_PICKUPDELIVERY = VIEW_PICKUPDELIVERY || (function () {
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
                       'url': '/super-admin/shop/pickup_delivery/view-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data':'fname'},
                        {'data':'email'},
                        {'data':'current_date'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    }
                ],
                    order:[[0,'desc']]
                };

                var table = $('#pickup-delivery-list').DataTable(dataTableOpt);

                // table.on('click', 'tr', function () {
                //     alert("hello")
                //     var order_id = $(this).closest('tr').attr('order_id');
                //     window.location.href=`/super-admin/shop/view/order/${order_id}`;
                // });

                // table.on('click', 'tr', function () {
                //     var user_id = $(this).closest('tr').attr('user_id');
                //     window.location.href=`/super-admin/shop/view/user-orders/${user_id}`;
                // });

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