var VIEW_LEADS = VIEW_LEADS || (function () {
    return {
        init: function (Args) {
            var _args = Args;
            var _csrf = _args._csrf
            var flash = _args.flash

            $(document).ready(function () {
                if (flash) {
                    toastr.error(flash)
                }

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/marketing/leads/view-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        { 'data': 'brand_locations_id' },
                        { 'data': 'lname' },
                        { 'data': 'email' },
                        { 'data': 'phone' },
                        { 'data': 'operatinghrstart' },
                        { 'data': 'operatinghourend' },
                        {
                            'render': function (data, type, row, meta) {
                                data = '<a href="#" data-toggle="modal" data-target="#update-branch" class="update-branch-btn">\n\
                                        <i class="fa fa-pencil" aria-hidden="true" id="update_btn" > </i></a>&nbsp;&nbsp;\n\
                                    <a href="#" data-toggle="modal" data-target="#delete-branch" class="delete-branch-btn">\n\
                                        <i class="fa fa-trash" aria-hidden="true" id="delete-btn"value="data.lname"></i>\n\
                                    </a>';

                                return data;
                            }
                        },
                        { 'data' : 'status' }
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },
                    {   
                        "targets": 7,
                        "render": function (data, type, row) {
                            return `<input type="checkbox" data-brand-location-id=${row.brand_locations_id} data-plugin="switchery" data-switch-type="is_active" data-color="#eb6709" class="toggle-switch js-switch" ${data==1 ? `checked` : ''}>`
                        }
                    }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-lead-id", data.id);
                    },
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('lead_id', data.brand_locations_id);
                        $(row).attr('lname', data.lname);
                        $(row).attr('add1', data.add1);
                        $(row).attr('add2', data.add2);
                        // $(row).attr('cityid', data.cityid);
                        // $(row).attr('stateid', data.stateid);
                        $(row).attr('phone', data.phone);
                        $(row).attr('zip', data.zip);
                        $(row).attr('email', data.email);
                        $(row).attr('operatinghrstart', data.operatinghrstart);
                        $(row).attr('operatinghourend', data.operatinghourend);
                        $(row).attr('udyog_no1',data.udyog_no);
                        $(row).attr('pan_no1',data.pan_no);
                        $(row).attr('gst_no1',data.gst_no);
                        $(row).attr('pan_file',data.pan_file);
                        $(row).attr('gst_file',data.gst_file);
                    },
                    'order': [[0, 'asc']]
                };

                var table = $('#leads-list').DataTable(dataTableOpt);
            
                table.on('draw.dt', function () {
                    var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
                    elems.forEach(function (html) {
                        new Switchery(html);
                    });
                })

                  table.on('click', 'tr', function () {
                    // alert("ji")
                    // $(this).toggleClass('selected');
                });
                $('#apply-filter').on('click', function () {
                    //alert("hii")
                    var table = $('#leads-list').dataTable();
                    var tableSettings = table.fnSettings();
                  
                    tableSettings.ajax.data = {
                        filter: {
                            operating_hour_from:$('#fromhr').val() ,
                            operating_hour_to: $('#tohr').val(),                          
                            location_name: $('#location_id').val(),
                            email:$('#email_id').val(),
                            phone_no: $('#phone_id').val()
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click',()=>{
                    //alert("ioio")
                    var table = $('#leads-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            operating_hour_from:null,
                            operating_hour_to: null,                          
                            location_name: null,
                            email:null,
                            phone_no: null
                        }
                    }
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })
            
                $(document).on('click','.delete-branch-btn', function () {
                    $('#location-id').val($(this).closest('tr').attr('lead_id'));
                });
                $(document).on('click','.update-branch-btn', function () {
                    $('#location-id').val($(this).closest('tr').attr('lead_id'));
                    $('#location-name').val($(this).closest('tr').attr('lname'));
                    $('#address_line11').val($(this).closest('tr').attr('add1'));
                    $('#address_line22').val($(this).closest('tr').attr('add2'));
                    // $('#state_id1').val($(this).closest('tr').attr('cityid'));
                    // $('#city_id1').val($(this).closest('tr').attr('stateid'));
                    $('#pincode_id1').val($(this).closest('tr').attr('zip'));
                    $('#phone1').val($(this).closest('tr').attr('phone'));
                    $('#email1').val($(this).closest('tr').attr('email'));
                    $('#operatinghr_from1').val($(this).closest('tr').attr('operatinghrstart'));
                    $('#operatinghr_to1').val($(this).closest('tr').attr('operatinghourend'));
                    $('#udyog_card_no1').val($(this).closest('tr').attr('udyog_no1'));
                    $('#pan_card_no1').val($(this).closest('tr').attr('pan_no1'));
                    $('#gst_no1').val($(this).closest('tr').attr('gst_no1'));
                });

                if (window.File && window.FileList && window.FileReader) {
                    $("#pan-file1").on('change', function(e) {
                        var files = e.target.files
                        filesLength = files.length
                        for (var i=0; i<filesLength; i++) {
                            var f = files[i]
                            var fileReader = new FileReader();
                            fileReader.onload = (function(e) {
                                var file = e.target;
                                $("#pancard").attr('src',e.target.result)
                            })
                            fileReader.readAsDataURL(f);
                        }
                    })

                    $("#gst-file1").on('change', function(e) {
                        var files = e.target.files
                        filesLength = files.length
                        for (var i=0; i<filesLength; i++) {
                            var f = files[i]
                            var fileReader = new FileReader();
                            fileReader.onload = (function(e) {
                                var file = e.target;
                                $("#gstfile").attr('src',e.target.result)
                            })
                            fileReader.readAsDataURL(f);
                        }
                    })
                } else {
                    toastr.error("Your browser doesn't support to File API")
                }

                $('#update-branch-btn').on('click', function(e){
                    if(!$("#location-name").val()){
                        toastr.error('Please Enter Location Name')
                        return;
                    }
                    if(!$('#udyog_card_no1').val()){
                        toastr.error('Please Enter Udyog Card Number')
                        return;
                    }
                    if(!$('#pan_card_no1').val()){
                        toastr.error('Please Enter Valid Pan Card Number')
                        return;
                    }
                    if(!$('#gst_no1').val()){
                        toastr.error('Please Enter Valid GST Number')
                        return;
                    }
                    if(!$('#phone1').val()){
                        return;
                    }
                    if(!$('#email1').val()){
                        return;
                    }
                    if(!$('#address_line11').val()){
                        toastr.error('Please Fill Address Line 1')
                        return;
                    }
                    if(!$('#address_line22').val()){
                        toastr.error('Please Fill Address Line 2')
                        return;
                    }
                    if(!$('#pincode_id1').val()){
                        toastr.error('Please Enter Pincode Number')
                        return;
                    }
                    if(!$('#operatinghr_from1').val()){
                        toastr.error('Please Select Operating From hours')
                        return;
                    }
                    if(!$('#operatinghr_to1').val()){
                        toastr.error('Please Select Operating to hours')
                        return;
                    }
                    var location_id = $("#location-id").val();
                    var location_name =  $("#location-name").val();
                    var address_line11= $('#address_line11').val();
                    var address_line22 =  $('#address_line22').val();
                    var pincode_id1 =  $('#pincode_id1').val();
                    var state_id1= $('#state_id1').val();
                    var city_id1 =$('#city_id1').val();
                    var phone1 =  $('#phone1').val();
                    var email1 = $('#email1').val();
                    var operatinghr_from1 = $('#operatinghr_from1').val();
                    var operatinghr_to1 = $('#operatinghr_to1').val();
                    var udyog_card_no =$('#udyog_card_no1').val();
                    var pan_card_no=$('#pan_card_no1').val();
                    var gst_no=$('#gst_no1').val()

                    $.ajax({
                        url : '/app/marketing/leads/update_location',
                        data :{
                            location_id: location_id,
                            location_name : location_name,
                            address_line11 : address_line11,
                            address_line22 : address_line22,
                            pincode_id1 : pincode_id1,
                            phone1 : phone1,
                            email1 : email1,
                            state_id1:state_id1,
                            city_id1:city_id1,
                            operatinghr_from1: operatinghr_from1,
                            operatinghr_to1: operatinghr_to1,
                            udyog_card_no:udyog_card_no,
                            pan_card_no:pan_card_no,
                            gst_no:gst_no,
                            _csrf: '<%= _csrf %>',
                            _csrf: _csrf,
                        },
                        method: 'POST',
                        success: function (data) {
                            window.location ="/app/marketing/leads"
                        },
                        error: function (data, status, error) {
                            alert("not successfull")
                        }
                    })
                })
                // $("#leads-list tbody ").on('click', function () {
                //     var id = $(this).closest("tr").find('td:eq(0)').text();
                //     alert("ujuij" + id)
                // })

                $(document).on('change','.js-switch', function() {
                    var location_id = ($(this).closest('tr').attr('lead_id'))
                    if($(this).prop('checked')){
                        var status = 1
                    } else {
                        var status = 0
                    }
                    $.ajax({
                        url: "/app/marketing/leads/updateStatus",
                        data: {
                            location_id: location_id,
                            status:status,
                            _csrf: _csrf,
                        },
                        method: 'POST',
                        success: function (data) {
                            window.location = "/app/marketing/leads"
                        },
                        error: function (data, status, error) {
                            toastr.error("not successfull")
                        }
                    });
                })
                $("#delete-branch-btn").click(function (e) {
                    var location_id = $("#location-id").val();
                   

                    $.ajax({
                        url: "/app/marketing/leads/delete-location",
                        data: {

                            location_id: location_id,
                            _csrf: '<%= _csrf %>',
                            _csrf: _csrf,
                        },

                        method: 'POST',
                        success: function (data) {
                            // alert("successfully")
                            //window.location = "/api/v1/branduserteam/view-all"; 
                            window.location = "/app/marketing/leads"
                        },
                        error: function (data, status, error) {
                            // alert("not successfull")
                        }
                    });
                });


                // table.on('click', 'tr', function () {
                //     if (table.row(this).node() !== null) {
                //         var leadId = $(table.row(this).node()).attr('data-lead-id');
                //         location.href = location.href + '/' + leadId;
                //     }
                // });

                // $('#apply-filter').on('click', function () {
                //     var table = $('#leads-list').dataTable();
                //     var tableSettings = table.fnSettings();
                //     tableSettings.ajax.data = {
                //         filter: {
                //             from: $('#from').val(),
                //             to: $('#to').val(),
                //             gender: $('#gender').val(),
                //             source: $('#source').val(),
                //             status: $('#status').val(),
                //             leadOwner: $('#team').val(),
                //         }
                //     }
                //     table.fnDraw();
                //     $('#filter').modal('hide');
                //     $('#reset-filter-btn').show();
                // })

                // $('#reset-filter-btn').on('click', function () {
                //     var table = $('#leads-list').dataTable();
                //     var tableSettings = table.fnSettings();
                //     tableSettings.ajax.data = {}
                //     table.fnDraw();
                //     $('#reset-filter-btn').hide();
                // })

                $(document).on('change', "#email, #email1", ()=>{
                    $("#email").removeClass('is-valid');
                    $("#email").removeClass('is-invalid');
                    $("#email1").removeClass('is-valid');
                    $("#email1").removeClass('is-invalid');
                    var hasError = false;
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    var panno = $("#email").val()
                    if(!regex.test(panno)){
                        toastr.error("Please enter valid Email Address")
                        hasError = true
                        $("#email").addClass('is-invalid')
                        $("#email1").addClass('is-invalid')
                    }else{
                        $("#email").addClass('is-valid')
                        $("#email1").addClass('is-valid')
                    }
                    if(hasError == true) { return false; }
                })

                $(document).on('change', "#phone, #phone1", function() {
                    $("#phone").removeClass('is-valid');
                    $("#phone").removeClass('is-invalid');
                    $("#phone1").removeClass('is-valid');
                    $("#phone1").removeClass('is-invalid');
                    var hasError = false;
                    if ($("#phone").val().length != 10) {
                        toastr.error("Please enter valid Phone number")
                        hasError = true
                        $("#phone").addClass('is-invalid')
                        $("#phone1").addClass('is-invalid')
                    }else{
                        $("#phone").addClass('is-valid')
                        $("#phone1").addClass('is-valid')
                    }
                    if(hasError == true) { return false; }
                })
                
                $(document).on('change', "#pan_card_no", function() {
                    $("#pan_card_no").removeClass('is-valid');
                    $("#pan_card_no").removeClass('is-invalid');
                    var hasError = false;
                    const regex = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/
                    var panno = $("#pan_card_no").val()
                    if(!regex.test(panno)){
                        toastr.error("Please enter valid Pan number")
                        hasError = true
                        $("#pan_card_no").addClass('is-invalid')
                    }else{
                        $("#pan_card_no").addClass('is-valid')
                    }
                    if(hasError == true) { return false; }
                })

                $(document).on('change', "#gst_no", ()=>{
                    $("#gst_no").removeClass('is-valid');
                    $("#gst_no").removeClass('is-invalid');
                    var hasError = false;
                    const regex = /^([0-2][0-9]|[3][0-7])[A-Z]{3}[ABCFGHLJPTK][A-Z]\d{4}[A-Z][A-Z0-9][Z][A-Z0-9]$/;
                    var gstinno = $("#gst_no").val()
                    if(!regex.test(gstinno)){
                        toastr.error("Please enter valid GST number")
                        hasError = true
                        $("#gst_no").addClass('is-invalid')
                    }else{
                        $("#gst_no").addClass('is-valid')
                    }
                    if(hasError == true) { return false; }
                })

                $(document).on('change', "#gst_no , #pan_card_no", function() {
                    if($("#gst_no").hasClass("is-valid") && $("#pan_card_no").hasClass('is-valid')) {
                        $("#add-lead-btn").prop('disabled', false)
                    }
                })

                $('#from').datetimepicker({
                    format: 'D/M/Y'
                });
                $('#to').datetimepicker({
                    format: 'D/M/Y'
                });

                $('#state_id').on('change', function () {
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
                                $('#city_id').empty().append('<option value="">Select City</option>');
                                data.cities.forEach((c) => {
                                    $('#city_id').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
            
                $('#state_id1').on('change', function () {
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
                                $('#city_id1').empty().append('<option value="">Select City</option>');
                                data.cities.forEach((c) => {
                                    $('#city_id1').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })

                $('#pincode_id').on('keyup', function (){
                    $element =$(this)

                    if($element.val().length > 6){
                        toastr.error('Please enter a valid 6 digit zip')
                        return
                    }
                })
            });

        }
    };
}());