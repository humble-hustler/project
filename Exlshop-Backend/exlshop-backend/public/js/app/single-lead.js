var SINGLE_LEAD = SINGLE_LEAD || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const leadData = JSON.parse(_args.leadData);

            $(document).ready(function () {
                var elem = document.querySelector('.js-switch');
                var init = new Switchery(elem);
                
                $('#package_ids').select2();
                $('#trial_date_time').datetimepicker();
                $('#followup_date_time').datetimepicker({
                    format:'D/M/Y h:m a'
                });
                $('.edit-data').on('change', function () {
                    const col = $(this).attr('name');
                    var val = $(this).val();
                    if (col === 'gender' || col === 'marital_status' || col === 'trial_booked') {
                        val = $(this).val()
                    }

                    if (col === 'trial_date_time' ) {
                        val = moment($(this).val()).format('YYYY-MM-DD HH:mm:ss')
                    }

                    if (col === 'is_active') {
                        val = $(this).prop('checked') ? 1 : 0
                    }
                    
                    if (col === 'package_ids') {
                        val = $(this).val().join(',')
                    }
                    
                    $.ajax({
                        url: '/app/marketing/leads/update',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            leadId: leadData.id,
                            col,
                            val
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Profile updated successfully!');
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                });
                $('.edit-followup').on('click',function(){
                    $('[name=followup_id]').val($(this).attr('followup-id'));
                    $('[name=text]').val($(this).parent().parent().parent().find('.text').text());
                    $('[name=followup_date_time]').val(moment($(this).parent().parent().parent().find('.date_time').text(),'DD-MM-YYYY hh:mm:ss a').format('DD-MM-YYYY hh:mm:ss a'));
                    $('#followup-form').attr('action','/app/marketing/leads/update/followup');
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

                $('#user-dob, #user-anniversary').datetimepicker({
                    format: 'DD-MM-YYYY'
                })

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
                                toastr.success('Successfully Converted to a Member');
                                $.ajax({
                                    url: '/app/marketing/leads/convert-to-member',
                                    method: 'POST',
                                    data:{
                                        id: leadData.id,
                                        _csrf: _csrf
                                    },
                                    success: function(data){
                                        if(data.success){
                                            toastr.success('You can add the member packages in the next Sales page.');
                                            setTimeout(() => { window.location.href="/app/sales";}, 4000);
                                        }
                                    }
                                })
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                /* END - Add new customer */

                $('.convert-lead').click(function(){
                    $('#user-phone').change();
                })
            });
        }
    };
}());