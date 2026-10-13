var LOCATION_LIST = LOCATION_LIST || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf

            $(document).ready(function () {       
                var paramPeriod = $("#param-period").val()

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                       'url': `/app/orders/view/locationlist/${paramPeriod}`,
                        headers: {
                            'csrf-token': _csrf
                        },
                    },
                    'columns': [
                        {'data': 'name', 'className':'vendor-name'},
                        {'data': 'count', 'className':'order-count'},
                        {'data': 'price', 'className':'order-price'},
                        {'data': "status", }
                        
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{ 
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        {
                            'targets': 3,
                            "render": function (data, type, row){
                                var data = `<select> 
                                    <option> pending </option>
                                    <option> done </option>
                                </select>`
                                return data
                            }
                        }
                    ],
                    order:[[0,'desc']],
                    'createdRow': function (row, data, index) {
                        console.log(data)
                        $(row).attr('vendor_id', data.id);
                    },

                };
              
                var table = $('#vendorlist').DataTable(dataTableOpt);
                var day = paramPeriod.split("-")[2]
                var month = paramPeriod.split("-")[1]
                var year = paramPeriod.split("-")[0]

                $("#vendorlist").find('tbody').mouseover(function(){
                    $(this).find('tr').find(".order-count").click(function(){
                        var vendor_name=  $(this).parent().find(".vendor-name").text()
                         location.href = `/app/orders/view/location/${vendor_name}/${paramPeriod}`;
                    })
                })
            });
        }
    };
}());