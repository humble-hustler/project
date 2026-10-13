var SINGLE_USER = SINGLE_USER || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const userData = JSON.parse(_args.userData)
            const userEducations = JSON.parse(_args.userEducations);
            const userExperience = JSON.parse(_args.userExperience);

            $(document).ready(function () {
                
                var elem = document.querySelector('.js-switch');
                var init = new Switchery(elem);

                $('.edit-data').on('change', function () {
                    update_details(this);
                });
                $('.edit-data-phone').on('change',function(){
                    $element = $(this);
                    const col = $(this).attr('name');
                    var val = $(this).val();
                    const regex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
                    if (regex.test(val)){
                        $element.removeClass('is-invalid').addClass('is-valid');
                        update_details(this);
                        
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
                    const regex = /^[a-zA-Z]+$/;
                    if (regex.test(val)){
                        $element.removeClass('is-invalid').addClass('is-valid');
                        update_details(this);
                        
                    }
                    else{
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid name');
                        return
                    }
                })

                $('.edit-data-email').on('change',function(){
                    $element = $(this);
                    const col = $(this).attr('name');
                    var val = $(this).val();
                    const regex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
                    if (regex.test(val)){
                        $element.removeClass('is-invalid').addClass('is-valid');
                        update_details(this);
                        
                    }
                    else{
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid Email');
                        return
                    }
                })
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

                /*edit education start*/
                $('.edit-education').click(function () {
                    var id = $(this).closest('tr').attr('education_id');
                    userEducations.forEach(function(u){
                        if(u.id == id){
                            $('#education-level').val(u.education_level);
                            $('#institute').val(u.institute);
                            $('#description').val(u.description);
                            $('#month').val(u.month);
                            $('#year').val(u.year);
                            $('#education-form').attr('action','/super-admin/settings/user/update/education');
                            $('#education-form-btn').text('Update');
                            $('#education-id').val(id);
                            $('#add-education').removeClass('display-hidden');
                        }
                    })
                })
                /*edit education end*/

                /*edit experience start*/
                $('.edit-experience').click(function () {
                    var id = $(this).closest('tr').attr('experience_id');
                    userExperience.forEach(function(u){
                        if(u.id == id){
                            $('#job-position').val(u.job_position);
                            $('#employer-name').val(u.employer_name);
                            $('#job-description').val(u.job_description);
                            $('#from_month_exp').val(u.from_month);
                            $('#from_year_exp').val(u.from_year);
                            $('#to_month_exp').val(u.to_month);
                            $('#to_year_exp').val(u.to_year);
                            $('#experience-form').attr('action','/super-admin/settings/user/update/experience');
                            $('#experience-form-btn').text('Update');
                            $('#experience-id').val(id);
                            $('#add-experience').removeClass('display-hidden');
                        }
                    })
                })
                /*edit experience end*/

                /*add experience start*/                
                $('#add-experience').click(function () {
                    $('#experience-form').attr('action','/super-admin/settings/user/add/experience');
                    $('#experience-form-btn').text('Add');
                    $('#experience-form').find('.form-control').each(function () {
                        $(this).val('');
                    });
                    $(this).addClass('display-hidden');
                })
                /*add experience end*/

                /*add education start*/  
                $('#add-education').click(function () {
                    $('#education-form').attr('action','/super-admin/settings/user/add/education');
                    $('#education-form-btn').text('Add');
                    $('#education-form').find('.form-control').each(function () {
                        $(this).val('');
                    });
                    $(this).addClass('display-hidden');
                })
                /*add education end*/

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
        }
    };
}());