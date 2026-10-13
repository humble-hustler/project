var SALES = SALES || (function () {
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
                        // 'url': '/api/v1/orders/orders-view-all',
                       'url': '/super-admin/settings/sales-view-all',

                        //  /api/v1/orders/orders-view-all
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data':'name'},
                        {'data':'amount'},
                        {'data':'shop_name'}

                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    }],
                    order:[[0,'desc']],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('order_id', data.id);
                        $(row).attr('user_id', data.user_id);
                    },
                };

                var table = $('#sale-list').DataTable(dataTableOpt);

                // table.on('click', 'tr .order-no', function () {
                //     var order_id = $(this).closest('tr').attr('order_id');
                //     window.location.href=`/super-admin/shop/view/order/${order_id}`;
                // });

                table.on('click', 'tr .user-name', function () {
                    var user_id = $(this).closest('tr').attr('user_id');
                    window.location.href=`/super-admin/shop/view/user-orders/${user_id}`;
                });
            });
        }
    };
}());