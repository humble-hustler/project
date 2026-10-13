var SINGLE_ORDER = SINGLE_ORDER || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            var shipBody = ''
            var token = ''
            var products = ''

            $(document).ready(function () {
                $("#order_status_id option").each(function() {
                    if($(this).text() == 'Order Placed'){
                        $(this).css("background", "skyblue")
                    }else if($(this).text() == 'Shipped'){
                        $(this).css("background", "violet")
                    }else if($(this).text() == 'Out for Delivery'){
                        $(this).css("background", "orange")
                    }else if($(this).text() == 'Delivered'){
                        $(this).css("background", "green")
                    }else if($(this).text() == 'Cancelled'){
                        $(this).css("background", "red")
                    }else if($(this).text() == 'Returned'){
                        $(this).css("background", "pink")
                    }else if($(this).text() == 'push to shiprocket'){
                        $(this).css("background", "yellow")
                    }
                })
        
                if($("#order_status_id").find(":selected").text() == 'Order Placed'){
                    $("#order_status_id").css("background", "skyblue")
                }else if($("#order_status_id").find(":selected").text() == 'Shipped'){
                    $("#order_status_id").css("background", "violet")
                }else if($("#order_status_id").find(":selected").text() == 'Out for Delivery'){
                    $("#order_status_id").css("background", "orange")
                }else if($("#order_status_id").find(":selected").text() == 'Delivered'){
                    $("#order_status_id").css("background", "green")
                }else if($("#order_status_id").find(":selected").text() == 'Cancelled'){
                    $("#order_status_id").css("background", "red")
                }else if($("#order_status_id").find(":selected").text() == 'Returned'){
                    $("#order_status_id").css("background", "pink")
                }else if($("#order_status_id").find(":selected").text() == 'push to shiprocket'){
                    $("#order_status_id").css("background", "yellow")
                }
                var selected_options = $("#order_status_id").find(":selected").text()
                if(selected_options == "Cancelled"){
                    $("#order_status_id").prop('disabled',true)
                }

                $('#add_shopadmin_delivery').click(()=>{
                    alert("hi")
                    var pickup_date =$('#pickup_date_id123').val()
                    var pickup_time=$('#pickup_time_id123').val()
                    var pickup_location=$('#pickup_location_id123').val()
                    var staff_id=$('#staff_id').val();
                    $.ajax({
                        url: "/app/asset-management/add/shopadmin_delivery",
                        data: {
                        pickup_time,
                        pickup_date,
                        pickup_location,
                        staff_id,
                        order_id:10,
                        _csrf:'<%= _csrf %>'
                        },
                        method: 'POST',
                        success: function (data) {
                            toastr.success(' delivery Request created successfully!');
                            window.location.reload();
                        },
                        error: function (data, status, error) {
                            toastr.error('Some error occurred')
                        }
                    });
                })
                
                var id = $("#order_status_id").attr('data-orderId')
                var custFname = $("#orderName").attr('fname')
                var custLname = $("#orderName").attr('lname')
                var custNum = $("#orderPhone").attr('phone')
                var order_date = moment($("#orderDate").attr('value')).format('DD-MM-YYYY hh:mm a')
                var order_mo =  $("#orderDelName").attr('delnum')
                var order_email =  $("#orderMail").attr('mail')
                var order_name =  $("#orderDelName").attr('delname')
                var order_zip = $("#cityZip").attr('zip')
                var order_address_1 = $("#addLine1").text()
                var order_address_2 = $("#addLine2").text()
                var order_city = $("#cityZip").attr('city')
                var order_state = $("#cityZip").attr('state')
                var order_country = $("#cityZip").attr('country')
                var order_sub_total = $("#totalAmt").attr('reg')
                var order_total_discount = $("#totalAmt").attr('dis')
                var total_minus_discount = $("#totalAmt").attr('sel')

                $.ajax({
                    url: "/api/v1/appOrder/getexlshopproducts",
                    method: "GET",
                    data: {
                        _csrf: _csrf,                     
                        id,
                    },
                    success: function (data) {
                        if(data.success) {
                            products = JSON.stringify(data.data)
                        }
                    },
                    error : function(data, error) {
                        console.log(error)
                    }
                })

                $('#order_status_id').on('change',function(e){
                    var status_id = $("#order_status_id").val();
                    var pickupLocation = ''
                    if(status_id == 7){
                        const url = 'https://apiv2.shiprocket.in/v1/external/auth/login'
                        const loginOpts = {
                            "email": 'info@tapsoft.in',
                            "password": 'Harvey!@3',
                        };
                        const customHeaders = {
                            "Content-Type": "application/json",
                        }                        
                        fetch(url,
                            {
                                method: "POST",
                                headers: customHeaders,
                                body: JSON.stringify(loginOpts)
                            })
                            .then((response) => response.json())
                            .then((dataOne) => {
                                token = {
                                    "Content-Type": "application/json",
                                    "Authorization": "Bearer" + " " + dataOne.token
                                }
                                fetch("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", {
                                    method: "GET",                                 
                                    headers: token
                                })
                                .then((response) => response.json())
                                .then((pickup) => {
                                    var shipAdd = pickup.data.shipping_address
                                    shipAdd.forEach((s) => {
                                        if($("#brandName").text() == s.pickup_location){
                                            pickupLocation = s.pickup_location
                                        }
                                    })
                                    fetch("https://apiv2.shiprocket.in/v1/external/channels", {
                                    method: "GET",                                 
                                    headers: token
                                    })
                                    .then((response) => response.json())
                                    .then((channel) => {
                                        courier_length = $('#courier-length').val()
                                        courier_breadth = $('#courier-breadth').val()
                                        courier_height = $('#courier-height').val()
                                        courier_weight = $('#courier-weight').val()
                                        shipBody = {
                                            "order_id": `${id}`,
                                            "order_date": `${order_date}`,
                                            "pickup_location": `${pickupLocation}`,
                                            "channel_id": `${channel.data[0].id}`,
                                            "comment": "fast and furious",
                                            "billing_customer_name": `${custFname}`,
                                            "billing_last_name": `${custLname}`,
                                            "billing_address": `${order_address_1}`,
                                            "billing_address_2": `${order_address_2}`,
                                            "billing_city": `${order_city}`,
                                            "billing_pincode": `${order_zip}`,
                                            "billing_state": `${order_state}`,
                                            "billing_country": `${order_country}`,
                                            "billing_email": `${order_email}`,
                                            "billing_phone": `${order_mo}`,
                                            "shipping_is_billing": true,
                                            "shipping_customer_name": "",
                                            "shipping_last_name": "",
                                            "shipping_address": "",
                                            "shipping_address_2": "",
                                            "shipping_city": "",
                                            "shipping_pincode": "",
                                            "shipping_country": "",
                                            "shipping_state": "",
                                            "shipping_email": "",
                                            "shipping_phone": "",
                                            "order_items": `${products}`,
                                            "payment_method": "Prepaid",
                                            "shipping_charges": 0,
                                            "giftwrap_charges": 0,
                                            "transaction_charges": 0,
                                            "total_discount": `${order_total_discount}`,
                                            "sub_total": `${total_minus_discount}`,
                                            "length": `${courier_length}`,
                                            "breadth": `${courier_breadth}`,
                                            "height": `${courier_height}`,
                                            "weight": `${courier_weight}`
                                        }
                                        shipBody = JSON.stringify(shipBody)
                                        shipBody = shipBody.replace(/\\/g, '');
                                        shipBody = shipBody.replace(`"[`, "[");
                                        shipBody = shipBody.replace(`]"`, "]")
                                        $("#update-status-btn").on('click',function() {
                                            var status_id = $("#order_status_id").val();
                                            if(status_id == 7) {
                                                const header = {
                                                    "Content-Type": "application/json",
                                                    "Authorization": "Bearer" + " " + dataOne.token
                                                }
                                                fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
                                                    method: "POST",
                                                    headers:header,
                                                    body:shipBody                                                        
                                                })
                                                .then((response) => response.json())
                                                .then((order) => {
                                                    $.ajax({
                                                        url : '/app/accounts/updatestatus',
                                                        data :{
                                                            status_id: 7,
                                                            order_id:id,
                                                            _csrf: _csrf
                                                        },
                                                        method: 'POST',
                                                        success: function (data) {
                                                            toastr.success("Order Status Updated Successfully")
                                                        },
                                                        error: function (data, status, error) {
                                                            toastr.error("not successfull")
                                                        }
                                                    })
                                                    $.ajax({
                                                        url : '/app/accounts/updateOrderDelStatus',
                                                        data :{
                                                            _csrf: _csrf,
                                                            order_id:id,
                                                            del_order_id: order.order_id,
                                                            del_shipment_id: order.shipment_id,
                                                            del_status: order.status,
                                                            del_status_code: order.status_code,
                                                            del_awb_code: order.awb_code
                                                        },
                                                        method: 'POST',
                                                        success: function (data) {
                                                            window.location.reload()
                                                        },
                                                        error: function (data, status, error) {
                                                            toastr.error("not successfull")
                                                        }
                                                    })
                                                })
                                            }
                                        })            
                                    })
                                })
                            }
                        )
                    }
                })

                $.ajax({
                    url: '/app/orders/getOrderStatusHistory',
                    data: {
                        order_id:id,
                        _csrf: _csrf,
                    },
                    method: 'POST',
                    success: function (data) {
                        $("#order_status_id option").each(function() {
                            $(this).prop('disabled',false)
                            if(data.data.Order_Placed == 1 && $(this).val()==1) {
                                $(this).prop('disabled',true)
                            }
                            if(data.data.Shipped == 1 && $(this).val()==2) {
                                $(this).prop('disabled',true)
                            }
                            if(data.data.Out_for_Delivery == 1 && $(this).val()==3) {
                                $(this).prop('disabled',true)
                            }
                            if(data.data.Delivered == 1 && $(this).val()==4) {
                                $(this).prop('disabled',true)
                            }
                            if(data.data.Cancelled == 1 && $(this).val()==5) {
                                $(this).prop('disabled',true)
                            }
                            if(data.data.Returned == 1 && $(this).val()==6) {
                                $(this).prop('disabled',true)
                            }
                            if(data.data.push_to_shiprocket == 1 && $(this).val()==7) {
                                $(this).prop('disabled',true)
                            }
                        })
                    },
                    error: function (data, status, error) {
                        toastr.error("not successfull")
                    }
                })

                $(document).on('click','#ExlShop-delivery-btn', function() {
                    if(!$('#courier-length').val()){
                        toastr.error("Please Enter Courier Length")
                        return
                    }
                    if(!$('#courier-breadth').val()){
                        toastr.error("Please Enter Courier Breadth")
                        return
                    }
                    if(!$('#courier-height').val()){
                        toastr.error("Please Enter Courier Height")
                        return
                    }
                    if(!$('#courier-weight').val()){
                        toastr.error("Please Enter Courier Weight")
                        return
                    }
                    $.ajax({
                        url: '/app/orders/brandExlshopDelDetails',
                        data: {
                            order_id:id,
                            _csrf: _csrf,
                            length : $('#courier-length').val(),
                            breadth : $('#courier-breadth').val(),
                            height : $('#courier-height').val(),
                            weight : $('#courier-weight').val(),
                        },
                        method: 'POST',
                        success: function (data) {
                            toastr.success('Delivery Details For Exlshop Delivery Added Successfully')
                            $('#add-delivery-details').modal('toggle')
                            window.location.reload()
                        },
                        error: function (data, status, error) {
                            toastr.error("not successfull")
                        }
                    })
                })

                $(document).on('click','#update-ExlShop-delivery-btn', function() {
                    if(!$('#courier-length').val()){
                        toastr.error("Please Enter Courier Length")
                        return
                    }
                    if(!$('#courier-breadth').val()){
                        toastr.error("Please Enter Courier Breadth")
                        return
                    }
                    if(!$('#courier-height').val()){
                        toastr.error("Please Enter Courier Height")
                        return
                    }
                    if(!$('#courier-weight').val()){
                        toastr.error("Please Enter Courier Weight")
                        return
                    }
                    $.ajax({
                        url: '/app/orders/updatebrandExlshopDelDetails',
                        data: {
                            order_id:id,
                            _csrf: _csrf,
                            length : $('#courier-length').val(),
                            breadth : $('#courier-breadth').val(),
                            height : $('#courier-height').val(),
                            weight : $('#courier-weight').val(),
                        },
                        method: 'POST',
                        success: function (data) {
                            toastr.success('Delivery Details For Exlshop Delivery Updated Successfully')
                            $('#add-delivery-details').modal('toggle')
                            window.location.reload()
                        },
                        error: function (data, status, error) {
                            toastr.error("not successfull")
                        }
                    })
                })

                $("#update-status-btn").on('click',function() {
                    var status_id = $("#order_status_id").val();
                    if(status_id != 7) {
                        $.ajax({
                            url : '/app/accounts/updatestatus',
                            data :{
                                status_id: status_id,
                                order_id:id,
                                _csrf: _csrf
                            },
                            method: 'POST',
                            success: function (data) {
                                toastr.success("Order Status Updated Successfully")
                                window.location.reload()
                            },
                            error: function (data, status, error) {
                                toastr.error("not successfull")
                            }
                        })
                    }
                })
            });
        }
    };
}());