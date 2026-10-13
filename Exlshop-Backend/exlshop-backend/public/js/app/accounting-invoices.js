var ACCOUNTING_INVOICES = ACCOUNTING_INVOICES || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;

            $(document).ready(function () {
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/accounts/invoices',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'invoice_date'},
                        {'data': 'sale_location_id'},
                        {'data': 'member_name'},
                        {'data': 'packages'},
                        {'data': 'total_amount'},
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
                                return (data)?(moment(data).format('Do MMM YYYY')):('')
                            }
                        },{
                            "targets": 1,
                            "render": function (data, type, row) {
                                return '#'+data
                            }
                        },{
                            "targets": 5,
                            "render": function (data, type, row) {
                                if (data == 1) {
                                    var status = '<span class="badge badge-success">Complete</span>'
                                } else {
                                    var status = `<span class="badge badge-danger">Partial</span> `
                                }
                                return `${status}`
                            }
                        },
                        {
                            "targets": 6,
                            "render": function (data, type, row) {
                                return `<center><a href="/app/sales/invoice/${row.id}" target="_blank" class='text-gray'><i class="fa fa-eye" ></i></a></center>`;
                            }
                            
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-invoice-id", data.id);
                    },
                    order:[[0,'DESC']]
                };

                var table = $('#accounting-invoices-table').DataTable(dataTableOpt);

                // table.on('click', 'tr', function () {
                //     if (table.row(this).node() !== null) {
                //         var saleId = $(table.row(this).node()).attr('data-invoice-id');
                //         location.href = '/app/sales/invoice/'+saleId;
                //     }
                // });

                $(document).on('click', '.edit-invoice', function(){
                    var invoiceId = $(this).closest('tr').attr('data-invoice-id');
                    window.location.href = '/app/accounts/invoice-edit/'+invoiceId; 
                })
            });
        }
    };
}());