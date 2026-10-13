var VIEW_PRODUCTS = VIEW_PRODUCTS || (function () {
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
                       'url': '/super-admin/shop/products/view-all',
                        headers: {
                            'csrf-token': _csrf,
                        }
                    },
                    'columns': [
                        {'data': 'id'},
                        {'data': 'files'},
                        {'data': 'name'},
                        {'data' : 'description'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{ 
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        {
                            "targets": 1,
                            "render": function (data, type, row) {
                                var data = `<img style="width:60px" src=`+row.files+`>`;
                                return data;
                            }
                        }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-product-id", data.id);
                    },
                    order:[[0,'asc']]
                };

                var table = $('#products-list').DataTable(dataTableOpt);
                table.on('click', 'tr', function () {
                    if (table.row(this).node() !== null) {
                        var productId = $(table.row(this).node()).attr('data-product-id');
                        location.href = `/super-admin/shop/view/product/${productId}`;
                    }
                });

                $('#category101').on('change', function () {
                
                    var category_id = $('#category').find(":selected").val();
                    const categoryId = $(this).val()
                    $.ajax({
                        url: '/super-admin/shop/GetSubcategories',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            categoryId
                        },
                        success: function (data) {
                            if (data.success && data.subcategories.length > 0) {
                                $('#subcategory101').empty().append('<option value="">Select Subcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subcategory101').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                $('#subcategory101').on('change', function () {
                    const categoryId = $(this).val()
                    $.ajax({
                        url: '/super-admin/shop/GetSubcategories',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            categoryId
                        },
                        success: function (data) {
                            if (data.success && data.subcategories.length > 0) {
                                $('#subsubcategory101').empty().append('<option value="">Select SubSubcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subsubcategory101').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })

                $('#apply-filter').on('click', function () {
                    var table = $('#products-list').dataTable();
                    alert(table)
                    var tableSettings = table.fnSettings();
                    var categories = [];
                    $('.category').each(function(){
                        if($(this).is(':checked')){
                            categories.push($(this).val());
                        }
                    })
                    tableSettings.ajax.data = {
                        filter:{
                            categories: categories  
                        } 
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click', function () {
                    var table = $('#products-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {}
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                    $('.category').prop('checked',false);
                })

                // $("#add-product-btn").submit(function(e){
                   
                //     var pname=$("#product-name").val(); 
                //     var cid=$("#subsubcategory101").val()
                               
                //     $.ajax({
                //         url: "/api/v1/productlist/add-products",
                //         data:{
                //           product_name:pname,
                //           cid:cid,
                //               _csrf: '<%= _csrf %>'},	
                //               method: 'POST',					
                //               success: function(data) {
                //               toastr.success('Products Added successfully!');
                //                window.location = "/super-admin/shop/products";                  
                //                },
                //               error: function(data,status,error) {
                //               toastr.error('Some error occurred')
                //                }
                //     });			
                // });			
             
            });
        }
    };
}());