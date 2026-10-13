const { options } = require("google-distance-matrix");
var FCM = require('fcm-node');
var serverKey = 
'AAAATE0L40g:APA91bGL6bVyxbdDq_5xZGAWnr2TBbuwzBIpdwrSPEeA41-4_oYtUUKMk0svtvESYmU6aaIaunwolc4-9R1Ww7eGSwZng1I-x2Cy1_UuhwKcwGSI7WO2gyX9XKPAX3ZHRBH6EB2Bdk8S'
var serverKey1 = 'AAAA9fp2meU:APA91bHsnhA-keeAfdE5HrsUFWiRVA-ppe-QBvCaJlI6vD-Ql5zsDqvn2lqyKaK2ISXgK9WffvDYwylW9OxId0_Zm627xx2eR_k2A9VqQ_j0L4hs8mIJ_hhRjjZwwFcRoGVOCPYmCUDo'
var fcm = new FCM(serverKey);
var fcm1 = new FCM(serverKey1)


const Chat = (connection, logger) => {
    const module = {}
    module.Add = (options, callback) =>{
    	connection.query(`INSERT INTO chats SET from_user=?, to_user=?, text=?, brand_location_id =?`, [options.fromUser, options.toUser, options.message, options.LocId], (err) => {
            if (err) {
                callback(err)
            } else {
                // callback(null)
                connection.query(`select CONCAT(a.fname, " " ,a.lname) from_user from users as a where a.id = ${options.fromUser}`, (err, fromUser) =>{
                    if(err){
                        callback(err)
                    }else{
                        connection.query(`select CONCAT(a.fname, " " ,a.lname) to_user from users as a where a.id = ${options.toUser}`, (err, toUser) =>{
                            if(err){
                                callback(err)
                            }else{
                                var from_user = fromUser[0].from_user
                                var to_user = toUser[0].to_user
                                connection.query(`INSERT INTO Notifications SET  type_id =?, description =?, user_id =?, receiver_id =?, sender_id =?`, [9, `${from_user} send message to ${to_user} "${options.message}"`, options.toUser,options.toUser, options.fromUser], (err, notification) =>{
                                    if(err){
                                        console.log(err)
                                        callback(err)
                                    }else{
                                        connection.query(`select device_token from fcm_token where user_id= ${options.toUser}`, (err, token) =>{
                                            if(err){
                                                console.log(err)
                                                callback(err)
                                            }else{
                                                token.forEach(token => {
                                                    console.log("token", token.device_token)
                                                    var message = {
                                                        to: token.device_token,
                                                        notification: {
                                                        // title: 'notification',
                                                            body: `Message from ${from_user}`,
                                                           
                                                        },   
                                                        data: {
                                                            screen: 'ChatCustomerDetails',
                                                        },
                                                        // Required for background/quit data-only messages on iOS
                                                        contentAvailable: true,
                                                        // Required for background/quit data-only messages on Android
                                                        priority: 'high',
                                                    };
                                                    console.log("message",message)
            
                                                    fcm1.send(message, function (err, response) {
                                                        if (err) {
                                                            console.log("Something has gone wrong!" + err);
                                                        } else {
                                                            console.log("Successfully sent with response: ", response);
                                                        }
                                                    });
            
                                                    fcm.send(message, function (err, response) {
                                                        if (err) {
                                                            console.log("Something has gone wrong!" + err);
                                                        } else {
                                                            console.log("Successfully sent with response: ", response);
                                                        }
                                                    });
                                                })
                                                callback(false)
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }

    module.getmessage = (options, callback) =>{
        connection.query(`SELECT * FROM (
            SELECT *, date_format(created_date, "%d/%m/%Y %h:%i %p") as date FROM chats WHERE (from_user = ? OR to_user = ?) AND (from_user = ? OR to_user = ?) and brand_location_id = ?
            ORDER BY chats.created_date DESC) AS a
            ORDER BY a.created_date ASC`, [options.userId, options.userId, options.loc_user_id, options.loc_user_id, options.LocId],(err, getmessage) =>{
            if(err){
                callback(err)
            }else{
                callback(null, getmessage)
            }
        })
    }

    module.GetBetweenUsers = (options, callback) => {
        connection.query(`SELECT * FROM (
        SELECT * FROM chats WHERE (from_user = ? OR to_user = ?) AND (from_user = ? OR to_user = ?)
        ORDER BY chats.created_date DESC LIMIT 0,10) AS a
        ORDER BY a.created_date ASC`, [options.user1, options.user1, options.user2, options.user2], (err, chats) => {
            if (err) {
                callback(err)
            } else {
                callback(null, chats)
            }
        })   
    }
    module.MessageRead = (options, callback) => {
        connection.query(`UPDATE chats SET is_read = 1 WHERE from_user = ?  AND  to_user = ?`, [options.sender, options.receiver], (err) => {
            if (err) {
                callback(err)
            } else {
                callback(null)
            }
        }) 
    }
    module.GetUnreadMessages = (options, callback) => {
        connection.query(`SELECT * FROM chats WHERE to_user = ? AND is_read = 0`, [options.userId], (err, chats) => {
            if (err) {
                callback(err)
            } else {
                callback(null, chats)
            }
        })   
    }
    return module;
};
module.exports = Chat;