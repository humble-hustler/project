var SMS_SETTING = SMS_SETTING || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;

            $('.js-switch').each(function(){
                var elem = $(this);
                var init = new Switchery(elem);
            })
            
          

            $(document).ready(function () {
                $('#send-sms').click(function(){
                    if($('#sms-message').val()){
                        var filter = {};
                        var send_to_enquiry=0, send_to_member=0, outstanding_all_val='';
                        if($('#sms-plan').val() == 'all' || $('#sms-plan').val() == 'all-enquiry' || $('#sms-plan').val() == 'enquiry-wise' || $('#sms-plan').val() == 'trial-wise'){
                            send_to_enquiry = 1;
                        }
                        if($('#sms-plan').val() == 'all' || $('#sms-plan').val() == 'all-member' || $('#sms-plan').val() == 'plan-wise' || $('#sms-plan').val() == 'age-wise' || $('#sms-plan').val() == 'member-wise'|| $('#sms-plan').val() == 'family-members' || $('#sms-plan').val() == 'outstanding' || $('#sms-plan').val() == 'renewals'){
                            send_to_member = 1;
                        }
                        if($('#outstanding').val() == 'all'){
                            $('#outstanding option').each(function(){
                                if($(this).val() != 'all'){
                                    outstanding_all_val += (outstanding_all_val)?(','+$(this).val()):($(this).val())
                                }
                            })
                        }else{
                            outstanding_all_val = $('#outstanding').val();
                        }
                        filter = {
                            status : $('#status').closest('.filter-options').css('display') != 'none' ? $('#status').val() : null,
                            gender : $('#gender').closest('.filter-options').css('display') != 'none' ? $('#gender').val() : null,
                            plan : $('#plan').closest('.filter-options').css('display') != 'none' ? $('#plan').val() : null,
                            age : $('#age').closest('.filter-options').css('display') != 'none' ? $('#age').val() : null,
                            member_list : $('#member-list').closest('.filter-options').css('display') != 'none' ? $('#member-list').val().join() : null,
                            enquiry_list : $('#enquiry-list').closest('.filter-options').css('display') != 'none' ? $('#enquiry-list').val().join() : null,
                            trial: $('#trial').closest('.filter-options').css('display') != 'none' ? $('#trial').val() : null,
                            renewal_type: $('#renewal-type').closest('.filter-options').css('display') != 'none' ? $('#renewal-type').val() : null,
                            renewal : $('#renewal').closest('.filter-options').css('display') != 'none' ? $('#renewal').val() : null,
                            outstanding : $('#outstanding').closest('.filter-options').css('display') != 'none' ? outstanding_all_val : null
                        }
                     
                        $.ajax({
                            url: '/app/settings/get-plan-members',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                filter: filter,
                                send_to_member,
                                send_to_enquiry,
                                message: $('#sms-message').val()
                            },
                            success: function (data) {
                                if(data.success){
                                    memberArray = data.members;
                                    $('#member-list-modal').modal('show');
                                    $('#member-list-table tbody').empty();
                                    $('#send-sms-final').removeClass('display-hidden');
                                    $('#send-email-final').addClass('display-hidden');
                                    //append members
                                    memberArray.forEach(function(d){
                                        $('#member-list-table tbody').append(`<tr id="${d.id}">
                                            <td>${d.fname} ${d.lname}</td>
                                            <td>${d.email}</td>
                                            <td>${d.phone}</td>
                                            <td><center><span class="delete-member"><i class="fa fa-trash"></i></span></center></td>
                                            </tr>`);
                                    })

                                    //delete member
                                    $('.delete-member').click(function(){
                                        var id = $(this).closest('tr').attr('id');
                                        memberArray.splice(memberArray.findIndex(item => item.id === parseInt(id)), 1);
                                        $(this).closest('tr').remove();
                                    })

                                    //send sms ajax
                                    $('#send-sms-final').click(function(){
                                        $.ajax({
                                            url: '/app/settings/send-sms',
                                            method: 'POST',
                                            data: {
                                                _csrf: _csrf,
                                                memberArray: memberArray,
                                                message: $('#sms-message').val(),
                                                send_to_member,
                                                send_to_enquiry,
                                            },
                                            success: function (data) {
                                                if(data.success){
                                                    toastr.success('SMS Send Successfully!');
                                                    window.location.reload();
                                                }else{
                                                    toastr.error('Some error occurred')
                                                }
                                            }
                                        })
                                    })

                                }else{
                                    toastr.error('Some error occurred')
                                }
                            }
                        });
                    }else{
                        alert('Please type a message to send!')
                    }
                })

                $('#send-email').click(function(){
                    if($('#email-message').val()){
                        var filter = {};
                        var send_to_enquiry=0, send_to_member=0,outstanding_all_val='';
                        if($('#email-plan').val() == 'all' || $('#email-plan').val() == 'all-enquiry' || $('#email-plan').val() == 'enquiry-wise' || $('#email-plan').val() == 'trial-wise'){
                            send_to_enquiry = 1;
                        }
                        if($('#email-plan').val() == 'all' || $('#email-plan').val() == 'all-member' || $('#email-plan').val() == 'plan-wise' || $('#email-plan').val() == 'age-wise' || $('#email-plan').val() == 'member-wise'|| $('#email-plan').val() == 'family-members' || $('#email-plan').val() == 'outstanding' || $('#email-plan').val() == 'renewals'){
                            send_to_member = 1;
                        }
                        if($('#email-outstanding').val() == 'all'){
                            $('#email-outstanding option').each(function(){
                                if($(this).val() != 'all'){
                                    outstanding_all_val += (outstanding_all_val)?(','+$(this).val()):($(this).val())
                                }
                            })
                        }else{
                            outstanding_all_val = $('#email-outstanding').val();
                        }
                        filter = {
                            status : $('#email-status').closest('.filter-options-email').css('display') != 'none' ? $('#email-status').val() : null,
                            plan : $('#email-plan-wise').closest('.filter-options-email').css('display') != 'none' ? $('#email-plan-wise').val() : null,
                            age : $('#email-age').closest('.filter-options-email').css('display') != 'none' ? $('#email-age').val() : null,
                            member_list : $('#email-member-list').closest('.filter-options-email').css('display') != 'none' ? $('#email-member-list').val().join() : null,
                            enquiry_list : $('#email-enquiry-list').closest('.filter-options-email').css('display') != 'none' ? $('#email-enquiry-list').val().join() : null,
                            trial: $('#email-trial').closest('.filter-options-email').css('display') != 'none' ? $('#email-trial').val() : null,
                            renewal_type: $('#renewal-type').closest('.filter-options-email').css('display') != 'none' ? $('#renewal-type').val() : null,
                            renewal : $('#email-renewal').closest('.filter-options-email').css('display') != 'none' ? $('#email-renewal').val() : null,
                            outstanding : $('#email-outstanding').closest('.filter-options-email').css('display') != 'none' ? outstanding_all_val : null
                        }
                       
                        $.ajax({
                            url: '/app/settings/get-plan-members',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                filter: filter,
                                send_to_member,
                                send_to_enquiry,
                                message: $('#email-message').val()
                            },
                            success: function (data) {
                                if(data.success){
                                    memberArray = data.members;
                                    $('#member-list-modal').modal('show');
                                    $('#member-list-table tbody').empty();
                                    $('#send-email-final').removeClass('display-hidden');
                                    $('#send-sms-final').addClass('display-hidden');
                                    //append members
                                    memberArray.forEach(function(d){
                                        $('#member-list-table tbody').append(`<tr id="${d.id}">
                                            <td>${d.fname} ${d.lname}</td>
                                            <td>${d.email}</td>
                                            <td>${d.phone}</td>
                                            <td><center><span class="delete-member"><i class="fa fa-trash"></i></span></center></td>
                                            </tr>`);
                                    })

                                    //delete member
                                    $('.delete-member').click(function(){
                                        var id = $(this).closest('tr').attr('id');
                                        memberArray.splice(memberArray.findIndex(item => item.id === parseInt(id)), 1);
                                        $(this).closest('tr').remove();
                                    })

                                    //send email ajax
                                    $('#send-email-final').click(function(){
                                        $.ajax({
                                            url: '/app/settings/send-email',
                                            method: 'POST',
                                            data: {
                                                _csrf: _csrf,
                                                memberArray: memberArray,
                                                message: $('#email-message').val(),
                                                send_to_member,
                                                send_to_enquiry,
                                            },
                                            success: function (data) {
                                                if(data.success){
                                                    toastr.success('Email Send Successfully!');
                                                    window.location.reload();
                                                }else{
                                                    toastr.error('Some error occurred')
                                                }
                                            }
                                        })
                                    })

                                }else{
                                    toastr.error('Some error occurred')
                                }
                            }
                        });
                    }else{
                        alert('Please type a message to send!')
                    }
                })

                //send-sms start
                $('#sms-plan').change(function(){
                    var val = $(this).val();
                    $('#renewal-type').val('');
                    
                    $('.filter-options').each(function(){
                        $(this).addClass('display-hidden');
                    })

                    if(val == 'all'){
                        $('#gender').closest('.filter-options').removeClass('display-hidden col-lg-3').addClass('col-lg-6');
                    }

                    if(val == 'all-member'){
                        $('#status').closest('.filter-options').removeClass('display-hidden');
                        $('#gender').closest('.filter-options').removeClass('display-hidden col-lg-6').addClass('col-lg-3');
                    }

                    if(val == 'all-enquiry'){
                        $('#status').closest('.filter-options').removeClass('display-hidden');
                        $('#gender').closest('.filter-options').removeClass('display-hidden col-lg-6').addClass('col-lg-3');
                    }

                    if(val == 'plan-wise'){
                        $('#plan').closest('.filter-options').removeClass('display-hidden');
                    }

                    if(val == 'age-wise'){
                        $('#age').closest('.filter-options').removeClass('display-hidden');
                    }

                    if(val == 'member-wise'){
                        $('#member-list').closest('.filter-options').removeClass('display-hidden');
                    }

                    if(val == 'enquiry-wise'){
                        $('#enquiry-list').closest('.filter-options').removeClass('display-hidden');
                        $('#enquiry-list').val();
                    }

                    if(val == 'trial-wise'){
                        $('#trial').closest('.filter-options').removeClass('display-hidden');
                    }

                    if(val == 'family-members'){
                        $('#trial').closest('.filter-options').removeClass('display-hidden');
                    }

                    if(val == 'outstanding'){
                        $('#outstanding').closest('.filter-options').removeClass('display-hidden');
                        $('#outstanding').val();
                        $('#outstanding').empty();
                        $.ajax({
                            headers:{
                                'X-CSRF-TOKEN':_csrf
                            },
                            url:'/app/settings/outstanding',
                            method:'POST',
                            data:{
                            },
                            success:function(data){
                                data.members.forEach(function(m){
                                    $('#outstanding').append(`<option value='${m.member_id}'>${m.member_name} ( Rs. ${parseFloat(m.total_amount) - parseFloat(m.amount_paid)})</option>`);
                                })
                                $('#outstanding').append(`<option value="all">All</option>`);
                            }
                        })
                    }

                    if(val == 'renewals'){
                        $('#renewal').closest('.filter-options').removeClass('display-hidden');
                        $('#renewal-type').closest('.filter-options').removeClass('display-hidden');
                        $('#renewal').val();
                        
                    }
                })

                $('#renewal-type').change(function(){
                    $('#renewal').empty();
                    $.ajax({
                        headers:{
                            'X-CSRF-TOKEN':_csrf
                        },
                        url:'/app/settings/renewal',
                        method:'POST',
                        data:{
                            renewalType : $('#renewal-type').val()
                        },
                        success:function(data){
                            data.members.forEach(function(m){
                                $('#renewal').append(`<option value='${m.id}'>${m.member_name} ( ${m.package_name} )</option>`);
                            })
                        }
                    })
                })

                $('#plan, #email-plan-wise').select2({
                    placeholder: 'Search Plan',
                    ajax: {
                        headers:{
                            'X-CSRF-TOKEN':_csrf
                        },
                        url: '/app/packages/search',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    keywords: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.packages.forEach((m) => {
                                    searchResult.push({
                                        id: m.id,
                                        text: `${m.name} `
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                $('#member-list, #email-member-list').select2({
                    placeholder: 'Search Member',
                    ajax: {
                        headers:{
                            'X-CSRF-TOKEN':_csrf
                        },
                        url: '/app/members/search',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    phone: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.members.forEach((m) => {
                                    searchResult.push({
                                        id: m.id,
                                        text: `${m.fname+' '+m.lname} `
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })
                
                $('#enquiry-list, #email-enquiry-list').select2({
                    placeholder: 'Search Member',
                    ajax: {
                        headers:{
                            'X-CSRF-TOKEN':_csrf
                        },
                        url: '/app/marketing/leads/search',
                        method: 'POST',
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
                                data.leads.forEach((m) => {
                                    searchResult.push({
                                        id: m.id,
                                        text: `${m.fname+' '+m.lname} `
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })
                //send sms end

                //send email start
                $('#email-plan').change(function(){
                    var val = $(this).val();
                    $('#email-renewal-type').val('');
                    $('.filter-options-email').each(function(){
                        $(this).addClass('display-hidden');
                    })

                    if(val == 'all'){
                        $('#email-gender').closest('.filter-options-email').removeClass('display-hidden ');
                    }

                    if(val == 'all-member'){
                        $('#email-status').closest('.filter-options-email').removeClass('display-hidden');
                    }

                    if(val == 'all-enquiry'){
                        $('#email-status').closest('.filter-options-email').removeClass('display-hidden');
                    }

                    if(val == 'plan-wise'){
                        $('#email-plan-wise').closest('.filter-options-email').removeClass('display-hidden');
                    }

                    if(val == 'age-wise'){
                        $('#email-age').closest('.filter-options-email').removeClass('display-hidden');
                    }

                    if(val == 'member-wise'){
                        $('#email-member-list').closest('.filter-options-email').removeClass('display-hidden');
                    }

                    if(val == 'enquiry-wise'){
                        $('#email-enquiry-list').closest('.filter-options-email').removeClass('display-hidden');
                        $('#email-enquiry-list').val();
                    }

                    if(val == 'trial-wise'){
                        $('#email-trial').closest('.filter-options-email').removeClass('display-hidden');
                    }

                    if(val == 'family-members'){
                        $('#email-trial').closest('.filter-options-email').removeClass('display-hidden');
                    }

                    if(val == 'outstanding'){
                        $('#email-outstanding').closest('.filter-options-email').removeClass('display-hidden');
                        $('#email-outstanding').val();
                        $('#email-outstanding').empty();
                        $.ajax({
                            headers:{
                                'X-CSRF-TOKEN':_csrf
                            },
                            url:'/app/settings/outstanding',
                            method:'POST',
                            data:{
                            },
                            success:function(data){
                                data.members.forEach(function(m){
                                    $('#email-outstanding').append(`<option value='${m.member_id}'>${m.member_name} ( Rs. ${parseFloat(m.total_amount) - parseFloat(m.amount_paid)})</option>`);
                                })
                                $('#email-outstanding').append(`<option value="all">All</option>`);
                            }
                        })
                    }

                    if(val == 'renewals'){
                        $('#email-renewal').closest('.filter-options-email').removeClass('display-hidden');
                        $('#email-renewal-type').closest('.filter-options-email').removeClass('display-hidden');
                        $('#email-renewal').val();
                        
                    }
                })
                //send email end

                $('#email-renewal-type').change(function(){
                    $('#email-renewal').empty();
                    $.ajax({
                        headers:{
                            'X-CSRF-TOKEN': _csrf
                        },
                        url:'/app/settings/renewal',
                        method:'POST',
                        data:{
                            renewalType : $('#email-renewal-type').val()
                        },
                        success:function(data){
                            data.members.forEach(function(m){
                                $('#email-renewal').append(`<option value='${m.id}'>${m.member_name} ( ${m.package_name} )</option>`);
                            })
                        }
                    })
                })
                //datatable for sms log
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/settings/sms',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'member_name'},
                        {'data': 'phone'},
                        {'data': 'message'},
                        {'data': 'created_date'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },{
                            "targets": 3,
                            "render": function (data, type, row) {
                                //temp fix for time issue
                                return moment(data).utc().format('Do MMM YYYY hh:mm a')
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-user-id", data.id);
                    },
                    'order': [[ 3, "desc" ]]
                };
                var table = $('#sms-list').DataTable(dataTableOpt);
                //end datatable for sms log

                //datatable for email log
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/settings/email',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'member_name'},
                        {'data': 'email'},
                        {'data': 'message'},
                        {'data': 'created_date'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },{
                            "targets": 3,
                            "render": function (data, type, row) {
                                return moment(data).utc().format('Do MMM YYYY hh:mm a')
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-email-id", data.id);
                    },
                    'order': [[ 3, "DESC" ]]
                };
                var table = $('#email-list').DataTable(dataTableOpt);
                //end datatable for sms log

                //wyswig editor
                $('.sms-setting-message').summernote();
                $('#email-message').summernote();
                $('.email-setting-message').summernote();
                $('#sms-template').summernote();
                $('#email-template').summernote();

                //save sms-settings start
                $('#save-sms-settings').click(function(){
                    var sms_settings = [];
                    $('.sms-settings-rows').each(function(e){
                        sms_settings.push({
                            template_id: $(this).attr('template_id'),
                            message: $(this).find('.sms-setting-message').val(),
                            is_active: ($(this).find('.js-switch').is(':checked') ?  1: 0)
                        });
                    })

                    $.ajax({
                        url: '/app/settings/update-sms-setting',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            sms_settings
                        },
                        success: function (data) {
                            if(data.success){
                                toastr.success('Updated successfully!');
                            }else{
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                //save sms-settings end

                //save email-settings start
                $('#save-email-settings').click(function(){
                    var email_settings = [];
                    $('.email-settings-rows').each(function(e){
                        email_settings.push({
                            template_id: $(this).attr('template_id'),
                            message: $(this).find('.email-setting-message').val(),
                            is_active: ($(this).find('.js-switch-1').is(':checked') ?  1: 0)
                        });
                    })

                    $.ajax({
                        url: '/app/settings/update-email-setting',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            email_settings
                        },
                        success: function (data) {
                            if(data.success){
                                toastr.success('Email saved successfully!');
                            }else{
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                //save email-settings end

                $('#sms-message').keyup(function(e){
                    var used_letters = this.value.length;
                    var max_letters = 321;
                    var tval = $('#sms-message').val();
                    var tlength = tval.length;
                    var remaining = max_letters - used_letters;
                    $('#sms-remaining-characters').text(remaining);
                    if (remaining <= 0) {
                        $('#sms-message').val((tval).substring(0, tlength - 1));
                        return false;
                    }
                })

                $('#email-outstanding, #outstanding').select2();
                // $('#email-outstanding, #outstanding').change(function(){
                //     alert($(this).val())
                //     if($(this).val() == 'all'){
                //         $(this).val('');
                //         $(this).val('all');
                //     }
                // })
            });
        }
    };
}());