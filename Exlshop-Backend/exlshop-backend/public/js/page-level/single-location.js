var SINGLE_LOCATION = SINGLE_LOCATION || (function () {
    var _args = {};
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const locationInfo = JSON.parse(_args.locationInfo);
            
            $(document).ready(function () {
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/super-admin/brands/locations/team/get-team',
                        headers: {
                            'csrf-token': _csrf
                        },
                        data:{
                            locationId : locationInfo.id
                        }
                    },
                    'columns': [
                        {'data': 'id'},
                        {'data': 'user_name'},
                        {'data': 'email'},
                        {'data': 'phone'},
                        {'data': 'role_name'},
                        {'render': function(data, type, row, meta){
                            data = '<a href="#" data-toggle="modal" data-target="#add-new-team-member" team_member_id="'+row.id+'" class="update-team-member">\n\
                                        <i class="fa fa-pencil" aria-hidden="true" > </i></a>&nbsp;&nbsp;\n\
                                    <a href="#" data-toggle="modal" data-target="#delete-team-member" class="delete-team-member-btn" team-member-id="'+row.id+'">\n\
                                        <i class="fa fa-trash" aria-hidden="true"></i>\n\
                                    </a>';
                            return data;
                            }
                        }
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        }]
                };
                var table = $('#team-member-list').DataTable(dataTableOpt);

                $('#location-information input, #location-information select').on('change', function () {
                    var value = $(this).val();
                    const col = $(this).attr('name');

                    if (col === 'is_active') {
                        value = $(this).prop('checked') ? 1 : 0
                    }

                    if(col=="phone"){
                        $element = $(this);
                        const regex = /^\d+$/
                        if ($element.val().length !== 10 || !regex.test($element.val())) {
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid 10 digit phone number')                            
                            return
                        }
                        else{
                            $element.removeClass('is-invalid').next('.invalid-feedback').text('')
                        }
                    }
                    if(col=="zip"){
                        $element = $(this);
                        const regex = /^\d+$/
                        if ($element.val().length !== 6 || !regex.test($element.val())) {
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid 6 digit Pin Code')                            
                            return
                        }
                        else{
                            $element.removeClass('is-invalid').next('.invalid-feedback').text('')
                        }
                    }
                    if(col=="gstin") {
                        $element = $(this);
                        const regex = /^([0-2][0-9]|[3][0-7])[A-Z]{3}[ABCFGHLJPTK][A-Z]\d{4}[A-Z][A-Z0-9][Z][A-Z0-9]$/;

                        if (!regex.test($element.val())) {
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid GST number'); 
                            return                             
                        }else{
                            $element.removeClass('is-invalid').next('.invalid-feedback').text('');
                        }
                    }
                    if(col=="lat") {
                        $element = $(this)
                        const regex = /^[+-]?(([1-8]?[0-9])(\.[0-9]{1,6})?|90(\.0{1,6})?)$/;
                        if(!regex.test($element.val())){
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid latitude')
                            return  
                        }else{
                            $element.removeClass('is-invalid').next('.invalid-feedback').text('');
                        }
                    }
                    if(col=="long") {
                        $element = $(this)
                        const regex = /^[+-]?((([1-9]?[0-9]|1[0-7][0-9])(\.[0-9]{1,6})?)|180(\.0{1,6})?)$/;;
                        if(!regex.test($element.val())){
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid latitude')
                            return  
                        }else{
                            $element.removeClass('is-invalid').next('.invalid-feedback').text('');
                        }
                    }
                    $.ajax({
                        url: '/super-admin/brands/locations/update',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            col,
                            value,
                            locationId: locationInfo.id
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Successfully Updated!')
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })

                var activeStatus = $("#brand-active").attr("activestatus")
                $("#panel-action").click(function (){
                        if(activeStatus == 0){
                            var changeStatus = 1
                            $.ajax({
                                url: `/super-admin/brands/locations/updateActiveStatus`,
                                method: "post",
                                data: {
                                    _csrf: _csrf,
                                    changeStatus,
                                    locationId: locationInfo.id
                                },
                                success: function (data) {
                                        if(data.success) {
                                            toastr.success('Successfully Updated!')
                                            location.reload(true)
                                        }else{
                                            toastr.error('Some error occurred')
                                        }   
                                    }
                            })
                        }
                       if(activeStatus == 1){
                            var changeStatus = 0
                            $.ajax({
                                url: `/super-admin/brands/locations/updateActiveStatus`,
                                method: "post",
                                data: {
                                    _csrf: _csrf,
                                    changeStatus,
                                    locationId: locationInfo.id
                                },
                                success: function (data) {
                                        if(data.success) {
                                            toastr.success('Successfully Updated!')
                                            location.reload(true)
                                        }else{
                                            toastr.error('Some error occurred')
                                        }   
                                }
                            })
                        }
                })
              
                $('#state').on('change', function () {
                    const stateId = $(this).val()
                    $.ajax({
                        url: '/super-admin/common/get-cities',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            stateId
                        },
                        success: function (data) {
                            if (data.success && data.cities.length > 0) {
                                $('#city').empty().append('<option>Select City</option>');
                                data.cities.forEach((c) => {
                                    $('#city').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })

                $('#user-password, #user-confirm-password').on('change', function () {
                    if ($('#user-password').val() !== $('#user-confirm-password').val()) {
                        $('#password-mismatch').css('display', 'block');
                        $('#add-new-team-member-btn').attr('disabled', true);
                    } else {
                        $('#password-mismatch').hide();
                        $('#add-new-team-member-btn').attr('disabled', false);
                    }
                })

                $('#user-email').on('change', function () {
                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid email address')
                        $('#add-new-team-member-btn').attr('disabled', true);
                        return
                    }
                    $.ajax({
                        url: '/email-valid',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            email: $element.val()
                        },
                        success: function (data) {
                            if (!data.valid) {
                                $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Email already exists')
                                $('#add-new-team-member-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-team-member-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                $('#user-phone').on('change', function () {
                    $element = $(this);
                    if ($element.val().length !== 10) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid 10 digit phone number')
                        $('#add-new-team-member-btn').attr('disabled', true);
                        return
                    }
                    $.ajax({
                        url: '/phone-valid',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            phone: $element.val()
                        },
                        success: function (data) {
                            if (!data.valid) {
                                $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Phone Number already exists')
                                $('#add-new-team-member-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-team-member-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                $(document).on('click','.delete-team-member-btn',function () {
                    $('#team-member-id').val($(this).attr('team-member-id'));
                })

                $(document).on('click','.update-team-member',function () {
                    var id = $(this).attr('team_member_id');
                  
                    $.ajax({
                        url: '/super-admin/brands/locations/team/get-single-member',
                        method: 'POST',
                        data: {
                            userId: id,
                            _csrf: _csrf,
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#update-team-member-id').val(id);
                                $('#user-fname').val(data.user.fname);
                                $('#user-lname').val(data.user.lname);
                                $('#user-email').val(data.user.email);
                                $('#user-phone').val(data.user.phone);
                                $('#role option[value='+data.user.roles_id+']').attr('selected','selected');
                            } 
                        }
                    });
                    $('#update-team-member-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-new-team-member-btn').addClass('display-hidden').removeClass('display-block');
                    $('#team-member-form').attr('action','/super-admin/brands/locations/team/update-team-member');
                    $('#add-new-team-member .modal-title').text('Update Team Member');
                    $('#user-password').addClass('display-hidden').removeClass('display-block').attr('required',false);
                    $('#user-confirm-password').addClass('display-hidden').removeClass('display-block').attr('required',false);
                })
                $("#add-new-team-member-btn").click(function(e){
                    var fname=$("#user-fname").val();  
                    var lname=$("#user-lname").val();
                    var email=$("#user-email").val();
                    var phone=$("#user-phone").val();
                    var password= $("#user-password").val();
                    var cpassword=$("#user_confirm_password").val();
                    var role = $("#role").val(); 
                    var lid= $("#lid").val(); 
                            
                    $.ajax({
                        url: "/super-admin/brands/locations/team/add-new-member",
                        data:{
                            fname:fname,
                            lname:lname,
                            email:email,
                            phone:phone,
                            password:password,
                            cpassword:cpassword,
                            role:role,
                           lid:lid,
                            _csrf: _csrf
                            },	
                              method: 'POST',					
                              success: function(data) {
                                toastr.success('Team Member Added successfully!');
                                location.reload(true); 
                               },
                              error: function(data,status,error) {
                                toastr.error('Some error occurred')
                               }
                    });			
                });				
           
                $('#add-team-member-btn').click(function () {
                    $('#update-team-member-btn').removeClass('display-block').addClass('display-hidden');
                    $('#add-new-team-member-btn').removeClass('display-hidden').addClass('display-block');
                    $('#team-member-form').attr('action','/super-admin/brands/locations/team/add-new-member');
                    $('#add-new-team-member .modal-title').text('Add New Team Member');
                    $('#user-password').removeClass('display-hidden').addClass('display-block').attr('required',true);
                    $('#user-confirm-password').removeClass('display-hidden').addClass('display-block').attr('required',true);
                    $('#team-member-form').find('input').val('');
                    $('#team-member-form').find('select').val('');
                })
            });
        }
    };
}());