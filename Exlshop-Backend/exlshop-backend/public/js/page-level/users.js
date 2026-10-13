var USERS = USERS || (function () {
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
                        // 'url': '/api/v1/user1/view-all',
                       'url': '/super-admin/settings/user/view-all',
                        headers: {
                            'csrf-token': _csrf
                        },
                        data:{
                        }
                    },
                    'columns': [
                        {'data': 'id'},
                        {'data': 'user_name'},
                        {'data': 'email'},
                        {'data': 'phone'},
                        {'data': 'shop_name'},
                        { 'render': function(data, type, row, meta){
                            data = '<a href="#" data-toggle="modal" data-target="#add-new-user" class="update-user">\n\
                            <i class="fa fa-pencil" aria-hidden="true" > </i></a>&nbsp;&nbsp;\n\
                        <a href="#" data-toggle="modal" data-target="#delete-user" class="delete-user-btn">\n\
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
                    },
                };

                var table = $('#user-list').DataTable(dataTableOpt);


                table.on('click', 'tr td:not(:last-child)', function () {
                    var user_id = $(this).closest('tr').attr('user_id');
                    window.location.href=`/super-admin/settings/user/${user_id}`;
                });

                $('#user-password, #user-confirm-password').on('change', function () {
                    if ($('#user-password').val() !== $('#user-confirm-password').val()) {
                        $('#password-mismatch').css('display', 'block');
                        $('#add-new-user-btn').attr('disabled', true);
                    } else {
                        $('#password-mismatch').hide();
                        $('#add-new-user-btn').attr('disabled', false);
                    }
                })

                $('#user-fname').on('change',function(){
                    $element = $(this);
                    const regex = /^[A-Za-z]+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid First name')
                        $('#add-new-user-btn').attr('disabled', true);
                        return false
                    }
                    else{
                        $element.removeClass('is-invalid').addClass('is-valid');
                        $('#add-new-user-btn').attr('disabled', false);
                        return true
                    }
                })
                $('#user-lname').on('change',function(){
                    $element = $(this);
                    const regex = /^[A-Za-z]+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid Last name')
                        $('#add-new-user-btn').attr('disabled', true);
                        return false
                    }
                    else{
                        $element.removeClass('is-invalid').addClass('is-valid');
                        $('#add-new-user-btn').attr('disabled', false);
                        return true
                    }
                })
                $('#user-email').on('change', function () {
                    // alert('hiii')

                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid email address')
                        $('#add-new-user-btn').attr('disabled', true);
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
                                $('#add-new-user-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-user-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                $('#user-phone').on('change', function () {
                    $element = $(this);

                    const regex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid Phone Number')
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
                                $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Phone Number already Registered.')
                                $('#add-new-user-btn').attr('disabled', true)
                            } else {
                                $element.removeClass('is-invalid').addClass('is-valid')
                                $('#add-new-user-btn').attr('disabled', false)
                            }
                        }
                    });
                })

                $(document).on('click','.delete-user-btn',function () {
                    $('#user-id').val($(this).closest('tr').attr('user_id'));
                })

                $(document).on('click','.update-user',function () {
                    $('#update-user-id').val($(this).closest('tr').attr('user_id'));
                    var id = $(this).closest('tr').attr('user_id');
                    $.ajax({
                        url: '/super-admin/settings/user/get-single',
                        method: 'POST',
                        headers: {
                            'csrf-token': _csrf
                        },
                        data: {
                            userId: id,
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#update-user-id').val(id);
                                $('#user-fname').val(data.user.fname);
                                $('#user-lname').val(data.user.lname);
                                $('#user-email').val(data.user.email);
                                $('#user-phone').val(data.user.phone);
                            } 
                        }
                    });
                    $('#update-user-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-new-user-btn').addClass('display-hidden').removeClass('display-block');
                    $('#user-form').attr('action','/super-admin/settings/user/update');
                    $('#add-new-user .modal-title').text('Update User');
                    $('#user-password').addClass('display-hidden').removeClass('display-block').attr('required',false);
                    $('#user-confirm-password').addClass('display-hidden').removeClass('display-block').attr('required',false);
                })

                $('#add-new-su-user-btn').click(function () {
                    $('#update-user-btn').removeClass('display-block').addClass('display-hidden');
                    $('#add-new-user-btn').removeClass('display-hidden').addClass('display-block');
                    $('#user-form').attr('action','/super-admin/settings/user/add');
                    $('#add-new-user .modal-title').text('Add New User');
                    $('#user-password').removeClass('display-hidden').addClass('display-block').attr('required',true);
                    $('#user-confirm-password').removeClass('display-hidden').addClass('display-block').attr('required',true);
                    $('#user-form .form-body').find('input').val('');
                    $('#user-form').find('select').val('');
                })

               
                $("#add-new-user-btn").click(function(e){
                   
                    var fname=$("#user-fname").val();  
                    var lname=$("#user-lname").val();
                    var email=$("#user-email").val();
                    var phone=$("#user-phone").val();
                    var password= $("#user-password").val();
                    var cpassword=$("#user-confirm-password").val();          
                    $.ajax({
                        // url: "/api/v1/user1/user-add",
                        url : "/super-admin/settings/user/add",
                        data:{
                          user_fname:fname,
                          user_lname:lname,
                          user_email:email,
                          user_phone:phone,
                          user_password:password,
                          //cpassword:cpassword,
                              _csrf: _csrf},	
                              method: 'POST',					
                              success: function(data) {
                                  if(data.success){
                                    toastr.success('User Added successfully!');
                                    window.location = "/super-admin/settings/users"; 
                                  }                 
                               },
                              error: function(data,status,error) {
                                toastr.error('Some error occurred')
                               }
                    });			
                });				
              
                $("#update-user-btn").click(function(e){
                    var id=$("#update-user-id").val();
                    var fname=$("#user-fname").val();  
                    var lname=$("#user-lname").val();
                    var email=$("#user-email").val();
                    var phone=$("#user-phone").val();
                    var password= $("#user-password").val();
                    var cpassword=$("#user-confirm-password").val();         
                    $.ajax({
                        // url: "/super-admin/settings/user/update",
                        url:  "/api/v1/user1/user-update",
                        data:{
                          update_user_id:id,
                          user_fname:fname,
                          user_lname:lname,
                          user_email:email,
                          user_phone:phone,
                              _csrf: '<%= _csrf%>'},	
                              method: 'POST',					
                              success: function(data) {
                                toastr.success('Brand Added successfully!');
                               window.location = "/super-admin/settings/users";                  
                               },
                              error: function(data,status,error) {
                                toastr.error('Some error occurred')
                               }
                    });			
                });			
              
                
                $(document).on('click','.delete-user-btn', function () {
                    $('#user_id').val($(this).closest('tr').attr('user_id'));
                })
                $("#delete-tax-btn").click(function(e){
                    var user_id=$("#user_id").val();  
                    alert(user_id)    
                           
                    $.ajax({
                        //url: "/super-admin/settings/user/delete",
                        url :"/api/v1/user1/user-delete",
                        data:{
                            user_id:user_id,
                              _csrf: '<%= _csrf %>'},	
                              method: 'POST',					
                              success: function(data) {
                                toastr.success('User Deleted successfully!');
                               window.location = "/super-admin/settings/users";                  
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