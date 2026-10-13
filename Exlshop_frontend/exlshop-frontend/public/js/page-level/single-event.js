var SINGLE_EVENT = SINGLE_EVENT || (function () {
    return {
        init: function (Args) {
            // const _csrf = Args._csrf;
            const userId = Args.userId;
            const eventId = Args.eventId;
            const eventCharges = Args.eventCharges;

            $(document).ready( function () {
                $('#register').on('click',function () {
                    $('#register').attr('disabled',true);

                    $.ajax({
                        url: '/event/register',
                        method: 'POST',
                        data: {
                            _csrf,
                            userId ,
                            eventId
                        },
                        success: function (data) {
                            if (data.success === false) {
                                toastr.success('Some error occurred')
                            } else {
                                toastr.success('Successfully Registered!')
                            }
                            $('#register').attr('disabled',false);
                        }
                    });
                })

                $('#registration-form').submit(function(e){
                    e.preventDefault();

                    $.ajax({
                        url: '/event/request-payment',
                        method: 'POST',
                        data: {
                            _csrf,
                            amount: eventCharges
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#event-registration').modal('hide');
                                const orderData = data;
                                var options = {
                                    "key": data.key,
                                    "name": "Fitbiz",
                                    "description": "",
                                    "image": "/images/logo.png",
                                    "order_id": data.orderId,
                                    "handler": function (response) {
                                    
                                        $.ajax({
                                            url: '/event/register',
                                            method: 'POST',
                                            dataType: 'json',
                                            data: {
                                                _csrf,
                                                paymentResponse: response,
                                                eventId,
                                                name: $('#name').val(),
                                                email: $('#email').val(),
                                                contact_no: $('#contact_no').val(),
                                                gender: $('[name=gender]').val(),
                                                country: $('#country').val(),
                                                state: $('#state').val(),
                                                city: $('#city').val(),
                                                pincode: $('#zip').val(),
                                                address: $('#address').val(),
                                                amount:eventCharges
                                            },
                                            success: function (data) {
                                                if (data) {
                                                    toastr.success('Successfully Registered!');
                                                } else {
                                                    toastr.error('Some error occurred. Please contact support')
                                                }
                                                window.location.reload();
                                            }
                                        })
                                    }
                                };
                                var rzp = new Razorpay(options);
                                rzp.open();
                            } else {
                                alert('Some error occurred. Please try again later')
                            }
                        }
                    })
                })

                $('#state').on('change', function () {
                    $.ajax({
                        url: '/get-cities',
                        method: 'POST',
                        data: {
                            _csrf,
                            stateId: $(this).val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#city').empty().append('<option value="" selected disabled>Select City</option>')
                                data.cities.forEach((c) => {
                                    $('#city').append(`<option value="${c.id}">${c.name}</option>`)
                                })
                            }
                        }
                    })
                })
            })
        }
    };
}());