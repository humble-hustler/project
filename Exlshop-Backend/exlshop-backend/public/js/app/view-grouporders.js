var VIEW_GROUPORDERS = VIEW_GROUPORDERS || (function () {
    return {
        init: function (Args) {
            var _args = Args;
            var _csrf = _args._csrf
            var flash = _args.flash

            $(document).ready(function () {
                if (flash) {
                    toastr.error(flash)
                }
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/grouporders/view-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        { 'data': 'name' },
                        { 'data': 'locations' },
                        {'render': function(data, type, row, meta){
                            data = `<a class="update-grouporder" grouporder_id="${row.id}" data-target="#update-group-order" data-toggle="modal">\n\
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>\n\
                                    </a>&nbsp;&nbsp;
                                    <a class="delete-grouporder" grouporder_id="${row.id}" data-target="#delete-group-order" data-toggle="modal">\n\
                                        <i class="fa fa-trash" aria-hidden="true" ></i>\n\
                                    </a>`;
                            return data;
                            }
                        }
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
                        $(row).attr("data-grouporder-id", data.id);
                        $(row).attr("data-groupName", data.name);
                        $(row).attr('data-locations', data.locations);
                    },
                    'order': [[0, 'asc']]
                };

                var table = $('#grouporders-list').DataTable(dataTableOpt);



                $("#add-group-btn").on('submit',function (e) {
                    var group_name = $("#group_name").val();
                    var location_id=  $('#location ').val();
                        $.ajax({
                            url: "/app/grouporders/add",
                            data: {
                                location_id: location_id,
                                group_name: group_name,
                                _csrf: _csrf,
                            },

                            method: 'POST',
                            success: function (data) {
                                // alert("successfully")
                                //window.location = "/api/v1/branduserteam/view-all"; 
                                window.location = "/app/grouporders"
                            },
                            error: function (data, status, error) {
                                // alert("not successfull")
                            }
                        });
                });

                $(document).on('click', '#grouporders-list tbody tr td:not(:last-child)', function () {
                    if ($(this).closest('tr').attr('data-grouporder-id') !== null) {
                        var groupOrderId = $(this).closest('tr').attr('data-grouporder-id');
                        location.href = location.href + '/' + groupOrderId;
                    }
                });

                $(document).on('click','.update-grouporder', function() {
                    var name = $(this).closest('tr').attr('data-groupname');
                    var code = ($(this).closest('tr').attr('data-locations')).split(',');
                    var group_id = $(this).attr('grouporder_id')
                    $("#editlocation").val(code)
                    $("#editgroup_id").val(name)
                    $("#editgroup_id").attr('data-group-id', group_id)
                })

                $(document).on('click', '.delete-grouporder', function() {
                    $("#del_group_id").val($(this).attr('grouporder_id'))
                })

                $("#update-grouporder-btn").on('click', function() {
                    var group_name = $("#editgroup_id").val();
                    var location_id =  $('#editlocation').val();
                    var group_id = $("#editgroup_id").attr('data-group-id')
                    $.ajax({
                        url: "/app/grouporders/update",
                        data: {
                            location_id: location_id,
                            group_name: group_name,
                            group_id: group_id,
                            _csrf: _csrf,
                        },

                        method: 'POST',
                        success: function (data) {
                            toastr.success("Updated Successfully")
                            window.location = "/app/grouporders"
                        },
                        error: function (data, status, error) {
                            toastr.error("not successfull")
                        }
                    });
                })

                $('#apply-filter').on('click', function () {
                    var table = $('#grouporders-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            group_name: $('#group_id').val(),
                            zip_code: $('#zip_code').val()
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click', function () {
                    $("#group_id").val('')
                    $("#zip_code").val('')
                    var table = $('#grouporders-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })

                

                $('#from').datetimepicker({
                    format: 'D/M/Y'
                });
                $('#to').datetimepicker({
                    format: 'D/M/Y'
                });
            });

        }
    };
}());