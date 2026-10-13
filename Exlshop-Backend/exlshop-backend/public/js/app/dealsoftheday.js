var DEALS = DEALS || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            var flash = _args.flash;
            const session = JSON.parse(_args.session)
            $(document).ready(function () {
                
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'paging': true,
                    'dom': 'lfrtip',
                    'info': true,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/asset-management/products/DealsofTheDay',
                        // 'url':'/api/v1/appProduct/getProducts',
                        headers: {
                            'csrf-token': _csrf,
                            content:'sreverFilter'
                        }
                    },
                    "initComplete": function(settings, json) {
                        var api = this.api();
                        var numRows = api.rows( ).count();
                        $("#add-existing-product-btn").attr('curr-product',numRows)
                        // Place the value in your HTML using jQuery, etc
                    },
                    'columns': [
                        { 'data': "file_name" },
                        { 'data': 'name' },
                        { 'data': 'shop' },
                        { 'data': 'location' },
                        { 'data': 'start_date' },
                        { 'data': 'end_date' },
                        {
                            'render': function (data, type, row, meta) {
                                data = '&nbsp;&nbsp;\n\
                                    <a href="#" data-toggle="modal" data-target="#delete-product" class="delete-product-btn">\n\
                                        <i class="fa fa-trash" aria-hidden="true" id="delete-btn"value="data.lname"></i>\n\
                                    </a>';

                                return data;
                            }
                        }
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },
                    {
                        "targets": 0,
                        "render": function (data, type, row) {
                            var featuredImg = ``
                            if (data) {
                                featuredImg = `<img src="${data}" class="mr-10" width="60" />`
                            } else {
                                featuredImg = `<img src="${row.image}" class="mr-10" width="60" />`
                            }
                            return featuredImg
                        }
                    },
                    {
                        "targets": 4,
                        "render": function (data, type, row) {
                            return data ? moment(data).format('DD-MM-YYYY') : ''
                        }
                    },
                    {
                        "targets": 5,
                        "render": function (data, type, row) {
                            return data ? moment(data).format('DD-MM-YYYY') : ''
                        }
                    },
                    {
                        "targets": 0,
                        "render": function (data, type, row) {
                            var featuredImg = ``
                            if (data) {
                                featuredImg = `<img src="${data}" class="mr-10" width="60" />`
                            } else {
                                featuredImg = `<img src="${row.image}" class="mr-10" width="60" />`
                            }
                            return featuredImg
                        }
                    },
                    
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-member-id", data.id);
                    },
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('product_id', data.id);
                    },
                    'order': [[0, "asc"]]
                };   
                var table = $('#products-list').DataTable(dataTableOpt);
                table.on('click', 'tr', function () {
                    $(this).addClass('selected').siblings().removeClass("selected");
                    $(this).css('background-color','#cccccc').siblings().css('background-color','')
                    if (table.row(this).node() !== null) {
                        var productId = $(table.row(this).node()).attr('product_id');
                        localStorage.setItem("product_id", productId);
                    }
                });

                table.on('draw.dt', function () { 
                    $("#addedProducts").attr('addedPro', table.page.info().recordsTotal)
                    $("#remaining-products").text( (parseInt($("#addedProducts").attr('allowedPro'))) - (table.page.info().recordsTotal) +' ' +'Products Remaining')
                    
                })

                $("#addproductbtn").on("click", function () {
                    $.ajax({
                        url : '/app/asset-management/products/add-product-to-deals',
                        method : 'POST',
                        data : {
                            _csrf: _csrf,
                            productId : $("#productselect").val(),
                            shopId : session.user.currentLocation.id,
                            brandId : session.user.currentLocation.brands_id,
                            startDate : $("#start-date").val(),
                            endDate : $("#end-date").val()
                        },
                        success : function (data){
                            if(data.success){
                                toastr.success('Added Successfully!')
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1000);
                            }else{
                                toastr.error("Some error occur")
                            }
                        }
                    })
                })

                $(document).on('click','.delete-product-btn', function () {
                    $('#product-id2').val($(this).closest('tr').attr('product_id'));
                });
                $("#delete-product-btn").on('click',function (e) {
                    var product_id = $('#product-id2').val();
                    $.ajax({
                        url: '/app/asset-management/products/delete-deals-product',
                        data:{
                            id:product_id
                        },
                        method: 'POST',
                        success: function (data) {
                            if(data.success){
                                toastr.success('Delete Successfully!')
                                setTimeout(function () {
                                    window.location.reload();
                                }, 1000);
                            }else{
                                toastr.error("Some error occur")
                            }
                        }
                    });
                });
     
            })
        }
    }
}());