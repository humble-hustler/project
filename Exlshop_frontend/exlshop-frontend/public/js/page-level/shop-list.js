

var SHOP_LIST = SHOP_LIST || (function () {
    return {
        init: function (Args) {
            const _csrf = Args._csrf;
            const s_loc = Args.s_loc;
            const s_catId = Args.s_catId;
            const catName = Args.catName;
            const shops = Args.shops;
            const myLocation= Args.myLocation;
            const shopdistances= Args.shopdistances;
            const shopid = Args.shopid;


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
            /////////////////DISTANCE////////////////////////////////////

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

            //////TIMING///
            $("#showhidemainlist3").click(function () {

                var collapsablediv = document.getElementById("collapsetiming");
                if (collapsablediv.style.display == "none") {
                    $("#collapsetiming").show();
                    $("#showhidemainlist3").toggleClass('fa fa-chevron-up fa fa-chevron-down')

                }
                else {
                    $("#collapsetiming").hide();
                    $("#showhidemainlist3").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
                }
            });


            var valueforsort;
          
            $(".sortfilter").click(function(){
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
                    /////////////////////////////////////////////RATINGS///////////
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
                    $.ajax({
                        url: '/get-shop-list',
                        method: 'POST',
                        data: {
                            _csrf,
                            s_catId,
                            catName,
                            s_loc,
                            shops,
                            myLocation,
                            shopdistances,
                            shopid,
                            searchValue,
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

          

            $(document).ready(function () {
                let categoryfilter = document.getElementsByClassName("catfilter");
                    for (var i = 0; i < categoryfilter.length; i++) {
                        var str = $.trim($(categoryfilter[i]).next('label').text())
                       
                        if(str==catName){
                            // $(categoryfilter[i]).prop('checked', true);
                        }
                    }

                getShop();
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
            })
        }
    };
}());