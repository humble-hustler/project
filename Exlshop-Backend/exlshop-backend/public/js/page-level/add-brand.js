var ADD_BRAND = ADD_BRAND || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            _csrf = _args._csrf

            $(document).ready(function () {

                $("#brand-active").change(function(){
                    cb = $(this);
                    var active =cb.val('0');
                });
                $("#addbtn").click(function (e) {
                    // var elem = document.querySelector('.js-switch');
                    // var init = new Switchery(elem);
                    // alert(init)
                    var name = $("#brand-name").val();
                    var active = $("#brand-active").val();

                    $.ajax({
                        // url: "/api/v1/brands/addBrand",
                        url: "/super-admin/brands/add",
                        data: {
                            name: name,
                            active: active,
                            _csrf: _csrf
                        },
                        method: 'POST',
                        success: function (data) {
                            toastr.success('Brand Added successfully!');
                            window.location = "/super-admin/brands/";
                        },
                        error: function (data, status, error) {
                            toastr.error('Some error occurred')
                        }
                    });
                });

            });

        }
    };
}());