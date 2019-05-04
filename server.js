
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


//  type = 1 ==> 用户 ==> 服务端  告诉服务端新连接的名字
//  type = 2 ==> 用户1 ==> 服务端  用户1邀请用户2，用户1发送到服务端邀请，服务端转发。
//  type = 3 ==> 服务端 ==> 用户2   服务端转发用户1 邀请用户2


wss.on('connection', function (ws) {

    

    // //  监听到链接后统一更新连接的用户列表
    // ws.send(JSON.stringify(userList), (err) => {

        
    // });

    ws.on('close', function close(){

        let deleteIndex = userList.findIndex((val) => val.userID == ws.userData.userID);

        userList.splice(deleteIndex, 1);

        //  服务端广播 更新用户列表
        wss.clients.forEach(function(client){
            client.send(JSON.stringify({type: 0, data: userList}));
        })
    });

    ws.on('message', function (message) {

        let data = JSON.parse(message);

        //  首次连接，接收用户端用户名等数据
        if(data.type == 1){

            let date = new Date(),year = date.getFullYear(), month = date.getMonth()+1, day = date.getDate(), hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds();

            let userData = {
                userName :  data.data.userName,
                userID : userID,
                linkTime : year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second
            };

            userList.push(userData);

            ws.userData = userData

            userID++;

            //  服务端广播 更新用户列表
            wss.clients.forEach(function(client){

                client.send(JSON.stringify({type: 0, data: userList}));
            });
        }

        //  发送邀请
        if(data.type == 2){

            //  服务端广播 更新用户列表
            wss.clients.forEach(function(client){

                if(data.data.userID == client.userData.userID){

                    client.send(JSON.stringify({type: 3, data: ws.userData}));
                }
            });
        }


        //  发送邀请
        if(data.type == 4){

            if(data.data.isConfirm){


            }else{

                //  服务端广播 更新用户列表
                wss.clients.forEach(function(client){

                    if(data.data.userID == client.userData.userID){

                        client.send(JSON.stringify({type: 5, data : {userData : data.data.userData, isConfirm : false}}));
                    }
                });
                
            }

            
        }

    })
});

