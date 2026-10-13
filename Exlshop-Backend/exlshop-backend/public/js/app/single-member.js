var SINGLE_MEMBER = SINGLE_MEMBER || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const userData = _args.userData
            const membershipLogs = _args.membershipLogs;
            const taxes = _args.taxes;

            $(document).ready(function () {
                var elem = document.querySelector('.js-switch');
                var init = new Switchery(elem);
                
                $('#dob, #anniversary_date').datetimepicker({
                    format:'DD-MM-Y'
                }).on('dp.change',function(){
                    if($(this).val()!=''){
                        const col = $(this).attr('name');
                        var val = $(this).val();
                        edit_data(col, val);
                    }
                });

                $('.edit-data').on('change', function () {
                    const col = $(this).attr('name');
                    var val = $(this).val();
                    edit_data(col, val);
                });

                $('#capture-image').on('click', function () {
                    $('#profile-picture-capture').modal()
                    Webcam.set({
                        width: 320,
                        height: 240,
                        image_format: 'jpeg',
                        jpeg_quality: 90
                    });
                    Webcam.attach('#camera-container');
                    $('#capture').on('click', function () {
                        Webcam.snap(function (imageData) {
                            $.ajax({
                                url: '/app/members/update/profile-image',
                                method: 'POST',
                                data: {
                                    _csrf: _csrf,
                                    userId: userData.id,
                                    imageData,
                                },
                                success: function (data) {
                                    if (data.success) {
                                        toastr.success('Profile Image updated successfully!');
                                        $('#member-profile-image').attr('src', data.filename)
                                    } else {
                                        toastr.error('Some error occurred')
                                    }
                                }
                            });
                        });
                    })
                })

                $('#height, #weight').change(function () {
                    get_bmi();
                })
                
                function get_bmi(){
                    if($('#height').val() && $('#weight').val()){
                        var ht = parseFloat($('#height').val());
                        var wt = parseFloat($('#weight').val());
                        // var bmi = wt/(ht*ht)
                        var bmi = [wt / ht / ht] * 10000;
                        $('[name=bmi]').val(bmi.toFixed(2));
                        
                        var fat_weight = (wt * bmi) / 100;
                        $('[name=fat_weight]').val(fat_weight.toFixed(2));
                        
                        var lean_weight = wt - fat_weight;
                        $('[name=lean_weight]').val(lean_weight.toFixed(2));
                    }
                }

                $('#brand-location').change(function(){
                    $.ajax({
                        url: '/app/members/change-location',
                        method: 'POST',
                        data: {
                            memberId : userData.id,
                            locationId: $('#brand-location').val(),
                            _csrf:_csrf
                        },
                        success:function(data){
                            if (data.success) {
                                toastr.success('Location updated successfully!');
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })

                $('#brand').select2({
                    placeholder: 'Search Brands',
                    ajax: {
                        url: '/app/members/search-brands',
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
                                data.brands.forEach((w) => {
                                    searchResult.push({
                                        id: w.id,
                                        text: `${w.name}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                $('#brand').change(function(){
                    $('#brand-location').empty();
                    $.ajax({
                        url: '/app/members/get-brand-locations',
                        method: 'POST',
                        data: {
                            brandId: $('#brand').val(),
                            _csrf:_csrf
                        },
                        success:function(data){
                            if (data.success) {
                                toastr.success('Please select a Brand Location for saving the current Brand Change!');
                                $('#brand-location').append('<option value="">--Select Brand Location--</option>');
                                data.locations.forEach(function(l){
                                    $('#brand-location').append('<option value='+l.id+'>'+l.name+'</option>');
                                })
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    })
                })

                $('#transfer_member_id').select2({
                    placeholder: 'Search Member',
                    ajax: {
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
                                data.members.forEach((w) => {
                                    searchResult.push({
                                        id: w.id,
                                        text: `${w.fname} ${w.lname}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                });

                $('.transfer-membership').click(function(){
                    $('[name=membership_id]').val($(this).closest('tr').attr('membership_id'));
                })

                $('.freeze-membership').click(function(){
                    var membership_id = $(this).closest('tr').attr('membership_id');
                    $('[name=freeze_membership_id]').val(membership_id);
                    $('[name=mem_exp_date]').val($(this).closest('tr').attr('exp_date'));
                    membershipLogs.forEach(function(m){
                        if(m.id == membership_id){
                            $('#membership_start_date').val(moment(m.start_date).format('DD-MM-YYYY'))
                        }
                    })
                })    
                
                function edit_data(col, val){
                    if (col === 'fname' || col === 'lname') {
                        if(!validate_name()){
                            return;
                        };
                    }

                    if (col === 'gender' || col === 'marital_status') {
                        val = $(this).val()
                    }

                    if (col === 'birth_date' || col === 'anniversary_date') {
                        val = moment(val,'DD-MM-YYYY').format('YYYY-MM-DD')
                    }

                    if (col === 'is_active') {
                        val = $(this).prop('checked') ? 1 : 0
                    }

                    if(col == 'phone'){
                        if(!validate_phone_no($('#phone'))){
                            return ;
                        }
                    }

                    if(col == 'emergency_contact_number'){
                        if(!validate_phone_no($('#emergency_contact_number'))){
                            return ;
                        }
                    }

                    if(col == 'email'){
                        if(!validate_email()){
                            return;
                        }
                    }

                    $.ajax({
                        url: '/app/members/update',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            userId: userData.id,
                            col,
                            val
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Profile updated successfully!');
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                }

                function validate_phone_no($element){
                    $element ;
                    var val = $element.val();

                    if(val){
                        const regex = /^\d+$/
                        if ($element.val().length !== 10 || !regex.test(val)) {
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid 10 digit phone number')
                            return false;
                        }else{
                            $element.removeClass('is-invalid').next('.invalid-feedback').text('')
                            return true;
                        }
                    }else{
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid 10 digit phone number')
                        return false;
                    }
                }

                function validate_email(){
                    $element = $('#email');
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

                    if (!regex.test($element.val())) {
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid email address');
                        return false;
                    }
                    $element.removeClass('is-invalid').next('.invalid-feedback').text('')
                    return true;
                }

                function validate_name(){
                    if($('#fname').val() == ''){
                        $element = $('#fname');
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a First Name');
                        return false;
                    }else if($('#lname').val() == ''){
                        $element = $('#lname');
                        $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a Last Name');
                        return false;
                    }else{
                        $('#fname').removeClass('is-invalid').next('.invalid-feedback').text('');
                        $('#lname').removeClass('is-invalid').next('.invalid-feedback').text('');
                    }
                    return true;
                }

                $('#membership_freeze_start_date, #membership_freeze_end_date, #new_membership_end_date, #bmi-date').datetimepicker({
                    format:'DD-MM-Y'
                })

                $('#membership_freeze_start_date, #membership_freeze_end_date').on('dp.change', function(){
                    if($('#membership_freeze_start_date').val() && $('#membership_freeze_end_date').val()){
                        var start_date = moment($('#membership_freeze_start_date').val(), 'DD-MM-YYYY');
                        var end_date = moment($('#membership_freeze_end_date').val(), 'DD-MM-YYYY');
                        var no_of_days = end_date.diff(start_date,'days');
                        var mem_exp_date = $('#mem_exp_date').val();
                        var new_exp_date = moment(mem_exp_date,'YYYY-MM-DD').add(no_of_days, 'days').format('DD-MM-YYYY');
                        $('#new_membership_end_date').val(new_exp_date);
                    } 
                })

                $('#apply_tax').change(function(){
                    if($(this).is(':checked')){
                        $('#tax').attr('required',true);
                    }else{
                        $('#tax').attr('required',false);
                    }
                })

                $('#tax, #freeze_price').change(function(){
                    if($('#freeze_price').val()){
                        var total_price = 0;
                        price = parseFloat($('#freeze_price').val());
                        total_price = price;
                        taxes.forEach(function(t){
                            if(t.id == $('#tax').val()){
                                var rate = t.rate;
                                total_price = price+(price*(rate/100));
                                
                            }
                        })
                        $('#total_price').val(total_price);
                    }
                })

                $('#transfer_tax, #transfer_fees').change(function(){
                    if($('#transfer_fees').val()){
                        var total_price = 0;
                        price = parseFloat($('#transfer_fees').val());
                        total_price = price;
                        taxes.forEach(function(t){
                            if(t.id == $('#transfer_tax').val()){
                                var rate = t.rate;
                                total_price = price+(price*(rate/100));
                                
                            }
                        })
                        $('#total_transfer_price').val(total_price);
                    }
                })

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/members/get-sms',
                        headers: {
                            'csrf-token': _csrf
                        },
                        data:{
                            user_id: userData.id
                        }
                    },
                    'columns': [
                        {'data': 'created_date'},
                        {'data': 'message'}
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
                            return moment(data).format('Do MMM YYYY')
                        }
                    }],
                    'order': [[ 0, "asc" ]]
                };

                var table = $('#sms-list').DataTable(dataTableOpt);

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/members/get-email',
                        headers: {
                            'csrf-token': _csrf
                        },
                        data:{
                            user_id: userData.id
                        }
                    },
                    'columns': [
                        {'data': 'created_date'},
                        {'data': 'message'}
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
                            return moment(data).format('Do MMM YYYY')
                        }
                    }],
                    'order': [[ 0, "asc" ]]
                };

                var table = $('#email-list').DataTable(dataTableOpt);

                $('.upgrade-restrict').click(function(){
                    var reason = $(this).attr('reason');
                    if(reason=='already-upgraded'){
                        toastr.warning('The Membership has already been Upgraded!');
                    }else if(reason == 'payment-incomplete'){
                        toastr.warning('The Sale Payment must be fully Completed to Upgrade!');
                    }else if(reason == 'not-upgradable'){
                        toastr.warning('The current package is not Upgradable as there is no Package found with better Benefits!');
                    }
                })

                $('.downgrade-restrict').click(function(){
                    var reason = $(this).attr('reason');
                    if(reason=='already-downgraded'){
                        toastr.warning('The Membership has already been Downgraded!');
                    }else if(reason == 'not-downgradable'){
                        toastr.warning('The current packge is not Downgradable as there is no Package found with lesser Benefits!');
                    }
                })
            });
        }
    };
}());