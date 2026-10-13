var FCM = require('fcm-node');
var serverKey = 
'AAAATE0L40g:APA91bGL6bVyxbdDq_5xZGAWnr2TBbuwzBIpdwrSPEeA41-4_oYtUUKMk0svtvESYmU6aaIaunwolc4-9R1Ww7eGSwZng1I-x2Cy1_UuhwKcwGSI7WO2gyX9XKPAX3ZHRBH6EB2Bdk8S'
var serverKey1 = 'AAAA9fp2meU:APA91bHsnhA-keeAfdE5HrsUFWiRVA-ppe-QBvCaJlI6vD-Ql5zsDqvn2lqyKaK2ISXgK9WffvDYwylW9OxId0_Zm627xx2eR_k2A9VqQ_j0L4hs8mIJ_hhRjjZwwFcRoGVOCPYmCUDo'
var fcm = new FCM(serverKey);
var fcm1 = new FCM(serverKey1)

const Chat = (connection, logger) => {
    const module = {}

    module.Add = (options, callback) =>{
    	connection.query(`INSERT INTO chats SET from_user=?, to_user=?, text=?`, [options.fromUser, options.toUser, options.message], (err) => {
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
                                                            screen: 'ChatWithShopAdmin',
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

    module.GetUserChats = (options, callback) => {
        connection.query(`SELECT * FROM (
        SELECT * FROM chats WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)
        ORDER BY chats.created_date DESC) AS a
        ORDER BY a.created_date ASC`, [options.fromUser, options.toUser, options.fromUser, options.toUser], (err, chats) => {
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
    module.MessageRead1 = (options, callback) => {
        connection.query(`select *from chats `,  (err,chatresult) => {
            if (err) {
                callback(err)
            } else {
                callback(null,chatresult)
            }
        }) 
    }
    module.GetUnreadMessagesCount = (options, callback) => {
        connection.query(`SELECT b.from_user AS id , count(b.id) AS message_count
            FROM users AS a
                INNER JOIN 
            chats AS b ON b.to_user = a.id AND b.is_read=0
            WHERE a.id = ?
            GROUP BY b.from_user`, [options.userId], (err, count) => {
            if (err) {
                callback(err)
            } else {
                callback(null, count)
            }
        })   
    }

    module.GetDietSubscribers = (options, callback) => {
        connection.query(`SELECT d.id, d.fname, d.lname
            FROM 
            shop_orders_products_dietitians AS a
            INNER JOIN
            shop_orders_products AS b ON b.id = a.shop_orders_products_id
            INNER JOIN 
            shop_orders AS c ON c.id = b.order_id 
            INNER JOIN 
            users AS d ON d.id = c.users_id 
            WHERE a.dietitian_id = ? `, [options.dietitianId], (err, users) => {
            if (err) {
                callback(err)
            } else {
                callback(null, users)
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