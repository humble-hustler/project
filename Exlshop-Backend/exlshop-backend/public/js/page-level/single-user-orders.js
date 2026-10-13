var SINGLE_USER_ORDERS = SINGLE_USER_ORDERS || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;

            $(document).ready(function () {
                $('.shipping-label').popover();
            });
        }
    };
}());