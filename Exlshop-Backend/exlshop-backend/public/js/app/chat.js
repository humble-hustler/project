var CHAT = CHAT || (function () {
    var _args = {};
    return {
        init: function (Args) {
            _args = Args;
            _csrf = _args._csrf
            userSession = JSON.parse(_args.userSession);
            users = JSON.parse(_args.users);
            var from_user = userSession.id;

            $(document).ready(function () {
                var customer_Id = localStorage.getItem('customer_Id')

                if(customer_Id != null){
                    var toUser = customer_Id

                    $("#chat-box").empty();
                    $('.panel-footer').removeClass('display-hidden');
                    $('#to-user').val(toUser);
                    active_user = toUser;
                    $('.chat-header').addClass('display-hidden');
                    $('.user-chat-profile').removeClass('display-hidden');
                    var user_from_profile="", user_to_profile="";

                    //display selected user details
                    users.forEach(function(u){
                        if(u.id == active_user){
                            $('.user-chat-profile').find('.avatar-name').text(u.user_name);
                            $('.user-chat-profile').find('.avatar-img').attr('src',(u.image_file)?(u.profile_image):('/images/avatar-placeholder.png'));
                            user_to_profile = (u.image_file)?(u.profile_image):('/images/avatar-placeholder.png');
                        }
                        if(u.id == from_user){
                            user_from_profile = (u.image_file)?(u.profile_image):('/images/avatar-placeholder.png');
                        }
                    })

                    //fetch chats and append to view
                    $.ajax({
                        url: '/app/chats/single-user',
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
                                            add_chat('sender', c.text, moment(c.created_date).format('DD-MM-YYYY hh:mm a'), user_from_profile);
                                        }else{
                                            add_chat('receiver', c.text, moment(c.created_date).format('DD-MM-YYYY hh:mm a'), user_to_profile);
                                        }
                                    })
                                }

                                $('.single-member').each(function(){
                                    if($(this).attr('user-id') == toUser){
                                        $(this).find('.message-count').addClass('display-hidden')
                                    }
                                })
                                //set all user messages as read
                                $.ajax({
                                    url: '/api/v1/chat/read',
                                    method: 'POST',
                                    data: {
                                        _csrf: _csrf,
                                        receiver: userSession.id,
                                        sender: toUser
                                    },
                                    success: function (data) {
                                        if (!data.success) {      
                                            alert("Error occurred!")                                 
                                        }
                                    }
                                });
                            }
                        }
                    });

                    localStorage.removeItem("customer_Id");
                }
                var socket = io();
                var active_user = 0;

                //emit an event for starting the socket connection
                socket.on('connect',function(){ 
                    socket.emit('connection-start', {userId: userSession.id});
                });

                //get the unread message count
                $.ajax({
                    url: '/api/v1/chat/unread-count',
                    method: 'POST',
                    data: {
                        _csrf: _csrf,
                        userId: userSession.id,
                        locationId: userSession.currentLocation.id
                    },
                    success: function (data) {
                        if (data.success) { 
                            var countArr =  data.messageCount;    
                            countArr.forEach(function(ca){
                                $('.single-member').each(function(){
                                    if($(this).attr('user-id') == ca.id){
                                        if(ca.message_count){
                                            $(this).find('.message-count').removeClass('display-hidden')
                                            $(this).find('.message-count').text(ca.message_count);
                                        }
                                    }
                                })
                            })                             
                        }
                    }
                });
                
                //fetch the chats of the clicked user
                $('.single-member').on('click',function (){
                    $("#chat-box").empty();
                    $('.panel-footer').removeClass('display-hidden');
                    var toUser = $(this).attr('user-id');
                    $('#to-user').val(toUser);
                    active_user = toUser;
                    $('.chat-header').addClass('display-hidden');
                    $('.user-chat-profile').removeClass('display-hidden');
                    var user_from_profile="", user_to_profile="";

                    //display selected user details
                    users.forEach(function(u){
                        if(u.id == active_user){
                            $('.user-chat-profile').find('.avatar-name').text(u.user_name);
                            $('.user-chat-profile').find('.avatar-img').attr('src',(u.image_file)?(u.profile_image):('/images/avatar-placeholder.png'));
                            user_to_profile = (u.image_file)?(u.profile_image):('/images/avatar-placeholder.png');
                        }
                        if(u.id == from_user){
                            user_from_profile = (u.image_file)?(u.profile_image):('/images/avatar-placeholder.png');
                        }
                    })

                    //fetch chats and append to view
                    $.ajax({
                        url: '/app/chats/single-user',
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
                                            add_chat('sender', c.text, moment(c.created_date).format('DD-MM-YYYY hh:mm a'), user_from_profile);
                                        }else{
                                            add_chat('receiver', c.text, moment(c.created_date).format('DD-MM-YYYY hh:mm a'), user_to_profile);
                                        }
                                    })
                                }

                                $('.single-member').each(function(){
                                    if($(this).attr('user-id') == toUser){
                                        $(this).find('.message-count').addClass('display-hidden')
                                    }
                                })
                                //set all user messages as read
                                $.ajax({
                                    url: '/api/v1/chat/read',
                                    method: 'POST',
                                    data: {
                                        _csrf: _csrf,
                                        receiver: userSession.id,
                                        sender: toUser
                                    },
                                    success: function (data) {
                                        if (!data.success) {      
                                            alert("Error occurred!")                                 
                                        }
                                    }
                                });
                            }
                        }
                    });
                });

                //generate event of typing
                $('#message').bind("keypress", () => {
                    socket.emit('typing',{fromUser:userSession.id, toUser: $('#to-user').val()})
                })

                $("input").keyup(function(){
                    socket.emit('stop-typing',{fromUser:userSession.id, toUser: $('#to-user').val()})
                });

                //Listen on typing
                socket.on('typing', (data) => {
                    $('#typing').css('visibility','visible');
                })

                //Listen on typing
                socket.on('stop-typing', (data) => {
                    $('#typing').css('visibility','hidden');
                })

                //send message
                $('#send-message').click(function(e){
                    e.preventDefault(); 
                    if(!$("#message").val()) {
                        toastr.error("Please Write Some Message...")
                        return
                    }
                    var message = $('#message').val();
                    var time = moment().format('DD-MM-YYYY hh:mm a');
                    var data = {
                        message: message,
                        toUser: $('#to-user').val(),
                        fromUser: userSession.id
                    }
                    socket.emit('send-message', data);
                    $('#message').val('');
                    add_chat('sender', message, time);

                    return false;
                });

                //listener for received message
                socket.on('receive-message',function(data){
                    if(data.fromUser == active_user){
                        add_chat('receiver', data.message, moment().format('hh:mm a'))
                    }else{
                        $('.single-member').each(function(){
                            if($(this).attr('user-id') == data.fromUser){
                                var message_count = (!isNaN(parseInt($(this).find('.message-count').text())))?(parseInt($(this).find('.message-count').text())):(0);
                                $(this).find('.message-count').removeClass('display-hidden')
                                $(this).find('.message-count').text(message_count+1);
                            }
                        })
                    }
                })          
            });

            function add_chat(chat_type, message, time, profile_pic){
                $('#no-chat').addClass('display-hidden');
                var chat_block = (chat_type == 'sender')?($('#my-chat').clone().removeClass('display-hidden')):($('#your-chat').clone().removeClass('display-hidden'));
                chat_block.find('.chat-text').text(message);
                chat_block.find('.chat-time').text(time);
                chat_block.find('.chat-user-profile').attr('src',profile_pic)
                $('#chat-box').append(chat_block);
                $('.chat-box').scrollTop($('.chat-box').height());              
            }
        }
    };
}());