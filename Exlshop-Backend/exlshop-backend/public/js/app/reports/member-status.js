var MEMBER_STATUS = MEMBER_STATUS || (function () {
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
                        'url': '/app/reports/member-status',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'member_name'},
                        {'data': 'gender'},
                        {'data': 'address_line_1'},
                        {'data': 'dob'},
                        {'data': 'created_date'},
                        {'data': 'package_name'},
                        {'data': 'expiry_date'},
                        {'data': 'expiry_date'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        {
                            "targets": 3,
                            "render": function (data, type, row) {
                                return (data)?(moment(data).format('Do MMM YYYY')):(' - ')
                            }
                        },{
                            "targets": 4,
                            "render": function (data, type, row) {
                                return (data)?(moment(data).format('Do MMM YYYY')):(' - ')
                            }
                        },{
                            "targets": 5,
                            "render": function (data, type, row) {
                                return (data)?(data):(' - ')
                            }
                        },{
                            "targets": 6,
                            "render": function (data, type, row) {
                                return (data)?(moment(data).format('Do MMM YYYY')):(' - ')
                            }
                        },
                        {
                            "targets": 7,
                            "render": function (data, type, row) {
                                if(moment(row.expiry_date) < moment() || !row.package_name){
                                    return `'<span class="badge badge-danger">In Active</span>`;
                                }else{
                                    return '<span class="badge badge-success">Active</span>';
                                }
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-sale-id", data.id);
                    },
                    order:[[0,'ASC']]
                };

                var table = $('#member-status-report-table').DataTable(dataTableOpt);

                $('#export').click(function(){
                    $.ajax({
                        headers: {
                            'csrf-token': _csrf
                        },
                        url: '/app/reports/member-status-export',
                        method: 'POST',
                        data:{
                            searchValue : $('.dataTables_filter input').val(),
                            orderBy: table.order(),
                            filter: {
                                from: $('#from').val() ? moment($('#from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                                to: $('#to').val() ? moment($('#to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null
                                // expiryFrom: $('#expiry_from').val() ? moment($('#expiry_from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                                // expiryTo: $('#expiry_to').val() ? moment($('#expiry_to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null
                            }
                        },
                        success: function(data){
                            console.log('download!')
                            window.location.href='/reports/member_status/'+data.filename;
                        }
                    })
                })

                $('#from, #to, #expiry_from, #expiry_to').datetimepicker({
                    format:'DD-MM-YYYY'
                })

                $('#apply-filter').on('click', function () {
                    var table = $('#member-status-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            from: $('#from').val() ? moment($('#from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                            to: $('#to').val() ? moment($('#to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null
                            // expiryFrom: $('#expiry_from').val() ? moment($('#expiry_from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                            // expiryTo: $('#expiry_to').val() ? moment($('#expiry_to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click', function () {
                    var table = $('#member-status-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                });
            });
        }
    };
}());