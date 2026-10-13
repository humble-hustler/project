var BUY_NOW = BUY_NOW || (function () {
    return {
        init: function (Args) {
            const _csrf = Args._csrf;

const successfulLookup=(position)=>{
    const {latitude,longitude}=position.coords;
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=f7d5c66950914df8917e56a202fdf719`)
    .then(response=>response.json())
}
navigator.geolocation.getCurrentPosition(successfulLookup, console.log)

            $(document).ready(function () {
                 $('#shipping-state').on('change', function () {
                    $.ajax({
                        url: '/get-cities',
                        method: 'POST',
                        data: {
                            _csrf,
                            stateId: $('#shipping-state').val()
                        },
                        success: function (data) {    
                            if (data.success) {
                                if(data.success && data.cities.length > 0 ){
                                    $('#shipping-city').empty().append('<option value="">Select City</option>');
                                    data.cities.forEach((c) => {
                                    $('#shipping-city').append(`<option value="${c.id}">${c.name}</option>`);
                                    })
                                }
                            }
                        }
                    })
                })

                $('.button-plus').click(function(){
                    var D_Charge = parseInt( $('#deliveryCharge').text())
                    var productId = $(this).closest('tr').attr('product_id');
                    var variationId = $(this).closest('tr').attr('variation_id');
                    var existingQuantity =parseInt( $(this).closest('tr').find('.quantity').val());
                    $(this).closest('tr').find('.quantity').val(existingQuantity+1);
                    var singlePrice = $(this).closest('tr').find('.single-price').attr('single-item-price');
                    var discPrice = $(this).closest('tr').find('.single-price').attr('single-item-discount');
                    $('#calc_amount').text((singlePrice*(existingQuantity+1)));
                    $('#disc_price').text(discPrice*(existingQuantity+1))
                    var x = parseInt( $('#calc_amount').text());
                    var y =  parseInt( $('#disc_price').text());
                    $("#total_amount").text((x-y)+D_Charge)
                    var quantity = $(this).closest('tr').find('.quantity').val();
                    updateCartQuantity(productId, variationId, quantity);
                })	

                $('.button-minus').click(function(){
                    var D_Charge = parseInt( $('#deliveryCharge').text())
                    var productId = $(this).closest('tr').attr('product_id');
                    var variationId = $(this).closest('tr').attr('variation_id');
                    var existingQuantity =parseInt( $(this).closest('tr').find('.quantity').val());
                    if(existingQuantity!=1){
                        $(this).closest('tr').find('.quantity').val(existingQuantity-1);
                        var singlePrice = $(this).closest('tr').find('.single-price').attr('single-item-price');
                        var discPrice = $(this).closest('tr').find('.single-price').attr('single-item-discount');
                        $('#calc_amount').text((singlePrice*(existingQuantity-1)));
                        $('#disc_price').text((discPrice*(existingQuantity-1)))
                        var x = parseInt( $('#calc_amount').text());
                        var y =  parseInt( $('#disc_price').text());
                        $("#total_amount").text((x-y)+D_Charge)
                        var quantity = $(this).closest('tr').find('.quantity').val();
                        updateCartQuantity(productId, variationId, quantity);
                    }
                })

                    function updateBuyQuantity(productId, quantity, totalAmount ) {
                        $.ajax({
                            url: '/shop/buy-now',
                            method: 'POST',
                            data: {
                                _csrf,
                                productId: productId,
                                quantity: quantity,
                                totalAmount: totalAmount,
                            },
                            success: function (data) {
                                if (data.success) {
                                    toastr.success('Updated Successfully');
                                    var totalAmount = 0;
                                    var discAmount = 0;
                                    var deliveryCharge = 0;
                                    $('table tbody tr').each(function () {
                                        var singlePrice = $(this).find('#single-amount').val();
                                        var discPrice = $(this).find('#discount_hide').val('');
                                        var quantity = $(this).find('.quantity').val();
                                        deliveryCharge = parseInt(deliveryCharge);
                                        totalAmount += singlePrice * quantity;
                                        discAmount += discPrice * quantity;
                                        finalAmount = totalAmount - discAmount + deliveryCharge;
                                    })
                                    $('#total-amount strong').text('₹ ' + finalAmount);
                                    $('#regular-price').text('₹ ' + totalAmount);
                                    $('#discPrice').text('- ₹ ' + discAmount);
                                } else {
                                    toastr.error('Sorry there was an error in updating the quantity')
                                }
                            }
                        });
                    }
            })
        }
    };
}());