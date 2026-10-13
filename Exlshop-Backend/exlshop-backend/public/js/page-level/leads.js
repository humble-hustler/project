var LEADS = LEADS || (function () {
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
                        'url': '/super-admin/marketing/leads/view-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'render': function(data,type,row,meta){
                            data = '<span style="white-space: nowrap;">'+moment(row.created_date).format('DD/MM/YYYY')+'</span>';
                            return data;
                        }},
                        {'render': function(data,type,row,meta){
                            return row.created_date ? moment(row.created_date).format('h:m a') : 'NA';
                        }},
                        {'render': function(data,type,row,meta){
                            data = row.brand_name+'<br>';
                            return data;
                        }},
                        {'data': 'source'},
                        {'data': 'status'},
                        {'data': 'owner_name'},
                        {'render': function(data,type,row,meta){
                            return row.followup_date_time ? moment(row.followup_date_time).format('DD-MM-YYYY') : 'NA';
                        }},
                        {'render': function(data,type,row,meta){
                            return row.followup_date_time ? moment(row.followup_date_time).format('h:m a') : 'NA';
                        }},
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center'
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-lead-id", data.id);
                    },
                    'order':[[0,'asc']]
                };

                var table = $('#leads-list').DataTable(dataTableOpt);

                table.on('click', 'tr', function () {
                    if (table.row(this).node() !== null) {
                        var leadId = $(this).attr('data-lead-id');
                        location.href = '/super-admin/marketing/leads/' + leadId;
                    }
                });

                $('#from, #to').datetimepicker({
                    format:'D/M/Y'
                });

                $('#users,#owner-id').select2({
                    placeholder: 'Search Owner',
                    ajax: {
                        url: '/super-admin/settings/user/search',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    userName: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.users.forEach((u) => {
                                    searchResult.push({
                                        id: u.id,
                                        text: `${u.fname} ${u.lname}`
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
                    var table = $('#leads-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            from: $('#from').val(),
                            to: $('#to').val(),
                            source: $('#source').val(),
                            status: $('#status').val(),
                            leadOwner: $('#team').val(),
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click', function () {
                    var table = $('#leads-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })

            });
        }
    };
}());