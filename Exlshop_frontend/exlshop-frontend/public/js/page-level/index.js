var INDEX = INDEX || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const shop_categories = JSON.parse(_args.shop_categories);
            const shop_subcategories = JSON.parse(_args.shop_subcategories);
            const shop_subsubcategories = JSON.parse(_args.shop_subsubcategories);
        }
    }
})