var RENEWAL_EXPIRED = RENEWAL_EXPIRED || (function () {
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
                        'url': '/app/reports/renewal-expired/get-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'member_name'},
                        {'data': 'phone'},
                        {'data': 'email'},
                        {'data': 'gender'},
                        {'data': 'package_name'},
                        {'data': 'package_start_date'},
                        {'data': 'package_expiry_date'},
                        {'data': 'is_renewed'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        {
                            "targets": 5,
                            "render": function (data, type, row) {
                                return (data)?(moment(data).format('Do MMM YYYY')):('')
                            }
                        },{
                            "targets": 6,
                            "render": function (data, type, row) {
                                return (data)?(moment(data).format('Do MMM YYYY')):('')
                            }
                        },
                        {
                            "targets": 7,
                            "render": function (data, type, row) {
                                return (data==1)?('Renewed'):('Not Renewed')
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-sale-id", data.id);
                    },
                    order:[[3,'DESC']]
                };

                var table = $('#renewal-expired-report-table').DataTable(dataTableOpt);

                $('#export').click(function(){
                    $.ajax({
                        headers: {
                            'csrf-token': _csrf
                        },
                        url: '/app/reports/renewal-export',
                        method: 'POST',
                        data:{
                            searchValue : $('.dataTables_filter input').val(),
                            orderBy: table.order(),
                            filter: {
                                from: $('#from').val() ? moment($('#from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                                to: $('#to').val() ? moment($('#to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null
                            }
                        },
                        success: function(data){
                            console.log('download!')
                            window.location.href='/reports/renewal/'+data.filename;
                        }
                    })
                })

                $('#from, #to').datetimepicker({
                    format:'DD-MM-YYYY'
                })

                $('#apply-filter').on('click', function () {
                    var table = $('#renewal-expired-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            from: $('#from').val() ? moment($('#from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                            to: $('#to').val() ? moment($('#to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click', function () {
                    var table = $('#renewal-expired-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                });
            });
        }
    };
}());