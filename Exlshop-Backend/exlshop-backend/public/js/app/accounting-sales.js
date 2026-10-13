var VIEW_ORDER = VIEW_ORDER || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            const    _csrf = _args._csrf;
            const   order_status = JSON.parse(Args.order_status)

            function saleChildRow(o) {
                var table = `<table class="table report-child-row"> 
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Regular Price</th>
                            <th>Selling Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>`
                o.forEach((o) => {
                    table += `<tr>
                            <td>${o.product_id}</td>
                            <td>${o.product_name}</td>
                            <td>₹ ${o.regular_price.toFixed(2)}</td>
                            <td>₹ ${(o.regular_price-o.discount_price).toFixed(2)}</td>
                            <td>${o.quantity}</td>
                            <td>₹ ${(o.regular_price-o.discount_price)*o.quantity.toFixed(2)}</td>
                        </tr>`
                })
                table += `</tbody> </table>`
                return table
            }

            $(document).ready(function () {
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                       'url': '/app/accounts/view-all-orders',
                        //  /api/v1/orders/orders-view-all
                        // /api/v1/appOrder/orders-view-all
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data':'id'},
                        {'data': 'razorpay_order_id','className':'order-no'},
                        {'data': 'user_name','className':'user-name'},
                        {'data': 'address_label'},
                        {'data': 'created_date'},
                        {'data': 'name'},
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },
                    {
                        "targets": 0,
                        "render": function (data, type, row) {
                            return `<a href="#" class="expand-row" data-order-id="${row.id}"><i class="fa fa-bars" id="orderid" value="${row.id}"></i></a>`
                        }
                    },
                    {
                        "targets": 1,
                        "render": function (data, type, row) {
                            return `${row.razorpay_order_id}<br>${row.payment_mode}`
                        }
                    },
                    {
                        "targets": 4,
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
                        "targets": 3,
                        "render": function (data, type, row) {
                            var data = `<a ><i class="fa fa-map-marker" aria-hidden="true"></i> <span>`+row.address_label+`</span><br>
                                        <span > `+row.address_name+`</span></a><br>
                                        <span class="font-size-12">`+row.address_line_1+' '+row.shipping_address+`</span></a><br>`;
                            return data;
                        }
                    },
                    {
                        "targets": 6,
                        "render": function (data, type, row) {
                            return CreateSel(row.assignedId)
                        }
                    }],
                    order:[[0,'desc']],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('order_id', data.id);
                        $(row).attr('user_id', data.user_id);
                    },
                };

                function CreateSel(selStaff){
                    var list = ''
                    $.ajax({
                        'async': false,
                        url: '/app/accounts/stafflist',
                        method: 'POST',
                        data: {
                            _csrf: _csrf
                        },
                        success: function (data) {
                            if (data.success) {
                                list = `<select class="form-control assignStaff" name="staffId" id="assign_staff">
                                            <option value="">Select Staff</option>`
                                    data.data.forEach((s) => {
                                    list += `<option value="${s.id}" ${s.id==selStaff ? 'selected' : ''}>${s.user_name}</option>`
                                })
                                list += `</select>`
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                    return list;
                }

                var table = $('#order-list').DataTable(dataTableOpt);
               
                table.on('click', 'tr .order-no', function () {
                    var order_id = $(this).closest('tr').attr('order_id');
                    window.location.href=`/app/accounts/view/order/${order_id}`;
                });

                table.on('click', 'tr .user-name', function () {
                    var user_id = $(this).closest('tr').attr('user_id');
                    window.location.href=`/app/accounts/view/user-orders/${user_id}`;
                });

                $('#order-list').on('click', '.expand-row', function (e) {
                    e.preventDefault()
                    var tr = $(this).closest('tr');
                    var row = table.row(tr);
                    var orderId = $(this).data('order-id');
                    if (row.child.isShown()) {
                        row.child.hide();
                        tr.removeClass('shown');
                    } else {
                        $.ajax({
                            url: '/app/accounts/getorderproducts/' + orderId,
                            method: 'POST',
                            data: {
                                _csrf: _csrf
                            },
                            success: function (data) {
                                if (data.success) {
                                    row.child(saleChildRow(data.orderProducts)).show();
                                    tr.addClass('shown');
                                } else {
                                    toastr.error('Some error occurred')
                                }
                            }
                        });
                    }
                });

                $(document).on('change',"#assign_staff",function() {
                    var assignedId = $(this).val()
                    var orderId = $(this).closest('tr').attr('order_id')
                    $.ajax({
                        url: '/app/accounts/assignStaff',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            assignedId: assignedId,
                            orderId: orderId
                        },
                        success: function (data) {
                            if (data.success) {
                                window.location.reload()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })

                $('#apply-filter').on('click', function () {
                    var table = $('#order-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            orderplaced_datefrom:$('#from').val() ,
                            orderplaced_dateto: $('#to').val(),                          
                            order_status: $('#statusId').val(),
                            order_id: $('#orderidFilter').val(),
                            customer_name: $('#customerName').val()
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click',()=>{
                    var table = $('#order-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            orderplaced_datefrom:null ,
                            orderplaced_dateto: null,                          
                            order_status:null,
                            order_id: null,
                            customer_name: null
                        }
                    }
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })
            });
        }
    };
}());