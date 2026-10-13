$(document).ready(function () {
    $(document).on('click', '.dropdown-menu', function (e) {
        e.stopPropagation();
    });
    if ($('[data-toggle="tooltip"]').length > 0) {
        $('[data-toggle="tooltip"]').tooltip()
    }
    var active_chat_window='none';
    var active_dietitian_id = 0;
    // setInterval(function(){
    //     $.ajax({
    //         url: '/chat/get-unread-messages',
    //         method: 'POST',
    //         data: {
    //             _csrf: $('meta[name="_token"]').attr('content'),
    //             userId: $('#user-id').val()
    //         },
    //         success: function (data) {
    //             if (data.success) {
    //                 console.log(data)
    //                 if(active_chat_window == 'none'){
    //                     $('#chat-count').text(data.chats.length)
    //                     $('#chat-count').removeClass('display-hidden')
    //                 }else 
    //                 if(active_chat_window == 'chat-list'){
    //                     $('#chat-count').addClass('display-hidden')
    //                     $('.dietitian').each(function(){
    //                         var count = 0;
    //                         var dietitian_id = $(this).attr('dietitian_id');
    //                         data.chats.forEach(function(c){
    //                             if(dietitian_id == c.from_user){
    //                                 count++;
    //                             }
    //                         })
    //                         if(count){
    //                             $(this).find('.message-list-count').removeClass('display-hidden');
    //                             $(this).find('.message-list-count').text(count);
    //                         }else{
    //                             $(this).find('.message-list-count').addClass('display-hidden');
    //                         }
    //                     })
    //                 }else if(active_chat_window == 'chat-window' && active_dietitian_id){
    //                     $('#chat-count').addClass('display-hidden')
    //                     data.chats.forEach(function(c){
    //                         if(active_dietitian_id == c.from_user){
    //                             append_message('receiver', c.text, moment(c.created_date).format('hh:mm a'));                               
    //                         }
    //                     })
    //                 }
    //                 if(data.chats.length){
    //                     read_messages();
    //                 }
    //             }
    //         }   
    //     })
    // }, 3000);

    $('#display-chats,.message-header, .close-chat').click(function(){        
    	if($('#chat-list').css('display') != 'none'){
    		$('#chat-list').addClass('display-hidden');
            $('#chat-window').addClass('display-hidden');
            active_chat_window='none';
    	}else{
            active_chat_window='chat-list';
    		$('#chat-list').removeClass('display-hidden');
            $.ajax({
                url: '/chat/get-dietitians',
                method: 'POST',
                data: {
                    _csrf: $('meta[name="_token"]').attr('content'),
                    userId: $('#user-id').val()
                },
                success: function (data) {
                    if (data.success) {
                        $('#chat-list-content').empty();
                        var arr = data.dietitians;
                        arr.forEach(function(a){
                            append_dietitian_list(a)
                        })
                    }
                }   
            })
    	}
    })
        
    //On click of Single Dietitian name
    $(document).on('click', '.dietitian', function(){
        $('.chat-box').empty(); 
        $('#chat-list').addClass('display-hidden');
        $('#chat-window').removeClass('display-hidden');
        var dietitianId = $(this).attr('dietitian_id');
        active_chat_window='chat-window';
        active_dietitian_id = dietitianId;
        var userId = $('#user-id').val();
        $('#active-dietitian-id').val(dietitianId);

        //get dietitian details and chats between them
        $.ajax({
            url: '/chat/get-dietitian-details',
            method: 'POST',
            data: {
                _csrf: $('meta[name="_token"]').attr('content'),
                dietitianId: dietitianId,
                userId: userId
            },
            success: function (data) {
                if (data.success) {
                    var dietitian = data.dietitian;
                    $('#chat-header-name').text(`${dietitian.fname} ${dietitian.lname}`);
                    $('#chat-header-img').attr('src', '/images/avatar-placeholder.png');
                    var chats = data.chats;
                    chats.forEach(function(c){
                        if(c.from_user == userId && c.to_user == dietitianId){
                            append_message('sender', c.text, moment(c.created_date).format('hh:mm a'))
                        }else{
                            append_message('receiver', c.text, moment(c.created_date).format('hh:mm a'))
                        }
                    })

                    //set all messages to read
                    read_messages();
                }
            }   
        })
    })
    
    //On click of send meesage
    $('#send-message').click(function(){
        if($('#message').val()){
            var message = $('#message').val();
            
            $.ajax({
                url: '/chat/add',
                method: 'POST',
                data: {
                    _csrf: $('meta[name="_token"]').attr('content'),
                    message: message,
                    fromUser: $('#user-id').val(),
                    toUser: $('#active-dietitian-id').val()
                },
                success: function (data) {
                    if (data.success) {
                        $('#message').val(''); 
                        append_message('sender', message, moment().format('hh:mm a'));
                    }
                }   
            })
            
        }
    })

    //append messages
    function append_message(type, text, datetime){
        var elem;
        if(type == 'sender'){
            elem = $('#message-sample-right').clone().removeClass('display-hidden').removeAttr('id');    
        }else{
            elem = $('#message-sample-left').clone().removeClass('display-hidden').removeAttr('id');
        }
        elem.find('.message-text').text(text);
        elem.find('.message-date-time').text(datetime);
        $('.chat-box').append(elem);
        $('.chat-box').scrollTop($('.chat-box').height())
    }

    //append dietitian to chat list
    function append_dietitian_list(obj){
        var elem = $('#sample-dietitian').clone().removeClass('display-hidden').removeAttr('id');
        elem.attr('dietitian_id',obj.id);
        elem.find('.list-name').text(`${obj.fname} ${obj.lname}`);
        elem.find('.list-img').attr('src',`/images/avatar-placeholder.png`)
        $('#chat-list-content').append(elem);
    }
    
    function read_messages(){
        console.log("read ")
        if(active_dietitian_id){
            $.ajax({
                url: '/chat/mark-read',
                method: 'POST',
                data: {
                    _csrf: $('meta[name="_token"]').attr('content'),
                    sender: active_dietitian_id,
                    receiver: $('#user-id').val()
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