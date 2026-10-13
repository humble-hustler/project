var VIEW_REPRODUCTS = VIEW_REPRODUCTS || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const reqproduct = JSON.parse(_args.reqproduct)

            $(document).ready(function () {
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/super-admin/shop/reqproducts/view-all',
                        headers: {
                            'csrf-token': _csrf,
                        }
                    },

                    'columns': [
                        { 'data': 'id' },
                        { 'data': 'name' },
                        { 'data' : 'description'},
                        {'data':'catname'},
                        { 'data': 'category' },
                        { 'data': 'subcategory' },
                        {'data':'subsubcategory'},
                        // { 'data': 'new_category' },
                        { 'data': 'new_subcategory' },
                        {'data':'new_subsubcategory'},

                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },
                    {
                        "targets": 9,
                        "render": function (data, type, row) {
                            var data = `<input name="select_all" id="check_id" value="1" type="checkbox"/>
                            <input id="file_name" value="${row.request_file_name}" type="hidden"/>`
                            return data;
                        }
                    }
        

                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-product-id", data.id);
                    },
                    order: [[0, 'desc']]

                };
                var table = $('#products-list').DataTable(dataTableOpt);

                $("#add-product-btn").on('click',function () {
                    $("#products-list input[type=checkbox]:checked").each(function () {
                        var row = $(this).closest("tr")[0];
                        // var catId= $(this).attr('data-subsubcatId');
                        pname = row.cells[1].innerHTML;
                        id = row.cells[0].innerHTML;
                        var desc = row.cells[2].innerHTML;
                        var catId = row.cells[4].innerHTML;
                        var subCatId = row.cells[5].innerHTML;
                        var subsubCatId = row.cells[6].innerHTML;
                        // var newCatName = row.cells[7].innerHTML;
                        var newsubCatName = row.cells[7].innerHTML;
                        var newsubsubCatName = row.cells[8].innerHTML;
                        var file_name = $(this).siblings('#file_name').val()
                        if(catId && subCatId && subsubCatId) {
                            $.ajax({
                                url: "/super-admin/shop/add/reqproduct",
                                //url: "/super-admin/brands/locations/team/add-new-member",
                                data: {
                                    product_name: pname,
                                    id: id,
                                    desc:desc,
                                    _csrf: _csrf,
                                    catId:subsubCatId,
                                    file_name
                                },
                                method: 'POST',
                                success: function (data) {
                                    toastr.success('Requested  Product Added successfully!');
                                    window.location = "/super-admin/shop/requested/products";
                                },
                                error: function (data, status, error) {
                                    toastr.error('Some error occurred')
                                }
                            });
                        } else {
                            $.ajax({
                                url: "/super-admin/shop/add/reqcategory",
                                //url: "/super-admin/brands/locations/team/add-new-member",
                                data: {
                                    product_name: pname,
                                    id: id,
                                    _csrf: _csrf,
                                    catId:catId,
                                    subCatId:subCatId,
                                    newCatName:newCatName,
                                    newsubCatName:newsubCatName,
                                    newsubsubCatName:newsubsubCatName
                                },
                                method: 'POST',
                                success: function (data) {
                                    $.ajax({
                                        url: "/super-admin/shop/add/reqproduct",
                                        //url: "/super-admin/brands/locations/team/add-new-member",
                                        data: {
                                            product_name: pname,
                                            id: id,
                                            desc:desc,
                                            _csrf: _csrf,
                                            catId:data.result.subsubCatId,
                                        },
                                        method: 'POST',
                                        success: function (data) {
                                            toastr.success('Requested  Product Added successfully!');
                                            window.location = "/super-admin/shop/requested/products";
                                        },
                                        error: function (data, status, error) {
                                            toastr.error('Some error occurred')
                                        }
                                    });
                                },
                                error: function (data, status, error) {
                                    toastr.error('Some error occurred')
                                }
                            });
                        }
                    });

                });

                

                $('#apply-filter').on('click', function () {
                    var table = $('#products-list').dataTable();
                    var tableSettings = table.fnSettings();
                    var categories = [];
                    $('.category').each(function () {
                        if ($(this).is(':checked')) {
                            categories.push($(this).val());
                        }
                    })
                    tableSettings.ajax.data = {
                        filter: {
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
                    $('.category').prop('checked', false);
                })
            });
        }
    };
}());