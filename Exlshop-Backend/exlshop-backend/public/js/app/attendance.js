var ATTENDANCE = ATTENDANCE || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;

            $(document).ready(function () {
                $('#customer-search').select2({
                    placeholder: 'Search Customer',
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
                                data.members.forEach((m) => {
                                    searchResult.push({
                                        id: m.id,
                                        text: `${m.fname} ${m.lname} (${m.phone})`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                $('#customer-search').on('change', function () {
                    $.ajax({
                        url: '/app/members/get',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            userId: $(this).val()
                        },
                        success: function (data) {
                            if (data.success) {
                                const user = data.user;
                                $('#member-details tbody').empty().append(`<tr><td>${user.fname} ${user.lname}</td><td>${user.phone}</td></tr>`)
                                $('#refImg').attr('src', user.profile_image)
                                Webcam.set({
                                    width: 320,
                                    height: 240,
                                    image_format: 'jpeg',
                                    jpeg_quality: 90
                                });
                                Webcam.attach('#camera-container');
                                $('#capture').on('click', function () {
                                    Webcam.snap(function (data_uri) {
                                        $('#queryImg').attr('src', data_uri);
//                                        updateReferenceImageResults()
                                    });
                                })
                            }
                        }
                    });
                })
            });
        }
    };
}());