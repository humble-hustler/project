var VENDOR = VENDOR || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf

            $(document).ready(function () {       
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                   
                    'ajax': {
                        'method': 'POST',
                       'url': '/super-admin/shop/vendor/vendor-list',
                        headers: {
                            'csrf-token': _csrf
                        },
                    },
                    'columns': [
                       {'data': 'period'},
                        {'data': 'count', 'className':'vendor-count'},
                        {'data': 'sub_total'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{ 
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        {
                            'targets':0,
                            "render": function (data, type, row) {
                                var date = row.period
                                var day = date.split("-")[2]
                                var month = date.split("-")[1]
                                var year = date.split("-")[0]
                                var month
                                if(month == 1){
                                    month = 'January'
                                } if(month == 2){
                                    month = 'February'
                                } if(month == 3){
                                    month = 'March'
                                } if(month == 4){
                                    month = 'April'
                                } if(month == 5){
                                    month = 'May'
                                } if(month == 6){
                                    month = 'June'
                                } if(month == 7){
                                    month = 'July'
                                } if(month == 8){
                                    month = 'August'
                                } if(month == 9){
                                    month = 'September'
                                } if(month == 10){
                                    month = 'October'
                                } if(month == 11){
                                    month = 'November'
                                } if(month == 12){
                                    month = 'December'
                                }

                                if(day == 01){
                                var data = `  <span class="font-size-13">01-15 </span> <span class="aaa">`+month+` `+year+`</span>`;
                                }
                                if(day == 15){
                                    var data = `  <span class="font-size-13">16- month last day </span> <span class="aaa">`+month+` `+year+`</span>`;
                                }
                                return data;
                            }
                        }
                    ],
                    order:[[0,'desc']],
                    'createdRow': function (row, data, index) {
                        $(row).attr('vendor_id', data.brands_id);
                        $(row).attr('date', data.period)
                    },
                };
                var table = $('#vendor-list').DataTable(dataTableOpt);
               
                table.on('click', 'tr', '.vendor-count', function () {
                    if (table.row(this).node() !== null) {
                        var vendorId = $(table.row(this).node()).attr('vendor_id');
                        var period = $(table.row(this).node()).attr('date');
                        location.href = `/super-admin/shop/view/vendor/${period}`;
                    }
                });	
            });
        }
    };
}());