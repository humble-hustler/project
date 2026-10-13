var PRODUCTS_LIST = PRODUCTS_LIST || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const categoryId = _args.categoryId
            JSON.parse(categoryId)

            $(document).ready(function () {           
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                       'url': '/super-admin/shop/productsBySubCategory/view-all',
                        headers: {
                            'csrf-token': _csrf,
                        },
                        data: {
                            categoryId
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

            });
        }
    };
}());