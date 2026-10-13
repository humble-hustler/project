var CART = CART || (function () {
    return {
        init: function (Args) {
            const _csrf = Args._csrf;

            $(document).ready( function () {
                $('#shipping-state').on('change', function () {
                    $.ajax({
                        url: '/get-cities',
                        method: 'POST',
                        data: {
                            _csrf,
                            stateId: $(this).val()
                        },
                        success: function (data) {
                            if (data.success) {
                                if (data.success && data.cities.length > 0) {
                                    $('#shipping-city').empty().append('<option value="">Select City</option>');
                                    data.cities.forEach((c) => {
                                        $('#shipping-city').append(`<option value=${c.id}> ${c.name}</option>`);
                                    })
                                }
                            }
                        }
                    })
                })

                $('#checkout').on('click', function (e) {
                    e.preventDefault();
                    var locations_name= [];
                    var locations = document.getElementsByClassName('location_name');
                    for(var i = 0; i < locations.length; i++){
                       var data = locations[i].innerText;
                        locations_name.push(data)
                    }
                    if(locations_name.every( (val, i, arr) => val === arr[0] )){
                        if (typeof $('.select-shipping:checked').val() !== 'undefined') {
                             var demovalue = $("input:radio[name=paymet-method]:checked").val();
                            $.ajax({
                                url: '/order/request-payment',
                                method: 'POST',
                                data: {
                                    _csrf,
                                    demovalue:demovalue
                                },
                                success: function (data) {
                                    if (data.success) {
                                        const orderData = data;
                                        if(demovalue=="ONLINE")
                                        {var options = {
                                                "key": data.key,
                                                "name": "Exlshop",
                                                "description": "",
                                                "image": "/images/logo.png",
                                                "order_id": data.orderId,
                                                "handler": function (response) {
                                                    $.ajax({
                                                        url: '/order/confirm',
                                                        method: 'POST',
                                                        dataType: 'json',
                                                        data: {
                                                            _csrf,
                                                            paymentResponse: response,
                                                            shippingId: $('.select-shipping:checked').val()
                                                        },
                                                        success: function (data) {
                                                            if (data) {
                                                                location.href = `/my-account/orderconfirm/${(data.order_id.order_id)}`
                                                            } else {
                                                                alert('Some error occurred. Please contact support')
                                                            }
                                                        }
                                                    })
                                                }
                                            };
                                            var rzp = new Razorpay(options);
                                            rzp.open();
                                        }
                                        else
                                        {
                                            $.ajax({
                                                url: '/order/confirm1',
                                                method: 'POST',
                                                dataType: 'json',
                                                data: {
                                                    _csrf,
                                                    shippingId: $('.select-shipping:checked').val()
                                                },
                                                success: function (data) {
                                                    if (data) {
                                                        location.href = `/my-account/orderconfirm/${(data.order_id.order_id)}`
                                                    } else {
                                                        alert('Some error occurred. Please contact support')
                                                    }
                                                }
                                            })
                                        }
                                    } else {
                                        alert('Some error occurred. Please try again later')
                                    }
                                }
                            })
                        } else {
                            toastr.error('Please select shipping address')
                            $('#shipping-address-list-wrap').addClass('border-danger')
                        }
                    }
                    else{
                        toastr.error('Please select Products from same shop..')
                    }
                })

                $('.select-shipping').on('click', function () {
                    $('#shipping-address-list-wrap').removeClass('border-danger')
                })

                $('.button-plus').click(function(){
                    var productId = $(this).closest('tr').attr('product_id');
                    var variationId = $(this).closest('tr').attr('variation_id');
                    var existingQuantity =parseInt( $(this).closest('tr').find('.quantity').val());
                    $(this).closest('tr').find('.quantity').val(existingQuantity+1);
                    var singleDiscPrice = $(this).closest('tr').find('.single-price').attr('single-item-discount-price');
                    var discPrice = $(this).closest('tr').find('.single-price').attr('single-item-discount');
                    $(this).closest('tr').find('.price-wrap').find('.price').text('₹ '+(singleDiscPrice*(existingQuantity+1)));
                    var quantity = $(this).closest('tr').find('.quantity').val();
                    $(".saveforlater").attr('value1',quantity)
                    $(".saveforlater").attr('value2',quantity)
                    var location_budget =  parseInt($("#minimum-order-amount").val());
                    var order_total = $("#total-amount").find("#order-total").text()

                    if(location_budget >= order_total){
                        $("#proceed-to-buy a").attr("href", "#")
                    }
                    updateCartQuantity(productId, variationId, quantity);
                })

                $('.button-minus').click(function(){
                    var productId = $(this).closest('tr').attr('product_id');
                    var variationId = $(this).closest('tr').attr('variation_id');
                    var existingQuantity =parseInt( $(this).closest('tr').find('.quantity').val());
                    if(existingQuantity!=1){
                        $(this).closest('tr').find('.quantity').val(existingQuantity-1);
                        var singleDiscPrice = $(this).closest('tr').find('.single-price').attr('single-item-discount-price');
                        var discPrice = $(this).closest('tr').find('.single-price').attr('single-item-discount');
                        $(this).closest('tr').find('.price-wrap').find('.price').text('₹ '+(singleDiscPrice*(existingQuantity-1)));
                        var quantity = $(this).closest('tr').find('.quantity').val();
                        $(".saveforlater").attr('value1',quantity)
                        $(".saveforlater").attr('value2',quantity)

                        var location_budget =  parseInt($("#minimum-order-amount").val());
                        var order_total = $("#total-amount").find("#order-total").text()
    
                        if(location_budget >= order_total){
                            $("#proceed-to-buy a").attr("href", "#")
                            // toastr.error('Total order amount must be greater than' + " " +location_budget)
                        }
                        updateCartQuantity(productId, variationId, quantity);
                    }
                })

                function updateCartQuantity(productId, variationId, quantity){
                    $.ajax({
                        url: '/shop/update-cart-quantity',
                        method: 'POST',
                        data: {
                            _csrf,
                            productId: productId,
                            variationId: variationId,
                            quantity: quantity
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Cart Updated');
                                var totalAmount=0;
                                var discAmount=0; 
                                var deliveryCharge =0;
                                $('table tbody tr').each(function(){
                                    var singlePrice = $(this).find('.single-price').attr('single-item-price');
                                    var discPrice = $(this).find('.single-price').attr('single-item-discount');
                                    var deliveryCharge = $(this).find('.single-price').attr('delChr');
                                    var quantity = $(this).find('.quantity').val();
                                    deliveryCharge = parseInt(deliveryCharge);
                                    totalAmount+=singlePrice*quantity;
                                    discAmount+=discPrice*quantity;
                                    finalAmount = totalAmount-discAmount+deliveryCharge;
                                })
                                $('#total-amount #order-total').text( finalAmount);
                                $('#regular-price').text('₹ '+ totalAmount);
                                $('#discPrice').text('- ₹ '+ discAmount);
                                location.reload(true); 

                            }else{
                                toastr.error('Sorry there was an error in updating the quantity')
                            }
                        }
                    });
                }

                $('.remove-item').click(function(){
                    var productId = $(this).closest('tr').attr('product_id');
                    var variationId = $(this).closest('tr').attr('variation_id');
                    var tr = $(this).closest('tr');
                    $.ajax({
                       url: '/shop/remove-cart-item',
                        method: 'POST',
                        data: {
                            _csrf,
                            productId: productId,
                            variationId: variationId
                        },
                        success: function (data) {
                            if (data.success) {
                                window.location.reload();
                            }else{
                                toastr.error('Sorry there was an error in updating the quantity')
                            }
                        }
                    });
                })  
                    $('#zip1').on('change',function(){
                        var cityId=$("#shipping-city").val();
                        $element = $(this);
                        const regex = /^[1-9][0-9]{5}$/;
                        if (!regex.test($element.val())) {
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid zip code');
                            $('#savebtn').attr('disabled', true);
                            return
                        }
                        $.ajax({
                            url: '/my-account/zip-valid',
                             method: 'POST',
                             data: {
                                 _csrf:_csrf,
                                 zip : $element.val(),
                                 cityId :cityId
                             },
                             success: function (data) {
                                 if(data.success) {    
                                     $element.removeClass('is-invalid').addClass('is-valid')
                                     $('#savebtn').attr('disabled', false)   
                                 } else {
                                     $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please Enter Your City Pincode')
                                     $('#savebtn').attr('disabled', true)
                                 }
                             }
                         });
                    })
            })
        }
    };
}());