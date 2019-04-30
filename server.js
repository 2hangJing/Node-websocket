
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

//  type = 0 ==> 判断是否为用户自己
//  type = 1 ==> 更新用户数据

wss.on('connection', function (ws) {

    ws.id = userID;

    userList.push({
        userName : '玩家' + userID,
        userID : userID
    });

    userID++;

    ws.send(JSON.stringify(userList), (err) => {

        ws.send(JSON.stringify({type: 0, isYou : true, userID : ws.id}));

        //  服务端广播 更新用户列表
        wss.clients.forEach(function(client){
            client.send(JSON.stringify({type: 1, userList}));
        })
    });

    ws.on('close', function close(){

        let deleteIndex = userList.findIndex((val) => val.userID == ws.id);

        userList.splice(deleteIndex, 1);

        //  服务端广播 更新用户列表
        wss.clients.forEach(function(client){
            client.send(JSON.stringify({type: 1, userList}));
        })
    });

    ws.on('message', function (message) {

        
    })
});

