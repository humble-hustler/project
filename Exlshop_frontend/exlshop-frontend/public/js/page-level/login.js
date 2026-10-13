var LOGIN = LOGIN || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf

            $(document).ready( function () {
                $("#modal-login").click(function (e) {
                    var flag=1;
                    var email = $("#u-email").val();
                    var password = $("#u-password").val();
                    if(!$("#u-email").val()){
                        toastr.error('Please Enter Email')
                        return
                    }
                    if(!$("#u-password").val()){
                        toastr.error('Please Enter Password')
                        return
                    }
                    $.ajax({
                        url: "/api/v1/userlogin/login",
                        data: {
                            flag:flag,
                            email: email,
                            password: password,
                            _csrf:_args._csrf
                        },
                        method: 'POST',
                        success: function (data) {
                            toastr.success('Login Successfully');
                            window.location = "/";
                        },
                        error: function (data, status, error) {
                            toastr.error('Email and Password does not match');
                        }
                    });
                });
			
                $('#user-email').on('change', function () {
                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback')
                        toastr.error(`Please enter a valid email address`)
                        $('#register-btn').attr('disabled', true);
                        return
                    }
                    $.ajax({
                       url: '/email-valid',
                        method: 'POST',
                        data: {
                            _csrf: _args._csrf,
                            email: $element.val()
                        },
                        success: function (data) {
                            if (!data.valid) {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#register-btn').attr('disabled', false)   
                            } else {
                                $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback')
                                toastr.error('Email already exists')
                                $('#register-btn').attr('disabled', true)
                            }
                        }
                    });
                })
               
                $('#user-phone').on('change', function () {
                    $element = $(this);
                    if ($element.val().length != 10) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback')
                        $('#register-btn').attr('disabled', true);
                        toastr.error(`Please enter a valid 10 digit phone number`)
                        return
                    }
                    $.ajax({
                        url: '/phone-valid',
                        method: 'POST',
                        data: {
                            _csrf: _args._csrf,
                            phone: $element.val()
                        },
                        success: function (data) {
                            if (!data.valid) {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#register-btn').attr('disabled', false)
                            } else {
                                $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback')
                                toastr.error(`Phone Number already exists`)
                                $('#register-btn').attr('disabled', true)
                            }
                        }
                    });
                })
            })
        }
    };
}());