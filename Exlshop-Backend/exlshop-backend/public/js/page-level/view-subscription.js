var VIEW_SUBSCRIPTION = VIEW_SUBSCRIPTION || (function () {
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
                       'url': '/super-admin/shop/subscription/view-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data':'subscriptionId'},
                        {'data': 'plan_name'},
                        {'data':'brandName'},
                        {'data': 'b.fname'},
                        {'data': 'shopStatus'},
                        {'data': 'period'}
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
                       'render': function(data, type, row, meta){
                            return `<span>${row.fname} ${row.lname}</span>`
                        }
                    }
                    ],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('location_id', data.id);
                    },
                    order:[[0,'desc']]
                };

                var table = $('#subscription-list').DataTable(dataTableOpt);

                table.on('click', 'tr', function () {
                    var location_id = $(this).closest('tr').attr('location_id');
                    window.location.href=`/super-admin/brands/locations/view/${location_id}`;
                });
            });
        }
    };
}());