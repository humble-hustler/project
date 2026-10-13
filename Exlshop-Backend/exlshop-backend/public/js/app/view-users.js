var VIEW_USERS = VIEW_USERS || (function () {
    return {
        init: function (Args) {
            var _args = Args;
            var _csrf = _args._csrf;
            var flash = _args.flash;

            $(document).ready(function () {
                if (flash) {
                    toastr.error(flash)
                }


                var dataTableOpt1 = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/users/view-sefldetails',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'user_name'},
                        {'data': 'email'},
                        {'data': 'phone'},
                        {'data': 'verbose'},
                        {'data': 'department'},
                        {'data': 'designation'},
                        {'data': 'is_active'},
                        {'data': 'completed'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },{
                            "targets": 6,
                            "render": function (data, type, row) {
                                return row.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'
                            }
                        },{
                            "targets": 7,
                            "render": function (data, type, row) {
                                return row.completed ? '<span class="badge badge-success">Complete</span>' : '<span class="badge badge-danger">Incomplete</span>'
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-user-id", data.id);
                    },
                    'order': [[ 0, "asc" ]]
                };

                var table1 = $('#self-list').DataTable(dataTableOpt1);

                table1.on('click', 'tr', function () {
                    if (table1.row(this).node() !== null) {
                        var userId = $(table1.row(this).node()).attr('data-user-id');
                        location.href = '/app/users/userid' + '/' + userId;
                    }
                });




                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/users/view-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'user_name'},
                        {'data': 'email'},
                        {'data': 'phone'},
                        {'data': 'verbose'},
                        {'data': 'department'},
                        {'data': 'designation'},
                        {'data': 'is_active'},
                        {'data': 'completed'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },{
                            "targets": 6,
                            "render": function (data, type, row) {
                                return row.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'
                            }
                        },{
                            "targets": 7,
                            "render": function (data, type, row) {
                                return row.completed ? '<span class="badge badge-success">Complete</span>' : '<span class="badge badge-danger">Incomplete</span>'
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-user-id", data.id);
                    },
                    'order': [[ 0, "asc" ]]
                };

                var table = $('#team-list').DataTable(dataTableOpt);

                table.on('click', 'tr', function () {
                    if (table.row(this).node() !== null) {
                        var userId = $(table.row(this).node()).attr('data-user-id');
                        location.href = '/app/users/userid' + '/' + userId;
                    }
                });

                $('#apply-filter').on('click', function () {
                    var table = $('#team-list').dataTable();
                    var tableSettings = table.fnSettings();
                  
                    tableSettings.ajax.data = {
                        filter: {
                            customer_name:$('#customerName').val() ,
                            email: $('#email_id').val(),                          
                            department: $('#department_id').val(),
                            designation:$('#designation_id').val(),
                            phone_no: $('#phone_id').val()
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click',()=>{
                    var table = $('#team-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                        }
                    }
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })



                $('#user-password, #user-confirm-password').on('change', function () {
                    if ($('#user-password').val() !== $('#user-confirm-password').val()) {
                        $('#password-mismatch').css('display', 'block');
                        $('#add-new-team-member-btn').attr('disabled', true);
                    } else {
                        $('#password-mismatch').hide();
                        $('#add-new-team-member-btn').attr('disabled', false);
                    }
                })

                $('#user-email').on('change', function () {
                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid email address')
                        $('#add-new-team-member-btn').attr('disabled', true);
                        return
                    }

                    $.ajax({
                        url: '/email-valid',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            email: $element.val()
                        },
                        success: function (data) {
                            if (!data.valid) {
                                $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Email already exists')
                                $('#add-new-team-member-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-team-member-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                $('#user-phone').on('change', function () {
                    $element = $(this);

                    if ($element.val().length !== 10) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid 10 digit phone number')
                        $('#add-new-team-member-btn').attr('disabled', true);
                        return
                    }

                    $.ajax({
                        url: '/phone-valid',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            phone: $element.val()
                        },
                        success: function (data) {
                            if (!data.valid) {
                                $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Phone Number already exists')
                                $('#add-new-team-member-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-team-member-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                /* START - Get City By State */
                $('#state').on('change', function () {
                    const stateId = $(this).val()
                    $.ajax({
                        url: '/app/common/get-cities',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            stateId
                        },
                        success: function (data) {
                            if (data.success && data.cities.length > 0) {
                                $('#city').empty().append('<option value="">Select City</option>');
                                data.cities.forEach((c) => {
                                    $('#city').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })

                $('#dob, #anniversary_date').datetimepicker({
                    format:'D-M-Y'
                });
                
            });

        }
    };
}());