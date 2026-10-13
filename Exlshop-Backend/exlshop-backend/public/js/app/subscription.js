
var SUBSCRIPTION= SUBSCRIPTION|| (function () {
    return {
        init: function (Args) {
            var _args = Args;
            var _csrf = _args._csrf
            var flash = _args.flash
            var subscription_plans = JSON.parse(_args.subscription_plans)
            var session = JSON.parse(_args.session)
            $(document).ready(function () {
                if (flash) {
                    toastr.error(flash)
                }   

                
    $(document).ready(function(){
        $('.owl-carousel').owlCarousel({
            loop: true,
            margin: 10,
            center: true,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1,
                    nav: true
                },
                600: {
                    items: 3,
                    nav: true
                },
                1000: {
                    items: 3,
                    nav: true,
                    // loop: false
                },
                
            }
        });
    });


        
        $('.btn-checkout2').click(function (e) {
            var planName = $(this).attr('planName');
            // alert($("#subscription_list").attr('amount_plan'))
            // alert($('#subscription_list').find('option:selected').attr('period_plan')) 
            var amount= parseInt($(this).attr('planAmt'));
            var planPeriod= $(this).attr('planPeriod');
            var planId= parseInt($(this).attr('planId'));
            var paymentApi = document.getElementById("paymentApi");
            var interval = parseInt($(this).attr('planInterval'))
                    // paymentApi.setAttribute("data-amount", amount);
                    paymentApi.setAttribute("src", "https://checkout.razorpay.com/v1/checkout.js")

                    if(planId == 1){
                            if(session.user && session.user.currentLocation){
                                let endDate = new Date(session.user.currentLocation.end_date)
                                endDate.setDate(endDate.getDate() + 1)
                                const locantionId = session.user.currentLocation.id
                                if(new Date().toISOString() > endDate.toISOString()){
                                    $.ajax({
                                        url: `/app/subscriptionrequest/getExpiredPlan`,
                                        method: "POST",
                                        data : {
                                            _csrf:  _csrf,
                                            locantionId
                                        },
                                        success : function(data){
                                            if(data.success){
                                                if(data.data.length){
                                                    // alert("kkkkkkkkk")
                                                    alert("Your free plan has expired. You should upgrade to a paid plan.")
                                                }else{
                                                    toastr.success("Your plan is active")
                                                }
                                            }else{
                                                toastr.error("Some error occur")
                                            }
                                        }
                                    })
                                }else{
                                    $.ajax({
                                        url: `/app/subscriptionrequest/getActivePlan`,
                                        method: "POST",
                                        data : {
                                            _csrf:  _csrf,
                                            locantionId
                                        },
                                        success : function(data){
                                            if(data.success){
                                                if(data.data.length){
                                                    // alert("kkkkkkkkk")
                                                    // alert("Your free plan has expired. You should upgrade to a paid plan.")
                                                    alert("Your Plan is Active!")
                                                }else{
                                                    $.ajax({
                                                        //   url:'/api/v1/index1/login',
                                                        url: "/app/subscriptionrequest/registrationCheckoutForFree",
                                                        data: {
                                                            _csrf:  _csrf,
                                                            planName: planName,
                                                            amount,
                                                            planId,
                                                            planPeriod,
                                                            interval,
                                                            purpose : 'For subscription',
                                                        },
                                        
                                                        method: 'POST',
                                                        success: function (data1) {
                                                                window.location.href = '/app/subscriptionrequest/confirmFree'
                                                        
                                                        },
                                                        error: function (data, status, error) {
                                                            console.log(error)
                                                        }
                                                    });
                                                }
                                            }else{
                                                toastr.error("Some error occur")
                                            }
                                        }
                                    })

                                }
                            }
                            
                        
                    }else{
                        $.ajax({
                            //   url:'/api/v1/index1/login',
                            url: "/app/subscriptionrequest/registrationCheckout",
                            data: {
                                _csrf:  _csrf,
                                planName: planName,
                                amount,
                                planId,
                                planPeriod,
                                interval,
                                purpose : 'For subscription',
                                redirect_url: location.origin + '/app/subscriptionrequest/confirm',
                            },
            
                            method: 'POST',
                            success: function (data1) {
                                var options = {
                                                    "key": data1.key,
                                                    "name": "Exlshop",
                                                    "description": "",
                                                    "image": "/images/logo.png",
                                                    "subscription_id": data1.subscriptioId,
                                                    "amount": data1.amount*100,
                                                    // "order_id": data.subscriptioId,
                                                    "handler": function (response) {
                                                       
                                                        $.ajax({
                                                            url: '/app/subscriptionrequest/confirm',
                                                            method: 'POST',
                                                            dataType: 'json',
                                                            data: {
                                                                _csrf,
                                                                amount: data1.amount,
                                                                subscription_id:data1.subscriptionId,
                                                                paymentResponse: response
                                                            },
                                                            success: function (data) {
                                                                if (data) {
                                                                    alert('Successfull')
                                                                    location.href = '/app/dashboard'
                                                                } else {
                                                                    alert('Some error occurred. Please contact support')
                                                                }
                                                            }
                                                        })
                                                    }
                                                };
                                    //  var rzp = new Razorpay(options);
                                    //  rzp.open();
                                     const longurl = data1.payment_request.longurl;
                                     window.location.href = longurl;
                               
                            },
                            error: function (data, status, error) {
                                console.log(error)
                            }
                        });
                    
                    }
            
                });
        
           
            });

        }
    }
}());