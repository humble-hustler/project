var DIETITIAN_MESSENGER = DIETITIAN_MESSENGER || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            _csrf = _args._csrf
            userSession = JSON.parse(_args.userSession);
            var from_user = userSession.id;

            $(document).ready(function () {
                var active_user = 0;
                
                $.ajax({
                    url: '/super-admin/chat/get-diet-subscribers',
                    method: 'POST',
                    data: {
                        _csrf: _csrf,
                        dietitianId: userSession.id
                    },
                    success: function (data) {
                        if (data.success) {     
                            data.users.forEach(function(u){
                                append_chat_users(u);  
                            })                       
                        }
                    }
                });

                //fetch the chats of the clicked user
                $(document).on('click','.single-member',function (){
                    $("#chat-box").empty();
                    $('.panel-footer').removeClass('display-hidden');
                    var toUser = $(this).attr('user-id');
                    $('#to-user').val(toUser);
                    active_user = toUser;
                    $('.chat-header').addClass('display-hidden');
                    $('.user-chat-profile').removeClass('display-hidden');
                    var user_from_profile="", user_to_profile="";
               
                    //fetch chats and append to view
                    $.ajax({
                        url: '/super-admin/chat/get-chats',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            fromUser: userSession.id,
                            toUser: toUser
                        },
                        success: function (data) {
                            if (data.success) {
                                chats = data.chats;
                                if(chats.length==0){
                                    $('#chat-box').append("<center><p>No Converations Yet.</p></center>");
                                }else{
                                    chats.forEach(function(c){
                                        if(c.from_user == userSession.id){
                                            add_chat('sender', c.text, moment(c.created_date).format('hh:mm a'), user_from_profile);
                                        }else{
                                            add_chat('receiver', c.text, moment(c.created_date).format('hh:mm a'), user_to_profile);
                                        }
                                    })
                                }

                                //display selected user details
                                $('.user-chat-profile').find('.avatar-name').text(data.userDetails.fname+' '+data.userDetails.lname);
                                $('.user-chat-profile').find('.avatar-img').attr('src',(data.userDetails.image_file)?(profile_image):('/images/avatar-placeholder.png'));

                                $('.single-member').each(function(){
                                    if($(this).attr('user-id') == toUser){
                                        $(this).find('.message-count').addClass('display-hidden')
                                    }
                                })
                                //set all user messages as read
                                read_messages()
                            }
                        }        
                    });
                });

                //send message
                $('#send-message').click(function(e){
                    e.preventDefault(); 
                    var message = $('#message').val();
                    var time = moment().format('hh:mm a');
                    $.ajax({
                        url: '/super-admin/chat/dietitian-add-chat',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            fromUser: from_user ,
                            toUser: $('#to-user').val(),
                            message: message
                        },
                        success:function(data){
                            if(data.success){
                                $('#message').val('');  
                                add_chat('sender', message, time);
                            }
                        }
                    })
                    return false;
                });

                setInterval(function(){
                    $.ajax({
                        url: '/super-admin/chat/get-unread-messages',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            userId: from_user
                        },
                        success: function (data) {
                            if (data.success) {
                                if(data.chats.length){
                                    $('.single-member').each(function(){
                                        if($(this).attr('user-id') == active_user){
                                            data.chats.forEach(function(c){
                                                if(active_user == c.from_user){
                                                    add_chat('receiver',c.text, moment(c.created_date).format('hh:mm a'), null);
                                                }
                                            })
                                        }else{
                                            var count = 0;
                                            var customer_id = $(this).attr('user-id');
                                            data.chats.forEach(function(c){
                                                if(customer_id == c.from_user){
                                                    count++;
                                                }
                                            })
                                            if(count){
                                                $(this).find('.message-count').removeClass('display-hidden');
                                                $(this).find('.message-count').text(count);
                                            }else{
                                                $(this).find('.message-count').addClass('display-hidden');
                                            }
                                        }
                                    })
                                    read_messages();
                                }
                            }
                        }   
                    })
                }, 3000);

                function read_messages(){
                    if(active_user){
                        $.ajax({
                            url: '/super-admin/chat/mark-read',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                sender: active_user,
                                receiver: from_user
                            },
                            success: function (data) {
                                if (!data.success) {
                                    console.log('Some error occured for markin this message as read')
                                }
                            }   
                        })
                    } 
                }
            });

            function add_chat(chat_type, message, time, profile_pic){
                $('#no-chat').addClass('display-hidden');
                var chat_block = (chat_type == 'sender')?($('#my-chat').clone().removeClass('display-hidden')):($('#your-chat').clone().removeClass('display-hidden'));
                chat_block.find('.chat-text').text(message);
                chat_block.find('.chat-time').text(time);
                chat_block.find('.chat-user-profile').attr('src',profile_pic)
                $('#chat-box').append(chat_block); 
                $('.chat-box').scrollTop($('#chat-box').height());
            }

            function append_chat_users(obj){
                var elem = $('#sample-user').clone().removeClass('display-hidden').removeAttr('id');
                elem.find('.user-name').text(obj.fname+' '+obj.lname);
                elem.attr('user-id',obj.id);
                $('#user-list').append(elem)
            }
        }
    };
}());