
var SEARCH_SHOP_BYNAME =  SEARCH_SHOP_BYNAME || (function () {

    return {
        init: function (Args) {
            const _csrf = Args._csrf;
            const shops = JSON.parse(Args.shops)
            const myLocation= Args.myLocation;
            const shopdistances= Args.shopdistances;
            const shopid = Args.shopid;
      
        
                $ ('#innersearch').on('click',function(){
                    alert("please enter shop name")
                })

                $("#showhidemainlist").click(function () {
                    var collapsablediv = document.getElementById("collapse_1");
                    if (collapsablediv.style.display == "none") {
                        $("#collapse_1").show();
                        $("#showhidemainlist").toggleClass('fa fa-chevron-up fa fa-chevron-down')
                    }
                    else {
                        $("#collapse_1").hide();
                        $("#showhidemainlist").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
                    }
                    });
                    
                    ///////////RATINGS//////
                    
                $("#showhidemainlist1").click(function () {
                    var collapsablediv = document.getElementById("ratingcollapse");
                    if (collapsablediv.style.display == "none") {
                        $("#ratingcollapse").show();
                        $("#showhidemainlist1").toggleClass('fa fa-chevron-up fa fa-chevron-down')
                    }
                    else {
                        $("#ratingcollapse").hide();
                        $("#showhidemainlist1").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
                    }
                    });

                    /////////////////PRICE RANGE////////////////////////////////////

                    $("#showhidemainlist2").click(function () {
                        var collapsablediv = document.getElementById("collapse_3");
                        if (collapsablediv.style.display == "none") {
                            $("#collapse_3").show();
                            $("#showhidemainlist2").toggleClass('fa fa-chevron-up fa fa-chevron-down')
                        }
                        else {
                            $("#collapse_3").hide();
                            $("#showhidemainlist2").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
                        }
                        });
                        
                        //////offers///

                        $("#showhidemainlist3").click(function () {
                        var collapsablediv = document.getElementById("collapsediscount");
                        if (collapsablediv.style.display == "none") {
                            $("#collapsediscount").show();
                            $("#showhidemainlist3").toggleClass('fa fa-chevron-up fa fa-chevron-down')
                        }
                        else {
                            $("#collapsediscount").hide();
                            $("#showhidemainlist3").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
                        }
                        })

                        $("#shop-list").find(".shopdiv").each(function (){
                          $(this).find(".info-wrap").find("#bookmark").click(function () {
                            var brand_id = parseInt($(this).parent().parent().parent().find("#brand_id").text());
                            var brand_location_id = parseInt($(this).parent().parent().parent().find("#brand_location_id").text())
                            var brand_name = $(this).parent().parent().parent().find("#brand-name").text()
                           alert(brand_id)
                           alert(brand_location_id)
                            if($(this).attr('class') == 'bi bi-bookmark'){
        
                                $.ajax({
                                    url: `/addShopWishlist`,
                                    method: "POST",
                                    data: {
                                        _csrf: _csrf,
                                        brand_id,
                                        brand_location_id,
                                        brand_name
                                    },
                                    success: function(data){
                                        if(data.success){
                                            alert("shop added in wishlist")
                                            location.reload();
                                        }else{
                                            alert("something went wrong")
                                        }
                                    }
                                })
                            }else if($(this).attr('class') == 'fa fa-bookmark'){
                           
                                $.ajax({
                                    url: `/my-account/remove-shop-wishlist`,
                                    method: "POST",
                                    data: {
                                        _csrf: _csrf,
                                        brand_id,
                                        brand_location_id,
                                        brand_name
                                    },
                                    success: function(data){
                                        if(data.success) {
                                            alert("shop remove from wishlist")
                                            location.reload();
                                        }else{
                                        alert("something went wrong")
                                        }
                                    }
                                })
                            }
                          })
                        })

                        
            var valueforsort;
          
                $("#sort1").click(function(){
                    valueforsort= $("#sort1").attr("value");
                    $("#sort1"). css({"color": "green","font-weight":"bold"});
                    $("#sort2"). css({"color": "black","font-weight":"normal"});
                    $("#sort3"). css({"color": "black","font-weight":"normal"});
                    getShop()
                    // return valueforsort
                });         
                $("#sort2").click(function(){
                    valueforsort= $("#sort2").attr("value");
                       $("#sort2"). css({"color": "green","font-weight":"bold"}); 
                       $("#sort1"). css({"color": "black","font-weight":"normal"});
                       $("#sort3"). css({"color": "black","font-weight":"normal"});
                       getShop()
                });
                $("#sort3").click(function(){
                    valueforsort= $("#sort3").attr("value");
                    $("#sort3"). css({"color": "green","font-weight":"bold"});
                    $("#sort1"). css({"color": "black","font-weight":"normal"});
                    $("#sort2"). css({"color": "black","font-weight":"normal"});
                    getShop()
                });
  
            function getShop() {
            
                /////////////////catfilter/////////////////
                let categoryfilter = document.getElementsByClassName("catfilter");
                var j = 0;
                var a = [];
                var catvalarray = [];
                var k = 0;
                for (var i = 0; i < categoryfilter.length; i++) {
                    if ($(categoryfilter[i]).is(":checked")) {
                        a[j] = categoryfilter[i];
                        catvalarray[k] = a[j].defaultValue;
                        j++;
                        k++;
                    } 
                }

                /////////////////////////////////////DISTANCE////////////////////////////////////
                let distancefilter = document.getElementsByClassName("shopdistance");
                var j = 0;
                var a = [];
                var distancevalarray = [];
                var k = 0;
                for (var i = 0; i < distancefilter.length; i++) {
                    if ($(distancefilter[i]).is(":checked")) {
                        a[j] = distancefilter[i];
                        distancevalarray[k] = a[j].defaultValue;
                        j++;
                        k++;
                    }
                }
               
                /////////////////////////////////////TIMING////////////////////////////////////
                let timingfilter = document.getElementsByClassName("shoptiming");
                var j = 0;
                var a = [];
                var timingvalarray = [];
                var k = 0;
                for (var i = 0; i < timingfilter.length; i++) {
                    if ($(timingfilter[i]).is(":checked")) {
                        a[j] = timingfilter[i];
                        timingvalarray[k] = a[j].defaultValue;
                        j++;
                        k++;
                    }
                }

                ///////////////////////////////////////RATINGS//////////////////////////////
                let ratingfilter = document.getElementsByClassName("starrating");
               var q = 0;
                var b = [];
                var ratingvalarray = [];
                var r = 0;
                for (var p = 0; p < ratingfilter.length; p++) {
                    if ($(ratingfilter[p]).is(":checked")) {
                        b[q] = ratingfilter[p];
                        ratingvalarray[r] = b[q].defaultValue;
                        q++;
                        r++;
                    }
                }
              
                var searchValue = $('#search-shop').val();
                var search_data = $("#search_data").val();
                var latitude = $("#MyLatitude").val()
                var longitude = $("#MyLongitude").val()
             
                $.ajax({
                    url: '/get-shop-list2',
                    //  url:'/api/v1/shop/getproductlist',
                    method: 'POST',
                    data: {
                        _csrf,
                        search_data,
                        shops,
                        shopid,
                        myLocation,
                        shopdistances,
                        searchValue,
                        latitude,
                        longitude,
                        valueforsort,
                        catvalarray,
                        ratingvalarray,
                        distancevalarray,
                        timingvalarray
                    },
                    success: function (data) {
                        if (data.success === false) {
                            alert('Some error occurred')
                        } else {
                            $('#shop-list').empty().append(data);
                        }
                    }
                });
        }

            $(document).ready(function() {
                $("#filters").click(function () {
                    let categoryfilter = document.getElementsByClassName("catfilter");
                    var j = 0;
                    var a = [];
                    var catvalarray = [];
                    var k = 0;
                    for (var i = 0; i < categoryfilter.length; i++) {
                        if ($(categoryfilter[i]).is(":checked")) {
                            a[j] = categoryfilter[i];
                            catvalarray[k] = a[j].defaultValue;
                            j++;
                            k++;
                        }
                    }

                     let ratingfilter = document.getElementsByClassName("starrating");
                     var q = 0;
                     var b = [];
                     var ratingvalarray = [];
                     var r = 0;
                     for (var p = 0; p < ratingfilter.length; p++) {
                         if ($(ratingfilter[p]).is(":checked")) {
                             b[q] = ratingfilter[p];
                             ratingvalarray[r] = b[q].defaultValue;
                             q++;
                             r++;
                         }
                     }

                     let distancefilter = document.getElementsByClassName("shopdistance");
                     var j = 0;
                     var a = [];
                     var distancevalarray = [];
                     var k = 0;
                     for (var i = 0; i < distancefilter.length; i++) {
                         if ($(distancefilter[i]).is(":checked")) {
                             a[j] = distancefilter[i];
                             distancevalarray[k] = a[j].defaultValue;
                             j++;
                             k++;
                         }
                     }
                    getShop();
                })
                
                $('#search-shop').keyup(function () {
                    var searchValue = $(this).val();
                    if (searchValue.length > 3) {
                        getShop();
                    }
                })
          
        $('#list-view').click(function(e){
            e.preventDefault();
            var elements = document.getElementsByClassName("column");
            var i;
            for (i = 0; i < elements.length; i++) {
                elements[i].style.width = "100%";
            }
        })
        $('#grid-view').click(function(e){
            e.preventDefault();
            var elements = document.getElementsByClassName("column");
            var i;
            for (i = 0; i < elements.length; i++) {
                elements[i].style.width = "33%";
            }
        })

        if ($('#s_data').length) {
            $('#s_data').val(localStorage.getItem("s_data"));
        }
        if ($('#search_data').length) {
            $('#search_data').val(localStorage.getItem("search_data"));
        }
        if(localStorage.getItem("s_data") == 'shops'){
            document.getElementById("defaultOpen1").click();
        }
        else{}
    });
    }}
}());