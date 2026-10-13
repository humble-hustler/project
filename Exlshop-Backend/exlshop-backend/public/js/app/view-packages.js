var VIEW_PACKAGES = VIEW_PACKAGES || (function () {
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
                        'url': '/app/packages/view-all/',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'name'},
                        {'data': 'validity_days'},
                        {'data': 'price'},
                        {'data': 'is_pt'},
                        {'data': 'tax_included'},
                        {'data': 'is_active'},
                        {'render': function(data, row, type, meta){
                            var data = `<center><a class="delete-package" data-target="#delete-package" data-toggle="modal"><i class="fa fa-trash"></i> </a></center>`;
                            return data;
                        }}
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
                                return `<input type="text" class="form-control edit-data" data-col-name="name" data-package-id="${row.id}" name="name" value="${data}" placeholder="Name" />`
                            }
                        },
                        {
                            "targets": 1,
                            "render": function (data, type, row) {
                                return `<input type="number" class="form-control edit-data" data-col-name="validity_days" data-package-id="${row.id}" name="name" value="${data}" placeholder="Name" />`
                            }
                        },
                        {
                            "targets": 2,
                            "render": function (data, type, row) {
                                return `<input type="number" step="0.01" class="form-control edit-data" data-col-name="price" data-package-id="${row.id}" name="name" value="${data}" placeholder="Name" />`
                            }
                        },
                        {
                            "targets": 3,
                            "render": function (data, type, row) {
                                return `<input type="checkbox" data-package-id=${row.id} data-plugin="switchery" data-color="#eb6709" data-switch-type="is_pt" class="toggle-switch js-switch" ${data ? `checked` : ''}>`
                            }
                        },
                        {
                            "targets": 4,
                            "render": function (data, type, row) {
                                return `<input type="checkbox" data-package-id=${row.id} data-plugin="switchery" data-color="#eb6709" data-switch-type="tax_included" class="toggle-switch js-switch" ${data ? `checked` : ''}>`
                            }
                        },
                        {
                            "targets": 5,
                            "render": function (data, type, row) {
                                return `<input type="checkbox" data-package-id=${row.id} data-plugin="switchery" data-color="#eb6709" data-switch-type="is_active" class="toggle-switch js-switch" ${data ? `checked` : ''}>`
                            }
                        }],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-package-id", data.id);
                    },
                    order:[[0,'asc']]
                };

                var table = $('#packages-list').DataTable(dataTableOpt);

                table.on('draw.dt', function () {
                    var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
                    elems.forEach(function (html) {
                        new Switchery(html);
                    });
                    $('.toggle-switch').on('change', function () {
                        const packageId = $(this).data('package-id');
                        const col = $(this).data('switch-type');
                        const val = $(this).prop('checked') ? 1 : 0;

                        $.ajax({
                            url: '/app/packages/update',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                packageId,
                                col,
                                val,
                            },
                            success: function (data) {
                                if (data.success) {
                                    toastr.success('Status Updated Successfully')
                                } else {
                                    toastr.error('Some error occurred')
                                }
                            }
                        });
                    })

                    $('.edit-data').on('change', function () {
                        const col = $(this).data('col-name');
                        const val = $(this).val();
                        const packageId = $(this).data('package-id');

                        $.ajax({
                            url: '/app/packages/update',
                            method: 'POST',
                            data: {
                                packageId,
                                col,
                                val
                            },
                            success: function (data) {
                                if (data.success) {
                                    toastr.success('Data Updated Successfully')
                                } else {
                                    toastr.error('Some error occurred')
                                }
                            }
                        });
                    })
                })

                $(document).on('click','.delete-package',function(){
                    $('[name=package_id]').val($(this).closest('tr').attr('data-package-id'));
                })
            });
        }
    };

}());