
const express = require('express');

const app = express();
// 导入WebSocket模块:
const WebSocket = require('ws');
// 引用Server类:
const WebSocketServer = WebSocket.Server;

app.use(express.static('static'));

// app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))

// 实例化:
const wss = new WebSocketServer({
    port: 3001
});

let userList = [], userID = 1;

wss.on('connection', function (ws) {

    ws.on('close', function(){

        let deleteIndex = userList.findIndex((val) => val.userID == ws.userData.userID);

        userList.splice(deleteIndex, 1);

        //  服务端广播 更新用户列表
        wss.clients.forEach(function(client){
            client.send(JSON.stringify({type: 0, data: userList}));
        })
    });

    ws.on('message', function (message) {

        let data = JSON.parse(message);

        if(data.type == 'user_1'){

            let date = new Date(),year = date.getFullYear(), month = date.getMonth()+1, day = date.getDate(), hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds();

            let userData = {
                userName :  data.data.userName,
                userID : userID,
                linkTime : year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second
            };

            userList.push(userData);

            ws.userData = userData;

            userID++;

            //  单独给链接用户返回该用户在服务端数据
            ws.send(JSON.stringify({type: 'service_1', data: userData}));

            //  服务端广播 更新用户列表
            wss.clients.forEach(function(client){

                client.send(JSON.stringify({type: 'service_2', data: userList}));
            });
        }


        if(data.type == 'user_2'){

            //  服务端广播 更新用户列表
            wss.clients.forEach(function(client){

                if(data.order.beInvite.userID == client.userData.userID){

                    client.send(JSON.stringify({type: 'service_3', order: data.order}));
                }
            });
        }

        if(data.type == 'user_3'){

            //  服务端广播 更新用户列表
            wss.clients.forEach(function(client){

                if(data.order.invite.userID == client.userData.userID){

                    client.send(JSON.stringify({type: 'service_4', order : data.order}));
                }
            });
        }

        if(data.type == 'user_4'){

            let { invite, beInvite } = data.order;

            if(invite.isConfirm){

                //  统一发送开始游戏
                wss.clients.forEach(function(client){

                    if(invite.userID == client.userData.userID || beInvite.userID == client.userData.userID){

                        client.send(JSON.stringify({type: 'service_5', order : data.order}));
                    }
                });
            }else{

                //  player1 玩家取消了游戏 , 更新player2 游戏状态
                wss.clients.forEach(function(client){

                    if(data.order.beInvite.userID == client.userData.userID){

                        data.order.beInvite.isConfirm = false;

                        client.send(JSON.stringify({type: 'service_6', order : data.order}));
                    }
                });
            }
        }

        if(data.type == 'user_5'){

            let { invite, beInvite } = data.order;

            //  服务端广播 更新用户列表
            wss.clients.forEach(function(client){

                if(client.userData.userID == (!!invite.num ? beInvite.userID : invite.userID)){

                    client.send(JSON.stringify({type: 'service_7', order : data.order}));
                }
            });
        }


        if(data.type == 'user_6'){

            let { invite, beInvite } = data.order;

            //  服务端广播 更新用户列表
            wss.clients.forEach(function(client){

                if(client.userData.userID == (!!invite.num ? beInvite.userID : invite.userID)){

                    client.send(JSON.stringify({type: 'service_8', order : data.order}));
                }
            });
        }
    })
});

