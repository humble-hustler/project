var MEMBERSHIP_DOWNGRADE = MEMBERSHIP_DOWNGRADE || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const packages = JSON.parse(_args.packages);
            const taxes = JSON.parse(_args.taxes);
            const membership = JSON.parse(_args.membership);
            var tax_included = 0;
            var total_price = 0; 
            var plan_type = '';
            
            $(document).ready(function () {
            	$('#packages').change(function(){
                    $('.editable').each(function(){
                        $(this).val('');
                    })
            		var package_id = $(this).val();
            		packages.forEach(function(p){
            			if(p.id == package_id){
            				$('#fees').val(p.price)
            				if(!p.tax_included){
            					tax_included = 0;
            					$('#tax').val(taxes.rate);
            					$('#tax_price').val(p.price * taxes.rate/100);
            					total_price = p.price + (p.price * taxes.rate/100);
                                $('#fees').val(p.price)
            					
            				}else{
            					tax_included = 1;
            					total_price = p.price;
                                $('#tax').val(taxes.rate);
                                $('#tax_price').val(((p.price/(1+(taxes.rate/100))) * taxes.rate/100).toFixed(2));
                                $('#fees').val((p.price/(1+(taxes.rate/100))).toFixed())
            				}
                            $('#package_start_date').val(moment(membership.start_date,'DD-MM-YYYY').format('DD-MM-YYYY'))
                            $('#package_end_date').val(moment(membership.start_date,'DD-MM-YYYY').add(p.validity_days, 'days').format('DD-MM-YYYY'))
            			    $('#package_end_date').attr('original_package_date', moment(membership.start_date,'DD-MM-YYYY').add(p.validity_days, 'days').format('DD-MM-YYYY'))
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
            		$('#total_price').val(total_price);
                    $('#upgrade_plan_price').val(total_price - parseFloat($('#discount').val()));
        			
            		$('#price_difference').val(Math.abs(total_price - parseFloat($('#old_plan_price').val())));
                    var difference = parseFloat(parseFloat($('#upgrade_plan_price').val()) - parseFloat($('#paid_amount').val()));
                    // alert(difference)
                    if(difference >= 0){
                        $('#due_amount').val((difference));    
                        $('#downgrade_add_on').addClass('display-hidden');
                    }else{
                        $('#due_amount').val(0);
                        $('#downgrade_add_on').removeClass('display-hidden');
                    }
                    $('#extend-downgrade').addClass('display-hidden');
                    $('#add-plan').addClass('display-hidden');
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
                    var difference = parseFloat(parseFloat($('#total_price').val()) - parseFloat($('#paid_amount').val()));
                    if(!$('#time-slots').val() || $('#time-slots').val()=='0'){
                        toastr.error('Please select a time slot');
                        return;
                    }

                    if(!$('#sold-by').val() || $('#sold-by').val()=='0'){
                        toastr.error('Please select the Sold By Field');
                        return;
                    }

                    if(difference < 0 && !$('#extended-period').val() && !$('#downgrade_additional_package').val()){
                        toastr.error('Please select the required Fields!');
                    }else{
                        if($('#package_start_date').val() && $('#upgrade_plan_price').val() && $('#packages').val()){
                            var package = [];
                            var tax_array = [];
                            var paymentLines = [];
                            
                            packages.forEach(function(p){
                                if(p.id == $('#packages').val()){
                                    package.push({
                                        id: p.id,
                                        brand_locations_id: membership.brand_locations_id,
                                        name: p.name,
                                        validity_days: p.validity_days,
                                        price: 0,
                                        tax_included: p.tax_included,
                                        created_date: p.created_date,
                                        is_pt: 0,
                                        is_active: p.is_active,
                                        discount: (parseFloat($('#discount_percent').val())?(parseFloat($('#discount_percent').val())):(0)),
                                        total: 0,
                                        subTotal: 0,
                                        cost_price: 0,
                                        start: moment($('#package_start_date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                        expiry: moment($('#package_end_date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                        tax: [],
                                        lineId: 1, 
                                        trainer_id: $('#trainer').val() ? $('#trainer_id').val() : null,
                                        slotId: $('#time-slots').val() ? $('#time-slots').val() : null
                                    })
                                }
                                downgrade_additional_trainer = $('#downgrade_additional_trainer').val();
                                if(p.id == $('#downgrade_additional_package').val()){
                                    package.push({
                                        id: p.id,
                                        brand_locations_id: membership.brand_locations_id,
                                        name: p.name,
                                        validity_days: p.validity_days,
                                        price: 0,
                                        tax_included: p.tax_included,
                                        created_date: p.created_date,
                                        is_pt: 0,
                                        is_active: p.is_active,
                                        discount: 0,
                                        total: 0,
                                        subTotal: 0,
                                        cost_price: 0,
                                        start: moment($('#downgrade_additional_start_date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                        expiry: moment($('#downgrade_additional_end_date').val(), 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                        tax: [],
                                        lineId: 1,
                                        trainer_id: 1,
                                        slotId: $('#downgrade_additional_time_slots').val() ? $('#downgrade_additional_time_slots').val() :null
                                    })
                                }
                            })
                            
                            var url = '/app/members/downgrade';
                            $.ajax({
                                url: url,
                                method: 'POST',
                                data: {
                                    _csrf: _csrf,
                                    membershipLogId: membership.id,
                                    memberId: membership.member_id,
                                    package
                                },
                                success: function (data) {
                                    if(data.success){
                                        toastr.success('Membership Downgraded successfully!')
                                        window.location.href='/app/members/'+membership.member_id;
                                    }else{
                                        toastr.error('some error occurred!')
                                    }
                                }
                            });
                        }else{
                            toastr.error('Please make sure you have selected the Package Period , Package and then click on the Submit Button')
                        }
                    }
                    
            	})

                // $('[name=plan_type]').change(function(){
                //     if($(this).val() == 'membership-upgrade'){
                //         $('#package_start_date').attr('disabled', true);
                //     }else{
                //         $('#package_start_date').removeAttr('disabled');
                //     }
                //     $('#packages').val('');
                //     $('.editable').each(function(){
                //         $(this).val('');
                //     })
                // })

                $('[name=plan_downgrade]').change(function(){
                    var val = $('input[name=plan_downgrade]:checked').val();
                    $('#downgrade_additional_package').val('');
                    $('#downgrade_additional_validity').val('');
                    $('#downgrade_additional_start_date').val('');
                    $('#downgrade_additional_end_date').val('');
                    $('#extended-period').val(0);
                    $('#package_end_date').val($('#package_end_date').attr('original_package_date'))
                    if(val == 'add-new'){
                        $('#add-plan').removeClass('display-hidden');
                        $('#extend-downgrade').addClass('display-hidden');
                    }else{
                        $('#extend-downgrade').removeClass('display-hidden');
                        $('#add-plan').addClass('display-hidden');
                    }
                })

                $('#extended-period').change(function(){
                    val = $(this).val();
                    var package_end_date = moment($('#package_end_date').attr('original_package_date'), 'DD-MM-YYYY').add(val,'days').format('DD-MM-YYYY');
                    $('#package_end_date').val(package_end_date);
                })

                $('#downgrade_additional_package').change(function(){
                    var package_id = $(this).val();
                    packages.forEach(function(p){
                        if(p.id == package_id){
                            $('#downgrade_additional_validity').val(p.validity_days)
                            $('#downgrade_additional_start_date').val(moment($('#package_end_date').val(),'DD-MM-YYYY').format('DD-MM-YYYY'))
                            $('#downgrade_additional_end_date').val(moment($('#package_end_date').val(),'DD-MM-YYYY').add(p.validity_days, 'days').format('DD-MM-YYYY'))
                            if(p.is_pt){
                                $('#downgrade_additional_trainer').removeAttr('disabled');
                            }else{
                                $('#downgrade_additional_trainer').attr('disabled', true);
                            }
                        }
                    })
                })

                $('#discount').change(function(){
                    var discount = parseFloat($(this).val());
                    var upgraded_plan_price = parseFloat($('#total_price').val());
                    if(discount <= upgraded_plan_price){
                        update_price();    
                    }else{
                        $(this).val(0);
                        update_price();
                        toastr.error('Discount amount cant exceed the New Plan Price!')
                    }
                })

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

                $('#downgrade_additional_trainer').change(function(){
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
                                $('#downgrade_additional_time_slots').empty();
                                data.timeSlots.forEach(function(ts){
                                    $('#downgrade_additional_time_slots').append(`<option value="${ts.id}">${ts.start_time} - ${ts.end_time}</option>`);
                                })
                            }
                        }
                    })
                })
            });
        }
    };
}());