var SHIPPING_CHARGES = SHIPPING_CHARGES || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            const    _csrf = _args._csrf;
            $('#addCharges').hide()
            $(document).ready(function () {

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'searching': false,
                    'paging': false,
                    'info': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/orders/getShippingCharges',
                        // 'url':'/api/v1/appProduct/getProducts',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data':'d_0_5_Km'}, 
                        {'data':'d_5_10_Km'},   
                        { 'data':'d_10_20_Km' },
                        {'data':'d_20_40_Km'},
                        {'data':'d_40_60_Km'},
                        {'data':'d_60_100_Km'},
                        {'data':'d_more_than_100_Km'},
                     
                    ],
                    'ordering': false,
                    'aaSorting': false,
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },
                    {
                        "targets": 7,
                        'render': function (data, type, row, meta) {
                            data = `<a href="#" data-toggle="modal" data-target="#update-charges" class="update-charges-btn">\n\
                                    <i class="fa fa-pencil" aria-hidden="true" id="update_btn" > </i></a>&nbsp;&nbsp;\n\
                                <a href="#" data-toggle="modal" data-target="#delete-charges" class="delete-charges-btn">\n\
                                    <i class="fa fa-trash" aria-hidden="true" id="delete-btn" value="${row.id}"></i>\n\
                                </a>`;

                            return data;
                        }
                    }],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('locationId', data.brand_location_id);
                        $(row).attr('status', data.user_id);
                        $(row).attr('id', data.id);
                    },
                    "drawCallback": function (settings) { 
                        // Here the response
                        var response = settings.json;
                        if(response.recordsTotal){
                            $('#addCharges').hide()
                        } else {
                            $('#charges-list_wrapper').hide()
                            $('#addCharges').show()
                        }
                    },
                    'order': [[0, "asc"]]
                };
                
                var table = $('#charges-list').DataTable(dataTableOpt);
                // if(table.rows().length){
                //     $('#addCharges').hide()
                // } else {
                //     $('#charges-list_wrapper').hide()
                //     $('#addCharges').show()
                // }

                $(document).on('click','.delete-charges-btn', function () {
                    $('#record_id').val($(this).closest('tr').attr('id'));
                });

                $(document).on('click','.update-charges-btn', function () {
                    $('#zero-five-update').val($(this).closest('tr').find('td')[0].innerText)
                    $('#five-ten-update').val($(this).closest('tr').find('td')[1].innerText)
                    $('#ten-twenty-update').val($(this).closest('tr').find('td')[2].innerText)
                    $('#twenty-forty-update').val($(this).closest('tr').find('td')[3].innerText)
                    $('#forty-sixty-update').val($(this).closest('tr').find('td')[4].innerText)
                    $('#sixty-hundred-update').val($(this).closest('tr').find('td')[5].innerText)
                    $('#more-than-hundred-update').val($(this).closest('tr').find('td')[6].innerText)
                });

                $("#delete-charges-btn").on('click',function (e) {
                    var record_id = $('#record_id').val();
                    $.ajax({
                        url: '/app/orders/deleteShippingCharges',
                        data:{
                            _csrf: _csrf,
                            record_id:record_id
                        },
                        method: 'POST',
                        success: function (data) {
                            window.location.href='/app/orders/addShippingCharges/'
                        }
                    });
                });

                $("#update-charges-btn").on('click',function (e) {
                    var record_id = $('#record_id').val();
                    $.ajax({
                        url: '/app/orders/addShippingCharges',
                        data:{
                            _csrf: _csrf,
                            range0_5 : $("#zero-five-update").val(),
                            range5_10 : $("#five-ten-update").val(),
                            range10_20 : $("#ten-twenty-update").val(),
                            range20_40 : $("#twenty-forty-update").val(),
                            range40_60 : $("#forty-sixty-update").val(),
                            range60_100 : $("#sixty-hundred-update").val(),
                            rangeMorethan_100 : $("#more-than-hundred-update").val()
                        },
                        method: 'POST',
                        success: function (data) {
                            window.location.href='/app/orders/addShippingCharges/'
                        }
                    });
                });

                $(".Add-btn").on('click', function (){
                    var range0_5 =   $(this).parent().parent().find("#zero-five").val()
                    var range5_10 =   $(this).parent().parent().find("#five-ten").val()
                    var range10_20=   $(this).parent().parent().find("#ten-twenty").val()
                    var range20_40=   $(this).parent().parent().find("#twenty-forty").val()
                    var range40_60=   $(this).parent().parent().find("#forty-sixty").val()
                    var range60_100=   $(this).parent().parent().find("#sixty-hundred").val()
                    var rangeMorethan_100=   $(this).parent().parent().find("#more-than-hundred").val()

                  $.ajax({
                    url: `/app/orders/addShippingCharges`,
                    method: "post",
                    data: {
                         _csrf: _csrf,
                         range0_5,
                         range5_10,
                         range10_20,
                         range20_40,
                         range40_60,
                         range60_100,
                         rangeMorethan_100
                    },
                    success: function (data) {
                            if(data.success) {
                                window.location='/app/orders/addShippingCharges'
                            }else{
                                alert("something went wrong")
                            }   
                        }
                    })
                })

                $("input[type=radio]").click(function(event) {
                    $("input[type=radio]").prop("checked", false);
                    $(this).prop("checked", true);

                    $.ajax({
                        url: '/app/orders/setDeliveryOption',
                        data: {
                            _csrf: _csrf,
                            choice : $(this).val()
                        },
                        method: 'POST',
                        success: function (data) {
                            toastr.success("Delivery option updated successfully")
                            window.location.href = '/app/orders/addShippingCharges'
                        },
                        error: function (data, status, error) {
                            toastr.error("Some error occured")
                        }
                    })
                    //event.preventDefault();
                });

                $('#exlshop-btn').on('click',()=>{
                    var pickup_date_id=$('#pickup_date_id').val();
                    var pickup_time_id=$('#pickup_time_id').val()
                    var pickup_location_id=$('#pickup_location_id').val()
                    var expected_package_count_id= $('#expected_package_count_id').val()
                    $.ajax({
                        url: '/app/orders/delhivery_request',
                        data: {
                        pickup_date_id,
                        pickup_time_id,
                        pickup_location_id,
                        expected_package_count_id,
                        order_id:'<%-order.id%>',
                            _csrf: '<%= _csrf %>'
                        },
                        method: 'POST',
                        success: function (data) {
                            window.location.reload()
                        },
                        error: function (data, status, error) {
                            alert("not successfull")
                        }
                    })
                })

                $('#emailid-update').on('change', function () {
                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (!regex.test($element.val())) {
                        toastr.error('Please Fill Valid Email-Id')
                        return
                    }
                })

                $('#phone-update').on('change', function () {
                    $element = $(this);

                    if ($element.val().length !== 10) {
                        toastr.error('Please enter 10 digit')
                        return
                    }
                })
                
                $('.set-pickup-btn').on('click', function () {
                    if (!$('#shopAdd1').text()) {
                        toastr.error('Please Add Shop Address Line 1')
                        return
                    }
                    if (!$('#shopCity').text()) {
                        toastr.error('Please Add City')
                        return
                    }
                    if (!$('#shopState').text()) {
                        toastr.error('Please Add State');
                        return
                    }
                    if (!$('#shopZip').text()) {
                        toastr.error('Please Add Pin Code');
                        return
                    }
                    if (!$('#shopMobile').text()) {
                        toastr.error('Please Add Shop Mobile Number')
                        return
                    }
                    if (!$('#shopEmail').text()) {
                        toastr.error('Please Add Shop Email Id')
                        return
                    }
                    if (!$('#shopLat').text()) {
                        toastr.error('Please Add Latitude')
                        return
                    }
                    if (!$('#shopLng').text()) {
                        toastr.error('Please Add Longitude')
                        return
                    }
                    if ($('#shopAdd1').text().length < 10) {
                        toastr.error('Address Line 1 should not be less than 10')
                        return
                    }
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
                        const pickupData = {
                            "pickup_location": $("#shopName").text(),
                            "name": $("#shopName").text(),
                            "email": $("#shopEmail").text(),
                            "phone": parseInt($("#shopMobile").text()),
                            "address": $("#shopAdd1").text(),
                            "address_2": $("#shopAdd2").text(),
                            "city": $("#shopCity").text(),
                            "state":$("#shopState").text(),
                            "country": $("#shopCountry").text(),
                            "pin_code": parseInt($("#shopZip").text()),
                            "lat": parseFloat($("#shopLat").text()),
                            "long": parseFloat($("#shopLng").text())
                        }
                        const token = {
                        "Content-Type": "application/json",
                            "Authorization": "Bearer" + " " + dataOne.token
                        }
                        fetch("https://apiv2.shiprocket.in/v1/external/settings/company/addpickup", {
                            method: "POST",                                 
                            headers: token,
                            body: JSON.stringify(pickupData)
                        })
                        .then((response) => response.json())
                        .then((addpickup) => {
                            if(addpickup.success == true){
                                $('.set-pickup-btn').hide()
                                $.ajax({
                                    url: '/app/orders/updatePickupStatus',
                                    method: 'POST',
                                    data: {
                                        _csrf: _csrf,
                                    },
                                    success: function (data) {
                                        window.location.reload()
                                    }
                                });
                            }
                        })
                    })
                })


                if($("#state-update").val()) {
                    const stateId = $("#state-update").val()
                    $.ajax({
                        url: '/app/common/get-cities',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            stateId
                        },
                        success: function (data) {
                            if (data.success && data.cities.length > 0) {
                                $('#city-update').empty().append('<option value="">Select City</option>');
                                data.cities.forEach((c) => {
                                    $('#city-update').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                            $("#city-update").val($("#state-update").attr('data-city_id'))
                        }
                    });
                }

                $("#state-update").on('change', function() {
                    const stateId = $(this).val()
                    $.ajax({
                        url: '/app/common/get-cities',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            stateId
                        },
                        success: function (data) {
                            if (data.success && data.cities.length > 0) {
                                $('#city-update').empty().append('<option value="">Select City</option>');
                                data.cities.forEach((c) => {
                                    $('#city-update').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })

                $('#update-shop-btn').on('click', function() {
                    if(!$('#address-line1-update').val()){
                        toastr.error('Please Fill Address Line 1')
                        return
                    } else if ($('#address-line1-update').val().length < 10) {
                        toastr.error('Address Line 1 should not be less than 10')
                        return
                    }
                    if(!$('#zip-update').val()){
                        toastr.error('Please Fill Pincode')
                        return
                    }
                    if(!$('#phone-update').val()){
                        toastr.error('Please Fill Phone Number')
                        return
                    } else {
                        var str = $('#phone-update').val()
                        const regexExp = /^[6-9]\d{9}$/gi;
                        if(!regexExp.test(str)){
                            toastr.error('Please Enter Valid Number')
                            return
                        }
                    }
                    if(!$('#emailid-update').val()){
                        toastr.error('Please Fill Email-Id')
                        return
                    }
                    if(!$('#lat-update').val() || !$('#lng-update').val()){
                        $('.eighteen').trigger('click')
                    }
                    $.ajax({
                        url: '/app/accounts/updateShopDetails',
                        data: {
                            address1:$('#address-line1-update').val(),
                            address2:$('#address-line2-update').val(),
                            zip:$('#zip-update').val(),
                            cityId:$("#city-update").val(),
                            stateId:$("#state-update").val(),
                            countryId:$("#country-update").attr('countryId'),
                            phoneno:$('#phone-update').val(),
                            emailId:$('#emailid-update').val(),
                            gstin:$('#gst-update').val(),
                            lat:$('#lat-update').val(),
                            lng:$('#lng-update').val(),
                            _csrf: _csrf
                        },
                        method: 'POST',
                        success: function (data) {
                            window.location.reload()
                        },
                        error: function (data, status, error) {
                            toastr.error("Not successfull")
                        }
                    })
                })
            });
        }
    };
}());