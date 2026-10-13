var SINGLEGROUP = SINGLEGROUP || (function () {
    return {
        init: function (Args) {
            var _args = Args;
            var _csrf = _args._csrf
            var flash = _args.flash

            $(document).ready(function () {
                if (flash) {
                    toastr.error(flash)
                }
                $("#grouplocation-list1 tr").click(function(){
                    $(this).find("td").each(function(){
                        var zip=$(this).attr('lid');
                    location.href = '/app/grouporders/zipcode/' + zip;
                });
            });

            })
        }
    }
}());