var VIEW_SINGLEORDER = VIEW_SINGLEORDER || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            _csrf = _args._csrf

            $(document).ready(function () {
                alert("jhjk")
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        // 'url': '/api/v1/orders/orders-view-all',
                       'url': '/app/grouporders/view-orders',
                        //  /api/v1/orders/orders-view-all
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data':'created_date'},
                        {'data': 'razorpay_order_id','className':'order-no'},
                        {'data': 'user_name','className':'user-name'},
                        {'data': 'products'},
                        {'data': 'address_label'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },{
                        "targets": 0,
                        "render": function (data, type, row) {
                            return data ? moment(data).format('DD-MM-YYYY hh:mm a') : ''
                        }
                    },{
                        "targets": 2,
                        "render": function (data, type, row) {
                            var data = `<a ><span>`+row.user_name+`</span><br>
                                        <span class="font-size-12"><i class="fa fa-phone" aria-hidden="true"></i>  `+row.phone+`</span></a>`;
                            return data;
                        }
                    },{
                        "targets": 4,
                        "render": function (data, type, row) {
                            var data = `<a ><i class="fa fa-map-marker" aria-hidden="true"></i> <span>`+row.address_label+`</span><br>
                                        <span > `+row.address_name+`</span></a><br>
                                        <span class="font-size-12">`+row.address_line_1+' '+row.shipping_address+`</span></a><br>`;
                            return data;
                        }
                    }],
                    order:[[0,'desc']],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('order_id', data.id);
                        $(row).attr('user_id', data.user_id);
                    },
                };

                var table = $('#grouporder-list').DataTable(dataTableOpt);

                table.on('click', 'tr .order-no', function () {
                    var order_id = $(this).closest('tr').attr('order_id');
                    window.location.href=`/super-admin/shop/view/order/${order_id}`;
                });

                table.on('click', 'tr .user-name', function () {
                    var user_id = $(this).closest('tr').attr('user_id');
                    window.location.href=`/super-admin/shop/view/user-orders/${user_id}`;
                });
            });
        }
    };
}());