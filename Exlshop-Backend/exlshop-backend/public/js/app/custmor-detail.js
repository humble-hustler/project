var VIEW_CUSTMOR = VIEW_CUSTMOR || (function () {
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
                       'url': '/app/custmor/view-custmor-detail',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data' : 'users_id'},
                        {'data' : 'COUNT(users_id)'},
                        {'data' : 'cnt4'},
                        {'data' : 'cnt5'},
                        {'data' : 'cnt6'},
                        {'data' : 'cnt1'},
                        {'data' : 'user_name'},
                        {'data' : 'phone'},
                        {'data' : 'email'}
                    ],
                    order:[[0,'desc']],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },
                    {
                        "targets": 5,
                        "render": function (data, type, row) {
                            return `${row.cnt1 + row.cnt2 + row.cnt3 + row.cnt7}`
                        }
                    },
                    {
                        "targets": 9,
                        "render": function (data, type, row) {
                            return `<span style="font-size:20px; cursor: pointer" id="chat-with-cust"><i class="fa fa-commenting"></i></span>`
                        }
                    },
                    ],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('user_phone', data.phone);
                        $(row).attr('user_id', data.user_id);
                    },
                };

                var table = $('#custmor-list').DataTable(dataTableOpt);

                $("#share").on('click', function(){
                    window.open("https://web.whatsapp.com/")
                })
                $('#custmor-list tbody').on('click', 'tr', function () {
                    $(this).toggleClass('selected');
                });


                $('#apply-filter').on('click', function () {
                    var table = $('#custmor-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            customer_name:$('#customer_id').val() ,
                            email_id: $('#email_id').val(),                          
                            phone_no: $('#phone_id').val(),
                            zip_code: $('#zip_code').val(),
                            // city_name:$('city_id').val()
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })
                $('#reset-filter-btn').on('click',()=>{
                    var table = $('#custmor-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                        }
                    }
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })

                $('#custmor-list tbody').on('click', 'tr td:last-child', function () {
                    var customer_Id = $(this).closest('tr').find('td:eq(0)').text()
                    localStorage.setItem('customer_Id', customer_Id)
                    var locationId = $("#currentLocation_Id").val()
                    console.log(customer_Id, locationId)
                    window.location.href = `/app/chats/customer`
                    console.log($('.single-member'))
                    $('.single-member').trigger('click');
                    $(this).attr('user-id', customer_Id)
                });
            });
        }
    };
}());