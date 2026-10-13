var SALES = SALES || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const cart = JSON.parse(_args.cart);
            const minDate = _args.minDate;

            /* START - Clear Cart */
            function clearCart() {
                $('#clear-cart-modal').modal();
                $('#clear-cart-confirm').on('click', function () {
                    $.ajax({
                        url: '/app/sales/clear-cart',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            clear: true
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                                $('#clear-cart-modal').modal('hide');
                                $('.modal-backdrop').remove();
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
            }
            /* END - Clear Cart */

            $(document).ready(function () {
                /* Init BS Tooltip */
                $('[data-toggle="tooltip"]').tooltip();

                $('#change-sale-date-text').datetimepicker({
                    format: 'DD-MM-YYYY hh:mm a',
                    defaultDate: new Date()
                }).on('dp.change', function () {
                    const saleDate = moment($(this).val(), 'DD-MM-YYYY hh:mm a').format('YYYY-MM-DD HH:mm:ss');
                    $("#change-sale-date-text").data("DateTimePicker").hide();
                    $.ajax({
                        url: '/app/sales/set-sale-date',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            saleDate
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })

                $('#change-sale-date-check').on('change', function () {
                    if ($(this).prop('checked')) {
                        $('#change-sale-date-input').show()
                    } else {
                        $('#change-sale-date-input').hide()
                    }
                })

                /* Init JS Switch */
                var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
                elems.forEach(function (html) {
                    new Switchery(html);
                });

                /* START - Clear Cart in button click */
                $('#clear-cart').on('click', function () {
                    clearCart()
                })
                /* END - Clear Cart in button click */

                /* START - Package Search */
                $('#package-search').on('keyup', function () {
                    var keywords = $('#package-search').val();
                    if (keywords.length > 0) {
                        $.ajax({
                            url: '/app/packages/search',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                keywords
                            },
                            success: function (data) {
                                if (data.success && data.packages.length !== 0) {
                                    const packages = data.packages;
                                    $('#package-search-result').empty();
                                    packages.forEach((p) => {
                                        $('#package-search-result').append(`<a class="dropdown-item add-to-cart" href="javascript:void(0)" data-package-id="${p.id}" role="menuitem">${p.name} | <span class="badge badge-warning">Price: Rs. ${p.price.toFixed(2)}</span> <span class="badge badge-info">Validity: ${p.validity_days} Days</span></a>`)
                                    })
                                    $('#package-search-result').show();
                                    $('.add-to-cart').on('click', function () {
                                        const packageId = $(this).data('package-id');
                                        $.ajax({
                                            url: '/app/sales/add-to-cart',
                                            method: 'POST',
                                            data: {
                                                _csrf: _csrf,
                                                packageId
                                            },
                                            success: function (data) {
                                                refreshCartBlock({clearTable: false})
                                            }
                                        });
                                    })
                                } else {
                                    $('#package-search-result').hide();
                                }
                            }
                        });
                    } else {
                        $('#package-search-result').hide();
                    }
                })
                /* END - Package Search */

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

                $('#user-dob, #user-anniversary, #neft-date, #cheque-date').datetimepicker({
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
                                $.ajax({
                                    url: '/app/sales/add-member-to-cart',
                                    method: 'POST',
                                    data: {
                                        _csrf: _csrf,
                                        memberId: data.userId
                                    },
                                    success: function (data) {
                                        if (data.success) {
                                            refreshCartBlock()
                                        } else {
                                            toastr.error('Some error occurred')
                                        }
                                    }
                                });
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                /* END - Add new customer */

                /* START - Search customer with phone number */
                $('#search-customer').on('keyup', function () {
                    const phone = $('#search-customer').val()
                    if (phone.length > 3) {
                        $.ajax({
                            url: '/app/members/search',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                phone
                            },
                            success: function (data) {
                                if (data.success && data.members.length !== 0) {
                                    const members = data.members
                                    $('#customer-search-result').empty();
                                    members.forEach((m) => {
                                        $('#customer-search-result').append(`<a class="dropdown-item add-member-to-cart" href="javascript:void(0)" data-member-id="${m.id}" role="menuitem">${m.fname} ${m.lname} <br /><i class="fa fa-phone"></i> ${m.phone} <br> <i class="fa fa-envelope"></i> ${m.email}</a>`)
                                    })
                                    $('#customer-search-result').show();
                                    $('.add-member-to-cart').on('click', function () {
                                        const memberId = $(this).data('member-id');
                                        $.ajax({
                                            url: '/app/sales/add-member-to-cart',
                                            method: 'POST',
                                            data: {
                                                _csrf: _csrf,
                                                memberId: memberId
                                            },
                                            success: function (data) {
                                                if (data.success) {
                                                    refreshCartBlock()
                                                } else {
                                                    toastr.error('Some error occurred')
                                                }
                                            }
                                        })
                                    })
                                } else {
                                    $('#customer-search-result').hide();
                                }
                            }
                        });
                    } else {
                        $('#customer-search-result').hide();
                    }
                })
                /* END - Search customer with phone number */

                /* START - Handle payment method selection buttons */
                $('.payment-method-btn').on('click', function (e) {
                    e.preventDefault()
                    $('.payment-method-btn').each(function (i, e) {
                        $(e).removeClass('btn-success').addClass('btn-default')
                    })
                    $(this).removeClass('btn-default').addClass('btn-success')
                })
                /* END- Handle payment method selection buttons */

                /* START - Handle adding payment method */
                $('#add-payment').on('click', function () {
                     // paymentAmount = Number($('#payment-amount').val());
                    var paymentLineId, paymentLineAmount, paymentLineMethod;
                   
                    var paymentLineId = $('#payment-method').val();
                    if(paymentLineId == 1){
                        //cash
                        paymentLineAmount = $('#total-cash-amount').val();
                        var count = 0;
                        $("#cash input").each(function(){
                            if(!$(this).val()){
                                count++;
                            }
                        });
                        if(count){
                            alert('Please fill up all the fields!');
                            return;
                        }
                    }else if(paymentLineId == 2){
                        //card
                        paymentLineAmount = $('#card-amount').val();
                        var count = 0;
                        $("#card input").each(function(){
                            if(!$(this).val()){
                                count++;
                            }
                        });
                        if(count){
                            alert('Please fill up all the fields!');
                            return;
                        }
                    }else if(paymentLineId == 3){
                        //razorpay
                        paymentLineAmount = $('#razorpay-amount').val();
                        var count = 0;
                        $("#razorpay input").each(function(){
                            if(!$(this).val()){
                                count++;
                            }
                        });
                        if(count){
                            alert('Please fill up all the fields!');
                            return;
                        }
                    }else if(paymentLineId == 5){
                        //cheque
                        paymentLineAmount = $('#cheque-amount').val();
                        var count = 0;
                        $("#cheque input").each(function(){
                            if(!$(this).val()){
                                count++;
                            }
                        });
                        if(count){
                            alert('Please fill up all the fields!');
                            return;
                        }
                    }else if(paymentLineId == 6 || paymentLineId == 7 || paymentLineId == 8 || paymentLineId == 9){
                        //neft, rtgs, imps
                        paymentLineAmount = $('#neft-amount').val();
                        var count = 0;
                        $("#neft input").each(function(){
                            if(!$(this).val()){
                                count++;
                            }
                        });
                        if(count){
                            alert('Please fill up all the fields!');
                            return;
                        }
                    }
                    if (isNaN(paymentLineAmount) || paymentLineAmount < 0) {
                        return toastr.error('Invalid Payment Amount')
                    }
                    
                    var paymentLineMethod = $('#payment-method').text();

                    var paymentLineCardType = $('[name=card-type]:checked').val();
                    var paymentLineCardNo = $('#card-number').val();
                    var paymentLineCardPhone = $('#card-phone').val();
                    
                    var paymentLineChequeNo = $('#cheque-no').val();
                    var paymentLineChequeDate = $('#cheque-date').val() ? moment($('#cheque-date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null;

                    var paymentLineBankName = (paymentLineId == 5)?($('#cheque-bank-name').val()):($('#bank-name').val());
                    var paymentLineNeftDate = $('#neft-date').val() ? moment($('#neft-date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD') : null; 
                    var paymentLineRefNo = $('#ref-no').val(); 

                    var paymentLineRazorpayTransactionId = $('#razorpay-transaction-id').val();

                    paymentLineMethod = $("#payment-method option:selected").text();
                    $.ajax({
                        url: '/app/sales/add-payment',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            id: paymentLineId,
                            amount: paymentLineAmount,
                            method: paymentLineMethod,
                            cardType: paymentLineCardType,
                            cardNo: paymentLineCardNo,
                            cardPhone: paymentLineCardPhone,
                            chequeNo: paymentLineChequeNo,
                            chequeDate: paymentLineChequeDate,
                            bankName: paymentLineBankName,
                            neftDate: paymentLineNeftDate,
                            refNo: paymentLineRefNo,
                            razorpayTransactionId: paymentLineRazorpayTransactionId
                        },
                        success: function (data) {
                            $('#add-sale-payment').modal('hide');
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })
                /* END - Handle adding payment method */

                /* START - Handle remove payment method */
                $('.remove-payment').on('click', function (e) {
                    e.preventDefault()
                    const paymentId = $(this).data('payment-id');
                    $.ajax({
                        url: '/app/sales/remove-payment',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            paymentId
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                            $('[data-toggle="tooltip"]').tooltip('dispose');
                        }
                    })
                })
                /* END - Handle remove payment method */

                /* START - Handle sale complete */
                $('#complete-sale').on('click', function () {
                    var validSale = true;
                    $('.trainer-id').each(function (i, e) {
                        if (!$(e).val()) {
                            $(this).addClass('is-invalid')
                            toastr.error('Please Select Personal Trainer')
                            validSale = false
                        }
                    })
                    if (!validSale) {
                        return
                    }

                    $('.sold-by').each(function (i, e) {
                        if (!$(e).val()) {
                            $(this).addClass('is-invalid')
                            toastr.error('Please Select Sold By User')
                            validSale = false
                        }
                    })

                    $('.slot-id').each(function (i, e) {
                        if (!$(e).val()) {
                            $(this).addClass('is-invalid')
                            toastr.error('Please Select a Time Slot')
                            validSale = false
                        }
                    })

                    $('.start-date').each(function (i, e) {
                        if (!$(e).val()) {
                            $(this).addClass('is-invalid')
                            toastr.error('Please Select a Date')
                            validSale = false
                        }
                    })
                    if (!validSale) {
                        return
                    }
                    if(cart.paymentLines.length == 0){
                        toastr.error('Please Add a Payment')
                        return
                    }
                    
                    $.ajax({
                        url: '/app/sales/validate-sale-dates',
                        method: 'POST',
                        data:{
                            _csrf
                        },
                        success: function(data){
                            if(data.isValid == 1){
                                var comment = $('#sale-comment').val();
                                var changeSale = $('#change-sale-date-check').prop('checked') ? moment($('#change-sale-date-text').val(), 'DD-MM-YYYY hh:mm a').format('YYYY-MM-DD HH:mm:ss') : false;
                                $('#complete-sale-modal').modal()
                                $('#complete-sale-cancel').on('click', function () {
                                    refreshCartBlock()
                                })
                                $('#complete-sale-confirm').on('click', function () {
                                    $(this).attr('disabled', true)
                                    $.ajax({
                                        url: '/app/sales/complete',
                                        method: 'POST',
                                        data: {
                                            _csrf: _csrf,
                                            comment,
                                            changeSale
                                        },
                                        success: function (data) {
                                            if (data.success) {
                                                window.location.href = '/app/sales/invoice/'+data.saleId;
                                            } else {
                                                refreshCartBlock()
                                                toastr.error('Some error occurred')
                                            }
                                            $('#complete-sale-modal').modal('hide');
                                            $('.modal-backdrop').remove();
                                        }
                                    })
                                })
                            }else{
                                toastr.error('The Member already has a active Membership within the selected period.Please select a date after that.')
                            }
                        }
                    })
                    
                })
                /* END - Handle sale complete */

                /* START - Detach Customer */
                $('#detach-member').on('click', function () {
                    $.ajax({
                        url: '/app/sales/detach-member',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            detach: true
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                            $('[data-toggle="tooltip"]').tooltip('dispose');
                        }
                    })
                })
                /* END - Detach Customer */

                /* START - Set discount */
                $('.set-discount-input').on('change', function () {
                    const discount = parseInt($(this).val());
                    const packageId = parseInt($(this).data('package-id'));
                    const lineId = parseInt($(this).data('line-id'));
                    if (discount > 100) {
                        $(this).val(0)
                    }
                    $.ajax({
                        url: '/app/sales/set-discount',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            discount,
                            packageId,
                            lineId
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })
                /* END - Set discount */

                /* START - Set Membership Start / End */
                $('.membership-date').datetimepicker({
                    format: 'DD-MM-YYYY',
                    // minDate: minDate
                }).on('dp.change', function () {
                    const date = moment($(this).val(), 'DD-MM-YYYY').format('YYYY-MM-DD');
                    const periodType = $(this).data('date-type');
                    const packageId = parseInt($(this).data('package-id'));
                    const lineId = parseInt($(this).data('line-id'));
                    $.ajax({
                        url: '/app/sales/set-membership-period',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            date,
                            periodType,
                            packageId,
                            lineId
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })
                /* START - Set Membership Start / End */

                /* START - Set discount */
                $('.set-price').on('change', function () {
                    const price = parseInt($(this).val());
                    const packageId = parseInt($(this).data('package-id'));
                    const lineId = parseInt($(this).data('line-id'));
                    $.ajax({
                        url: '/app/sales/set-price',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            price,
                            packageId,
                            lineId
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })
                /* END - Set discount */

                $('.remove-package').on('click', function () {
                    const packageId = $(this).data('package-id');
                    const lineId = $(this).data('line-id');
                    $.ajax({
                        url: '/app/sales/remove-package',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            lineId,
                            packageId
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                            $('[data-toggle="tooltip"]').tooltip('dispose');
                        }
                    })
                })

                /* START - Attach Trainer */
                $('.trainer-id').on('change', function () {
                    const packageId = $(this).data('package-id');
                    const lineId = $(this).data('line-id');
                    const trainerId = $(this).val();

                    $.ajax({
                        url: '/app/sales/set-trainer',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            trainerId,
                            packageId,
                            lineId
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })
                /* END - Attach Trainer */

                /* START - Set Sold By */
                $('.sold-by').on('change', function () {
                    const userId = $(this).val();
                    const packageId = parseInt($(this).data('package-id'));
                    const lineId = parseInt($(this).data('line-id'));
                    $.ajax({
                        url: '/app/sales/set-sold-by',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            userId,
                            packageId,
                            lineId
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })
                /* END - Set Sold By */

                /* START - Set Sold By */
                $('.slot-id').on('change', function () {
                    const slotId = $(this).val();
                    const packageId = parseInt($(this).data('package-id'));
                    const lineId = parseInt($(this).data('line-id'));
                    $.ajax({
                        url: '/app/sales/set-slot-id',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            slotId,
                            packageId,
                            lineId
                        },
                        success: function (data) {
                            if (data.success) {
                                refreshCartBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })
                /* END - Set Sold By */

            });

            /* START - Hide customer and package search result when clicked outside container */
            $(document).mouseup(function (e) {
                var container = $("#package-search-result, #customer-search-result");
                // if the target of the click isn't the container nor a descendant of the container
                if (!container.is(e.target) && container.has(e.target).length === 0) {
                    container.hide();
                }
            });
            /* END - Hide customer and package search result when clicked outside container */

            /* START - Clear cart with presses keyboard Esc */
            $(document).on('keydown', function (e) {
                if (e.key == "Escape") {
                    clearCart()
                }
            })
            /* END - Clear cart with presses Esc */

            /* START - Add New Package */
            $('#add-new-package-btn').on('click', function () {
                $.ajax({
                    url: '/app/packages/add',
                    method: 'POST',
                    data: {
                        _csrf: _csrf,
                        name: $('#package-name').val(),
                        validity: $('#package-validity').val(),
                        price: $('#package-price').val(),
                        taxIncluded: $('#tax-included').prop('checked') ? 1 : 0,
                        is_pt: $('#is-pt').prop('checked') ? true : ''
                    },
                    success: function (data) {
                        if (data.success) {
                            $('#add-new-package').modal('hide')
                            refreshCartBlock()
                        } else {
                            toastr.error('Some error occurred')
                        }
                        $('[data-toggle="tooltip"]').tooltip('dispose');
                    }
                })
            })
            /* END - Add New Package */

            $('#payment-method').change(function(){
                var val = $(this).val();
                if(val == 1){
                    //cash
                    $('#cash').removeClass('display-hidden');
                    $('#card').addClass('display-hidden');
                    $('#neft').addClass('display-hidden');
                    $('#razorpay').addClass('display-hidden');
                    $('#cheque').addClass('display-hidden');
                }else if(val == 2){
                    //card
                    $('#cash').addClass('display-hidden');
                    $('#card').removeClass('display-hidden');
                    $('#neft').addClass('display-hidden');
                    $('#razorpay').addClass('display-hidden');
                    $('#cheque').addClass('display-hidden');
                }else if(val == 3){
                    //razorpay
                    $('#razorpay').removeClass('display-hidden');
                    $('#cash').addClass('display-hidden');
                    $('#card').addClass('display-hidden');
                    $('#neft').addClass('display-hidden');
                    $('#cheque').addClass('display-hidden');
                }else if(val == 5){
                    //cheque
                    $('#cheque').removeClass('display-hidden');
                    $('#cash').addClass('display-hidden');
                    $('#card').addClass('display-hidden');
                    $('#neft').addClass('display-hidden');
                    $('#razorpay').addClass('display-hidden');
                }else if(val == 6 || val == 7 || val == 8 || val == 9){
                    //neft, rtgs, imps
                    $('#cash').addClass('display-hidden');
                    $('#card').addClass('display-hidden');
                    $('#neft').removeClass('display-hidden');
                    $('#razorpay').addClass('display-hidden');
                    $('#cheque').addClass('display-hidden');
                }
            })

            $('#total-cash-amount, #card-amount, #razorpay-amount, #cheque-amount, #neft-amount').change(function(){
                var due_amount = parseFloat($('#due_amount').text());
                if($(this).val() > due_amount){
                    $(this).addClass('is-invalid').next('.invalid-feedback').text('Please enter Amount lesser than or Equal to Due amount')
                }else{
                    $(this).removeClass('is-invalid').next('.invalid-feedback').text('')
                }
            })

            /* Comment Edit*/
            $('#sale-comment').change(function(){
                const comment = $(this).val();
                $.ajax({
                    url: '/app/sales/set-sale-comment',
                    method: 'POST',
                    data: {
                        _csrf: _csrf,
                        comment
                    },
                    success: function (data) {
                        if (data.success) {
                            refreshCartBlock()
                        } else {
                            toastr.error('Some error occurred in saving your comment!. Please refresh and check!')
                        }
                    }
                })  
            })
        }
    };
}());