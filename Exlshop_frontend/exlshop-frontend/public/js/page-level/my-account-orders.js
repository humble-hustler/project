var MY_ACCOUNT_ORDERS = MY_ACCOUNT_ORDERS || (function () {
    $("#v").click(function () {
        $(".abab").each(function () {
            let text = $(this).has('.card-timeline');
            for (var i = 0; i < 4; i++) {
                 var elements = document.getElementsByClassName('step');
                     $(elements).addClass("active");
            }
            var elements = " ";
        });
    });

    return {
        init: function (Args) {
            const _csrf = Args._csrf;

            function getOrders() {
                let orderfilter = document.getElementsByClassName("orderstatus");
                var elements = " ";
                var j = 0;
                var a = [];
                var statusvalarray = [];
                var k = 0;
                for (var i = 0; i < orderfilter.length; i++) {
                    if ($(orderfilter[i]).is(":checked")) {
                        statusvalarray.push(orderfilter[i].defaultValue);
                    }
                }

                let ordertimefilter = document.getElementsByClassName("ordertime");
                var j = 0;
                var a = [];
                var k = 0;
                var timestatusval = [];
                for (var i = 0; i < ordertimefilter.length; i++) {
                    if ($(ordertimefilter[i]).is(":checked")) {
                        timestatusval.push(ordertimefilter[i].defaultValue);
                    }
                }
                console.log(timestatusval)
                var searchValue = $('#search-orders').val();
                $.ajax({
                    url: '/my-account/orders/get-search-orders',
                    method: 'POST',
                    data: {
                        _csrf,
                        searchValue,
                        statusvalarray,
                        timestatusval
                    },
                    success: function (data) {
                        if (data.success === false) {
                            alert('Some error occurred')
                        } else {
                            $('#orderList').empty().append(data);
                        }
                    }
                });
            }
            $(document).ready(function () {
                getOrders();
                $("#filtersection").click(function () {
                    getOrders();
                });
                $('#search-orders').keyup(function () {
                    var searchValue = $(this).val();
                    getOrders();
                })
                $('#search-button').on('click', () => {
                    var searchValue = $('#search-orders').val();
                    if (searchValue.length > 1) {
                        getOrders();
                    }
                })
                $('.order-btn').on('click', function (e) {
                    const orderId = $(this).data('order-id');
                    $.ajax({
                        url: '/my-account/orders/get-single',
                        method: 'POST',
                        data: {
                            _csrf,
                            orderId
                        },
                        success: function (data) {
                            if (!data.success) {
                                $(`#order-${orderId}`).empty().append(data)
                            }
                        }
                    })
                })
                $('.order-return').on('click', function (e) {
                    e.preventDefault();
                    const productId = $(this).data('product-id');
                    const orderId = $(this).data('order-id');
                    $.ajax({
                        url: '/my-account/order-return',
                        method: 'POST',
                        data: {
                            _csrf,
                            orderId,
                            productId
                        },
                        success: function (data) {
                            if (data.success) {
                                window.location.reload();
                                toastr.success('Order Returned...');
                            }
                            else {
                                toastr.error('There was some error..')
                            }
                        }
                    })
                })
            })
      }
    };
}());