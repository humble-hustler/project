var MEMBERSHIP_UPGRADE = MEMBERSHIP_UPGRADE || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const packages = JSON.parse(_args.packages);
            const taxes = JSON.parse(_args.taxes);
            const membership = JSON.parse(_args.membership);
            var paymentLines = [];
            var tax_included = 0;
            var total_price = 0; 
            var plan_type = '';
            $(document).ready(function () {
            	$('#packages').change(function(){
            		var package_id = $(this).val();
            		packages.forEach(function(p){
            			if(p.id == package_id){
            				$('#validity').val(p.validity_days)
            				if(!p.tax_included){
            					tax_included = 0;
            					$('#tax').val(taxes.rate);
            					$('#tax_price').val(p.price * taxes.rate/100);
            					total_price = p.price + (p.price * taxes.rate/100);
                                $('#fees').val(p.price)
            				}else{
            					tax_included = 1;
                                $('#tax').val(taxes.rate);
                                $('#tax_price').val((p.price - p.price/(1+(taxes.rate/100))).toFixed(2));
            					total_price = p.price;
                                // alert((p.price/(1+(taxes.rate/100))).toFixed())
                                $('#fees').val((p.price/(1+(taxes.rate/100))).toFixed())
            				}
                            $('#package_start_date').val(moment(membership.start_date,'DD-MM-YYYY').format('DD-MM-YYYY'))
                            $('#package_end_date').val(moment(membership.start_date,'DD-MM-YYYY').add(p.validity_days, 'days').format('DD-MM-YYYY'))
                            if(p.is_pt){
                                validate_pt();
                            }
                            update_price();
            			}
            		})
            	})

            	$('#discount_percent').change(function(){
            		if(parseFloat($(this).val()) != NaN){
            			var fees = parseFloat($('#fees').val());
            			var discount = (parseFloat($(this).val()));
            			total_price = parseFloat($('#fees').val());

            			$('#price_after_discount').val(fees - (fees * discount/100));
            			$('#total_discount').val(fees * discount/100);
            			total_price = fees - (fees * discount/100);

            			if(!tax_included){
            				total_price = total_price + (total_price * taxes.rate/100);
            			}
            			
            			update_price();
            		}
            	})

            	function update_price(){
            		$('#total_price').val(parseFloat(total_price));
                    $('#upgrade_plan_price').val(total_price - parseFloat($('#old_plan_price').val()) - $('#discount').val());
                    
            		$('#price_difference').val(Math.abs(total_price - parseFloat($('#old_plan_price').val()) ));
                    var difference = (total_price - parseFloat($('#paid_amount').val())) - parseFloat(parseFloat($('#discount').val())) ;
                    if(difference > 0){
                        $('#due_amount').val((difference));    
                    }else{
                        $('#due_amount').val(0);
                    }
                    $('#final-amount').val(difference)
                    $('#final-amount').val(difference - parseFloat($('#discount').val()));
            	}

            	$('#round_off').change(function(){
            		if($(this).is(':checked')){
            			$('#round_off_amount').removeClass('display-hidden');
            			$('#round_off_amount').val(parseFloat($('#due_amount').val()).toFixed(2))
            		}else{
            			$('#round_off_amount').addClass('display-hidden');
            		}
            	})

            	$('#submit-upgrade').click(function(){
                    if(!$('#time-slots').val() || $('#time-slots').val()=='0'){
                        toastr.error('Please select a time slot');
                        return;
                    }

                    if(!$('#sold-by').val() || $('#sold-by').val()=='0'){
                        toastr.error('Please select the Sold By Field');
                        return;
                    }

                    if($('#package_start_date').val() && $('#upgrade_plan_price').val() && $('#packages').val()){
                        var package = [];
                        var tax_array = [];
                        
                        tax_array.push({
                            id: taxes.id,
                            label: taxes.label,
                            rate: taxes.rate,
                            amount: parseFloat($('#tax_price').val())
                        });
                        var discount = !isNaN($('#discount').val()) ? parseFloat($('#discount').val()) : 0;
                        var paid_amount = !isNaN($('#paid_amount').val()) ? parseFloat($('#paid_amount').val()) : 0;
                        var sub_total = parseFloat($('#upgrade_plan_price').val())/(1+(tax_array[0].rate/100));
                        var soldBy = $('#sold-by').val();

                        packages.forEach(function(p){
                            if(p.id == $('#packages').val()){
                                package.push({
                                    id: p.id,
                                    brand_locations_id: membership.brand_locations_id,
                                    name: p.name,
                                    validity_days: p.validity_days,
                                    price: p.price,
                                    tax_included: p.tax_included,
                                    created_date: p.created_date,
                                    is_pt: p.is_pt,
                                    is_active: p.is_active,
                                    discount: (parseFloat($('#discount_percent').val())?(parseFloat($('#discount_percent').val())):(0)),
                                    total: parseFloat($('#total_price').val()),
                                    subTotal: sub_total,
                                    cost_price: p.price,
                                    start: moment($('#package_start_date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                    expiry: moment($('#package_end_date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                    tax: tax_array,
                                    lineId: 1,
                                    trainer_id: $('#trainer').val(),
                                    slotId: $('#time-slots').val()
                                })
                            }
                        })
                        var url = '/app/members/upgrade';
                        $.ajax({
                            url: url,
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                membershipLogId: membership.id,
                                memberId: membership.member_id,
                                package,
                                paymentLines,
                                dueAmount: $('#due_amount').val(),
                                totalAmount: $('#upgrade_plan_price').val()
                            },
                            success: function (data) {
                                if(data.success){
                                    toastr.success('Membership Updated successfully!')
                                    window.location.href='/app/members/'+membership.member_id;
                                }else{
                                    toastr.error('some error occurred!')
                                }
                            }
                        });
                    }else{
                        toastr.error('Please make sure you have selected the Package Period , Package and then click on the Submit Button')
                    }
            	})

                $('#package_start_date').datetimepicker({
                    format:'DD-MM-Y'
                });

                $('#package_start_date').on('dp.change',function(){
                    $('#package_end_date').val(moment($(this).val(),'DD-MM-YYYY').add($('#validity').val(), 'days').format('DD-MM-YYYY'))
                })

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

                $('#add-payment').click(function(){
                    var paymentLineId, paymentLineAmount, paymentLineMethod;
                    var paymentLineId = $('#payment-method').val();
                    var dueAmount = $('#due_amount').val();
                    if(paymentLineId == 1){
                        //cash
                        paymentLineAmount = parseFloat($('#total-cash-amount').val());
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
                        paymentLineAmount = parseFloat($('#card-amount').val());
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
                        paymentLineAmount = parseFloat($('#razorpay-amount').val());
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
                        paymentLineAmount = parseFloat($('#cheque-amount').val());
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
                        paymentLineAmount = parseFloat($('#neft-amount').val());
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
                        alert('csdc')
                        return toastr.error('Invalid Payment Amount')
                    }
                    totalAmount = 0;
                    paymentLines.forEach(function(line){totalAmount+=parseFloat(line.amount) || 0;});
                    // alert(totalAmount+paymentLineAmount);
                    if((totalAmount+paymentLineAmount) > dueAmount){
                        return toastr.error('Please enter Amount lesser than or Equal to Due amount!');
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
                    var paymentLineRazorpayId = $('#razorpay-transaction-id').val();
                    paymentLineMethod = $("#payment-method option:selected").text();
                    // var p_id = paymentLines.length+1;
                    paymentLines.push({
                        id: paymentLineId,
                        amount: paymentLineAmount,
                        method: paymentLineMethod ,
                        cardType: paymentLineCardType,
                        cardNo: paymentLineCardNo,
                        cardPhone: paymentLineCardPhone,
                        chequeNo: paymentLineChequeNo,
                        chequeDate: paymentLineChequeDate,
                        bankName: paymentLineBankName,
                        neftDate: paymentLineNeftDate,
                        refNo: paymentLineRefNo,
                        razorpayTransactionId: paymentLineRazorpayId
                    });
                    var payment_line = $('#payment-line').clone().removeClass('display-hidden').removeAttr('id');
                    payment_line.find('.payment_method').text(paymentLineMethod);
                    payment_line.find('.payment_amount').text(paymentLineAmount);
                    payment_line.attr('p_id', paymentLineId);
                    $('#add-payment-modal').modal('hide');
                    $('#payment-line-div').append(payment_line);
                })

                $('#discount').change(function(){
                    if(parseFloat($('#price_difference').val()) >= parseFloat($(this).val())){
                        update_price();
                    }else{
                        toastr.error('The Discount amount exceeds Package Price');
                        $(this).val(0);
                    }
                })

                function validate_pt(){
                    $.ajax({
                        url: '/app/members/validate-pt-upgrade',
                        method:'POST',
                        data:{
                            _csrf,
                            memberId: membership.member_id,
                            startDate: moment($('#package_start_date').val(),'DD-MM-YYYY').format('YYYY-MM-DD'),
                            endDate: moment($('#package_end_date').val(),'DD-MM-YYYY').format('YYYY-MM-DD'),
                        },  
                        success:function(data){
                            if(data.success){
                                if(!data.isValid){
                                    $('#pt-validation-error').removeClass('display-hidden');
                                    $('#submit-upgrade').attr('disabled', true);
                                }else{
                                    $('#pt-validation-error').addClass('display-hidden');
                                    $('#submit-upgrade').removeAttr('disabled', true);
                                }
                            }
                        }
                    })
                }

                $('#trainer').change(function(){
                    var trainer_id = $(this).val();

                    $.ajax({
                        url: '/app/members/get-trainer-time-slots',
                        method: 'POST',
                        data:{
                            _csrf,
                            trainer_id
                        },
                        success: function(data){
                            if(data.success){
                                $('#time-slots').empty();
                                data.timeSlots.forEach(function(ts){
                                    $('#time-slots').append(`<option value="${ts.id}">${ts.start_time} - ${ts.end_time}</option>`);
                                })
                            }
                        }
                    })
                })

                $(document).on('click', '.delete-payment-line', function(){
                    var pId = $(this).closest('.payment-line').attr('p_id');
                    paymentLines = paymentLines.filter(line => !(line.id == pId));
                    $(this).closest('.payment-line').remove();
                })

                $('#add-payment-btn-upgrade').click(function(){
                    validate_payment_methods();
                })

                function validate_payment_methods(){
                    var paymentIds = [];
                    paymentLines.forEach(function(line){paymentIds.push(line.id)});
                    $("[name=payment-method] option").each(function(){
                        $(this).removeAttr('disabled');
                    }); 
                    paymentIds.forEach(function(id){
                        $("[name=payment-method] option[value='"+ id + "']").attr('disabled', true); 
                    })
                }
            });
        }
    };
}());