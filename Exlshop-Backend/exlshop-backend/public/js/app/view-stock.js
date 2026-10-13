var VIEW_STOCK = VIEW_STOCK || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const products = _args.products
            var flash = _args.flash;
            $(document).ready(function () {
                if (flash) {
                    toastr.error(flash)
                }
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/view-stock/ViewStock',
                        // 'url':'/api/v1/appProduct/getProducts',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data':'id'},
                        {'data':'file_name'},   
                        {'data':'name' },
                        {'data':'catName'},
                        {'data':'quantity'},
                        {'data':'returned_count'},
                        {'data':'cancelled_count'},
                        {'data':'stock_status'},
                     
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
                            var featuredImg = ``
                            if (data) {
                                featuredImg = `<img src="${data}" class="mr-10" width="60" />`
                            } else {
                                featuredImg = `<i class="fa fa-image"></i>`
                            }
                            return featuredImg
                        }
                    },
                    {
                        "targets": 3,
                        "render": function (data, type, row) {
                            return `${row.catName}<br>${row.subcatName}<br>${row.subsubcatName}`
                        }
                    },
                    {
                        "targets": 4,
                        "render": function (data, type, row) {
                            return `<input class="form-control" type="text" id="editquant" value = "${data}" name="quantity">`
                        }
                    },
                    {
                        "targets": 7,
                        "render": function (data, type, row) {
                            if(data == 'Out Of Stock') {
                                return `<span class="badge badge-danger">${data}</span>`;
                            } else {
                                return `<span class="badge badge-success">${data}</span>`;
                            }
                        }
                    },
                    {
                        "targets": 8,
                        "render": function (data, type, row) {
                            var data = '<input name="select_all" id="check_id" value="1" type="checkbox"></input>'
                            return data;
                        }
                    } ],
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('product_id', data.id);
                        $(row).attr('status', data.stock_status);
                    },
                    // rowCallback: function (row, data, index) {
                    //     $(row).attr("data-member-id", data.id);
                    // },
                    'order': [[0, "asc"]]
                };
                
                var table = $('#stock-list').DataTable(dataTableOpt);
                
                $('#apply-filter').on('click', function () {
                    var table = $('#stock-list').dataTable();
                    var tableSettings = table.fnSettings();                 
                    tableSettings.ajax.data = {
                        filter: {
                            product_name:$('#product_id').val() ,
                            quantity: $('#quantity_id').val(),                          
                            sub_subcategory: $('#filter_subsubcategory_id').val(),
                            status_id:$('#status_id').val(),
                            subcategory: $("#filter_subcategory_id").val(),
                            category: $("#filter_category_id").val()
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })

                $('#reset-filter-btn').on('click',()=>{
                    var table = $('#stock-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                        }
                    }
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })
                $('#filter_category_id').on('change', function () {
                    var category_id = $('#filter_category_id').find(":selected").val();
                    const categoryId = $(this).val()
                    $.ajax({
                        url: '/app/asset-management/GetSubcategories',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            categoryId
                        },
                        success: function (data) {
                            if (data.success && data.subcategories.length > 0) {
                                $('#filter_subcategory_id').empty().append('<option disabled selected value>Select Subcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#filter_subcategory_id').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                $('#filter_subcategory_id').on('change',()=>{
                    const categoryId = $("#filter_subcategory_id").val()
                 
                    $.ajax({
                        url: '/app/asset-management/GetSubcategories',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            categoryId
                        },
                        success: function (data) {
                            if (data.success && data.subcategories.length > 0) {
                                $('#filter_subsubcategory_id').empty().append('<option disabled selected value>Select SubSubcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#filter_subsubcategory_id').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });  
                })

                $("#update-stock").click(function (e) {
                    if(!$("#stock-list input[type=checkbox]:checked").length){
                        toastr.error("Please select product")
                        return
                    }
                    $("#stock-list input[type=checkbox]:checked").each(function () {
                        var row = $(this).closest("tr")[0];
                        
                        pname = row.cells[0].innerHTML;
                        var productId = $(this).closest('tr').attr('product_id');
                        // alert($(this).closest('tr').attr('status'))
                        var stock_status=$(this).closest('tr').attr('status')

                        $.ajax({
                            url: "/app/view-stock/UpdateStock",
                            data: {
                                _csrf: _csrf,
                                productId:productId,
                                stock_status:stock_status
                            },
                            method: 'POST',
                            success: function (data) {
                                if(data.stock == 1) {
                                    toastr.success(' Product Marked Out Of Stock successfully!');
                                } else {
                                    toastr.success(' Product Marked In Stock successfully!');
                                }
                                window.location.reload();
                            },
                            error: function (data, status, error) {
                                toastr.error('Some error occurred')
                            }
                        });
                    })
                });

                $(document).on('change', '#editquant', function() {
                    var productId = $(this).closest('tr').attr('product_id');
                    var quantity = $(this).val()
                    if(Math.sign(quantity) == 1){
                        $.ajax({
                            url: "/app/view-stock/UpdateQuantity",
                            data: {
                                _csrf: _csrf,
                                productId:productId,
                                quantity:quantity
                            },
                            method: 'POST',
                            success: function (data) {
                                if(data.success) {
                                    toastr.success(' Quantity Updated successfully!');
                                    window.location.reload();
                                } else{
                                    toastr.error('Quantity Not Updated!')
                                }
                                
                            },
                            error: function (data, status, error) {
                                toastr.error('Some error occurred')
                            }
                        });
                    }else{
                        toastr.error('Negative quantity is not accepted.')
                    }
                    
                })

            })

         $(document).ready(function () {
                
            if (flash) {
                toastr.error(flash)
            }
         var dataTableOpt1 = {
            'processing': true,
            'serverSide': true,
            'autoWidth': false,
            'ajax': {
                'method': 'POST',
                'url': '/app/view-stock/OutOfStock',
                // 'url':'/api/v1/appProduct/getProducts',
                headers: {
                    'csrf-token': _csrf
                }
            },
            'columns': [
                {'data':'id'},   
                { 'data': 'name' },
                {'data':'category'},
            ],
            'ordering': true,
            'aaSorting': [],
            'columnDefs': [{
                'searchable': false,
                'orderable': false,
                'className': 'dt-body-center',
            }
            ],
            rowCallback: function (row, data, index) {
                $(row).attr("data-member-id", data.id);
            },
            'order': [[0, "asc"]]
        };
        
        var table1 = $('#outofstock-list').DataTable(dataTableOpt1);
       
    })

        }
    }
}());