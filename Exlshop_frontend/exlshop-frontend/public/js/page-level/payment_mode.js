var PAYMENTMODE = PAYMENTMODE || (function () {
    return {
        init: function (Args) {
        const _csrf = Args._csrf;


        const successfulLookup=(position)=>{
            const {latitude,longitude}=position.coords;
            fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=f7d5c66950914df8917e56a202fdf719`)
            .then(response=>response.json())
            //.then(data=>console.log("data is",data.results[0].formatted));
        }
        navigator.geolocation.getCurrentPosition(successfulLookup, console.log)

      


        $(document).ready( function () {

        $("#checkout").click(function(e){ 
            e.preventDefault();
          
                    var locations_name= [];
                    var locations = document.getElementsByClassName('location_name');
                    for(var i = 0; i < locations.length; i++){
                       var data = locations[i].innerText;
                        locations_name.push(data)
                    }
                    if(locations_name.every( (val, i, arr) => val === arr[0] ) )
                    {
                        if (typeof $('.select-shipping123:checked').val() === 'undefined') {
                            
                            toastr.error('Please select shipping address')
                            $('#shipping-address-list-wrap').addClass('border-danger')
                        
                        } else {
                            if( typeof $("input:radio[name=paymet-method]:checked").val()== 'undefined'){
                                toastr.error('Please select Payment option')
                            $('#paymentMethod').addClass('border-danger')
                            }else
                           { var demovalue = $("input:radio[name=paymet-method]:checked").val();
                          
                            $.ajax({
                                url: '/order/request-payment',
                                // url:'/api/v1/order/request-payment',
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
                                                            shippingId: $('.select-shipping123:checked').val()
                                                        },
                                                        success: function (data) {
                                                            if (data) {
                                                                location.href = `/`
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
                                                    shippingId: $('.select-shipping123:checked').val(),
                                                    order_id: data.orderDataId
                                                },
                                                success: function (data) {
                                                    if (data) {
                                                        location.href = `/my-account`
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
                        
                        }
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
                    var singlePrice = $(this).closest('tr').find('.single-price').attr('single-item-price');
                    $(this).closest('tr').find('.price-wrap').find('.price').text('Rs. '+(singlePrice*(existingQuantity+1)));
                    var quantity = $(this).closest('tr').find('.quantity').val();
                    updateCartQuantity(productId, variationId, quantity);
                })

                $('.button-minus').click(function(){
                    var productId = $(this).closest('tr').attr('product_id');
                    var variationId = $(this).closest('tr').attr('variation_id');
                    var existingQuantity =parseInt( $(this).closest('tr').find('.quantity').val());
                    if(existingQuantity!=1){
                        $(this).closest('tr').find('.quantity').val(existingQuantity-1);
                        var singlePrice = $(this).closest('tr').find('.single-price').attr('single-item-price');
                        $(this).closest('tr').find('.price-wrap').find('.price').text('Rs. '+(singlePrice*(existingQuantity-1)));
                        var quantity = $(this).closest('tr').find('.quantity').val();
                        updateCartQuantity(productId, variationId, quantity);
                    }
        })
      
    })

        }
    }
}());