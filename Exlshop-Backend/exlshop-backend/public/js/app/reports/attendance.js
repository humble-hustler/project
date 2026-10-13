var ATTENDANCE = ATTENDANCE || (function () {
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
                        'url': '/app/reports/attendance',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'in_time'},
                        {'data': 'member_name'},
                        {'data': 'phone'},
                        {'data': 'in_time'},
                        {'data': 'id'},
                        {'data': 'out_time'},
                        {'data': 'id'},
                        {'data': 'in_time'}
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
                                return (data)?(moment(data).format('Do MMM YYYY')):('')
                            }
                        },{
                            "targets": 3,
                            "render": function (data, type, row) {
                                return (data)?(moment(data).format('hh:mm a')):('')
                            }
                        },{
                            "targets": 5,
                            "render": function (data, type, row) {
                                return (data)?(moment(data).format('hh:mm a')):('')
                            }
                        },{
                            "targets": 4,
                            "render": function (data, type, row) {
                                return '-'
                            }
                        },{
                            "targets": 6,
                            "render": function (data, type, row) {
                                return '-'
                            }
                        },{
                            "targets":7,
                            "render": function (data, type, row) {

								return moment(moment(row.out_time,'YYYY-MM-DD HH:mm:ss').diff( moment(row.in_time, 'YYYY-MM-DD HH:mm:ss'))).format("hh:mm:ss")
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-sale-id", data.id);
                    },
                    order:[[0,'ASC']]
                };

                var table = $('#attendance-report-table').DataTable(dataTableOpt);

                $('#export').click(function(){
                    $.ajax({
                        headers: {
                            'csrf-token': _csrf
                        },
                        url: '/app/reports/attendance-export',
                        method: 'POST',
                        data:{
                            searchValue : $('.dataTables_filter input').val(),
                            orderBy: table.order()
                        },
                        success: function(data){
                            console.log('download!')
                            window.location.href='/reports/attendance/'+data.filename;
                        }
                    })
                })

                $('#from, #to').datetimepicker({
                    format:'DD-MM-Y'
                });

                $('#member').select2({
                    placeholder: 'Search Member',
                    ajax: {
                        url: '/app/members/search',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    phone: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.members.forEach((m) => {
                                    searchResult.push({
                                        id: m.id,
                                        text: `${m.fname} ${m.lname}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                $('#apply-filter').on('click', function () {
                    var table = $('#attendance-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            from: $('#from').val() ? moment($('#from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                            to: $('#to').val() ? moment($('#to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                            member: $('#member').val()
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click', function () {
                    var table = $('#attendance-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                });

            });
        }
    };
}());