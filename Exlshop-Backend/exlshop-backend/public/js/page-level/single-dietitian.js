var SINGLE_DIETITIAN = SINGLE_DIETITIAN || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const dietitianId = _args.dietitianId;

            $(document).ready(function () {
                
                var elem = document.querySelector('.js-switch');
                var init = new Switchery(elem);

                $('.edit-data').on('change', function () {
                    update_details(this);
                });

                $('#diet-plan').select2();
                /* START - Get City By State */
                $('#state').on('change', function () {
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
                                $('#city').empty().append('<option value="">Select City</option>');
                                data.cities.forEach((c) => {
                                    $('#city').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                /* END - Get City By State */

                /* start datepicker */
                $('#dob, #anniversary_date').datetimepicker({
                    format:'D-M-Y'
                }).on('dp.change', function () {
                    update_details(this)
                });
                /*end datepicker*/          

                $('#capture-image').on('click', function () {
                    $('#profile-picture-capture').modal()
                    Webcam.set({
                        width: 320,
                        height: 240,
                        image_format: 'jpeg',
                        jpeg_quality: 90
                    });
                    Webcam.attach('#camera-container');
                    $('#capture').on('click', function () {
                        Webcam.snap(function (imageData) {
                            $.ajax({
                                url: '/super-admin/settings/user/update/profile-image',
                                method: 'POST',
                                data: {
                                    _csrf: _csrf,
                                    userId: userData.id,
                                    imageData,
                                },
                                success: function (data) {
                                    if (data.success) {
                                        toastr.success('Profile Image updated successfully!');
                                        $('#member-profile-image').attr('src', data.filename)
                                    } else {
                                        toastr.error('Some error occurred')
                                    }
                                }
                            });
                        });
                    })
                })

                $('#diet-plan').change(function(){
                    if($(this).val()){
                        $.ajax({
                            url: '/super-admin/settings/dietitian/category/update',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                dietitianId: dietitianId,
                                dietPlans: $('#diet-plan').val()
                            },
                            success: function (data) {
                                if (data.success) {
                                    toastr.success('Profile updated successfully!');
                                } else {
                                    toastr.error('Some error occurred')
                                }
                            }
                        })
                    }
                })
            });

            function update_details(elem){
                const col = $(elem).attr('name');
                var val = $(elem).val();
                if (col === 'gender' || col === 'marital_status') {
                    val = $(elem).val()
                }

                if (col === 'birth_date' || col === 'anniversary_date') {
                    val = moment($(elem).val(),'DD-MM-YYYY').format('YYYY-MM-DD')
                }

                if (col === 'is_active') {
                    val = $(elem).prop('checked') ? 1 : 0
                }

                $.ajax({
                    url: '/super-admin/brands/locations/members/update',
                    method: 'POST',
                    data: {
                        _csrf: _csrf,
                        userId: dietitianId,
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
            }
        }
    };
}());