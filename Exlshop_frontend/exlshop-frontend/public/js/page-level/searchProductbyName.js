

var PRODUCT_LIST_BYNAME = PRODUCT_LIST_BYNAME || (function () {
    return {
        init: function (Args) {
            const _csrf = Args._csrf;
            // const slug = Args.slug;
            // const CId = Args.CId;

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

                // $("#collapse_1").toggle();
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
                var collapsablediv = document.getElementById("collapseoffers");
                if (collapsablediv.style.display == "none") {
                    $("#collapseoffers").show();
                    $("#showhidemainlist3").toggleClass('fa fa-chevron-up fa fa-chevron-down')
                }
                else {
                    $("#collapseoffers").hide();
                    $("#showhidemainlist3").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
                }
            });

            ///////////DISCOUNT
            $("#collapsediscount").hide();
            $("#showhidemainlist4").click(function () {
                var collapsablediv = document.getElementById("collapsediscount");
                if (collapsablediv.style.display == "none") {
                    $("#collapsediscount").show();
                    $("#showhidemainlist4").toggleClass('fa fa-chevron-up fa fa-chevron-down')
                }
                else {
                    $("#collapsediscount").hide();
                    $("#showhidemainlist4").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
                }
            });

            ////AVAILABLE
            $("#collapseavailability").hide();
            $("#showhidemainlist5").click(function () {
                var collapsablediv = document.getElementById("collapseavailability");
                if (collapsablediv.style.display == "none") {
                    $("#collapseavailability").show();
                    $("#showhidemainlist5").toggleClass('fa fa-chevron-up fa fa-chevron-down')
                }
                else {
                    $("#collapseavailability").hide();
                    $("#showhidemainlist5").toggleClass('fa fa-chevron-down fa fa-chevron-up ')
                }
            });
            
            var valueforsort;
          
            $(".sortfilter").click(function(){
                $("#sort1").click(function(){
                    valueforsort= $("#sort1").attr("value");
                    $("#sort1"). css({"color": "green","font-weight":"bold"});
                    $("#sort2"). css({"color": "black","font-weight":"normal"});
                    $("#sort3"). css({"color": "black","font-weight":"normal"});
                    $("#sort4"). css({"color": "black","font-weight":"normal"});
                    getProducts()
                    // return valueforsort
                });         
                $("#sort2").click(function(){
                    valueforsort= $("#sort2").attr("value");
                       $("#sort2"). css({"color": "green","font-weight":"bold"}); 
                       $("#sort1"). css({"color": "black","font-weight":"normal"});
                       $("#sort3"). css({"color": "black","font-weight":"normal"});
                       $("#sort4"). css({"color": "black","font-weight":"normal"});
                       getProducts()
                });
                $("#sort3").click(function(){
                    valueforsort= $("#sort3").attr("value");
                    $("#sort3"). css({"color": "green","font-weight":"bold"});
                    $("#sort1"). css({"color": "black","font-weight":"normal"});
                    $("#sort2"). css({"color": "black","font-weight":"normal"});
                    $("#sort4"). css({"color": "black","font-weight":"normal"});
                    getProducts()
                });
                $("#sort4").click(function(){
                    valueforsort= $("#sort4").attr("value");
                    $("#sort4"). css({"color": "green","font-weight":"bold"});
                    $("#sort2"). css({"color": "black","font-weight":"normal"});
                    $("#sort3"). css({"color": "black","font-weight":"normal"});
                    $("#sort1"). css({"color": "black","font-weight":"normal"});
                    getProducts()
                });
            }); 

            function getProducts() {
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

                    /////////////////////////////////////OFF///////////////////////////////////////////
                    let offerfilter = document.getElementsByClassName("myoffers");
                    var j = 0;
                    var a = [];
                    var offervalarray = [];
                    var k = 0;
                    for (var i = 0; i < offerfilter.length; i++) {

                        if ($(offerfilter[i]).is(":checked")) {
                            a[j] = offerfilter[i];
                            offervalarray[k] = a[j].defaultValue;
                            j++;
                            k++;
                        }
                    }
                   
                    ///////////////////////////////////////////offend////////////////////

                    let percentfilter = document.getElementsByClassName("percentage");
                    var j = 0;
                    var a = [];
                    var percentagevalarray = [];
                    var k = 0;
                    for (var i = 0; i < percentfilter.length; i++) {

                        if ($(percentfilter[i]).is(":checked")) {
                            a[j] = percentfilter[i];
                           
                            percentagevalarray[k] = a[j].defaultValue;
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
                  
                    var CId = document.getElementById("category_id").innerText;
                   
                    var searchValue = $('#search-product').val();
                    var minPrice = ($('#min-price').val()) ? ($('#min-price').val()) : (null);
                    var maxPrice = ($('#max-price').val()) ? ($('#max-price').val()) : (null);
                    var header_search=localStorage.getItem("search_data");
                   
                    $.ajax({
                        url: '/get-product-byname',
                        //  url:'/api/v1/shop/getproductlist',
                        method: 'POST',
                        data: {
                            _csrf,
                            header_search,
                            searchValue,
                            minPrice,
                            maxPrice,
                            valueforsort,
                            catvalarray,
                            ratingvalarray,
                            percentagevalarray,
                            offervalarray
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
                getProducts();
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

                     let percentfilter = document.getElementsByClassName("percentage");
                     var j = 0;
                     var a = [];
                     var percentagevalarray = [];
                     var k = 0;
                     for (var i = 0; i < percentfilter.length; i++) {
                         if ($(percentfilter[i]).is(":checked")) {
                             a[j] = percentfilter[i];
                             percentagevalarray[k] = a[j].defaultValue;
                             j++;
                             k++;
                         }
                     }
                    getProducts();
                })
                $('#search-product').keyup(function () {
                    var searchValue = $(this).val();
                    if (searchValue.length > 3) {
                        getProducts();
                    }
                })
                
                $('#apply-price-range-btn').click(function () {
                    const checked = document.querySelectorAll('input[type="checkbox"]:checked')
                    selected = Array.from(checked).map(x => x.value)
                    getProducts();
                })
            })
        }
    };
}());