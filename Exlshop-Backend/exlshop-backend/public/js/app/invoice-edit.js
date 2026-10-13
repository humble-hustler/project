var INVOICE_EDIT = INVOICE_EDIT || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const saleId = _args.saleId;

            $(document).ready(function () {
                $('#update-invoice').click(function(){
                	var sale_line = [];
                	$('.sale-line').each(function(){
                		sale_line.push({
                			packageId: $(this).attr('package_id'),
                			price: $(this).find('.price').val()
                		})
                	})
                	$.ajax({
                        url: '/app/accounts/invoice-edit',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            invoiceDate: $('#invoice_date').val(),
                            notes: $('#notes').val(),
                            saleLine: sale_line,
                            saleId: saleId
                        },
                        success: function (data) {
                            if(data.success){
                            	toastr.success('Invoice Updated successfully')
                			} else {
                           		toastr.error('Some error occurred')
                       		}
                        }
                    });
                })

                $('#invoice_date').datetimepicker({
                    format:'D-M-Y'
                });
            });
        }
    };
}());