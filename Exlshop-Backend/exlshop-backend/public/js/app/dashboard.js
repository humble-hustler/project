var APP_DASHBOARD = APP_DASHBOARD || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            _csrf = _args._csrf;
            userSession = JSON.parse(_args.userSession);

            $(document).ready(function () {
                console.log(userSession)
            });

            // table.on('click', 'tr .order-no', function () {
            //     var order_id = $(this).closest('tr').attr('order_id');
            //     window.location.href=`/app/accounts/view/order/${order_id}`;
            // });

            $('#refresh').on('click', function(){
                if($('#start_date').val() || $('#end_date').val()){
                    window.location.href = '/app/dashboard/?from_date='+$('#start_date').val()+'&to_date='+$('#end_date').val()
                } 
            })

            $('.edit-data').on('change', function() {
                var val = $(this).val();
                var col = $(this).attr('name')
                $.ajax({
                    url: "/app/orders/setOrderAmountDistance",
                    data: {
                        _csrf: _csrf,
                        col:col,
                        val:val
                    },
                    method: 'POST',
                    success: function (data) {
                        if(data.success) {
                            toastr.success('Options Updated successfully!');
                            window.location.reload();
                        }
                    },
                    error: function (data, status, error) {
                        toastr.error('Some error occurred')
                    }
                });
            })

            $('#events').dataTable({
                "scrollY": "200px",
                "searching": false,
                "scrollCollapse": true,
                "pagingType": "full_numbers",
                "paging": true,
                "lengthMenu": [10, 25, 50, 75, 100],
                "order": false
            });

            $('#renewals').dataTable({
                "scrollY": "200px",
                "searching": false,
                "scrollCollapse": true,
                "paging": false
            });
        }
    };
}());