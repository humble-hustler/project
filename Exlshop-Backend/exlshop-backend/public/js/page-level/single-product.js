var SINGLE_PRODUCT1 = SINGLE_PRODUCT1 || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const product = JSON.parse(_args.product);
            const assignedCategories = JSON.parse(_args.assignedCategories)
            $(document).ready(function () {
                // var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
                // elems.forEach(function (html) {
                //     new Switchery(html);
                // });

                $('.cat-btn').on('change', function () {
                  
                    var category_id = $('#category').find(":selected").val();
                    const categoryId = $(this).val()
                    $.ajax({
                        url: '/super-admin/shop/GetSubcategories',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            categoryId
                        },
                        success: function (data) {
                            if (data.success && data.subcategories.length > 0) {
                                $('#subcategory').empty().append('<option value="">Select Subcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subcategory').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                $('#subcategory').on('change', function () {
                    const categoryId = $(this).val()
                    $.ajax({
                        url: '/super-admin/shop/GetSubcategories',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            categoryId
                        },
                        success: function (data) {
                            if (data.success && data.subcategories.length > 0) {
                                $('#subsubcategory').empty().append('<option value="">Select SubSubcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subsubcategory').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                $('#featured-image-input').on('change', () => {
                   
                    var form = $('#product-images')[0];
                    var formData = new FormData(form);
                    formData.append('_csrf', _csrf);
                    formData.append('productId', product.id);
                    $.ajax({
                        url :'/api/v1/productlist/add-product-images',
                    //    url: `/super-admin/shop/add/product-images`,
                        type: 'POST',
                        data: formData,
                        processData: false, // tell jQuery not to process the data
                        contentType: false, // tell jQuery not to set contentType
                        success: function (data) {
                            var images = data.result;
                            images.forEach((i) => {
                                $('.library-images-wrapper').append(`<div class="single-image"> <img src="/product-img/${i.fileName}" class="library-image" /><br> </div>`)
                            })
                        }
                    });
                })

                $('#product-type').on('change', function () {
                    const typeId = $(this).val();
                    const productId = product.id;
                    $.ajax({
                        url:"/api/v1/productlist/update-product-type",
                        //url: '/super-admin/shop/update/product-type',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            typeId,
                            productId
                        },
                        success: function (data) {
                            if (data.success) {
                                location.reload()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                });

                $('.set-featured').on('change', function () {
                    const imageId = $(this).data('image-id')
                    $.ajax({
                        url:'/api/v1/productlist/update-product-featured-image',
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
                    $.ajax({
                        url:'/api/v1/productlist/delete-product-images',
                       // url: '/super-admin/shop/delete/product-image',
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

                $('#update-inventory').on('click', function () {
                    const comment = $('#inventory-comment').val()
                    const inventoryCount = $('#inventory-qty').val()

                    if (!comment || !inventoryCount) {
                        toastr.error('Please enter Inventory Count and Comment')
                        return false
                    }

                    $.ajax({
                        url:'/api/v1/productlist/update-product-inventory',
                       // url: '/super-admin/shop/update/product-inventory',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            productId: product.id,
                            comment,
                            inventoryCount
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#product-inventory-log tbody').prepend(`<tr><td>${comment}</td><td>${inventoryCount}</td><td>${moment().format('Do MMM YYYY hh:mm A')}</td></tr>`)
                                toastr.success('Inventory Updated!')
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })

                $('#add-variation').on('click', function () {
                    const name = $('#variation-name').val()
                    const sku = $('#variation-sku').val()
                    const regularPrice = $('#variation-regular-price').val()
                    const discountPrice = $('#variation-discount-price').val()

                    if (!name || !sku || !regularPrice) {
                        toastr.error('Please enter Name, SKU and Price')
                        return false
                    }

                    $.ajax({
                        url:'/api/v1/productlist/add-product-variation',
                       // url: '/super-admin/shop/add/product-variation',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            productId: product.id,
                            name,
                            sku,
                            regularPrice,
                            discountPrice
                        },
                        success: function (data) {
                            if (data.success) {
                                location.reload()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })

                $('.variation-inventory-log').on('click', function (e) {
                    e.preventDefault()
                    const variationId = $(this).data('variation-id')
                    $.ajax({
                        url:'/api/v1/productlist/get-variation-inventory',
                        //url: '/super-admin/shop/get/variation-inventory',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            productId: product.id,
                            variationId
                        },
                        success: function (data) {
                            if (data.success) {
                                const inventory = data.inventory;
                                $('#variation-inventory-log tbody').empty()
                                $('#variation-inventory-log-modal #update-inventory').data('variation-id', variationId)
                                if (inventory.length) {
                                    inventory.forEach((t) => {
                                        $('#variation-inventory-log tbody').append(`<tr><td>${t.comment}</td><td>${t.inventory_count}</td><td>${moment(t.created_date).format('Do MMM YYYY hh:mm A')}</td></tr>`)
                                    })
                                } else {
                                    $('#variation-inventory-log tbody').append('<tr class="text-center"><td colspan="3">No Logs</td></tr>')
                                }
                                $('#variation-inventory-log-modal').modal()
                                $('#update-variation-inventory').unbind('click').on('click', function () {
                                    const comment = $('#inventory-comment').val()
                                    const inventoryCount = $('#inventory-qty').val()

                                    if (!comment || !inventoryCount) {
                                        toastr.error('Please enter Inventory Count and Comment')
                                        return false
                                    }

                                    $.ajax({
                                        url: '/super-admin/shop/update/variation-inventory',
                                        method: 'POST',
                                        data: {
                                            _csrf: _csrf,
                                            productId: product.id,
                                            variationId,
                                            comment,
                                            inventoryCount
                                        },
                                        success: function (data) {
                                            if (data.success) {
                                                $('#variation-inventory-log tbody').prepend(`<tr><td>${comment}</td><td>${inventoryCount}</td><td>${moment().format('Do MMM YYYY hh:mm A')}</td></tr>`)
                                                $('#inventory-comment').val('')
                                                $('#inventory-qty').val('')
                                                toastr.success('Inventory Updated!')
                                            } else {
                                                toastr.error('Some error occurred')
                                            }
                                        }
                                    });
                                })
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                });

                $('#is-service').on('change', function () {
                    const isService = $(this).prop('checked') ? 1 : 0;
                    $.ajax({
                        url:'/api/v1/productlist/update-is-service',
                       // url: '/super-admin/shop/update/is-service',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            productId: product.id,
                            isService
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Product updated successfully!')
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                });

                $('#product-status').on('change', function () {
                    const productStatus = $(this).val()
                    $.ajax({
                        url:'/api/v1/productlist/update-product-status',
                       // url: '/super-admin/shop/update/product-status',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            productId: product.id,
                            productStatus
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Product Status Updated Successfully!')
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })

                $('#update-product-btn').on('click', function () {
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
                        var catIds = [];
                        var check=true;


                        $('.categories').each(function () {
                            if ($(this).prop('checked')) {
                                catIds.push($(this).val())
                            }
                        })

                        var myFormData = new FormData();
                        myFormData.append('_csrf', _csrf);
                        myFormData.append('productId', product.id)
                        myFormData.append('name', $('#product-name').val())
                        myFormData.append('description', $('#description').val())
                        myFormData.append('category', $('#subsubcategory').val())
                        myFormData.append('Files', $("#global-image")[0].files[0]);
                        console.log(myFormData)

                        $.ajax({
                            url:'/super-admin/shop/update-products',
                            data: myFormData,
                            contentType: false,
                            processData: false,
                            method: 'POST',
                            success: function (data) {
                                if (data.success) {
                                    toastr.success('Product updated successfully!')
                                } else {
                                    toastr.error('Some error occurred')
                                }
                            }
                        });
                    }
                })

            });
        }
    };
}());