var PRODUCT_LIST = PRODUCT_LIST || (function () {
    // $("#listsix").hide();
       
    //    let v=$("#aaa");
    
        $("#showhidemainlist").click(function(){
            
            var collapsablediv=document.getElementById("collapse_1");
            if(collapsablediv.style.display=="none")
            {
                $("#collapse_1").show();
                $("#showhidemainlist").toggleClass('fa fa-chevron-up fa fa-chevron-down')
            
            }
            else
            {
                $("#collapse_1").hide();
                $("#showhidemainlist").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
            }
            
            // $("#collapse_1").toggle();
    });
    
    ///////////RATINGS//////
    
    $("#showhidemainlist1").click(function(){
        var collapsablediv=document.getElementById("ratingcollapse");
        if(collapsablediv.style.display=="none")
        {
            $("#ratingcollapse").show();
            $("#showhidemainlist1").toggleClass('fa fa-chevron-up fa fa-chevron-down')
        
        }
        else
        {
            $("#ratingcollapse").hide();
            $("#showhidemainlist1").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
        }
        
        // $("#collapse_1").toggle();
    });
    /////////////////PRICE RANGE////////////////////////////////////
    
    $("#showhidemainlist2").click(function(){
        
        var collapsablediv=document.getElementById("collapse_3");
        if(collapsablediv.style.display=="none")
        {
            $("#collapse_3").show();
            $("#showhidemainlist2").toggleClass('fa fa-chevron-up fa fa-chevron-down')
        
        }
        else
        {
            $("#collapse_3").hide();
            $("#showhidemainlist2").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
        }
        
        // $("#collapse_1").toggle();
    });
    
    //////offers///
    $("#showhidemainlist3").click(function(){
        
        var collapsablediv=document.getElementById("collapseoffers");
        if(collapsablediv.style.display=="none")
        {
            $("#collapseoffers").show();
            $("#showhidemainlist3").toggleClass('fa fa-chevron-up fa fa-chevron-down')
        
        }
        else
        {
            $("#collapseoffers").hide();
            $("#showhidemainlist3").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
        }
        
        // $("#collapse_1").toggle();
    });
    
    
    
    ///////////DISCOUNT
    $("#collapsediscount").hide();
    $("#showhidemainlist4").click(function(){
        
        var collapsablediv=document.getElementById("collapsediscount");
        if(collapsablediv.style.display=="none")
        {
            $("#collapsediscount").show();
            $("#showhidemainlist4").toggleClass('fa fa-chevron-up fa fa-chevron-down')
        
        }
        else
        {
            $("#collapsediscount").hide();
            $("#showhidemainlist4").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
        }
        
        
    });
    
    ////AVAILABLE
    
    $("#collapseavailability").hide();
    $("#showhidemainlist5").click(function(){
        
        var collapsablediv=document.getElementById("collapseavailability");
        if(collapsablediv.style.display=="none")
        {
            $("#collapseavailability").show();
            $("#showhidemainlist5").toggleClass('fa fa-chevron-up fa fa-chevron-down')
        
        }
        else
        {
            $("#collapseavailability").hide();
            $("#showhidemainlist5").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
        }
        
        
    });
     return {
            
            init: function (Args) {
                const _csrf = Args._csrf;
                const slug = Args.slug;
                 const CId = Args.CId;       
                function getProducts(slug,selected_category2) {
                   
                    var searchValue = $('#search-product').val();
                    var minPrice = ($('#min-price').val())?($('#min-price').val()):(null);
                    var maxPrice = ($('#max-price').val())?($('#max-price').val()):(null);
                    // alert($('#cat').is(":checked"))
                    $.ajax({
                       url: '/get-product-list',
                    //  url:'/api/v1/shop/getproductlist',
                        method: 'POST',
                        data: {
                            _csrf,
                            slug ,
                            CId,
                            searchValue,
                            minPrice,
                            maxPrice,
                            selected_category2
                        },
                        success: function (data) {
                            if (data.success === false) {
                                alert('Some error occurred')
                            } else {
                                $('#product-list').empty().append(data);
                                
                            } 
                        }
                    });
                }
                $(document).ready(function () {
                 
                    getProducts(slug,"");
    
                    $('.cateclass1').click(()=>{
                        var selected_category;
                        if ($('.cateclass1').is(":checked"))
                        {
                            selected_category =$('.cateclass1').val()
                        }
                        getProducts(slug,selected_category);
                    })
                    $('.cateclass2').click(()=>{
                        // alert("pp")
                        var selected_category;
                        // alert($('.cateclass1').val())
                        if ($('.cateclass2').is(":checked"))
                        {
                            selected_category =$('.cateclass2').val()
                        }
                        getProducts(slug,selected_category);
                    })
                    $('.cateclass3').click(()=>{
                        var selected_category;
                        if ($('.cateclass3').is(":checked"))
                        {
                            selected_category =$('.cateclass3').val()
                        }
                        getProducts(slug,selected_category);
                    })
                    $('.cateclass4').click(()=>{
                        var selected_category;
                        if ($('.cateclass4').is(":checked"))
                        {
                            selected_category =$('.cateclass4').val()
                        }
                        getProducts(slug,selected_category);
                    })
                    $('.cateclass191').click(()=>{
                        var selected_category;
                        if ($('.cateclass191').is(":checked"))
                        {
                            selected_category =$('.cateclass191').val()
                        }
                        getProducts(slug,selected_category);
                    })
                    $('.cateclass192').click(()=>{
                        var selected_category;
                        if ($('.cateclass192').is(":checked"))
                        {
                            selected_category =$(this).val()
                        }
                        getProducts(slug,selected_category);
                    })
    
                    $('#search-product').keyup(function(){
                        var searchValue = $(this).val();
                        if(searchValue.length > 3){
                            getProducts(slug);
                        }
                    })
                    $('.product-category').click(function(){
                        getProducts($(this).attr('slug'));
                    })
                    $('#apply-price-range-btn').click(function(){
                        const checked = document.querySelectorAll('input[type="checkbox"]:checked')
                        selected = Array.from(checked).map(x => x.value)            
                        getProducts(slug);
                    })
                })
            }
        };
    }());