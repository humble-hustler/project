var SINGLE_EVENT = SINGLE_EVENT || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const event_id = _args.event_id;

            $(document).ready(function () {
                $('#start-date, #end-date').datetimepicker({
                    format:'DD-MM-YYYY hh:mm a'
                });

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/super-admin/events/registrations/view-all/',
                        headers: {
                            'csrf-token': _csrf
                        },
                        'data': {
                            eventId: event_id
                        }
                    },
                    'columns': [
                        {'data':'id'},
                        {'data': 'fname'},
                        {'data': 'fname'},
                        {'data': 'fname'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },{
                        "targets": 1,
                        "render": function (data, type, row) {
                            var data = `<span>`+row.fname+' '+row.lname+`</span>`;
                            return data;
                        }
                    },{
                        "targets": 2,
                        "render": function (data, type, row) {
                            var data = `<center>`+(row.is_approved)?('Approved'):('Not Approved')+`</center>`;
                            return data;
                        }
                    },{
                        "targets": 3,
                        "render": function (data, type, row) {
                            var data = `<center>`+(row.fees_paid)?('Paid'):('Not Paid')+`</center>`;
                            return data;
                        }
                    }],
                    order:[[0,'asc']]
                };

                var table = $('#event-list').DataTable(dataTableOpt);

            });
        }
    };
}());