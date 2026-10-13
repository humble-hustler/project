var MY_WISHLIST = MY_WISHLIST || (function () {
    return {
        init: function (Args) {
            const _csrf = Args._csrf;
    
            $(document).ready(function () {
                $('#remove-wishlist-btn').on('click',function(e){
                    e.preventDefault();
                    var product_id = document.getElementById('remove_product_id').value;
                    $.ajax({
                        url : '/my-account/remove-wishlist-product',
                        method : 'POST',
                        data : {
                            _csrf,
                            product_id: product_id,
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success("Product removed successfully")
                                window.location.reload();
                            } else {
                                toastr.error('Some error occurred. Please contact support')
                            }
                        }
                    })
                   
                })

                $('#added').on('click',function(){
                    toastr.success('already in wishlist')
                })
                $('#add-to-wishlist-shop').on('click',function(e){
                    e.preventDefault();
                    var brand_location_id = document.getElementById('brand_location_id').value;
                    var brand_name = document.getElementById('brand_name').value;
                    var brand_id = document.getElementById('brand_id').value;

                    $.ajax({
                        url : '/my-account/add-shop-wishlist',
                        method : 'POST',
                        data : {
                            _csrf,
                            brand_location_id,
                            brand_name,
                            brand_id
                        },
                        success: function (data) {
                            if (data.success) {
                                window.location.reload();
                                document.getElementById("add-to-wishlist-shop").innerHTML = "Added";
                                toastr.success('Added to your wishlist');
                            } else {
                                toastr.error('Please Login First..')
                            }
                        }
                    })
                })  
                
                $('#add-to-cart').on('click', function (e) {
                            e.preventDefault()
                            var pId = $('#productId').val()
                               
                                $.ajax({
                                   url: '/shop/add-to-cart',
                                    method: 'POST',
                                    data: {
                                        _csrf,
                                        productId: pId,
                                        quantity: 1
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
                $('#remove-shop-wishlist-btn').on('click',function(e){
                    e.preventDefault();
                    var brand_location_id = document.getElementById('brand_location_id').value;
                    var brand_id = document.getElementById('brand_id').value;
                    $.ajax({
                        url : '/my-account/remove-shop-wishlist',
                        method : 'POST',
                        data : {
                            _csrf,
                            brand_location_id,
                            brand_id
                        },
                        success: function (data) {
                            if (data.success) {
                                window.location.reload();
                                toastr.success('Remove From shop Wishlist');
                            } else {
                                toastr.error('Please Try again later..')
                            }
                        }
                    })
                })

                $('#search-product').keyup(function(e){
                    var searchValue = $(this).val();
                    var brand_location_id = $('#brand_location_id').val();
                   
                    if(searchValue.length > 3){
                        $.ajax({
                            url: '/get-search-product',
                             method: 'POST',
                             data: {
                                _csrf,
                                searchValue,
                                 brand_location_id
                             },
                             success: function (data) {
                                 if (data.success === false) {
                                 } else {
                                     $('#product-list').empty().append(data);
                                 } 
                             }
                         });
                    }
                })
            })
        }
    };
}());