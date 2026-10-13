var SINGLE_MEMBER = SINGLE_MEMBER || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const userData = _args.userData

            $(document).ready(function () {
                var elem = document.querySelector('.js-switch');
                var init = new Switchery(elem);

                $('.edit-data').on('change', function () {
                    update_details(this);
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
                                url: '/super-admin/brands/locations/members/update/profile-image',
                                method: 'POST',
                                data: {
                                    _csrf: _csrf,
                                    userId: userData.id,
                                    imageData,
                                    locationId: userData.brand_locations_id
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
                
                $('#dob, #anniversary_date').datetimepicker({
                    format:'D-M-Y'
                }).on('dp.change', function () {
                    update_details(this)
                });

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

                /* START - Get City By State */
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
                                $('#city').empty().append('<option value="">Select City</option>');
                                data.cities.forEach((c) => {
                                    $('#city').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                /* END - Get City By State */
            });

            function update_details(elem){
                const col = $(elem).attr('name');
                var val = $(elem).val();

                if (col === 'gender' || col === 'marital_status') {
                    val = $(elem).val()
                }

                if (col === 'birth_date' || col === 'anniversary_date') {
                    val = moment($(elem).val(),'DD-MM-YYYY').format('YYYY-MM-DD')
                }

                if (col === 'is_active') {
                    val = $(elem).prop('checked') ? 1 : 0
                }

                $.ajax({
                    url: '/super-admin/brands/locations/members/update',
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

            $('#brand-location').change(function(){
                $.ajax({
                    url: '/super-admin/brands/locations/members/change-location',
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
                    url: '/super-admin/brands/locations/members/search-brands',
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
                    url: '/super-admin/brands/locations/members/get-brand-locations',
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
        }
    };
}());