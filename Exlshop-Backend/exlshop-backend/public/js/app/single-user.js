var SINGLE_USER = SINGLE_USER || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const userData = JSON.parse(_args.userData)

            $(document).ready(function () {
                $('#locations').select2().on('change', function () {
                    $.ajax({
                        url: '/app/users/set-locations',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            userId: userData.id,
                            locations: $(this).val(),
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Locations updated successfully!');
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                var elem = document.querySelector('.js-switch');
                var init = new Switchery(elem);
                $('.edit-data-phone').on('change',function(){
                    $element = $(this);
                    const col = $(this).attr('name');
                    var val = $(this).val();
                    const regex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
                    if (regex.test(val)){
                        $element.removeClass('is-invalid').addClass('is-valid');
                        $.ajax({
                            url: '/app/members/update',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                userId: userData.id,
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
                    else{
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid Phone Number');
                        return
                    }
                })
                $('.edit-data-name').on('change',function(){
                    $element = $(this);
                    const col = $(this).attr('name');
                    var val = $(this).val();
                    $element.removeClass('is-invalid').addClass('is-valid');
                    $.ajax({
                        url: '/app/members/update',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            userId: userData.id,
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
                })
                $('.edit-data-email').on('change',function(){
                   
                    $element = $(this);
                    const col = $(this).attr('name');
                    var val = $(this).val();
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (regex.test(val)){
                        $element.removeClass('is-invalid').addClass('is-valid');
                        $.ajax({
                            url: '/app/members/update',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                userId: userData.id,
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
                    else{
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid Email');
                        return
                    }
                })
                $('.edit-data').on('change', function () {
                    const col = $(this).attr('name');
                    var val = $(this).val();
                    if (col === 'gender' || col === 'marital_status') {
                        val = $(this).val()
                    }

                    if (col === 'birth_date' || col === 'anniversary_date') {
                        val = moment($(this).val()).format('YYYY-MM-DD')
                    }

                    if (col === 'is_active') {
                        val = $(this).prop('checked') ? 1 : 0
                    }

                    $.ajax({
                        url: '/app/members/update',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            userId: userData.id,
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

                $('.edit-profile-data').on('change', function () {
                    const col = $(this).attr('name');
                    var val = $(this).val();

                    $.ajax({
                        url: '/app/users/update/profile',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            userId: userData.id,
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
                                url: '/app/members/update/profile-image',
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
                /* END - Get City By State */

                $('#role').on('change', function () {
                    const roleId = $(this).val()
                    $.ajax({
                        url: '/app/users/update/role',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            roleId,
                            userId: userData.id
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Profile updated successfully!');
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })

                $('#add_salary_form').submit(function(e){
                    e.preventDefault();

                    if(!$('[name=is_promoted]:checked').val()){
                        toastr.error('Please select the Promotion Status')
                        return;
                    }
                    $.ajax({
                        url:'/app/users/add/salary',
                        method: 'POST',
                        data:{
                            _csrf,
                            user_id_salary: $('#user-id-salary').val(),
                            salary_type: $('#salary-type').val(),
                            salary_amount: $('#salary-amount').val(),
                            salary_department: $('#department-salary').val(),
                            salary_designation: $('#designation-salary').val(),
                            is_promoted: $('[name=is_promoted]:checked').val()
                        },
                        success:function(data){
                            if (data.success) {
                                toastr.success('Salary Updated successfully!');
                                window.location.reload();
                            } else {
                                toastr.error('Some error occurred');
                            }
                        }
                    })
                })

                $('#user-active-switch').change(function(){
                    $('#user-log-modal').modal('show');
                })

                $('#user-status-reason-id').change(function(){
                    if($(this).val() == 3){
                        $('.resignation').removeClass('display-hidden')
                        $('#reason-text').addClass('display-hidden');
                    }else if($(this).val() == 4){
                        $('.resignation').addClass('display-hidden')
                        $('#reason-text').removeClass('display-hidden');
                    }else{
                        $('.resignation').addClass('display-hidden')
                        $('#reason-text').addClass('display-hidden');
                    }
                })

                $('#save-user-status').on('click',function(){
                   
                    var invalid = false;
                    if($('#user-status-reason-id').val() == 3){
                        $('.resignation input').each(function(){
                            if(!$(this).val()){
                                invalid = true;
                            }
                        })
                        $('.resignation select').each(function(){
                            if(!$(this).val()){
                                invalid = true;
                            }
                        })
                        $('.resignation textarea').each(function(){
                            if(!$(this).val()){
                                invalid = true;
                            }
                        })
                        if(!$('[name=notice_served]:checked').val()){
                            invalid = true;
                        }
                    }
                    if(invalid){
                        toastr.error('Please fill all the fields!');
                        return;
                    }

                    var reasonId = $('#user-status-reason-id').val();
                    $.ajax({
                        url: '/app/users/update/status',
                        method: 'POST',
                        data:{
                            _csrf,
                            userId: userData.id,
                            isActive: (($('#user-active-switch').is(':checked'))?(1):(0)),
                            reasonId: reasonId,
                            reasonText: $('#reason-text').val(),
                            resignationType: reasonId == 3 ? $('#resignation-type').val() : null,
                            resignationReason: reasonId == 3 ? $('#resignation-reason').val() : null,
                            resignationNoticePeriod: reasonId == 3 ? $('#resignation-notice-period').val() : null,
                            resignationNoticeServed: reasonId == 3 ? $('[name=notice_served]:checked').val() : null
                        },
                        success: function(data){
                            if(data.success){
                                toastr.success('Status Updated successfully!');
                                window.location.reload();
                            }else{
                                toastr.error('Some Error Occurred!');
                            }
                        }
                    })
                })

                $('.time-slot-delete').click(function(){
                    $('[name=time_slot_id]').val($(this).attr('time_slot_id'));
                })
            });
        }
    };
}());