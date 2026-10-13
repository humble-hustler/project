var VIEW_BRANDS = VIEW_BRANDS || (function () {
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
                    'url':'/super-admin/brands/view-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'id'},
                        {'data': 'name'},
                        {'data': 'location_count'},
                        {'data': 'is_active'}
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
                                return data ? 'Active' : 'Inactive'
                            }
                        }],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-brand-id", data.id);
                    },
                    order:[[0,'asc']]
                };
                var table = $('#brand-list').DataTable(dataTableOpt);

                table.on('click', 'tr', function () {
                    if (table.row(this).node() !== null) {
                        var leadId = $(table.row(this).node()).attr('data-brand-id');
                        location.href = location.href + '/' + leadId;
                    }
                });
            });
        }
    };
}());