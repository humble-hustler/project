var SINGLE_PRODUCT = SINGLE_PRODUCT || (function () {
    return {
        init: function (Args) {
            const _csrf = Args._csrf;
            const variationData = JSON.parse(Args.variationData);
            const productData = JSON.parse(Args.productData);
            const ratings1 = JSON.parse(Args.ratings1)

            function getVariationId() {
                return $('.variation-select:checked').data('variation-id') ? $('.variation-select:checked').data('variation-id') : null;
            }

            function selectedVariationPrice(variationId) {
                if (variationId) {
                    return _.find(variationData, {id: variationId}).regular_price;
                } else {
                    return (productData.regular_price-productData.discount_price);
                }
            }

            function getQty() {
                var qty = parseInt($('#quantity').val());
                return qty ? qty : 1;
            }

            function setQty(qty) {
                return $('#quantity').val(qty ? qty : 1)
            }

            var myLat = document.getElementById("MyLatitude").value
            var myLong = document.getElementById("MyLongitude").value
            var shopLat = document.getElementById("shopLat").value
            var shopLong = document.getElementById("shopLong").value

            var radlat1 = Math.PI * myLat/180
            var radlat2 = Math.PI * shopLat/180
            var theta = myLong-shopLong
            var radtheta = Math.PI * theta/180
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist)
            dist = dist * 180/Math.PI
            dist = dist * 60 * 1.1515 * 1.609344 

            var maxDistance = document.getElementById("maximum-shop-distance").value

            $(document).ready(function () {
                $('#one-rate').css('width', `${parseInt(ratings1.one)}%`)
                $('#two-rate').css('width', `${parseInt(ratings1.two)}%`)
                $('#three-rate').css('width', `${parseInt(ratings1.three)}%`)
                $('#four-rate').css('width', `${parseInt(ratings1.four)}%`)
                $('#five-rate').css('width', `${parseInt(ratings1.five)}%`)

                if (productData.product_type == 2) {
                    $('.variation-select').on('change', function () {
                        const variationId = getVariationId()
                        $('.price').text(`Rs. ${selectedVariationPrice(variationId) * getQty()}`)
                    })
                }
               
               
                $('.zoom-area').on('mousemove', function(e) {
                    var magnifyOffset = $(this).offset();
                    var mouseX = e.pageX - magnifyOffset.left;
                    var mouseY = e.pageY - magnifyOffset.top;
                    $(this).find('.zoom-img').css({
                        'transform-origin': mouseX + 'px ' + mouseY + 'px'
                    });
                });
                $('#button-plus1').on('click', function () {
                    const variationId = getVariationId()
                    setQty(getQty() + 1)
                })
               
                $('#button-minus1').on('click', function () {
                    const variationId = getVariationId()
                    setQty(getQty() - 1)
                })

              var locationValue =   $(".isLocation").val()
              var session = $(".issesion").val()

              if(session == 1){

                // if(!dist <= maxDistance){

                if(locationValue == 0){
                    $('#add-to-cart').on('click', function (e) {
                        e.preventDefault()
                        $.ajax({
                           url: '/shop/add-to-cart',
                        //    url:'/api/v1/shop/add-to-cart',
                            method: 'POST',
                            data: {
                                _csrf,
                                productId: productData.id,
                                locationId: productData.location_id,
                                variationId: getVariationId(),
                                quantity: getQty()
                            },
                            success: function (data) {
                                if (data.success) {
                                    if(data.cartQty==0){
                                        toastr.error('Please Login to add items in cart')
                                    }else{
                                    toastr.success('Item added to cart')
                                    $('#cart-qty').text(data.cartQty)}
    
                                } else {
                                    toastr.error('Some error occurred. Pelase try again later')
                                }
                            }
                        })
                    })
                }else if(locationValue == productData.location_id){
                    $('#add-to-cart').on('click', function (e) {
                        e.preventDefault()
                        $.ajax({
                           url: '/shop/add-to-cart',
                        //    url:'/api/v1/shop/add-to-cart',
                            method: 'POST',
                            data: {
                                _csrf,
                                productId: productData.id,
                                locationId: productData.location_id,
                                variationId: getVariationId(),
                                quantity: getQty()
                            },
                            success: function (data) {
                                if (data.success) {
                                    if(data.cartQty==0){
                                        toastr.error('Please Login to add items in cart')
                                    }else{
                                    toastr.success('Item added to cart')
                                    $('#cart-qty').text(data.cartQty)}
    
                                } else {
                                    toastr.error('Some error occurred. Pelase try again later')
                                }
                            }
                        })
                    })
                }else{ 
                    $('#add-to-cart').on('click', function (e) {
                        e.preventDefault()
                        toastr.error('please select product from same location')
                })
                }
            // }else{
            //     toastr.error('No Delivery At Your Location from this shop')
            // }
            }else{
                $('#add-to-cart').on('click', function (e) {
                    e.preventDefault()
                          toastr.error('please login first')
                })
            }
            


                $('#buy-now').on('click', function(){
                   var productQuantity = $("#quantity").val()
                   var cartQuantity = parseInt($(".my-cart").text())
                   var is_session = $(".issesion").val()
                  
                    if(is_session == 1){
                        // if(!dist <= maxDistance){
                            window.location.href = `/buy/${productData.id}/${productQuantity}`
                        // }else{
                        //     toastr.error('No Delivery At Your Location from this shop')
                        // }
                    }else{
                        toastr.error('Please Login to buy product')
                    }
                })

                $('.item-thumb').on('click', function () {
                    $('#featured-image').attr('src',$(this).find('img').attr('src'));
                })


                 $('#remove-wishlist-btn').on('click',function(e){
                    e.preventDefault();
                    var product_id = document.getElementById('remove_product_id').value;
                    $.ajax({
                        url : '/my-account/remove-wishlist-product',
                        method : 'POST',
                        data : {
                            _csrf,
                            product_id
                        },
                        success: function (data) {
                            if (data.success) {
                                window.location.reload();
                                toastr.success("Product removed from wish list")
                               
                            } else {
                                toastr.error('Some error occurred. Please contact support')
                            }
                        }
                    })
                   
                })


                $('#added').on('click',function(){
                  
                    $.ajax({
                        url : '/my-account/remove-wishlist-product',
                        method : 'POST',
                        data : {
                            _csrf,
                            productId: productData.id,
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('remove from wishlist')
                                 window.location.reload();
                            } else {
                                toastr.error('Please Try again later..')
                            }
                        }
                    })
                   
                })

                //When item is not in wishlist
                $('#add-to-wishlist').on('click',function(e){
                    e.preventDefault();
                    $.ajax({
                        url: '/shop/add-to-wishlist',
                         method: 'POST',
                         data: {
                             _csrf,
                             productId: productData.id,
                             productName : productData.name,
                             locationId : productData.location_id,
                            //  regular_price: productData.regular_price,
                            //  discount_price: productData.discount_price
                         },
                         success: function (data) {
                           
                             if (data.success) {
                                toastr.success('Item added to Wishlist');
                                window.location.reload();
                                // $("#add-to-wishlist").addClass('fa fa-heart');
                               $("#cd").hide();
                              
                             } else {
                              
                                 toastr.error('Please Login First')
                             }
                         }
                     })
                })

                $('#check-pincode').on('click',function(e){
                    $('#check-pincode').css({"left":"68%"});
                    e.preventDefault();
                    $element = $('#pincode').val();
                    const regex = /^[1-9][0-9]{5}$/;
                    if (!regex.test($element)) {
                     
                        $('#pincode').removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid zip code');
                        return
                    }

                  
                   var delivery_postcode = parseInt($(this).parent().find("#pincode").val())
                    const url = 'https://apiv2.shiprocket.in/v1/external/auth/login'
                    const loginOpts = {
                        "email": 'info@tapsoft.in',
                        "password": 'Harvey!@3',
                    };
                    const customHeaders = {
                        "Content-Type": "application/json",
                    } 
                    fetch(url, {
                        method: "POST",
                        headers: customHeaders,
                        body: JSON.stringify(loginOpts)
                        })
                        .then((response) => response.json())

                        .then((dataOne)=>{
                            
                            
                            const token = {
                                "Content-Type": "application/json",
                                    "Authorization": "Bearer" + " " + dataOne.token
                                }

                                const a = {
                                    
                                        "pickup_postcode": 411038,
                                        "delivery_postcode": 410505,
                                        "weight" : 1,
                                        "cod" : 1
                                    
                                }
                               
                                const url1 = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=411038&delivery_postcode=${delivery_postcode}&weight=2&cod=0`
                               
                                fetch(url1, {
                                    method: "GET",
                                    headers: token,
                                   
                                })
                                .then((response) => response.json())
                                .then((service)=>{
                                   
                                    if(service.status == 404){
                                        $('#pincode').removeClass('is-valid').addClass('is-invalid').next('.message').text('Not Available on this Pincode')
                                        $('.message').text('Not Available on this Pincode')
                                        $('.message').css("color", "red")
                                    }else{
                                        $('#pincode').removeClass('is-invalid').addClass('is-valid')
                                        $('.message').text('Available at this Pincode')
                                        $('.message').css("color", "#198754")
                                    }
                                })
                        })


                    // $.ajax({
                    //     url: '/shop/valid-zip',
                    //      method: 'POST',
                    //      data: {
                    //          _csrf:_csrf,
                    //         zip : $element,
                    //         productId: productData.id,

                    //      },
                    //      success: function (data) {
                    //          if(data.success) {
                               
                                 
                    //          } else {
                               
                    //          }
                    //      }
                    //  });

                })

            })
        }
    };
}());

