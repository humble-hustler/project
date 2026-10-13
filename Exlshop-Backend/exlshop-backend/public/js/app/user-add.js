var USER_ADD = USER_ADD || (function () {
    return {
        init: function (Args) {
            var _args = Args;
            var _csrf = _args._csrf;

            $(document).ready(function () {

                jQuery(document).ready(function() {
                    jQuery("[required]").after("<span class='required'>*</span>");
                });
                
                $('#user-password, #user-confirm-password').on('change', function () {
                    if ($('#user-password').val() !== $('#user-confirm-password').val()) {
                        $('#password-mismatch').css('display', 'block');
                        $('#add-new-user-btn').attr('disabled', true);
                    } else {
                        $('#password-mismatch').hide();
                        $('#add-new-user-btn').attr('disabled', false);
                    }
                })

                $('#user-email').on('change', function () {
                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid email address')
                        $('#add-new-user-btn').attr('disabled', true);
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
                                $('#add-new-user-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-user-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                $('#emergency_contact_number').on('change', function () {
                   
                    $element = $(this);
                    const regex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid Phone Number')
                        $('#add-new-team-member-btn').attr('disabled', true);
                        return
                    }
                })
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
                                $('#add-new-user-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-user-btn').attr('disabled', false)
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

                //on click of add-more-education
                $('#add-education-entry').click(function(){
                    $('#education-table tbody').append($('#sample-education').clone().removeAttr('id').removeClass('display-hidden').css('display','table-row').addClass('education'));
                })

                //on click of add-more-experience
                $('#add-experience-entry').click(function(){
                    $('#experience-table tbody').append($('#sample-experience').clone().removeAttr('id').removeClass('display-hidden').css('display','table-row').addClass('experience'));
                })

                //on click of add-more-compensation-salary
                $('#add-compensation-salary-entry').click(function(){
                    $('#compensation-salary-table tbody').append($('#sample-compensation-salary').clone().removeAttr('id').removeClass('display-hidden').css('display','table-row').addClass('compensation-salary'));
                })

                //on click of add-more-compensation
                $('#add-compensation-personal-training-entry').click(function(){
                    $('#compensation-personal-training-table tbody').append($('#sample-compensation-personal-training').clone().removeAttr('id').removeClass('display-hidden').css('display','table-row').addClass('compensation-personal-training'));
                })

                $('#add-new-user-btn').on('click', function(){
                    var education = [];
                    var experience = [];
                    var compensation_salary = [];
                    var compensation_pt_salary = [];
                    if (!$('[name=user_fname]').val()) {
                        toastr.error('Please fill the First Name');
                        return
                    }
                    if (!$('[name=user_lname]').val()) {
                        toastr.error('Please fill the Last Name');
                        return
                    }
                    if (!$('[name=user_email]').val()) {
                        toastr.error('Please fill the Email');
                        return
                    }
                    if (!$('[name=user_phone]').val()) {
                        toastr.error('Please fill the Phone');
                        return
                    }
                    if (!$('[name=user_password]').val()) {
                        toastr.error('Please fill the Password');
                        return
                    }
                    if (!$('[name=role_id]').val()) {
                        toastr.error('Please select a Role');
                        return
                    }
                    if (!$('[name=department_id]').val()) {
                        toastr.error('Please select a Department');
                        return
                    }
                    if (!$('[name=designation_id]').val()) {
                        toastr.error('Please select a Designation');
                        return
                    }

                    // get all the education details
                    $('.education').each(function(){
                        if(!$(this).find('.education_level').val() || !$(this).find('.institute').val()){
                            toastr.error('Please Fill the Education Level and Institute Details');
                            return
                        }
                        education.push({
                            educationLevel : $(this).find('.education_level').val(),
                            institute : $(this).find('.institute').val(),
                            description : $(this).find('.description').val(),
                            month : $(this).find('.month').val(),
                            year : $(this).find('.year').val()
                        })
                    })

                    //get all the experience details
                    $('.experience').each(function(){
                        if(!$(this).find('.job_position').val() || !$(this).find('.employer_name').val() || !$(this).find('.from_month_exp').val() || !$(this).find('.from_year_exp').val()){
                            toastr.error('Please Fill the Experience Details');
                            alert("xc x")
                            return
                        }
                        experience.push({
                            jobPosition : $(this).find('.job_position').val(),
                            employerName : $(this).find('.employer_name').val(),
                            jobDescription : $(this).find('.job_description').val(),
                            fromMonth : $(this).find('.from_month_exp').val(),
                            toMonth : $(this).find('.from_year_exp').val(),
                            fromYear: $(this).find('.to_month_exp').val(),
                            toYear: $(this).find('.to_year_exp').val()
                        })
                    })

                    //get all the compensation salary details
                    $('.compensation-salary').each(function(){
                        if(!$(this).find('.salary_type').val() || !$(this).find('.salary_amount').val()){
                            toastr.error('Please Fill the Salary Details');
                            return
                        }
                        compensation_salary.push({
                            salaryType : $(this).find('.salary_type').val(),
                            salaryAmount : $(this).find('.salary_amount').val(),
                            department: $('#department').val(),
                            designation: $('#designation').val()
                        })
                    })
                    
                    //get all the compensation-personal-training details
                    $('.compensation-personal-training').each(function(){
                        if(!$(this).find('.salary_type').val() || !$(this).find('.salary_amount').val()){
                            toastr.error('Please Fill the Salary Details');
                            return
                        }
                        compensation_pt_salary.push({
                            salaryType : $(this).find('.salary_type').val(),
                            salaryAmount : $(this).find('.salary_amount').val()
                        })
                    })

                    $.ajax({
                        headers: {
                            'csrf-token': _csrf
                        },
                        url:'/app/users/add-new',
                        method:'POST',
                        data:{
                            user_fname : $('[name=user_fname]').val(),
                            user_lname : $('[name=user_lname]').val(),
                            user_email : $('[name=user_email]').val(),
                            user_phone : $('[name=user_phone]').val(),
                            user_password: $('[name=user_password]').val(),
                            user_department: $('#department').val(),
                            user_designation: $('#designation').val(),
                            role_id : $('[name=role_id]').val(),
                            gender : $('[name=gender]').val(),
                            address_line_1 : $('[name=address_line_1]').val(),
                            address_line_2 : $('[name=address_line_2]').val(),
                            city_id : $('[name=city_id]').val(),
                            state_id : $('[name=state_id]').val(),
                            zip : $('[name=zip]').val(),
                            marital_status : $('[name=marital_status]').val(),
                            emergency_contact_name : $('[name=emergency_contact_name]').val(),
                            emergency_contact_number : $('[name=emergency_contact_number]').val(),
                            blood_group : $('[name=blood_group]').val(),
                            birth_date : ($('[name=birth_date]').val())?($('[name=birth_date]').val()):(null),
                            anniversary_date : ($('[name=anniversary_date]').val())?($('[name=anniversary_date]').val()):(null),
                            education: education,
                            experience: experience,
                            compensation_salary: compensation_salary,
                            compensation_pt_salary: compensation_pt_salary
                        },
                        success:function(data){
                            if(data.success){
                                window.location.href='/app/users';
                            }else{
                                alert('Some Error occurred .Please try again!')
                            }
                        }
                    })
                })
            });

        }
    };
}());