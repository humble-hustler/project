var MEMBERS = MEMBERS || (function () {
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
                        'url': '/super-admin/brands/locations/members/view-all',
                        headers: {
                            'csrf-token': _csrf
                        },
                        data:{
                        }
                    },
                    'columns': [
                        {'data': 'member_name'},
                        {'data': 'phone'},
                        {'data': 'email'},
                        {'data': 'gender'},
                        {'data': 'brand_location_name'},
                        {'data': 'birth_date'},
                        {'data': 'created_date'},
                        {'data': 'expiry_date'},
                        {'data': 'gender'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        {
                            "targets": [5, 6,7],
                            "render": function (data, type, row) {
                                return data ? moment(data).format('DD-MM-YYYY') : 'NA'
                            }
                        },
                        {
                            "targets": 8,
                            "render": function (data, type, row) {
                                return row.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-member-id", data.id);
                    },
                    order:[[0,'asc']]
                };

                var table = $('#member-list').DataTable(dataTableOpt);

                $('#apply-filter').on('click', function () {
                    var table = $('#member-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            from: $('#from').val(),
                            to: $('#to').val(),
                            gender: $('#gender').val(),
                            isActive: $('#is_active').val(),
                            expiryFrom: $('#expiry_from').val(),
                            expiryTo: $('#expiry_to').val(),
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click', function () {
                    var table = $('#member-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })

                $('#from, #to, #expiry_from, #expiry_to').datetimepicker({
                    format:'D-M-Y'
                });
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
                    const regex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid Phone Number')
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
                        url: '/super-admin/common/get-cities',
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
                        url: '/super-admin/brands/locations/members/add',
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
                            location_id: $('#location').val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#add-new-member').modal('hide')
                                $('#member-list').DataTable().ajax.reload();
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                /* END - Add new customer */

                $('#location').select2({
                    placeholder: 'Search Location',
                    ajax: {
                        url: '/super-admin/brands/search/location',
                        method: 'POST',
                        headers: {
                            'csrf-token': _csrf
                        },
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    text: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.locations.forEach((l) => {
                                    searchResult.push({
                                        id: l.id,
                                        text: `${l.location_name} | ${l.brand_name}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                table.on('click', 'tr', function () {
                    if (table.row(this).node() !== null) {
                        var memberId = $(table.row(this).node()).attr('data-member-id');
                        location.href = '/super-admin/brands/locations/members/' + memberId;
                    }
                });
            });

        }
    };
}());