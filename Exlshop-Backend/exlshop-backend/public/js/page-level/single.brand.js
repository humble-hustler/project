var SINGLE_BRAND = SINGLE_BRAND || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            _csrf = _args._csrf
            brandId = _args.brandId
            console.log("kkkkkkkkkkkk", brandId)

            $(document).ready(function () {
                
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url':`/super-admin/brands/single-shop-details/${brandId}`,
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'name'},
                        {'data': 'subcriptionStatus'},
                        {'data': 'is_active'},
                        {'data': 'id'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        {
                            "targets": 2,
                            "render": function (data, type, row) {
                                return data ? 'Active' : 'Inactive'
                            }
                        },
                        {
                            "targets": 3,
                            "render": function (data, type, row) {
                                return `<a class="btn btn-primary btn-outline" href="/super-admin/brands/locations/view/${data}"><i class="fa fa-eye"></i></a>`
                            }
                        }],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-brand-id", data.id);
                    },
                    order:[[0,'asc']]
                };
                var table = $('#brand-list').DataTable(dataTableOpt);

                // table.on('click', 'tr', function () {
                //     if (table.row(this).node() !== null) {
                //         var leadId = $(table.row(this).node()).attr('data-brand-id');
                //         location.href = location.href + '/' + leadId;
                //     }
                // });

                $("#brand-active").change(function(){
                    let isChecked = $('#brand-active').is(':checked');
                    if(!isChecked){
                        var cb = $("#brand-active").val('0');
                    }
                    else{
                        var cb = $("#brand-active").val('1');
                    }
                });
               
                $("#updatebtn").click(function(e){
                    var name=$("#brand-name").val();  
                    var id=$("#brand-id").val();  
                    var active = $("#brand-active").val();
                    
                    $.ajax({
                       url: "/super-admin/brands/edit",
                        data:{name:name,
                              id:id,
                              active :active,
                              _csrf: _csrf},	
                              method: 'POST',					
                              success: function(data) {
                              toastr.success('Shop Updated successfully!');
                               window.location = "/super-admin/brands/";
                               },
                              error: function(data,status,error) {
                              toastr.error('Some error occurred')
                               }
                    });			
                });				
                  
                $("#addbtn").click(function(e){
                  var name=$("#location-name").val();  
                    var brandId=$("#bid").val();    
                    $.ajax({
                        url:"/api/v1/location/location-add-new",
                        data:{name:name,
                          brandId:brandId,
                              _csrf: '<%= _csrf %>'},	
                              method: 'POST',					
                              success: function(data) {
                              toastr.success('Location Added successfully!');
                               window.location.reload() ;
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