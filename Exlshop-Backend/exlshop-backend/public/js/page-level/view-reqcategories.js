var VIEW_REQCATEGORIES = VIEW_REQCATEGORIES || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const reqcategories = JSON.parse(_args.reqcategories)

            $(document).ready(function () {           
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                       'url': '/super-admin/shop/reqcategories/view-all',
                        headers: {
                            'csrf-token': _csrf,
                        }
                    },
                    'columns': [
                        {'data': 'id'},
                        {'data': 'c_name'},
                        {'data':'sub_name'},
                        {'data':'sub_sub_name'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{ 
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },
                        {
                            "targets": 4,
                            "render": function (data, type, row) {
                                var data =  '<input name="select_all" value="1" type="checkbox"></input>'
                                return data;
                            }
                        },
                        
                    
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-product-id", data.id);
                    },
                    order:[[0,'asc']]
                };

                var table = $('#category-list').DataTable(dataTableOpt);
                $("#add-product-btn").click(function (e) {
                    $("#category-list input[type=checkbox]:checked").each(function () {
                        var row = $(this).closest("tr")[0];
                        id = row.cells[0].innerHTML;
                        c_name = row.cells[1].innerHTML;
                        sub_name=row.cells[2].innerHTML;
                        sub_sub_name=row.cells[3].innerHTML;
                        c_id=row.cells[4].innerHTML;
                        s_id=row.cells[5].innerHTML;
                        $.ajax({
                            url: "/super-admin/shop/add/reqcategory",
                            //url: "/super-admin/brands/locations/team/add-new-member",
                            data: {
                                c_name: c_name,
                                sub_name:sub_name,
                                sub_sub_name:sub_sub_name,
                                id: id,
                                c_id:c_id,
                                s_id,s_id,
                                _csrf: _csrf
                            },
                            method: 'POST',
                            success: function (data) {
                                toastr.success('Category Request Sent successfully!');
                                window.location = "/super-admin/shop/requested/categories";
                            },
                            error: function (data, status, error) {
                                toastr.error('Some error occurred')
                            }
                        });
                    });
                });

                $('#apply-filter').on('click', function () {
                    var table = $('#products-list').dataTable();
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
            });
        }
    };
}());