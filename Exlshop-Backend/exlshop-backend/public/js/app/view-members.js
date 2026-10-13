var VIEW_MEMBERS = VIEW_MEMBERS || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            var _csrf = _args._csrf

            $(document).ready(function () {
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/members/view-all/',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'member_name'},
                        {'data': 'phone'},
                        {'data': 'email'},
                        {'data': 'gender'},
                        {'data': 'birth_date'},
                        {'data': 'created_date'},
                        {'data': 'expiry_date'},
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        {
                            "targets": [4, 5, 6],
                            "render": function (data, type, row) {
                                return data ? moment(data).format('DD-MM-YYYY') : 'NA'
                            }
                        },
                        {
                            "targets": 7,
                            "render": function (data, type, row) {
                                if(!row.expiry_date){
                                    return '<span class="badge badge-danger">Inactive</span>';
                                }else{
                                    if(moment(row.expiry_date).format('YYYY-MM-DD') > moment().format('YYYY-MM-DD')){
                                        return '<span class="badge badge-success">Active</span>';
                                    }else{
                                        return '<span class="badge badge-danger">Inactive</span>';
                                    }
                                }
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-member-id", data.id);
                    },
                    order:[[0,'asc']]
                };

                var table = $('#members-list').DataTable(dataTableOpt);

                table.on('click', 'tr', function () {
                    if (table.row(this).node() !== null) {
                        var memberId = $(table.row(this).node()).attr('data-member-id');
                        location.href = location.href + '/' + memberId;
                    }
                });

                $('#apply-filter').on('click', function () {
                    var table = $('#members-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            from: $('#from').val() ? moment($('#from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                            to: $('#to').val() ? moment($('#to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') :null,
                            gender: $('#gender').val(),
                            isActive: $('#is_active').val(),
                            expiryFrom: $('#expiry_from').val() ? moment($('#expiry_from').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') :null,
                            expiryTo: $('#expiry_to').val() ? moment($('#expiry_to').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null,
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click', function () {
                    var table = $('#members-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })

                /* START - Validate email address while adding new customer */
                $('#user-email').on('change', function () {
                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid email address')
                        $('#add-member-btn').attr('disabled', true);
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
                                $('#add-member-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-member-btn').attr('disabled', false)
                            }
                        }
                    });
                })
                /* End - Validate email address while adding new customer */

                /* START - Validate phone while adding new customer */
                $('#user-phone').on('change', function () {
                    $element = $(this);

                    if ($element.val().length !== 10) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid 10 digit phone number')
                        $('#add-member-btn').attr('disabled', true);
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
                                $('#add-member-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-member-btn').attr('disabled', false)
                            }
                        }
                    });
                })
                /* END - Validate phone while adding new customer */

                /* START - Validate gender while adding new customer */
                $('.gender-radio').on('change', function () {
                    if (!$('.gender-radio:checked').val()) {
                        toastr.error('Please select a gender');
                        $('#add-member-btn').attr('disabled', true)
                    } else {
                        $('#add-member-btn').attr('disabled', false)
                    }
                })
                /* END - Validate gender while adding new customer */

                /* START - Get City By State */
                $('#state-select').on('change', function () {
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
                                $('#city-select').empty().append('<option value="">Select City</option>');
                                data.cities.forEach((c) => {
                                    $('#city-select').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                /* END - Get City By State */

                /* START - Add new customer */
                $('#add-member-btn').on('click', function () {
                    if (!$('#user-fname').val()) {
                        toastr.error('Please Enter First Name')
                        return
                    }
                    if (!$('#user-lname').val()) {
                        toastr.error('Please Enter Last Name')
                        return
                    }
                    if (!$('.gender-radio:checked').val()) {
                        toastr.error('Please select a gender');
                        $('#add-member-btn').attr('disabled', true)
                        return
                    }
                    if (!$('.marital-status-radio:checked').val()) {
                        toastr.error('Please select a marital Status');
                        return
                    }
                    if (!$('#address-1').val()) {
                        toastr.error('Please enter address')
                        return
                    }
                    if (!$('#emergency-contact-name').val()) {
                        toastr.error('Please Enter Emergency Contact Name')
                        return
                    }
                    if (!$('#emergency-contact-number').val()) {
                        toastr.error('Please Enter Emergency Contact Number')
                        return
                    }
                    if (!$('#blood-group').val()) {
                        toastr.error('Please Enter Blood Group')
                        return
                    }
                    if (!$('#state-select').val()) {
                        toastr.error('Please select State')
                        return
                    }
                    if (!$('#city-select').val()) {
                        toastr.error('Please select City')
                        return
                    }
                    if (!$('#user-zip').val()) {
                        toastr.error('Please Enter Zip')
                        return
                    }
                    
                    $.ajax({
                        url: '/app/members/add',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            user_fname: $('#user-fname').val(),
                            user_lname: $('#user-lname').val(),
                            user_email: $('#user-email').val(),
                            user_phone: $('#user-phone').val(),
                            gender: $('.gender-radio:checked').val(),
                            address_1: $('#address-1').val(),
                            address_2: $('#address-2').val(),
                            stateId: $('#state-select').val(),
                            cityId: $('#city-select').val(),
                            zip: $('#user-zip').val(),
                            user_password: Math.floor(Math.random() * 99999999),
                            user_gender: $('.gender-radio:checked').val(),
                            role_id: 5,
                            marital_status: $('.marital-status-radio:checked').val(),
                            emergency_contact_name: $('#emergency-contact-name').val(),
                            emergency_contact_number: $('#emergency-contact-number').val(),
                            blood_group: $('#blood-group').val(),
                            birth_date: $('#user-dob').val(),
                            anniversary_date: $('#user-anniversary').val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#add-new-member').modal('hide')
                                $('#members-list').DataTable().ajax.reload();
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                /* END - Add new customer */
            });
            
            $('#user-dob, #user-anniversary, #from, #to, #expiry_from, #expiry_to').datetimepicker({
                format: 'DD-MM-YYYY'
            })
           
        }
    };
}());