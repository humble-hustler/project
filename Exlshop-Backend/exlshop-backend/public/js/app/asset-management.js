var ASSET_MANAGEMENT = ASSET_MANAGEMENT || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            var flash = _args.flash;
            const product = _args.product;
            const currentLocation = JSON.parse(_args.currentLocation);
            const session = JSON.parse(_args.session)
            const productRequest = JSON.parse(_args.productRequest)
            $(document).ready(function () {
                
                jQuery(document).ready(function() {
                    jQuery("[required]").after("<span class='required'>*</span>");
                });

                if (flash) {
                    toastr.error(flash)
                }
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'paging': true,
                    'dom': 'lfrtip',
                    'info': true,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/asset-management/products/view-all',
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
                        { 'data': 'catName' },
                        { 'data': 'regular_price' },
                        { 'data': 'discount_price' },
                        { 'data': '' },
                        { 'data': 'quantity'},
                        { 'data': 'sku' },
                        {
                            'render': function (data, type, row, meta) {
                                data = '<a href="#" data-toggle="modal" data-target="#update-product" class="update-product-btn">\n\
                                        <i class="fa fa-pencil" aria-hidden="true" id="update_btn" > </i></a>&nbsp;&nbsp;\n\
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
                        "targets": 2,
                        "render": function (data, type, row) {
                            return `${row.catName}<br>${row.subcatName}<br>${row.subsubcatName}`
                        }
                    },
                    {
                        "targets": 3,
                        "render": function (data, type, row) {
                            return `₹ ${row.regular_price}`
                        },
                        "class": "text-danger"
                    },
                    {
                        "targets": 4,
                        "render": function (data, type, row) {
                            return `₹ ${row.discount_price}`
                        },
                        "class": "text-success"
                    },
                    {
                        "targets": 5,
                        "render": function (data, type, row) {
                            return `₹ ${row.regular_price - row.discount_price}`
                        },
                        "class": "text-warning"
                    },
                    {
                        "targets": 6,
                        "render": function (data, type, row) {
                            return `${row.quantity}`
                        }
                    }
                    ],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-member-id", data.id);
                    },
                    'createdRow': function( row, data, dataIndex ) {
                        $(row).attr('product_id', data.id);
                        $(row).attr('product_name', data.name);
                        $(row).attr('product_description', data.description);
                        $(row).attr('regular_price', data.regular_price);
                        $(row).attr('discount_price', data.discount_price);
                        $(row).attr('sku_number', data.sku);
                        $(row).attr('product-quantity',data.quantity)
                        $(row).attr('is-returnable',data.is_returnable)
                        $(row).attr('no-days',data.returnable_days)
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
                    console.log(session.user.currentLocation.allowed_products, session.user.currentLocation.no_of_req-productRequest.length)
                    if(session.user.currentLocation.allowed_products != null){
                        if(session.user.currentLocation.allowed_products > ((session.user.currentLocation.no_of_req-productRequest.length) > 0 ? session.user.currentLocation.no_of_req-productRequest.length : 0)) {
                            $("#add-existing-product-btn").prop('disabled',false)
                            $("#duplicate-product-btn").prop('disabled',false)
                            $("#import-bulk-btn").prop('disabled',false)
                        } else {
                            toastr.error("Maximum Products Added Already")
                        }
                    }else{
                        toastr.error("please Select payment plan")
                    }
                    
                })
               
             
                $('#import-products-btn').on('click',()=>{
                    var fileval=document.getElementById("import_products_id").files[0]

                    function csvToArray(str, delimiter = ",") {
                        const headers = str.slice(0, str.indexOf("\r\n")).split(delimiter);
                      
                        const rows = str.slice(str.indexOf("\n")+1).split("\r\n");
                        while (rows.length) {                      // Loop while there are still entries
                            const last = rows[rows.length - 1];   // Get the last entry without removing it
                            if (last !== "" && last !== "\r") {     // Is this one to remove?
                                break;                              // No, stop
                            }
                            --rows.length;                         // Yes, remove and keep looping
                        }
                      
                        // Map the rows
                        // split values from each row into an array
                        // use headers.reduce to create an object
                        // object properties derived from headers:values
                        // the object passed as an element of the array
                        const arr = rows.map(function (row) {
                          const values = row.split(delimiter);
                          const el = headers.reduce(function (object, header, index) {
                            object[header] = values[index];
                            return object;
                          }, {});
                          return el;
                        });
                      
                        // return the array
                        return arr;
                    }

                    let reader = new FileReader();
                    reader.addEventListener("loadend", () => { 
                        let data = reader.result;
                        const newdata = csvToArray(data);
                        var column_names=Object.keys(newdata[0]);
                        const productOpts = {
                            _csrf: _csrf,
                            productData: newdata
                        }
                        
                        $.ajax({
                            url: '/app/asset-management/import_products',
                            method: 'POST',
                            data: productOpts,
                            success: function (data) {
                                if (data.success) {
                                    toastr.success('Bulk Product Uploaded successfully!')
                                    window.location ="/app/asset-management/"
                                } else {
                                    toastr.error('Some error occurred')
                                }
                            }
                        });
                      });   
                    reader.readAsText(fileval,(e,d)=>{
                        console.log("data is ",d)
                    })
                })
              $('#duplicate-product-btn').on('click',()=>{
                var product_id =localStorage.getItem("product_id");
                $.ajax({
                    url: '/api/v1/appProduct/duplicateProduct',
                    data:{
                        product_id:product_id
                    },
                    method: 'POST',
                    success: function (data) {
                        $.ajax({
                            url: '/api/v1/appProduct/addduplicateproductimg',
                            data:{
                                insert_id:data.data.insertId,
                                product_id:product_id
                            },
                            method: 'POST',
                            success: function (data) {
                                window.location.reload()
                            }
                        });
                    }
                });
              })
                $(document).on('click','.update-product-btn', function () {
                    $('#product-id1').val($(this).closest('tr').attr('product_id'));
                    $('#product-name1').val($(this).closest('tr').attr('product_name'));
                    $('#product-description1').val($(this).closest('tr').attr('product_description'));
                    $('#product-regular-price1').val($(this).closest('tr').attr('regular_price'));
                    $('#product-discount-price1').val($(this).closest('tr').attr('discount_price'));
                    $('#product-sku1').val($(this).closest('tr').attr('sku_number'))
                    $('#product-quantity1').val($(this).closest('tr').attr('product-quantity'))
                    $('#edit-returnable').val($(this).closest('tr').attr('is-returnable'))
                    $('#edit-days-toreturn').val($(this).closest('tr').attr('no-days'))

                });
                $('#update-product-btn').on('click', function(e){
                    if(!$('#product-name1').val()){
                        $(this).addClass('is-invalid')
                        toastr.error('Please Enter Product Name')
                        return
                    } else {
                        $(this).removeClass('is-invalid')
                    }

                    if(!$('#product-regular-price1').val()){
                        $(this).addClass('is-invalid')
                        toastr.error('Please Enter Regular Price')
                        return
                    } else {
                        $(this).removeClass('is-invalid')
                    }

                    if(!$('#product-discount-price1').val()){
                        $(this).addClass('is-invalid')
                        toastr.error('Please Enter Discount Amount')
                        return
                    } else {
                        $(this).removeClass('is-invalid')
                    }

                    if(!$('#product-sku1').val()){
                        $(this).addClass('is-invalid')
                        toastr.error('Please Enter SKU Number')
                        return
                    } else {
                        $(this).removeClass('is-invalid')
                    }

                    if(!$('#product-quantity1').val()){
                        $(this).addClass('is-invalid')
                        toastr.error('Please Enter Product Quantity')
                        return
                    } else {
                        $(this).removeClass('is-invalid')
                    }

                    const productOpts = {
                        _csrf: _csrf,
                        productId: $('#product-id1').val(),
                        name: $('#product-name1').val(),
                        description: $('#product-description1').val(),
                        regularPrice : $('#product-regular-price1').val(),
                        discountPrice : $('#product-discount-price1').val(),
                        sku:$('#product-sku1').val(),
                        quantity:$('#product-quantity1').val(),
                        isreturnable:$("#edit-returnable").val(),
                        daystoreturn:$("#edit-days-toreturn").val()
                    }
                    
                    $.ajax({
                        url: '/app/asset-management/update',
                        method: 'POST',
                        data: productOpts,
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Product updated successfully!')
                                window.location ="/app/asset-management/"
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                $(document).on('click','.delete-product-btn', function () {
                    $('#product-id2').val($(this).closest('tr').attr('product_id'));
                });
                $("#delete-product-btn").on('click',function (e) {
                    var product_id = $('#product-id2').val();
                    $.ajax({
                        url: '/api/v1/appProduct/deleteProduct',
                        data:{
                            id:product_id
                        },
                        method: 'POST',
                        success: function (data) {
                            $.ajax({
                                url: '/api/v1/appProduct/delete-product-images',
                                data:{
                                    imageId:product_id
                                },
                                method: 'POST',
                                success: function (data) {
                                    window.location.href='/app/asset-management/'
                                }
                            });
                        }
                    });
                });
                
                $('input[name="is_variable"]').on("change", function (){
                    if($(this).val() == 2){
                        $("#sizeId").attr("disabled", false)
                        $("#colorId").attr("disabled", false)
                        $("#size-type").attr("disabled", false)
                        $("#add-size-btn").attr("disabled", false)
                        $("#color-type").attr("disabled", false)
                        $("#add-color-btn").attr("disabled", false)
                    }else{
                        $("#sizeId").attr("disabled", true)
                        $("#sizeId").val("0")
                        $("#colorId").attr("disabled", true)
                        $("#colorId").val("0")
                        $("#size-type").attr("disabled", true)
                        $("#add-size-btn").attr("disabled", true)
                        $("#color-type").attr("disabled", true)
                        $("#add-color-btn").attr("disabled", true)
                    }
                })


                // table.on('click', 'tr', function () {
                //     var memberId = $(table.row(this).node()).attr('data-member-id');
                //     if (table.row(this).node() !== null) {
                //         var memberId = $(table.row(this).node()).attr('data-member-id');
                //         location.href = `/app/asset-management/view/asset/${memberId}`;
                //     }
                // });


                // var dataTableOpt1 = {
                //     'processing': true,
                //     'serverSide': true,
                //     'autoWidth': false,
                //     'ajax': {
                //         'method': 'POST',
                //         'url': '/app/asset-management/requestedcategory/view-all',
                //         // 'url':'/api/v1/appProduct/getProducts',
                //         headers: {
                //             'csrf-token': _csrf
                //         }
                //     },
                //     'columns': [
                //         { 'data': 'id' },
                //         { 'data': 'category_name' },
                //         { 'data': 'subcategory_name' },
                //         { 'data': 'subsubcategory_name' }
                //     ],
                //     'ordering': true,
                //     'aaSorting': [],
                //     'columnDefs': [{
                //         'searchable': false,
                //         'orderable': false,
                //         'className': 'dt-body-center',
                //     },
                //     {
                //         "targets": 1,
                //         "render": function (data, type, row) {
                //             return row.category_name ? row.category_name : '<span class="badge ">-</span>'
                //         }
                //     },
                //     {
                //         "targets": 2,
                //         "render": function (data, type, row) {
                //             return row.subcategory_name ? row.subcategory_name : '<span class="badge ">-</span>'
                //         }
                //     },
                //     {
                //         "targets": 3,
                //         "render": function (data, type, row) {
                //             return row.subsubcategory_name ? row.subsubcategory_name : '<span class="badge ">-</span>'
                //         }
                //     }
                //     ],
                //     rowCallback: function (row, data, index) {
                //         $(row).attr("data-members-id", data.id);
                //     },
                //     'order': [[0, "asc"]]
                // };
                // var table1 = $('#requestCategory-list').DataTable(dataTableOpt1);


                $('#apply-filter').on('click', function () {
                    var table = $('#products-list').dataTable();
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            product_name:$('#product_id').val() ,
                            sku_no: $('#sku_id').val(),                          
                            price_min: $('#minimum_id').val(),
                            price_max: $('#maximum_id').val(),
                            category: $('#filter_category_id').val(),
                            sub_subcategory: $('#filter_subsubcategory_id').val()
                        }
                    }
                    table.fnDraw();
                    $('#filter').modal('hide');
                    $('#reset-filter-btn').show();
                })
                $('#reset-filter-btn').on('click',()=>{
                    var table = $('#products-list').dataTable();
                    $("#product_id").val('')
                    $("#sku_id").val('')
                    $("#minimum_id").val('')
                    $("#maximum_id").val('')
                    $("#filter_category_id").val('')
                    $("#filter_subcategory_id").val('')
                    $("#filter_subsubcategory_id").val('')
                    var tableSettings = table.fnSettings();
                    tableSettings.ajax.data = {
                        filter: {
                            product_name:null,
                            sku_no:null,                          
                            price_min: null,
                            price_max: null,
                            category: null,
                            sub_subcategory: null
                        }
                    }
                    table.fnDraw();
                    $('#reset-filter-btn').hide();
                })
                $("#add-asset-btn").on('click',function () {
                    console.log($('input[name="is_variable"]'))
                    if (! $('#category option:selected').val() && !$('#new_category_id').val()) {
                        toastr.error('Please Select Category')
                        return
                    }
                    if (!$("#subcategory option:selected").val() && !$('#new_subcategory_id').val()) {
                        toastr.error('Please Select Subcategory')
                        return
                    }
                    if (!$('#product-name').val()) {
                        toastr.error('Please Enter Product Name')
                        return
                    }
                    if (!$('#description').val()) {
                        toastr.error('Please Enter Description')
                        return
                    }
                    
                    // var name = $("#product-name").val();
                    // var description = $("#description").val();
                    var category_id 
                    var new_category_id
                    var cat = $("#category").val();
                    var subcategory_id
                    var new_subcategory_id
                    var sub_subcategory_id 
                    var new_sub_subcategory_id 
                    
                  
                    if(!$('#category option:selected').val() )
                    {
                        new_category_id ==$('#new_category_id').val();
                    }else{
                        category_id = $('#category option:selected').val();
                    }
                    if(!$('#subsubcategory option:selected').val()){
                        new_subcategory_id=$('#new_subcategory_id').val()
                    }else{
                        subcategory_id= $("#subcategory option:selected").val();
                    }
                    if(!$("#subsubcategory option:selected").val()){
                        new_sub_subcategory_id=$('#new_subsubcategory_id').val()
                    }else{
                        sub_subcategory_id=$("#subsubcategory option:selected").val();
                    }

                    var myFormData = new FormData();
                    myFormData.append('_csrf', _csrf);
                    myFormData.append('product_name', $("#product-name").val())
                    myFormData.append('description',  $("#description").val())
                    myFormData.append('category_id', category_id)
                    myFormData.append('subcategory_id', subcategory_id)
                    myFormData.append('sub_subcategory_id', sub_subcategory_id)
                    myFormData.append('new_category_id', new_category_id)
                    myFormData.append('new_subcategory_id', new_subcategory_id)
                    myFormData.append('new_sub_subcategory_id', new_sub_subcategory_id)
                    myFormData.append('Files', $("#request-product-image")[0].files[0]);
                    $.ajax({
                          url: "/app/asset-management/send/product_request",
                          data: myFormData,
                          contentType: false,
                          processData: false,
                        // data: {
                        //     product_name: name,
                        //     description: description,
                        //     category_id: category_id,
                        //     subcategory_id: subcategory_id,
                        //     sub_subcategory_id: sub_subcategory_id,
                        //     new_category_id: new_category_id,
                        //     new_subcategory_id: new_subcategory_id,
                        //     new_sub_subcategory_id: new_sub_subcategory_id,
                        //     _csrf: _csrf
                        // },
                        method: 'POST',
                        success: function (data) {
                            toastr.success(' Product Request Sent successfully!');
                            window.location.reload();
                        },
                        error: function (data, status, error) {
                            toastr.error('Some error occurred')
                        }
                    });
                });
                $("#add-existing-asset-btn").click(function (e) {
                    if (!$("#globalProduct_id option:selected").html()) {
                        toastr.error('Please Enter Product Name')
                        return
                    }
                    if (!$("#category2id").val()) {
                        toastr.error('Please Select Category Name')
                        return
                    }
                    if (!$("#subcategory2").val()) {
                        toastr.error('Please Select Subcategory Name')
                        return
                    }
                    if (!$('#subsubcategory2').val()) {
                        toastr.error('Please Select Subsubcategory Name')
                        return
                    }
                    if(!$("#globalProduct_id").val()){
                        toastr.error('Please Select Product')
                        return
                    }
                    if(!$("#quantity-id").val()){
                        toastr.error('Please Enter Quantity')
                        return
                    }
                    if(!$("#regular-price").val()){
                        toastr.error('Please Enter Regular Price')
                        return
                    }
                    if(!$("#discount-price").val()){
                        toastr.error('Please Enter Discount Amount')
                        return
                    }
                    
                    if(!$('input[name="is_variable"]:checked').val()){
                        toastr.error('Please Select Is Variable')
                        return
                    }else{
                        if($('input[name="is_variable"]:checked').val() == 2){
                            if(!$("#sizeId").val()){
                                toastr.error("Please Select Size")
                                return
                            }
                            if(!$("#colorId").val()){
                                toastr.error("Please Select Color")
                                return
                            }
                        }
                    }

                    var name = $("#globalProduct_id option:selected").html();
                    var cat_id = $("#globalProduct_id option:selected").attr('catId');
                    var id = $("#globalProduct_id option:selected").val();
                    var size=$("#sizeId").val();
                    var color=$("#colorId").val();
                    var quantity=$('#quantity-id').val();
                    var isreturnable=$("#returnable").val();
                    var daystoreturn=$("#days-toreturn").val();
                    var is_variable = $('input[name="is_variable"]:checked').val()
                    var regular_price = $("#regular-price").val()
                    var discount_price = $("#discount-price").val()
                    $.ajax({
                        //   url: "/api/v1/appProduct/addProducts",
                        url: "/app/asset-management/add/shop_product",
                        data: {
                            cat_id: cat_id,
                            product_name: name,
                            id: id,
                            size,
                            color,
                            quantity,
                            is_variable,
                            isreturnable,
                            daystoreturn,
                            regular_price,
                            discount_price,
                            _csrf: _csrf
                        },
                        method: 'POST',
                        success: function (data) {
                            toastr.success('Existing Product Added successfully!');
                            window.location.reload();
                        },
                        error: function (data, status, error) {
                            toastr.error('Some error occurred')
                        }
                    });
                });
                $("#add-category-btn").click(function (e) {
                    var name = $("#category-id").val();
                    if (name == "") {
                        toastr.error('Please enter category name!!');
                        return false;
                    }else{
                        $.ajax({
                            //   url: "/api/v1/appProduct/addProducts",
                            url: "/app/asset-management/add/shop_category",
                            data: {
                                category_name: name,
                                _csrf: _csrf
                            },
                            method: 'POST',
                            success: function (data) {
                                toastr.success(' Category Request Sent successfully!');
                                window.location.reload();
                            },
                            error: function (data, status, error) {
                                toastr.error('Some error occurred')
                            }
                        });
                    }
                });
                $("#add-subcategory-btn").click(function (e) {
                    // var category_id = $("#category").val();
                    //var category_id = $('#category-id').find(":selected").val(); 
                    var category_id = $("#categoryid option:selected").val();
                    var name = $("#subcategory-id").val();
                    $.ajax({
                        //   url: "/api/v1/appProduct/addProducts",
                        url: "/app/asset-management/add/shop_subcategory",
                        data: {
                            subcategory_name: name,
                            category_id: category_id,
                            _csrf: _csrf
                        },
                        method: 'POST',
                        success: function (data) {
                            toastr.success('Subcategory Request Sent successfully!');
                            window.location.reload();
                        },
                        error: function (data, status, error) {
                            toastr.error('Some error occurred')
                        }
                    });
                });
                $("#add-subsubcategory").click(function (e) {
                    var category_id = $("#category1id option:selected").val();
                    var subcategory_id = $("#subcategory1id option:selected").val();
                    var name = $("#subsubcategory-id").val();
                    $.ajax({
                        //   url: "/api/v1/appProduct/addProducts",
                        url: "/app/asset-management/add/shop_subsubcategory",
                        data: {
                            subcategory_id: subcategory_id,
                            category_id: category_id,
                            subsubcategory_name: name,
                            _csrf: _csrf
                        },
                        method: 'POST',
                        success: function (data) {
                            toastr.success('Sub-SubCategory Request Sent successfully!');
                            window.location.reload();
                        },
                        error: function (data, status, error) {
                            toastr.error('Some error occurred')
                        }
                    });
                });
                $('#update-inventory').on('click', function () {
                    const comment = $('#inventory-comment').val()
                    const inventoryCount = $('#inventory-qty').val()
                    if (!comment || !inventoryCount) {
                        toastr.error('Please enter Inventory Count and Comment')
                        return false
                    }

                    $.ajax({
                        url: '/api/v1/productlist/update-product-inventory',
                        // url: '/super-admin/shop/update/product-inventory',
                        method: 'POST',
                        data: {
                            _csrf:  _csrf,
                            id: $('#product-id').val(),
                            comment,
                            inventoryCount
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#product-inventory-log tbody').prepend(`<tr><td>${comment}</td><td>${inventoryCount}</td><td>${moment().format('Do MMM YYYY hh:mm A')}</td></tr>`)
                                toastr.success('Inventory Updated!')
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                });
        
                $('#globalProduct').on('change', function () {
                    const productId = $(this).val()
                    $.ajax({
                        url: '/app/asset-management/get-globalproducts',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            productId
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Successfully!');
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                $('#category').on('change', function () {
                    var category_id = $('#category').find(":selected").val();
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
                                $('#subcategory').empty().append('<option disabled selected value>Select Subcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subcategory').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                $('#category1id').on('change', function () {
                    var category_id = $('#category1id').find(":selected").val();
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
                                $('#subcategory1id').empty().append('<option disabled selected value>Select Subcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subcategory1id').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                $('#category2id').on('change', function () {
                    var category_id = $('#category2id').find(":selected").val();
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
                                $('#subcategory2').empty().append('<option disabled selected value>Select Subcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subcategory2').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
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
                $('#subcategory2').on('change', function () {
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
                                $('#subsubcategory2').empty().append('<option disabled selected value>Select SubSubcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subsubcategory2').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })

                $('#subcategory').on('change', function () {
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
                                $('#subsubcategory').empty().append('<option disabled selected value>Select SubSubcategory</option>');
                                data.subcategories.forEach((c) => {
                                    $('#subsubcategory').append(`<option value=${c.id}>${c.name}</option>`);
                                })
                            }
                        }
                    });
                })
                // $('#update-product-btn').on('click', function () {
                //     var valid = false;
                //     $('.required').each(function () {
                //         if (!$(this).val()) {
                //             $(this).addClass('is-invalid')
                //             valid = false;
                //         } else {
                //             valid = true;
                //         }
                //     })

                //     if (!valid) {
                //         toastr.error('Please complete mandatory fields')
                //         return false;
                //     } else {
                //         $('.required').each(function () {
                //             $(this).removeClass('is-invalid')
                //         })
                //         var catIds = [];
                //         $('.categories').each(function () {
                //             if ($(this).prop('checked')) {
                //                 catIds.push($(this).val())
                //             }
                //         })
                //         const productOpts = {
                //             _csrf: _csrf,
                //             productId: product.id,
                //             name: $('#product-name').val(),
                //             description: $('#product-description').val(),
                //             catIds
                //         }
                //         if ($('#product-type').val() == 1) {
                //             productOpts.regularPrice = $('#product-regular-price').val()
                //             productOpts.discountPrice = $('#product-discount-price').val()
                //             productOpts.sku = $('#product-sku').val()
                //         }
                //         $.ajax({
                //             url: '/app/asset-management/update',
                //             method: 'POST',
                //             data: productOpts,
                //             success: function (data) {
                //                 if (data.success) {
                //                     toastr.success('Product updated successfully!')
                //                 } else {
                //                     toastr.error('Some error occurred')
                //                 }
                //             }
                //         });
                //     }
                // })
                $('#featured-image-input1').on('change', () => {
                    var form = $('#product-images')[0];
                    var formData = new FormData(form);
                    formData.append('_csrf', _csrf);
                    formData.append('productId', product.id);
                    $.ajax({
                        url: '/app/asset-management/add/product-images',
                        //    url: `/super-admin/shop/add/product-images`,
                        type: 'POST',
                        data: formData,
                        processData: false, // tell jQuery not to process the data
                        contentType: false, // tell jQuery not to set contentType
                        success: function (data) {
                            var images = data.result;
                            images.forEach((i) => {
                                $('.library-images-wrapper').append(`<div class="single-image"> <img src="${i.fileName}" class="library-image" /><br> </div>`)
                            })
                        }
                    });
                })
                $(document).on('change','#featured-image-input', () => {
                    var form = $('#product-images')[0];
                    var formData = new FormData(form);
                    formData.append('_csrf',  _csrf );
                    formData.append('productId',localStorage.getItem("product_id") );
                    // alert(form)
                    // alert(localStorage.getItem("product_id"))
                    $.ajax({
                        url: '/app/asset-management/add/product-images',
                        //    url: `/super-admin/shop/add/product-images`,
                        type: 'POST',
                        data: formData,
                        processData: false, // tell jQuery not to process the data
                        contentType: false, // tell jQuery not to set contentType
                        success: function (data) {
                            var images = data.result;
                            images.forEach((i) => {
                                $('.library-images-wrapper').append(`<div class="single-image"> <img src="${i.fileName}" class="library-image" /><br>
                                <input type="radio" 
                                name="set_featured" 
                                class="set-featured"
                                data-image-name=${i.fileName}
                                ${i.isFeatured} ? 'checked' : ''  />
                                <label for="image-${i.fileName}">Set Featured</label><br>
                                <a href="#"   class="text-danger delete-image"
                                data-image-name="${i.fileName}">Delete</a>
                                </div>`)
                            })
                        }
                    });
                })
          
                $(document).on('click','#image_list',()=>{
                   fetch('/app/asset-management/getimages', {  
                    // Adding method type
                    method: "POST",
                    // Adding body or contents to send
                    headers: {  'Content-Type': 'application/json','Accept':'application/json' },
                    body: JSON.stringify({
                        _csrf:_csrf,
                        product_id: localStorage.getItem("product_id")
                       
                   })
                   
                 })
                 .then(res => res.json())
                 .then(data => {
                    let grocerylist1="";
                    data.data.map((e1,index)=>{
                     
                     grocerylist1+=` 
                        <div class="single-image">
                            <img src= ${e1.file_name} class="library-image" /><br>
                            <input type="radio" 
                            name="set_featured" 
                            class="set-featured"
                            data-image-id=${e1.id} 
                            id="image-${e1.id}"
                            data-product-id=${e1.product_id} 
                            ${e1.is_featured}? 'checked' : ''  />
                             <label for="image-${e1.id}">Set Featured</label><br>
                            <a href="#"   class="text-danger delete-image"
                                data-image-id="${e1.id}" data-product-id=${e1.product_id} >Delete</a>
                        </div>`;
                        document.getElementById("imglist").innerHTML=grocerylist1;
                    })
                      
                       // $(mydiv).show();
                   
                    });
                    
           
                })
                
                $(document).on('change','.set-featured', function () {
                    const productId = $(this).data('product-id')
                    const imageId = $(this).data('image-id')
                    const imageName = $(this).data('image-name')
                    $.ajax({
                        url:'/api/v1/appProduct/update-product-featured-image',
                       // url: '/super-admin/shop/update/product-featured-image',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            productId,
                            imageId,
                            imageName
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Featured Image Set Successfully!')
                                window.location.reload()
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                });
             
                $(document).on('click','.delete-image', function () {
                    const imageId = $(this).data('image-id')
                    const imageName = $(this).data('image-name')
                    var $this = $(this)
                    $.ajax({
                        url:'/api/v1/appProduct/delete-product-images',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            imageId,
                            imageName
                        },
                        success: function (data) {
                            if (data.success) {
                                $($this).parent().fadeOut()
                                toastr.success('Image Deleted Successfully!')
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
    
                $('#subsubcategory2').on('change', () => {
                    const subsubcategory_val = $("#subsubcategory2").val()
                 
                    $.ajax({
                        url: '/app/asset-management/productsbycatid',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            subsubcategory_val
                        },
                        success: function (data) {
                            if (data.success) {
                                if(data.asset.length > 0) {
                                    $('#globalProduct_id').empty().append('<option disabled selected value>Select products</option>');
                                    data.asset.forEach((a) => {
                                        $('#globalProduct_id').append(`<option value=${a.id}>${a.name}</option>`);
                                    })
                                } else {
                                    toastr.error('No Products available')
                                }
                            } else {
                                toastr.error('Some error occurred')
                            }
                        }
                    });
                })
                $('#product-name').on('change', function () {
                       var name = $("#product-name").val();
                        $.ajax({
                            url: '/app/asset-management/duplicate_product',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                name:name
                            },
                            success: function (data) {
                                if (data.success) {
                                   
                                    if(Object.keys(data.data).length==0 )
                                    toastr.success('Selected Unique Product !!!')
                                    else {
                                    toastr.error('Product Exist already' )
                                    return
                                    }
                                } else {
                                    toastr.error('Some Error Occured')
                                }
                            }
                        });
                })
                $('#new_category_id').on('change',()=>{
                    var  new_cat_val=$('#new_category_id').val()
                    $.ajax({
                        url:'/app/asset-management/category_check',
                        method:'POST',
                        data:{
                            _csrf:_csrf,
                            new_cat_val:new_cat_val
                        },
                        success:function(data){
                            if (data.success) {
                                if(data.category_checked.length==0 )
                                toastr.success('Entered Unique Category !!!')
                                else {
                                toastr.error('Category Exist already' )
                                return
                                }
                            } else {
                                toastr.error('Some Error Occured')
                            } 
                        }
                    })
                })
                $('#new_subcategory_id').on('change',()=>{
                    if (! $('#category option:selected').val() && !$('#new_category_id').val()) {
                        toastr.error('Please Select Category')
                        return
                    }
                    var  new_subcat_val=$('#new_subcategory_id').val()
                    var   category_id=$('#category option:selected').val()
                    $.ajax({
                        url:'/app/asset-management/subcategory_check',
                        method:'POST',
                        data:{
                            _csrf:_csrf,
                            new_subcat_val:new_subcat_val,
                            category_id
                        },
                        success:function(data){
                            if (data.success) {
                                if(data.subcategory_checked.length==0 )
                                toastr.success('Entered Unique Category !!!')
                                else {
                                toastr.error('Category Exist already' )
                                return
                                }
                            } else {
                                toastr.error('Some Error Occured')
                            } 
                        }
                    })
                })

                $("#returnable").on('change', function() {
                    if ($(this).val() == 1) {
                        $("#days-toreturn").prop('disabled',false)
                        $("#days-toreturn").prop('required',true);
                        $("#days-toreturn").after("<span class='required'>*</span>");
                    } else {
                        $("#days-toreturn").prop('disabled',true)
                        $("#days-toreturn").prop('required',false);
                        $("#days-toreturn").next().remove()
                    }
                })

                $("#edit-returnable").on('change', function() {
                    if ($(this).val() == 1) {
                        $("#edit-days-toreturn").prop('disabled',false)
                        $("#edit-days-toreturn").prop('required',true);
                        $("#edit-days-toreturn").after("<span class='required'>*</span>");
                    } else {
                        $("#edit-days-toreturn").prop('disabled',true)
                        $("#edit-days-toreturn").prop('required',false);
                        $("#edit-days-toreturn").next().remove()
                    }
                })

                $('#new_subsubcategory_id').on('change',()=>{
                    if (! $('#category option:selected').val() && !$('#new_category_id').val()) {
                        toastr.error('Please Select Category')
                        return
                    }
                    if( ! $('#subcategory option:selected').val()   && !$('#new_subcategory_id').val()){
                        toastr.error('Please Select SubCategory')
                        return
                    }
                    var  new_subsubcat_val=$('#new_subsubcategory_id').val()
                    var   subcategory_id=$('#subcategory option:selected').val()
                    $.ajax({
                        url:'/app/asset-management/subsubcategory_check',
                        method:'POST',
                        data:{
                            _csrf:_csrf,
                            new_subsubcat_val:new_subsubcat_val,
                            subcategory_id
                        },
                        success:function(data){
                            if (data.success) {
                                if(data.subsubcategory_checked.length==0 )
                                toastr.success('Entered Unique Category !!!')
                                else {
                                toastr.error('Category Exist already' )
                                return
                                }
                            } else {
                                toastr.error('Some Error Occured')
                            } 
                        }
                    })
                })
               
                $("#add-size-btn").on("click", function (){
                    var size = $(this).parent().parent().find("#size-type").val()

                    $.ajax({
                        url : `/app/asset-management/add-new-size`,
                        method : "POST",
                        data : {
                            _csrf:_csrf,
                            size
                        },
                        success: function(data){
                            if(data.success){
                                var insert_id = data.id
                                console.log(insert_id, "llllllllllllllllll")
                                toastr.success("Size Added Succesfully!")
                                $.ajax({
                                    url : `/app/asset-management/getSizes`,
                                    method: "POST",
                                    data : {
                                        _csrf:_csrf,
                                    },
                                    success : function(data1){
                                        console.log(data1)
                                        if(data1.success){
                                            var option = ``
                                            data1.sizes.forEach((s)=>{
                                                option += ` <option value="${s.id}" ${s.id == insert_id ? "selected" : ""}>${s.Name}</option>`
                                            })
                                            $("#sizeId").empty().append(option)
                                        }else{
                                            toastr.error("Some error occur")
                                        }
                                    }
                                })
                                
                            }else{
                                toastr.error("Some error occur")
                            }
                        }
                    })
                })


                $("#add-color-btn").on("click", function (){
                    var color = $(this).parent().parent().find("#color-type").val()

                    $.ajax({
                        url : `/app/asset-management/add-new-color`,
                        method : "POST",
                        data : {
                            _csrf:_csrf,
                            color
                        },
                        success: function(data){
                            if(data.success){
                                var insert_id = data.id
                                toastr.success("Color Added Succesfully!")
                                $.ajax({
                                    url : `/app/asset-management/getColors`,
                                    method: "POST",
                                    data : {
                                        _csrf:_csrf,
                                    },
                                    success : function(data1){
                                        if(data.success){
                                            console.log(data1)
                                            var option = ``
                                            data1.colors.forEach((c)=>{
                                                option += ` <option value="${c.id}" ${c.id == insert_id ? "selected" : ""}>${c.name}</option>`
                                            })
                                            $("#colorId").empty().append(option)
                                        }else{
                                            toastr.error("Some error occur")
                                        }
                                    }
                                })
                                
                            }else{
                                toastr.error("Some error occur")
                            }
                        }
                    })
                })

        //         $('#purchase-date').datetimepicker({
        //             format: 'D/M/Y'
        //         });

        //         $('#add-vendor-btn').click(function () {
        //             if (!$('#vendor-name').val()) {
        //                 $('#vendor-name').addClass('is-invalid').next('.invalid-feedback').text('Please Provide a Vendor Name');
        //                 return;
        //             }
        //             $('#vendor-name').removeClass('is-invalid').next('.invalid-feedback').text('');
        //             $.ajax({
        //                 url: '/app/settings/add/vendor',
        //                 method: 'POST',
        //                 data: {
        //                     _csrf: _csrf,
        //                     vendorName: $('#vendor-name').val(),
        //                     vendorGST: $('#vendor-gst').val(),
        //                 },
        //                 success: function (data) {
        //                     if (data.success) {
        //                         toastr.success('vendor added successfully!');
        //                     } else {
        //                         toastr.error('Some error occurred')
        //                     }
        //                     $('#add-new-vendor').modal('hide');
        //                 }
        //             });
        //         })

        //         $('#vendor').select2({
        //             placeholder: 'Search Vendor',
        //             ajax: {
        //                 url: '/app/settings/search/vendor',
        //                 method: 'POST',
        //                 data: function (params) {
        //                     if (params.term) {
        //                         var query = {
        //                             _csrf: _csrf,
        //                             vendorName: params.term,
        //                         }
        //                         return query;
        //                     }
        //                 },
        //                 processResults: function (data) {
        //                     if (data.success) {
        //                         var searchResult = []
        //                         data.vendors.forEach((w) => {
        //                             searchResult.push({
        //                                 id: w.id,
        //                                 text: `${w.vendor_name}`
        //                             })
        //                         })
        //                         return {
        //                             results: searchResult
        //                         };
        //                     }
        //                 }
        //             }
        //         })

        //         /* Add Equipment. Eg. Treadmill, Barbell */
        //         $('#add-equipment-btn').on('click', function () {
        //             var $value = $('#equipment-name');
        //             if ($value.val()) {
        //                 $.ajax({
        //                     url: '/app/settings/add/equipment',
        //                     method: 'POST',
        //                     data: {
        //                         _csrf: _csrf,
        //                         equipmentName: $value.val(),
        //                         category: $('#equipment-cat').val()
        //                     },
        //                     success: function (data) {
        //                         $('#add-new-equipment').modal('hide');
        //                         if (data.success) {
        //                             $('#equipment-type').append('<option value=' + data.id + '>' + $value.val() + '</option>');
        //                             $value.val('');
        //                             toastr.success('Equipment added successfully!');
        //                         } else {
        //                             toastr.error('Some error occurred')
        //                         }
        //                     }
        //                 });
        //             } else {
        //                 toastr.error('Please fill the Equipment name.');
        //             }
        //         })

        //         $(document).on('click', '.update-asset', function () {
        //             $('#add-new-team-asset').text('Update Asset');
        //             $('#add-new-asset form').attr('action', '/app/asset-management/update');
        //             $('#add-new-asset form').attr('id', 'asset-form-update');
        //             $('#add-asset-btn').addClass('display-hidden');
        //             $('#update-asset-btn').removeClass('display-hidden');
        //             $('[name=asset_id]').val($(this).attr('asset_id'));
        //             $.ajax({
        //                 url: '/app/asset-management/get-single-asset',
        //                 method: 'POST',
        //                 data: {
        //                     _csrf: _csrf,
        //                     id: $(this).attr('asset_id')
        //                 },
        //                 success: function (data) {
        //                     if (data.success) {
        //                         var purchase_date = moment(data.asset.purchase_date).format('DD/MM/YYYY');
        //                         $('#asset-id').val(data.asset.id);
        //                         $('#asset-name').val(data.asset.asset_name);
        //                         $('#purchase-date').val(purchase_date);
        //                         $('#purchase-value').val(data.asset.purchase_value);
        //                         $('#warranty').val(data.asset.warranty_months);
        //                         $('#manufacturer').val(data.asset.manufacturer);
        //                         $('#model').val(data.asset.model);
        //                         $('#serial-number').val(data.asset.serial_number);

        //                         if (data.asset.category == 1) {
        //                             $('.gym-equipment').removeClass('display-hidden');
        //                             $('.office-equipment').addClass('display-hidden');
        //                             $('[name=category][value=gym]').attr('checked', true)
        //                             $('#equipment-type').val(data.asset.equipment_type_id)
        //                         } else if (data.asset.category == 2) {
        //                             $('.gym-equipment').addClass('display-hidden');
        //                             $('.office-equipment').removeClass('display-hidden');
        //                             $('[name=category][value=office]').attr('checked', true)
        //                             $('#office-equipment-type').val(data.asset.equipment_type_id)
        //                         }
        //                         var option = '<option value=' + ((data.asset.vendor_id) ? (data.asset.vendor_id) : (0)) + ' selected>\n\
        //                                         '+ ((data.asset.vendor_name) ? (data.asset.vendor_name) : ('')) + '</option>';
        //                         $('#vendor').append(option);
        //                     }
        //                 }
        //             });
        //         })

        //         $('#add-new-asset-btn').click(function () {
        //             $('#add-new-team-asset').text('Add Product');
        //             // $('#add-new-asset form').attr('action','/app/asset-management/add');
        //             $('#add-asset-btn').removeClass('display-hidden');
        //             $('#update-asset-btn').addClass('display-hidden');
        //             $('#add-new-asset input[type=text]').val('');
        //             $('#add-new-asset input[type=number]').val('');
        //             $('#add-new-asset select').val('');
        //         })

        //         $('[name=category]').change(function () {
        //             var val = $(this).val();
        //             if (val == 'gym') {
        //                 $('.gym-equipment').removeClass('display-hidden');
        //                 $('.office-equipment').addClass('display-hidden');
        //             } else {
        //                 $('.gym-equipment').addClass('display-hidden');
        //                 $('.office-equipment').removeClass('display-hidden');
        //             }
        //         })

        //         $('.add-new-file-row').click(function () {
        //             $('#asset-file-table tbody').append($('#sample-row').clone().removeAttr('id').removeClass('display-hidden').addClass('active-tr'));
        //         })

        //         // $(document).on('submit','#asset-form-add',function(e){
        //         //     e.preventDefault();
        //         //     var files = [];
        //         //     var form_data=  new FormData();
        //         //     // $('.active-tr').each(function(a,i){
        //         //     //     if($(this).find('.asset-file').val()){
        //         //     //         var file = $(this).find('.asset-file')[0];
        //         //     //         form_data.append('file', file.files[0]);
        //         //     //     }
        //         //     // })

        //         //     // form_data.append('asset_files', files);
        //         //     // form_data.append('asset_name', $('[name=asset_name]').val());
        //         //     // form_data.append('equipment_type', $('[name=equipment_type]').val());
        //         //     // form_data.append('office_equipment_type', $('[name=office_equipment_type]').val());
        //         //     // form_data.append('purchase_date', $('[name=purchase_date]').val());
        //         //     // form_data.append('purchase_value', $('[name=purchase_value]').val());
        //         //     // form_data.append('warranty', $('[name=warranty]').val());
        //         //     // form_data.append('manufacturer', $('[name=manufacturer]').val());
        //         //     // form_data.append('model', $('[name=model]').val());
        //         //     // form_data.append('serial_number', $('[name=serial_number]').val());
        //         //     // form_data.append('vendor', $('[name=vendor]').val());
        //         //     // form_data.append('category', $('[name=category]:checked').val());
        //         //       form_data.append('product',$('[name=asset_name]').val())
        //         //      
        //         //     $.ajax({
        //         //         headers:{
        //         //             'X-CSRF-TOKEN':_csrf
        //         //         },
        //         //         // url: '/app/asset-management/add',
        //         //         url :'/api/v1/productlist/add-products',
        //         //         method: 'POST',
        //         //         enctype: 'multipart/form-data',
        //         //         contentType: false,
        //         //         processData: false,
        //         //         data: form_data,
        //         //         success: function(data){

        //         //             if(data.success){
        //         //                 window.location.reload();
        //         //             }
        //         //         }
        //         //     })
        //         // })

        //         $(document).on('submit', '#asset-form-update', function (e) {

        //             e.preventDefault();
        //             // var files = [];
        //             var form_data = new FormData();
        //             // $('.active-tr').each(function(a,i){
        //             //     if($(this).find('.asset-file').val()){
        //             //         var file = $(this).find('.asset-file')[0];
        //             //         form_data.append('file', file.files[0]);
        //             //     }
        //             // })

        //             // form_data.append('asset_files', files);
        //             form_data.append('asset_name', $('[name=asset_name]').val());
        //             form_data.append('equipment_type', $('[name=equipment_type]').val());
        //             form_data.append('office_equipment_type', $('[name=office_equipment_type]').val());
        //             form_data.append('purchase_date', $('[name=purchase_date]').val());
        //             form_data.append('purchase_value', $('[name=purchase_value]').val());
        //             form_data.append('warranty', $('[name=warranty]').val());
        //             form_data.append('manufacturer', $('[name=manufacturer]').val());
        //             form_data.append('model', $('[name=model]').val());
        //             form_data.append('serial_number', $('[name=serial_number]').val());
        //             form_data.append('vendor', $('[name=vendor]').val());
        //             form_data.append('category', $('[name=category]:checked').val());
        //             form_data.append('asset_id', $('[name=asset_id]').val());

        //             $.ajax({
        //                 headers: {
        //                     'X-CSRF-TOKEN': _csrf
        //                 },
        //                 url: '/app/asset-management/update',
        //                 method: 'POST',
        //                 enctype: 'multipart/form-data',
        //                 contentType: false,
        //                 processData: false,
        //                 data: form_data,
        //                 success: function (data) {

        //                     if (data.success) {
        //                         $('#add-new-asset').modal('hide');
        //                         $('#members-list').DataTable().ajax.reload()
        //                     }
        //                 }
        //             })
        //         })

        //         // $('#category').change(function(){
        //         //     $('#members-list').dataTable().fnDraw();
        //         //     var table = $('#members-list').dataTable();
        //         //     var tableSettings = table.fnSettings();
        //         //     tableSettings.ajax.data = {
        //         //         category: $('#category').val()
        //         //     }
        //         //     table.fnDraw();
        //         // })

        //         $(document).on('click', '.delete-asset', function () {
        //             $('#delete-asset-id').val($(this).attr('asset_id'))
        //         })
        //     });
        // }
    // };
        })
        }
    }
}());