var OUTSTANDING = OUTSTANDING || (function () {
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
                        'url': '/app/reports/outstanding',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'render': function(data, type, row, meta){
                            return `${row.member_name}<br><span><i class="fa fa-phone"></i> ${row.phone}</span>`;
                        }},
                        {'data': 'sale_location_id'},
                        {'data': 'created_date'},
                        {'data': 'total_amount'},
                        {'data': 'amount_paid'},
                        {'render': function(data, type, row, meta){
                            return `${row.total_amount - row.amount_paid}`
                        }},
                        {'data': 'start_date'},
                        {'data': 'expiry_date'},
                        {'data': 'package_names'},
                        {'render': function(data, type, row, meta){
                            return `${row.ageing } days`
                        }},
                        {'data': 'trainer_name'},
                        {'data': 'sold_by_user'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },{
                            "targets": 2,
                            "render": function (data, type, row) {
                                return (data)?(moment(data).format('Do MMM YYYY')):('')
                            }
                        },{
                            "targets": 6,
                            "render": function (data, type, row) {
                                return (data)?(moment(data,'DD-MM-YYYY').format('Do MMM YYYY')):('')
                            }
                        },{
                            "targets": 7,
                            "render": function (data, type, row) {
                                return (data)?(moment(data).format('Do MMM YYYY')):('')
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-sale-id", data.id);
                    },
                    order:[[0,'ASC']]
                };

                var table = $('#outstanding-report-table').DataTable(dataTableOpt);
                $('#outstanding-report-table').on('search.dt', function() {
                    var value = $('.dataTables_filter input').val();
                    var order = table.order();
                    console.log(value,order); // <-- the value
                });

                $('#export').click(function(){
                    $.ajax({
                        headers: {
                            'csrf-token': _csrf
                        },
                        url: '/app/reports/export',
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
                            window.location.href='/reports/outstanding/'+data.filename;
                        }
                    })
                })

                $('#from, #to').datetimepicker({
                    format:'DD-MM-YYYY'
                })

                $('#apply-filter').on('click', function () {
                    var table = $('#outstanding-report-table').dataTable();
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
                    var table = $('#outstanding-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                });
            });
        }
    };
}());