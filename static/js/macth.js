//  player1 ==> 点击邀请的玩家 
//  player2 ==> 被邀请的玩家

//  user_1 ==> 玩家链接之后通知服务端
//  user_2 ==> player1 邀请 player2
//  user_3 ==> player2 用户端收到 service_3, 对邀请进行 接受、拒绝
//  user_4 ==> player1 用户端收到 service_4, 确认开启游戏、取消游戏
//  user_5 ==> player 向服务端发送点击次数

//  service_1 ==> 服务端收到 user_1 ,对发送用户返回用户在服务端标识符等信息
//  service_2 ==> 服务端收到 user_1 ,对所有用户广播用户数据
//  service_3 ==> 服务端收到 user_2 ,对player2发送邀请
//  service_4 ==> 服务端收到 user_3 ,对 player1 发送 player2 是否接受邀请
//  service_6 ==> 服务端收到 user_4 ,player1开始游戏，两个玩家进入游戏
//  service_6 ==> 服务端收到 user_4 ,player1取消游戏，更新 player2 isConfirm 状态为 flase
//  service_7 ==> 服务端收到 user_5 ,向player同步对方点击次数

let login_input = document.querySelector('.login_input'),
    login_btn = document.querySelector('.login_btn'),
    wsObj = {}, userData = {userName:'', userID: '', isConfirm: false},game;

    
function ws(userName){

    let userID;

    wsObj = new WebSocket('ws://192.168.1.2:3001');
    // wsObj = new WebSocket('ws://10.13.5.166:3001');
    
    let userList = document.querySelector('.userList');

    wsObj.onopen = function () {

        //  关闭 Loading 
        $('.login').css('display','none');

        wsObj.send(JSON.stringify({type: 'user_1', data: {userName}}))

        // 响应onmessage事件:
        wsObj.onmessage = function (msg) {

            let data = JSON.parse(msg.data);

            if(data.type == 'service_1'){

                Object.assign(userData,  data.data);

                //  防止 service_2 先到达
                $('.invite[data-id = "'+ userData.userID +'"]').css('dsplay','none');

            }else if (data.type == 'service_2') {

                userList.innerHTML = "";

                for(let val of data.data){

                    userList.innerHTML += `
                        <div class='userDetail'>
                            <p class='user'>${val.userName}</p>
                            <span>用户ID为：${val.userID}</span>
                            <span>连接时间：${val.linkTime}</span>
                            <span class='invite' style='display: ${userData.userID == val.userID ? "none" : "block"}' data-id = ${val.userID} data-name = ${val.userName}>邀请</span>
                        </div>`;
                }
            }else if(data.type == 'service_3'){

                let isConfirm = confirm(`玩家：${data.order.invite.userName} 邀请你玩游戏！`);

                if(isConfirm){

                    //  接受邀请，并进入游戏准备状态
                    data.order.beInvite.isConfirm = true;

                    //  接收邀请
                    wsObj.send(JSON.stringify({type: 'user_3', order: data.order}));

                    $('.loading_text').text('已接受，等待对方开始游戏！');
                    $('.login').css('display','block');
                }
                else{

                    //  拒绝邀请
                    wsObj.send(JSON.stringify({type: 'user_3', order: data.order}))
                }

            }else if(data.type == 'service_4'){

                $('.login').css('display','none');

                if(data.order.beInvite.isConfirm){

                    //  接受邀请
                    let isConfirm = confirm(`玩家：${data.order.beInvite.userName} 已接受，确认开始此盘游戏？`);

                    if(isConfirm){

                        //  进入游戏
                        data.order.invite.isConfirm = true;

                        wsObj.send(JSON.stringify({type: 'user_4', order: data.order}));
                    }else{

                        //  取消游戏
                        wsObj.send(JSON.stringify({type: 'user_4', order: data.order}));

                        alert('您已取消游戏，可重新邀请玩家！');
                    }

                    
                }else{

                    //  拒绝邀请
                    alert("对方已拒绝你的邀请!");
                }
            }else if(data.type == 'service_5'){

                $('.login').css('display','none');

                

                //  game.js 开始游戏
                // gameActive(wsObj,data.order);
                game = new Game(userData);

                game.init(wsObj,data.order);
                
            }else if(data.type == 'service_6'){

                $('.login').css('display','none');
                //  拒绝邀请
                alert(`玩家：${data.order.invite.userName} 取消了与您的游戏！`);

                userData.isConfirm = false;

            }else if(data.type == 'service_7'){

                let { invite, beInvite } = data.order;

                let clickNum = beInvite.num || invite.num;

                let isInvite = userData.userID == invite.userID;

                // game.js stage 为对方点击次数
                stage.innerText = clickNum;
                
                if((isInvite? game.touchIndex : clickNum) >= (isInvite? clickNum : game.touchIndex)){
                    
                    $('.game_user1').addClass('speedUp');

                    $('.game_user2').removeClass('speedUp');
                }else{

                    user2.classList.add('speedUp');

                    user1.classList.remove('speedUp');
                }
            }else if(data.type == 'service_8'){

                let { invite, beInvite } = data.order;

                let clickNum = beInvite.num || invite.num;

                let endText = game.touchIndex<=clickNum &&'You Lost!' || 'You Win!';
                
                game.end(endText, userData);
            }


           
        };
    }
}

login_input.addEventListener('input',function(e){

    let val = this.value;

    if(val.length >= 2){

        login_btn.classList.add('login_btn_active');
    }else{

        login_btn.classList.remove('login_btn_active');
    }
})

login_btn.addEventListener('click',function(e){

    let isInput = this.classList.contains('login_btn_active');

    if(isInput){

        $('.login_warp').css('display','none');

        $('.loading').css('display','block');

        ws(login_input.value);
    }
})

$('.userList').on('click','.invite',function(e){

    let domData = this.dataset;

    wsObj.send(JSON.stringify({
        type: 'user_2', 
        order: {
            invite: userData,
            beInvite: {
                userName: domData.name, userID : domData.id, isConfirm : false
            }
        } 
    }));

    $('.loading_text').text('邀请中，请稍后！');
    $('.login').css('display','block');
})




