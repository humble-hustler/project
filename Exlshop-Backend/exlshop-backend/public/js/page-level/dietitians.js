var DIETICIANS = DIETICIANS || (function () {
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
                        'url': '/super-admin/settings/dietitian/view-all',
                        headers: {
                            'csrf-token': _csrf
                        },
                        data:{
                        }
                    },
                    'columns': [
                        {'data': 'id'},
                        {'data': 'user_name'},
                        {'data': 'email'},
                        {'data': 'phone'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        }],
                    'order':[[0,'asc']],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('dietician_id', data.id);
                    },
                };

                var table = $('#dietician-list').DataTable(dataTableOpt);

                $('#dietician-password, #dietician-confirm-password').on('change', function () {
                    if ($('#dietician-password').val() !== $('#dietician-confirm-password').val()) {
                        $('#password-mismatch').css('display', 'block');
                        $('#add-new-dietician-btn').attr('disabled', true);
                    } else {
                        $('#password-mismatch').hide();
                        $('#add-new-dietician-btn').attr('disabled', false);
                    }
                })

                $('#dietician-email').on('change', function () {
                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid email address')
                        $('#add-new-dietician-btn').attr('disabled', true);
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
                                $('#add-new-dietician-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-dietician-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                $('#dietician-phone').on('change', function () {
                    $element = $(this);

                    if ($element.val().length !== 10) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid 10 digit phone number')
                        $('#add-new-dietician-btn').attr('disabled', true);
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
                                $('#add-new-dietician-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-dietician-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                $(document).on('click','.delete-user-btn',function () {
                    $('#user-id').val($(this).closest('tr').attr('user_id'));
                })

                table.on('click', 'tr', function () {
                    var dietician_id = $(this).closest('tr').attr('dietician_id');
                    window.location.href=`/super-admin/settings/dietitian/${dietician_id}`;
                });

            });
        }
    };
}());