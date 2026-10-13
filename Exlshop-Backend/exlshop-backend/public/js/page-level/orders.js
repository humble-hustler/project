// const { response } = require("express");

var VIEW_ORDERS = VIEW_ORDERS || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            _csrf = _args._csrf

            $(document).ready(function () {
               
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        // 'url': '/api/v1/orders/orders-view-all',
                       'url': '/super-admin/shop/orders/view-all/',
                        //  /api/v1/orders/orders-view-all
                        headers: {
                            'csrf-token': _csrf
                        }
                        
                    },
                    
                    'columns': [
                       
                        {'data':'created_date', 'className':'order-date'},
                        {'data': 'instamojo_payment_id','className':'order-no'},
                        {'data': 'user_name','className':'user-name'},
                        {'data': 'shop_name','className':'shop_name'},
                        {'data': 'products'},
                        {'data': 'address_label'},
                        {'data': 'order_status','className':'o-status'},
                       
                    ],
                    
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                        
                    },{
                        "targets": 0,
                        "render": function (data, type, row) {
                            return data ? moment(data).format('DD-MM-YYYY hh:mm a') : ''
                        }
                    },{
                        "targets": 2,
                        "render": function (data, type, row) {
                            var data = `<a ><span>`+row.user_name+`</span><br>
                                        <span class="font-size-12"><i class="fa fa-phone" aria-hidden="true"></i>  `+row.phone+`</span></a>`;
                            return data;
                        }
                    },{
                        "targets": 4,
                        "render": function (data, type, row) {
                            var data = `<a ><i class="fa fa-map-marker" aria-hidden="true"></i> <span>`+row.address_label+`</span><br>
                                        <span > `+row.address_name+`</span></a><br>
                                        <span class="font-size-12">`+row.address_line_1+' '+row.shipping_address+`</span></a><br>`;
                            return data;
                         
                        }
                    },
                    {
                        "targets": 5,
                        "render": function (data, type, row) {
                            var status;
                            if(row.order_status == 1){
                                status = "Order Placed"
                                var data = `<select class = "order-status"><option class = "valueone">`+status+`</option>
                              
                                            <option>Shipped</option>
                                            <option>Out for Delivery</option>
                                            <option>Delivered</option>
                                            <option>Cancelled</option>
                                            <option>Returned</option>
                                            </select>`;
                                return data;
                             
                            }

                            if(row.order_status == 2){
                                status = "Shipped"
                                var data = `<select class = "order-status" disabled="disabled"><option class = "valueone">`+status+`</option>
                                            <option >Order Placed</option>
                                            <option >Out for Delivery</option>
                                            <option >Delivered</option>
                                            <option >Cancelled</option>
                                            <option >Returned</option>
                                            </select>`;
                                return data;
                             
                            }
                            if(row.order_status == 3){
                                status = "Out for Delivery"

                                var data = `<select class = "order-status"><option class = "valueone">`+status+`</option>
                                            <option >Order Placed</option>
                                            <option >Shipped</option>
                                            
                                            <option >Delivered</option>
                                            <option >Cancelled</option>
                                            <option >Returned</option>
                                            </select>`;
                                return data;
                             
                            }
                            if(row.order_status == 4){
                                status = "Delivered"

                                var data = `<select class = "order-status"><option class = "valueone">`+status+`</option>
                                            <option >Order Placed</option>
                                            <option >Shipped</option>
                                            <option >Out for Delivery</option>
                                            
                                            <option >Cancelled</option>
                                            <option >Returned</option>
                                            </select>`;
                                return data;
                             
                            }
                            if(row.order_status == 5){
                                status = "Cancelled"

                                var data = `<select class = "order-status"><option class = "valueone">`+status+`</option>
                                            <option >Order Placed</option>
                                            <option >Shipped</option>
                                            <option >Out for Delivery</option>
                                            <option >Delivered</option>
                                            
                                            <option >Returned</option>
                                            </select>`;
                                return data;
                             
                            }
                            if(row.order_status == 6){
                                status = "Returned"
                                var data = `<select class = "order-status"><option class = "valueone">`+status+`</option>
                                            <option>Order Placed</option>
                                            <option>Shipped</option>
                                            <option>Out for Delivery</option>
                                            <option>Delivered</option>
                                            <option>Cancelled</option>
                                            
                                            </select>`;
                                return data;
                             
                            } if(row.order_status == 7){
                                status = "push to shiprocket"
                                var data = `<select class = "order-status" disabled="disabled"><option class = "valueone">`+status+`</option>
                                            <option>Order Placed</option>
                                            <option>Shipped</option>
                                            <option>Out for Delivery</option>
                                            <option>Delivered</option>
                                            <option>Cancelled</option>
                                            
                                            </select>`;
                                return data;
                             
                            }}},
                        ],
                    
                    order:[[0,'desc']],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('order_id', data.id);
                        $(row).attr('user_id', data.user_id);
                    },   
                };
              
              
                var table = $('#order-list').DataTable(dataTableOpt);

                table.on('click', 'tr .user-name', function () {
                    var user_id = $(this).closest('tr').attr('user_id');
                    window.location.href=`/super-admin/shop/view/user-orders/${user_id}`;
                });


              
                
                $("#tbody").click(function(){

                
                  $(this).find("tr").each(function (){
                    

                    $(this).find(".o-status").find(".order-status").change(function(){
                        var id = parseInt($(this).parent().parent().attr("order_id"))
                        var order_date = $(this).parent().parent().find(".order-date").text()
                        var order_mo =  $(this).parent().parent().find(".user-mo").text()
                        var order_email =  $(this).parent().parent().find(".user-email").text()
                        var order_fname =  $(this).parent().parent().find(".user-fname").text()
                        var order_lname =  $(this).parent().parent().find(".user-lname").text()
                        var order_zip = $(this).parent().parent().find(".user-zip").text()
                        var order_address_1 = $(this).parent().parent().find(".user-address-one").text()
                        var order_address_2 = $(this).parent().parent().find(".user-address-two").text()
                        var order_city = $(this).parent().parent().find(".user-city").text()
                        var order_state = $(this).parent().parent().find(".user-state").text()
                        var order_country = $(this).parent().parent().find(".user-country").text()
                        var order_sub_total = $(this).parent().parent().find(".sub-total").text()
                        var order_total_discount = $(this).parent().parent().find(".total-discount").text()
                        var total_minus_discount = (order_sub_total - order_total_discount)
                        var selectText = $(this).find(":selected").text()

                        if (selectText != 'Shipped'){
                        $.ajax({
                            url: "/super-admin/shop/orders/update-order-status",
                            method: "post",
                            data: {
                                _csrf: _csrf,
                                selectText,
                                id,
                            },
                            success: function (data) {
                                if(data.success) {
                                   location.reload(true)
                                }else{
                                    alert("something went wrong")
                                }
                            }
                        })
                    }


                        if (selectText == 'Shipped'){
                            $('#myModal').modal('show');
                         
                            $(".add-dimension-btn").click(function(){
                              var courier_length = $("#myModal").find("#courier-length").val()
                              var courier_breadth = $("#myModal").find("#courier-breadth").val()
                              var courier_height = $("#myModal").find("#courier-height").val()
                              var courier_weight = $("#myModal").find("#courier-weight").val()
                              $(".error").hide();
                            var hasError = false;
                              if(courier_length == ''){
                                $("#myModal").find("#courier-length").after('<p class="error" style="color: red">Please enter length.</p>');
                                hasError = true;
                              }else if(courier_breadth == ''){
                                $("#myModal").find("#courier-breadth").after('<p class="error" style="color: red">Please enter breadth.</p>');
                                hasError = true;
                              }else if(courier_height == ''){
                                $("#myModal").find("#courier-height").after('<p class="error" style="color: red">Please enter height.</p>');
                                hasError = true;
                              }else if(courier_weight == ''){
                                $("#myModal").find("#courier-weight").after('<p class="error" style="color: red">Please enter weight.</p>');
                                hasError = true;
                              }
                              if(hasError == true) { return false; }

                                  $.ajax({
                                 url: "/super-admin/shop/orders/get-order-details",
                                method: "post",
                                data: {
                                    _csrf: _csrf,
                                    id,
                                },
                                success: function (d) {
                                    if(d.success) {
                                    
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
                            .then((dataOne) => {
                             const token = {
                                "Content-Type": "application/json",
                                    "Authorization": "Bearer" + " " + dataOne.token
                                }
                                fetch("https://apiv2.shiprocket.in/v1/external/channels", {
                                    method: "GET",
                                 
                                    headers: token

                                })
                                .then((response) => response.json())
                                .then((channel) => {
                                
                                    var R = JSON.stringify(d.data)
                                    var b = 
                                        {
                                            
                                            "order_id": `${id}`,
                                            "order_date": `${order_date}`,
                                            "pickup_location": "Tapsoft",
                                            "channel_id": `${channel.data[0].id}`,
                                            "comment": "fast and furious",
                                            "billing_customer_name": `${order_fname}`,
                                            "billing_last_name": `${order_lname}`,
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
                                            "order_items": `${R}`,
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
                                          var A = JSON.stringify(b)
                                          var str = A.replace(/\\/g, '');
                                          var s = str.replace(`"[`, "[");
                                          var f = s.replace(`]"`, "]")

                                         const header = {
                                            "Content-Type": "application/json",
                                            "Authorization": "Bearer" + " " + dataOne.token
                                            }
                                          
                                            
                                    fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
                                    method: "POST",
                                      headers:header,
                                    body:f
                                 
                                })
                              
                                .then((response) => response.json())
                                .then((order) => {

                                    if(order.status_code == 1){
                                        var pushedStatus = "push to shiprocket"
                                        $.ajax({
                                            url: "/super-admin/shop/orders/shirocketStatus",
                                            method: "post",
                                            data: {
                                                _csrf: _csrf,
                                               pushedStatus,
                                                id,
                                            },
                                            success: function (data) {
                                                if(data.success) {
                                                 location.reload(true); 
                                                }else{
                                                    alert("order is not pushed")
                                                }
                                            }
                                        })
                                    }


                                  })
                                 .catch((error) => {
                                    console.log(error)
                                })

                                })
                                .catch((error) => {
                                    console.log(error)
                                })
  
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                                    }else{
                                        alert("something went wrong")
                                    }
                                }
                            })

                            $.ajax({
                                //  url: "/super-admin/shop/orders/update-order-status",
                                method: "post",
                                data: {
                                    _csrf: _csrf,
                                    selectText,
                                    id,
                                },
                                success: function (data) {
                                    if(data.success) {

                                    }else{
                                        alert("something went wrong")
                                    }
                                }
                            })
                            })
                        }
                    })
                  })
                })
            });
        }
    };
}());