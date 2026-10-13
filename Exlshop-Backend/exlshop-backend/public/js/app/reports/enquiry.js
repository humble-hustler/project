var ENQUIRY = ENQUIRY || (function () {
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
                        'url': '/app/reports/enquiry',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'created_date'},
                        {'data': 'fname'},
                        {'data': 'gender'},
                        {'data': 'phone'},
                        {'data': 'email'},
                        {'data': 'source'},
                        {'data': 'fitness_goal'},
                        {'data': 'package_names'},
                        {'data': 'status'},
                        {'data': 'owner_name'}
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
                                return (data)?(moment(data).format('Do MMM YYYY')):(' - ')
                            }
                        },
                        {
                            "targets": 1,
                            "render": function (data, type, row) {
                                return row.fname+' '+row.lname;
                            }
                        },{
                            "targets": 8,
                            "render": function (data, type, row) {
                                data = ((   row.status=="Warm")? ('<span class="badge badge-warning bg-warning">'+ row.status +'</span>')
                                        :(row.status=="Hot")?('<span class="badge badge-warning">'+ row.status +'</span>')
                                        :(row.status=="Cold")?('<span class="badge badge-info">'+ row.status +'</span>')
                                        :(row.status=="New")?('<span class="badge badge-danger">'+ row.status +'</span>')
                                        :null);
                                return data;
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-sale-id", data.id);
                    },
                    order:[[0,'ASC']]
                };

                var table = $('#enquiry-report-table').DataTable(dataTableOpt);

                $('#export').click(function(){
                    $.ajax({
                        headers: {
                            'csrf-token': _csrf
                        },
                        url: '/app/reports/enquiry-export',
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
                            window.location.href='/reports/enquiry/'+data.filename;
                        }
                    })
                })

                $('#from, #to').datetimepicker({
                    format:'DD-MM-YYYY'
                })

                $('#apply-filter').on('click', function () {
                    var table = $('#enquiry-report-table').dataTable();
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
                    var table = $('#enquiry-report-table').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                });
            });
        }
    };
}());