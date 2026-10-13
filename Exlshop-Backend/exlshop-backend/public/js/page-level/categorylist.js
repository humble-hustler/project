var VIEW_CATEGORY = VIEW_CATEGORY || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf

            $(document).ready(function () {       
                var vendor_name = $("#param-name").val()
                var paramPeriod = $("#param-period").val()

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                       'url': `/super-admin/shop/subCategories/`,
                        headers: {
                            'csrf-token': _csrf
                        },
                     
                    },
                    'columns': [
                        {'data': 'parent_name'},
                        {'data': 'name'},
                        {'data': 'slug'},
                        {'data': 'id'}
                        
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
                                return data
                            }
                        },{
                            "targets": 3,
                            "render": function (data, type, row) {
                                return `<button type="button" class="btn btn-dark delete-sub-cat" data-target="#delete-sub-category" data-toggle="modal" class="btn btn-sm  btn-dark">Delete</button>`
                            }
                        },
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-cat-id", data.id);
                        $(row).attr("data-is-sub-sub", 0)
                    },
                    order:[[0,'asd']],

                };
              
                var table = $('#sub-category-list').DataTable(dataTableOpt);


                var dataTableOpt1 = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'paging': true,
                    'ajax': {
                        'method': 'POST',
                       'url': `/super-admin/shop/subsubCategories/`,
                        headers: {
                            'csrf-token': _csrf
                        },
                     
                    },
                    'columns': [
                        {'data': 'parent_category_name'},
                        {'data' : 'sub_category_name'},
                        {'data': 'sub_sub_category_name'},
                        {'data': 'slug'},
                        {'data': 'id'}
                        
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
                                return data
                            }
                        },{
                            "targets": 4,
                            "render": function (data, type, row) {
                                    return `<button type="button" class="btn btn-dark delete-sub-sub-cat" data-target="#delete-sub-sub-category" data-toggle="modal" class="btn btn-sm  btn-dark">Delete</button>`
                            }
                        },
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-cat-id", data.sub_sub_category_id)
                        $(row).attr("data-is-sub-sub", 1);
                    },
                    order:[[0,'asd']],

                };
              
                var table1 = $('#sub-sub-category-list').DataTable(dataTableOpt1);
                
                
                $(document).on("click", '.delete-sub-cat', function (){
                    $('[name=sub_category_id]').val($(this).closest('tr').attr('data-cat-id'));
                    $('[name=is_sub_sub]').val($(this).closest('tr').attr('data-is-sub-sub'))
                })
                $(document).on('click','.delete-sub-sub-cat',function(){
                    $('[name=sub_sub_category_id]').val($(this).closest('tr').attr('data-cat-id'));
                    $('[name=is_sub_sub]').val($(this).closest('tr').attr('data-is-sub-sub'))
                })
                // table.on('click', 'tr .user-name', function () {
                //     var user_id = $(this).closest('tr').attr('user_id');
                //     window.location.href=`/super-admin/shop/view/user-orders/${user_id}`;
                // });


                var dataTableOpt2 = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'paging': true,
                    'ajax': {
                        'method': 'POST',
                       'url': `/super-admin/shop/deletedCategories/`,
                        headers: {
                            'csrf-token': _csrf
                        },
                     
                    },
                    'columns': [
                        {'data': 'category'},
                        {'data' : 'sub_category'},
                        {'data': 'name'},
                        {'data': 'slug'},
                        
                        
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{ 
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-cat-id", data.existing_id)
                        $(row).addClass('subsubrow');
                    },
                    order:[[0,'asd']],

                };
              
                var table2 = $('#deleted-category-list').DataTable(dataTableOpt2);
                table2.on('click', 'tr', function () {
                    var category_id = $(this).attr("data-cat-id")
                    window.location.href=`/super-admin/shop/view-product/${category_id}`;
                });

                $(document).on('click','.manage-product',function(){
                    $('[name=manage_product]').val($(this).closest('tr').attr('data-cat-id'));
                })

                $('#category1id').on('change', function () {
                    var category_id = $('#category1id').find(":selected").val();
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
                                $('#subcategory1id').empty().append('<option disabled selected value>Select Subcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subcategory1id').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })

                $("#add-subcategory-btn").on("click", function () {

                    if (!$('#categoryid').val()) {
                        toastr.error('Please Select Category')
                        return
                    }
                    if (!$('#subcategory-name').val()) {
                        toastr.error('Please Enter sub category name')
                        return
                    }
                    var category_name = $("#subcategory-name").val()
                    var category_id = $("#categoryid").val()

                    $.ajax({
                        url: '/super-admin/shop/add-category',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            category_id,
                            category_name
                        },
                        success: function (data){
                            if(data.success){
                                toastr.success("SubCategory Added Successfully!")
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1000);
                            }else{
                                toastr.error("Some error occur")
                            }
                        }
                    })
                })

                $("#add-subsubcategory").on("click", function () {
                    if (!$('#subcategory1id').val()) {
                        toastr.error('Please Select SubCategory')
                        return
                    }
                    if (!$('#subsubcategory-name').val()) {
                        toastr.error('Please Enter sub sub category name')
                        return
                    }
                    
                    var category_name = $("#subsubcategory-name").val()
                    var category_id = $("#subcategory1id").val()

                    $.ajax({
                        url: '/super-admin/shop/add-category',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            category_id,
                            category_name
                        },
                        success: function (data){
                            if(data.success){
                                toastr.success("SubSubCategory Added Successfully!")
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1000);
                            }else{
                                toastr.error("Some error occur")
                            }
                        }
                    })
                })
            });
        }
    };
}());