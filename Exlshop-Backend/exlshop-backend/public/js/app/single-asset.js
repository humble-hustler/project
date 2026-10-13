var SINGLE_ASSET = SINGLE_ASSET || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const product = _args.product;

            $(document).ready(function () {
                // $('#featured-image-input1').on('change', () => {
                //     var form = $('#product-images')[0];
                //     var formData = new FormData(form);
                //     formData.append('_csrf', _csrf);
                //     formData.append('productId', product.id);
                //     alert(_csrf)
                //     $.ajax({
                //         url: '/app/asset-management/add/product-images',
                //         //    url: `/super-admin/shop/add/product-images`,
                //         type: 'POST',
                //         data: formData,
                //         processData: false, // tell jQuery not to process the data
                //         contentType: false, // tell jQuery not to set contentType
                //         success: function (data) {
                //             var images = data.result;
                //             images.forEach((i) => {
                //                 $('.library-images-wrapper').append(`<div class="single-image"> <img src="${i.fileName}" class="library-image" /><br> </div>`)
                //             })
                //         }
                //     });
                // })
                $('#deleteproduct-btn').click(function(){
                    var product_id = $('#product-id').val();
                    alert(product_id)
                    $.ajax({
                        url: '/api/v1/appProduct/deleteProduct',
                        data:{
                            product_id:product_id
                        },
                        method: 'POST',
                        success: function (data) {
                            window.location.href='/app/asset-management/'
                        }
                    });
                })
                $('#update-product-btn').on('click', function () {
                    pname = $('#product-id').val()
                    var valid = false;
                    $('.required').each(function () {
                        if (!$(this).val()) {
                            $(this).addClass('is-invalid')
                            valid = false;
                        } else {
                            valid = true;
                        }
                    })

                    if (!valid) {
                        toastr.error('Please complete mandatory fields')
                        return false;
                    } else {
                        $('.required').each(function () {
                            $(this).removeClass('is-invalid')
                        })
                        const productOpts = {
                            _csrf:  _csrf,
                            id: $('#product-id').val(),
                            // productId: product.id,
                            name: $('#product-name').val(),
                            description: $('#product-description').val()
                        }
                            productOpts.regularPrice = $('#product-regular-price').val()
                            productOpts.discountPrice = $('#product-discount-price').val()
                            productOpts.sku = $('#product-sku').val()
                            
                           
                        $.ajax({
                            url: '/app/asset-management/update',
                            method: 'POST',
                            data: productOpts,
                            success: function (data) {
                                if (data.success) {
                                    toastr.success('Product updated successfully!')
                                } else {
                                    toastr.error('Sku duplicate  entry occurred')
                                }
                            }
                        });
                    }
                });
              
                $('.set-featured').on('change', function () {
                    const imageId = $(this).data('image-id')
                    $.ajax({
                        url:'/api/v1/appProduct/update-product-featured-image',
                       // url: '/super-admin/shop/update/product-featured-image',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            productId: product.id,
                            imageId
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Featured Image Set Successfully!')
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                });
                $('.delete-image').on('click', function () {
                    const imageId = $(this).data('image-id')
                    $this = $(this)
                    alert(imageId)
                    $.ajax({
                        url:'/api/v1/appProduct/delete-product-images',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            imageId
                        },
                        success: function (data) {
                            if (data.success) {
                                $this.parent().fadeOut(400)
                                toastr.success('Image Deleted Successfully!')
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
            })
        }
    }
    }());
    