var SALE_EDIT = SALE_EDIT || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const sale = JSON.parse(_args.sale);
            $(document).ready(function () {
                /* Init BS Tooltip */
                $('[data-toggle="tooltip"]').tooltip();

                $('#change-sale-date-text').datetimepicker({
                    format: 'DD-MM-YYYY hh:mm a',
                    defaultDate: new Date()
                })

                /* Init JS Switch */
                var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
                elems.forEach(function (html) {
                    new Switchery(html);
                });

                /* START - Package Search */
            
                $('#select-package').select2({
                    placeholder: 'Search Package',
                    ajax: {
                        url: '/app/packages/search',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    keywords: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.packages.forEach((w) => {
                                    searchResult.push({
                                        id: w.id,
                                        text: `${w.name}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })
                /* END - Package Search */

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
                    var paymentLineChequeDate = $('#cheque-date').val() ? (moment($('#cheque-date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD')) : null;

                    var paymentLineBankName = (paymentLineId == 5)?($('#cheque-bank-name').val()):($('#bank-name').val());
                    var paymentLineNeftDate = $('#neft-date').val() ? moment($('#neft-date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD'): null; 
                    var paymentLineRefNo = $('#ref-no').val(); 

                    paymentLineMethod = $("#payment-method option:selected").text();

                    var paymentLineRazorpayTransactionId = $('#razorpay-transaction-id').val();
                    $.ajax({
                        url: '/app/sales/update/add-payment',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            id: paymentLineId,
                            paymentLineAmount,
                            paymentMethodId: paymentLineId,
                            cardType: paymentLineCardType,
                            cardNo: paymentLineCardNo,
                            cardPhone: paymentLineCardPhone,
                            chequeNo: paymentLineChequeNo,
                            chequeDate: paymentLineChequeDate,
                            bankName: paymentLineBankName,
                            neftDate: paymentLineNeftDate,
                            refNo: paymentLineRefNo,
                            saleId: sale.id,
                            razorpayTransactionId: paymentLineRazorpayTransactionId
                        },
                        success: function (data) {
                            $('#add-sale-payment').modal('hide');
                            if (data.success) {
                                toastr.success('Payment Successfully Added!');
                                refreshSaleBlock()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })
                /* END - Handle adding payment method */

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

            });

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

            $('#update-sale').click(function(){
                $.ajax({
                    url:'/app/sales/update/details',
                    method:'POST',
                    data:{
                        _csrf,
                        saleId: sale.id,
                        saleDate: moment($('#change-sale-date-text').val(), 'DD-MM-YYYY hh:mm a').format('YYYY-MM-DD HH:mm:ss'),
                        comment: $('#sale-comment').val()
                    },
                    success: function(data){
                        if(data.success){
                            toastr.success('Sales details Successfully Updated!');
                            refreshSaleBlock();
                        }else{
                            toastr.error('Oops Some error occurred!')
                        }
                    }
                })
            })

            function update_membership(tr){
                $.ajax({
                    url:'/app/sales/update/membership',
                    method:'POST',
                    data:{
                        _csrf,
                        saleId: sale.id,
                        packageId: tr.attr('package_id'),
                        soldBy: tr.find('.sold-by').val(),
                        slotId: tr.find('.slot-id').val(),
                        startDate: moment(tr.find('.start-date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD')
                    },
                    success: function(data){
                        if(data.success){
                            toastr.success('Sales details Successfully Updated!');
                            refreshSaleBlock();
                        }else{
                            toastr.error('Oops Some error occurred!')
                        }
                    }
                })
            }

            $('.sold-by, .slot-id').change(function(){
                var tr = $(this).closest('tr');
                update_membership(tr);
            })

            $('.set-price').change(function(){
                var tr = $(this).closest('tr');
                if($(this).val()){
                    $.ajax({
                        url:'/app/sales/update/price',
                        method:'POST',
                        data:{
                            _csrf,
                            saleId: sale.id,
                            packageId: tr.attr('package_id'),
                            price: $(this).val()
                        },
                        success: function(data){
                            if(data.success){
                                toastr.success('Price Successfully Updated!');
                                refreshSaleBlock();
                            }else{
                                toastr.error('Oops Some error occurred!')
                            }
                        }
                    })
                }
            })

            $('.edit-package').click(function(){
                $('#old-package-id').val($(this).closest('tr').attr('package_id'))
            })

            $('#update-package-btn').click(function(){
                $.ajax({
                    url: '/app/sales/update/package',
                    method: 'POST',
                    data:{
                        _csrf,
                        saleId: sale.id,
                        newPackageId: $('#select-package').val(),
                        oldPackageId: $('#old-package-id').val()
                    },
                    success: function(data){
                        if(data.success){
                            toastr.success('Package Successfully Updated!');
                            $('#change-package').toggle();
                            // refreshSaleBlock();
                            window.location.reload();
                        }else{
                            toastr.error('Oops! some error occurred!');
                        }
                    }
                })
            })

            $('.trainer-id').change(function(){
                if($(this).val()){
                    $.ajax({
                        url:'/app/sales/update/trainer',
                        method:'POST',
                        data:{
                            _csrf,
                            saleId: sale.id,
                            trainerId: $(this).val(),
                            packageId: $(this).closest('tr').attr('package_id')
                        },
                        success: function(data){
                            if(data.success){
                                toastr.success('Trainer Updated Successfully!');
                                refreshSaleBlock();
                            }else{
                                toastr.error('Some error occurred!')
                            }
                        }
                    })
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

            $('.membership-date').datetimepicker({
                format: 'DD-MM-YYYY',
            }).on('dp.change', function(){
                var tr = $(this).closest('tr');
                update_membership(tr);
            });

            $('#neft-date, #cheque-date').datetimepicker({
                format: 'DD-MM-YYYY',
            })
        }
    };
}());