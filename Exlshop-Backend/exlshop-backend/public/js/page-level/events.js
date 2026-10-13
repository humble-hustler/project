var VIEW_EVENTS = VIEW_EVENTS || (function () {
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
                        'url': '/super-admin/events/view-all/',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'banner_img'},
                        {'data': 'name'},
                        {'data': 'event_type_name'},
                        {'data': 'start_date'},
                        {'data': 'start_date'},
                        {'data': 'held_by'},
                        {'data': 'charges'}
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
                                var featuredImg = ``
                                if (data) {
                                    featuredImg = `<img src="/event-img/${data}" class="mr-10" width="40" />`
                                } else {
                                    featuredImg = `<i class="fa fa-image"></i>`
                                }
                                return featuredImg
                            }
                        },
                        {
                            "targets": 3,
                            "render": function (data, type, row) {
                                return data ? moment(data).format('DD-MM-YYYY hh:mm a') : ''
                            }
                        },
                        {
                            "targets": 4,
                            "render": function (data, type, row) {
                                return data ? moment(data).format('DD-MM-YYYY hh:mm a') : ''
                            }
                        },
                        {
                            "targets": 6,
                            "render": function (data, type, row) {
                                return data ? ('Rs '+row.charges) : ''
                            }
                        }],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-event-id", data.id);
                    },
                    order:[[0,'asc']]
                };

                var table = $('#event-list').DataTable(dataTableOpt);

                $('#start-date,#end-date').datetimepicker({
                    format:'DD-MM-YYYY hh:mm a'
                });

                table.on('click', 'tr', function () {
                    if (table.row(this).node() !== null) {
                        var eventId = $(this).attr('data-event-id');
                        location.href = '/super-admin/events/' + eventId;
                    }
                });
            });

        }
    };
}());