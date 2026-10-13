var SINGLE_LEAD = SINGLE_LEAD || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const leadData = JSON.parse(_args.leadData);
            const leadContacts = JSON.parse(_args.leadContacts);

            $(document).ready(function () {
                var elem = document.querySelectorAll('.js-switch');
                elem.forEach(function(el) {
                    new Switchery(el)
                });

                $('#followup_date_time').datetimepicker();

                $('.edit-data').on('change', function () {
                    const col = $(this).attr('name');
                    var val = $(this).val();
                    if (col === 'gender' || col === 'marital_status' || col === 'trial_booked') {
                        val = $(this).val()
                    }

                    if (col === 'trial_date_time' ) {
                        val = moment($(this).val()).format('YYYY-MM-DD HH:mm:ss')
                    }

                    if (col === 'is_active' || col === 'is_demo_given') {
                        val = $(this).prop('checked') ? 1 : 0
                    }
                    
                    if (col === 'package_ids') {
                        val = $(this).val().join(',')
                    }
                    
                    $.ajax({
                        url: '/super-admin/marketing/leads/update',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            leadId: leadData.id,
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
                });

                $('#owner-id,#followup-user').select2({
                    placeholder: 'Search Owner',
                    ajax: {
                        url: '/super-admin/settings/user/search',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    userName: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.users.forEach((u) => {
                                    searchResult.push({
                                        id: u.id,
                                        text: `${u.fname} ${u.lname}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                $('.edit_contact').on('click',function () {
                    var id = $(this).closest('tr').attr('contact_id');
                    leadContacts.forEach(function (lc) {
                        if(lc.id == id){
                            $('#fname').val(lc.fname);
                            $('#lname').val(lc.lname);
                            $('#email').val(lc.email);
                            $('#phone').val(lc.phone);
                            $('#designation').val(lc.designation);
                            $('#address').val(lc.address);
                            $('#contact-form').attr('action','/super-admin/marketing/leads/update/contact');
                            $('#lead-contact-id').val(lc.id);
                        }
                    })
                })
            });
        }
    };
}());