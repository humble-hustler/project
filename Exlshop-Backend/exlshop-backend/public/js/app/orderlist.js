var ORDER_LIST = ORDER_LIST || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf

            $(document).ready(function () {       
                var locationId = $("#param-locationId").val()
                var paramPeriod = $("#param-period").val()

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                       'url': `/app/orders/view/location/${locationId}/${paramPeriod}`,
                        headers: {
                            'csrf-token': _csrf
                        },
                     
                    },
                    'columns': [
                        {'data':'created_date', 'className':'order-date'},
                        {'data': 'instamojo_payment_request_id', 'className':'order-id'},
                        {'data': 'user_name','className':'user-name'},
                        {'data': 'products'},
                        {'data': 'price'},
                        {'data': 'shipping_address'},
                        {'data': 'Shipping_charges'}
                        
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
                                console.log(row)
                                return data ? moment(data).format('DD-MM-YYYY hh:mm a') : ''
                            }
                        },{
                            "targets": 2,
                            "render": function (data, type, row) {
                                var data = `<a ><span>`+row.user_name+`</span><br>
                                            <span class="font-size-12"><i class="fa fa-phone" aria-hidden="true"></i>  `+row.phone+`</span></a>`;
                                return data;
                            }
                        }
                    ],
                    order:[[0,'desc']],
                    'createdRow': function (row, data, index) {
                        $(row).attr('vendor_id', data.brands_id);
                        $(row).attr('order_id', data.id);
                        $(row).attr('user_id', data.user_id);
                    },
                };
              
                var table = $('#orderlist').DataTable(dataTableOpt);
                var day = paramPeriod.split("-")[2]
                var month = paramPeriod.split("-")[1]
                var year = paramPeriod.split("-")[0]
                
                table.on('click', 'tr .order-id', function () {
                    var order_id = $(this).closest('tr').attr('order_id');
                    window.location.href=`/app/accounts/view/order/${order_id}`;
                });
            });
        }
    };
}());