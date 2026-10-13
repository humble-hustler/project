var TEAMS = TEAMS || (function () {
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
                        // 'url': '/api/v1/branduserteam/view-all',
                       'url': '/super-admin/brands/locations/team/view-all',
                       
                        data: {
                            _csrf: _csrf
                        }
                    },
                    'columns': [
                        {'data': 'id'},
                        {'data': 'user_name'},
                        {'data': 'email'},
                        {'data': 'phone'},
                        {'data': 'role_name'},
                        {'data': 'brand_location_name'},
                        {'render': function(data, type, row, meta){
                            data = '<a href="#" data-toggle="modal" data-target="#add-new-team-member"  class="update-team-member">\n\
                                        <i class="fa fa-pencil" aria-hidden="true" > </i></a>&nbsp;&nbsp;\n\
                                    <a href="#" data-toggle="modal" data-target="#delete-team-member" class="delete-team-member-btn">\n\
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
                        }],
                    'order':[[0,'asc']],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('user_id', data.id);
                        $(row).attr('fname', data.user_name);

                    }
                };

                var table = $('#team-list').DataTable(dataTableOpt);

                $('#user-password, #user-confirm-password').on('change', function () {
                    if ($('#user-password').val() !== $('#user-confirm-password').val()) {
                        $('#user-confirm-password').removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Passwords do not match')
                        // $('#password-mismatch').css('display', 'block');
                        $('#add-new-team-member-btn').attr('disabled', true);
                    } else {
                        // $('#password-mismatch').hide();
                         $('#user-confirm-password').removeClass('is-invalid').addClass('is-valid').next('.invalid-feedback').text('');
                        $('#add-new-team-member-btn').attr('disabled', false);
                    }
                })

                $('#user-email').on('change', function () {
                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid email address')
                        $('#add-new-team-member-btn').attr('disabled', true);
                        $('#update-team-member-btn').attr('disabled', true);
                        
                        return false;
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
                                $('#update-team-member-btn').attr('disabled', true);

                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid').next('.invalid-feedback').text('');
                                $('#add-new-team-member-btn').attr('disabled', false)
                                $('#update-team-member-btn').attr('disabled', false);

                            }
                        }
                    });
                })

                $('#user-phone').on('change', function () {
                    $element = $(this);
                    const regex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid Phone Number111')
                        $('#add-new-team-member-btn').attr('disabled', true);
                        return false;
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
                                $element.removeClass('is-invalid').addClass('is-valid').next('.invalid-feedback').text('');
                                $('#add-new-team-member-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                $('#user-lname').on('change',function(){
                    $element = $(this);
                    const regex = /^[A-Za-z]+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid Last name')
                        $('#add-new-team-member-btn').attr('disabled', true);
                        $('#update-team-member-btn').attr('disabled', true);
                        return false
                    }
                    else{
                        $element.removeClass('is-invalid').addClass('is-valid').next('.invalid-feedback').text('');
                        $('#add-new-team-member-btn').attr('disabled', false);
                        $('#update-team-member-btn').attr('disabled', false);
                        return true
                    }
                })
                $('#user-fname').on('change',function(){
                    $element = $(this);
                    const regex = /^[A-Za-z]+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid First name')
                        $('#add-new-team-member-btn').attr('disabled', true);
                        $('#update-team-member-btn').attr('disabled', true);

                        return false
                    }
                    else{
                        $element.removeClass('is-invalid').addClass('is-valid').next('.invalid-feedback').text('');
                        $('#add-new-team-member-btn').attr('disabled', false);
                        $('#update-team-member-btn').attr('disabled', false);
                        return true
                    }
                })
                $('#location').select2({
                   
                    placeholder: 'Search Location',
                    ajax: {
                        url: '/super-admin/brands/search/location',
                        method: 'POST',
                        headers: {
                            'csrf-token': _csrf
                        },
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    text: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.locations.forEach((l) => {
                                    searchResult.push({
                                        id: l.id,
                                        text: `${l.location_name} | ${l.brand_name}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                // $(document).on('click','.update-team-member',function () {
                //     var userId = $(this).closest('tr').attr('user_id');
                //     $.ajax({
                //        // url: '/super-admin/brands/locations/team/get-single-member',
                //          url:"/api/v1/users/getsingle",
                //         method: 'POST',
                //         data: {
                //             _csrf: _csrf,
                //             userId
                //         },
                //         success: function (data) {
                //             if(data.user){
                //                 $('#update-team-member-id').val(userId);
                //                 $('#user-fname').val(data.user.fname);
                //                 $('#user-lname').val(data.user.lname);
                //                 $('#user-email').val(data.user.email);
                //                 $('#user-phone').val(data.user.phone);
                //                 $('#role').val(data.user.roles_id);
                //                 $('#location').append('<option value='+data.user.brand_locations_id+' selected>'+data.user.brand_location_name+'</option>');
                //             }
                //         }
                //     });
                //     $('#update-team-member-btn').addClass('display-block').removeClass('display-hidden');
                //     $('#add-new-team-member-btn').addClass('display-hidden').removeClass('display-block');
                //     $('#team-member-form').attr('action','/super-admin/brands/locations/team/update-team-member');
                //     $('#user-password').addClass('display-hidden').removeClass('display-block').attr('required',false);
                //     $('#user-confirm-password').addClass('display-hidden').removeClass('display-block').attr('required',false);
                // })

                $('#add-team-member-btn').click(function () {
                    $('#update-team-member-btn').removeClass('display-block').addClass('display-hidden');
                    $('#add-new-team-member-btn').removeClass('display-hidden').addClass('display-block');
                    // $('#team-member-form').attr('method',"post");
                    $('#user-password').removeClass('display-hidden').addClass('display-block').attr('required',true);
                    $('#user-confirm-password').removeClass('display-hidden').addClass('display-block').attr('required',true);
                    $('#team-member-form .form-body').find('input').val('');
                    $('#team-member-form').find('#role').val('');
                    $('#team-member-form').find('#location').empty();
                })

                $(document).on('click','.delete-team-member-btn', function () {
                    $('#team-member-id').val($(this).closest('tr').attr('user_id'));
                })

                $(document).on('click','.update-team-member',function () {
                    var userId = $(this).closest('tr').attr('user_id');

                    $.ajax({
                       url: '/super-admin/brands/locations/team/get-single-member',
                        // url:"/api/v1/users/getsingle",
                        method: 'POST',
                        data: {
                            _csrf:  _csrf,
                            userId
                        },
                        success: function (data) {
                            if(data.user){
                                $('#update-team-member-id').val(userId);
                                $('#user-fname').val(data.user.fname);
                                $('#user-lname').val(data.user.lname);
                                $('#user-email').val(data.user.email);
                                $('#user-phone').val(data.user.phone);
                                $('#role').val(data.user.roles_id);
                                $('#location').append('<option value='+data.user.brand_locations_id+' selected>'+data.user.brand_location_name+'</option>');
                            }
                        }
                    });
                    $('#update-team-member-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-new-team-member-btn').addClass('display-hidden').removeClass('display-block');
                    $('#team-member-form').attr('method',"post");
                    $('#team-member-form').attr('action',"/super-admin/brands/locations/team/update-team-member");
                    $('#user-password').addClass('display-hidden').removeClass('display-block').attr('required',false);
                    $('#user-confirm-password').addClass('display-hidden').removeClass('display-block').attr('required',false);
                })
                $("#update-team-member-btn").click(function(e){
                    var id = $(this).attr('value');
                    var uid =$("#update-team-member-id").val();
                    var fname=$("#user-fname").val();  
                    var lname=$("#user-lname").val();
                    var email=$("#user-email").val();
                    var phone=$("#user-phone").val();
                    var role = $("#role").val(); 
                    var lid= $("#location").val(); 
                    alert(email)

                    $.ajax({
                        url: "/super-admin/brands/locations/team/update-team-member",
                       // "url":"/api/v1/user1/update-member",
                       
                        data:{
                            uid:uid,
                            fname:fname,
                            lname:lname,
                            email:email,
                            phone:phone,
                            role:role,
                            lid:lid,
                            _csrf:  _csrf
                        },  
                        method : 'POST',                          				
                              success: function(data) {
                                toastr.success('Team Member Updated successfully!');
                                window.location="/super-admin/brands/team";
                               // = "/super-admin/brands/team";                  
                               },
                              error: function(data,status,error) {
                                toastr.error('Some error occurred')
                               }
                    });			
                });				
                       
                $("#add-new-team-member-btn").click(function(e){
                    
                    var text = $('.invalid-feedback').text();
                    if(text != ''){
                        $('#add-new-team-member-btn').attr('disabled', true);
                        alert("Please enter Valid Data");

                    }
                    else if(text == ''){
                        $('#add-new-team-member-btn').attr('disabled', false);
                        var fname=$("#user-fname").val();  
                        var lname=$("#user-lname").val();
                        var email=$("#user-email").val();
                        var phone=$("#user-phone").val();
                        var password= $("#user-password").val();
                        var cpassword=$("#user_confirm_password").val();
                        var role = $("#role").val(); 
                        var lid= $("#location").val(); 
                        alert(lid)            
                        $.ajax({
                        //    url: "/api/v1/branduserteam/add-team-member",
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
                                  _csrf:  _csrf },	
                                  method: 'POST',					
                                  success: function(data) {
                                    toastr.success('Team Member Added successfully!');
                                   window.location = "/super-admin/brands/team";                  
                                   },
                                  error: function(data,status,error) {
                                    toastr.error('Some error occurred')
                                   }
                        });	
                       
                    }
                    		
                });				
           
                $("#delete-tax-btn").click(function(e){
                    var team_member_id=$("#team-member-id").val();  
                    alert(team_member_id)            
                    $.ajax({
                        url: "/api/v1/branduserteam/delete-team-member",
                        data:{
                          team_member_id:team_member_id,
                              _csrf: '<%= _csrf %>'},	
                              method: 'POST',					
                              success: function(data) {
                                toastr.success('Team  Member Deleted successfully!');
                               window.location="/super-admin/brands/team"                 
                               },
                              error: function(data,status,error) {
                                toastr.error('Some error occurred')
                               }
                    });			
                });				
            
            });
        }
    };
}());
