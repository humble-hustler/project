var REPORT_SALES = REPORT_SALES || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;

            function saleChildRow(s) {
                var table = `<table class="table report-child-row"> 
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Package</th>
                            <th>Package Price</th>
                            <th>Selling Price</th>
                            <th>Total Tax</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>`
                s.forEach((s) => {
                    table += `<tr>
                            <td>${s.line_id}</td>
                            <td>${s.name}</td>
                            <td>Rs. ${s.cost_price.toFixed(2)}</td>
                            <td>Rs. ${s.selling_price.toFixed(2)}</td>
                            <td>Rs. ${s.tax_amount.toFixed(2)}</td>
                            <td>Rs. ${s.total.toFixed(2)}</td>
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
                        'url': '/app/reports/sales/',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'created_date'},
                        {'data': 'sale_location_id'},
                        {'data': 'fname'},
                        {'data': 'total_amount'},
                        {'data': 'amount_paid'},
                        {'data': 'comment'},
                        {'data': 'completed'}
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
                                var action = ``
                                if (row.completed) {
                                    action = `<a href="/app/sales/invoice/${row.id}" class="view-invoice" data-sale-id="${row.id}" target="_blank"><i class="fa fa-list text-info mr-5"></i></a>`
                                } else {
                                    action = `<a href="#" class="get-receipts" data-sale-id="${row.id}"><i class="fa fa-list text-info mr-5"></i></a>`
                                }
                                return `${action} <a href="#" class="expand-row" data-sale-id="${row.id}"><i class="fa fa-plus-circle text-success"></i></a> ${moment(data).format('DD MMM YYYY')} <small>${moment(data).format('hh:mm A')}</small>`
                            }
                        },
                        {
                            "targets": [3, 4],
                            "render": function (data, type, row) {
                                return `Rs. ${data}`
                            }
                        },
                        {
                            "targets": 2,
                            "render": function (data, type, row) {
                                return `${row.fname ? row.fname : ''} ${row.lname ? row.lname: ''}`
                            }
                        },
                        {
                            "targets": 6,
                            "render": function (data, type, row) {
                                if (data == 1) {
                                    var status = '<span class="badge badge-success">Complete</span>'
                                } else {
                                    var status = `<span class="badge badge-danger">Partial</span> `
                                }
                                return `${status}`
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-sale-id", data.id);
                    },
                    order:[[0,'asc']]
                };

                var table = $('#sales-report-table').DataTable(dataTableOpt);

                $('#sales-report-table').on('click', '.expand-row', function (e) {
                    e.preventDefault()
                    var tr = $(this).closest('tr');
                    var row = table.row(tr);
                    var saleId = $(this).data('sale-id');
                    if (row.child.isShown()) {
                        row.child.hide();
                        tr.removeClass('shown');
                    } else {
                        $.ajax({
                            url: '/app/reports/sales/' + saleId,
                            method: 'POST',
                            data: {
                                _csrf: _csrf
                            },
                            success: function (data) {
                                if (data.success) {
                                    row.child(saleChildRow(data.report)).show();
                                    tr.addClass('shown');
                                } else {
                                    toastr.error('Some error occurred')
                                }
                            }
                        });
                    }
                });

                $('#apply-filter').on('click', function () {
                    var table = $('#sales-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            from: $('#from').val() ? moment($('#from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                            to: $('#to').val() ? moment($('#to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                            gender: $('#gender').val(),
                            paymentStatus: $('#payment-status').val()
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click', function () {
                    var table = $('#sales-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                });

                $('#sales-report-table').on('click', '.get-receipts', function (e) {
                    e.preventDefault();
                    const saleId = $(this).data('sale-id');
                    $.ajax({
                        url: '/app/sales/get/payment-logs',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            saleId
                        },
                        success: function (data) {
                            if (data.success) {
                                const payments = data.payments;
                                var table = ``
                                payments.forEach((p) => {
                                    table += `<tr>
                                                <td>${moment(p.created_date).format('Do MMM, YYYY')}</td>
                                                <td>${p.label}</td>
                                                <td>Rs. ${p.amount}</td>
                                                <td><a href="/app/sales/receipt/${p.id}" target="_blank">Receipt #${p.id}</a></td>
                                            </tr>`
                                })
                                $('#get-payment-logs').modal()
                                $('#payment-logs tbody').empty().append(table)
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })


                $('#export').click(function(){
                    $.ajax({
                        headers: {
                            'csrf-token': _csrf
                        },
                        url: '/app/reports/sales-export',
                        method: 'POST',
                        data:{
                            searchValue : $('.dataTables_filter input').val(),
                            orderBy: table.order(),
                            filter: {
                                from: $('#from').val() ? moment($('#from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                                to: $('#to').val() ? moment($('#to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                                gender: $('#gender').val(),
                                paymentStatus: $('#payment-status').val()
                            }
                        },
                        success: function(data){
                            console.log('download!')
                            window.location.href='/reports/sales/'+data.filename;
                        }
                    })
                })

                $('#from, #to').datetimepicker({
                    format:'DD-MM-YYYY'
                })
            });
        }
    };
}());